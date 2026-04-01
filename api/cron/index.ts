import type { VercelRequest, VercelResponse } from "@vercel/node";
import { randomUUID } from "crypto";
import { getDb } from "../_db.js";
import { getResend, getAppUrl, FROM_EMAIL, buildEmailHtml } from "../_email.js";
import { buildClientCommunicationProfile } from "../../src/lib/communications/profile.ts";
import {
  buildPreSessionReminderEmailContent,
  formatSessionDateForLanguage,
  getLocalizedServiceLabel,
} from "../../src/lib/communications/templates.ts";
import { shouldSendPreSessionReminder } from "../../src/lib/communications/reminders.ts";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Verify cron secret to prevent unauthorized access
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && req.headers.authorization !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const rawPath = req.query.__path;
  const pathSegments = typeof rawPath === "string" && rawPath !== ""
    ? rawPath.split("/")
    : Array.isArray(rawPath)
      ? rawPath
      : [];

  const route = pathSegments[0];

  try {
    switch (route) {
      case "pre-session-reminder":
        return await handlePreSessionReminder(res);
      case "post-session":
        return await handlePostSession(res);
      case "rebooking":
        return await handleRebooking(res);
      case "review-request":
        return await handleReviewRequest(req, res);
      case "checkin-24h":
        return await handleCheckin24h(res);
      case "nudge-7d":
        return await handleNudge7d(res);
      case "birthday":
        return await handleBirthday(res);
      case "feedback-request":
        return await handleFeedbackRequest(res);
      default:
        return res.status(404).json({ error: "Not found" });
    }
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return res.status(500).json({ error: message });
  }
}

/**
 * Cron: PRE-SESSION reminder
 * Schedule: hourly or daily depending on Vercel cron configuration
 */
async function handlePreSessionReminder(res: VercelResponse) {
  const sql = getDb();
  const sessions = await sql(
    `SELECT s.id AS session_id, s.client_id, s.scheduled_at, s.service_type, s.reminder_status,
            c.first_name, c.email, c.preferred_language, c.preferred_channel
     FROM sessions s
     JOIN clients c ON c.id = s.client_id
     WHERE s.status IN ('scheduled', 'confirmed')
       AND s.scheduled_at BETWEEN now() + interval '21 hours' AND now() + interval '27 hours'
       AND c.email IS NOT NULL`
  );

  const resend = getResend();
  let sentCount = 0;

  for (const session of sessions) {
    const profile = buildClientCommunicationProfile({
      preferred_language: session.preferred_language,
      preferred_channel: session.preferred_channel,
    });

    const shouldSend = shouldSendPreSessionReminder({
      now: new Date(),
      scheduledAt: new Date(session.scheduled_at),
      preferredChannel: profile.preferredChannel,
      emailAvailable: Boolean(session.email),
      smsAvailable: false,
      whatsappAvailable: false,
      reminderStatus: session.reminder_status ?? "pending",
    });

    if (!shouldSend) {
      continue;
    }

    const content = buildPreSessionReminderEmailContent({
      firstName: session.first_name,
      preferredLanguage: profile.preferredLanguage,
      serviceLabel: getLocalizedServiceLabel(
        session.service_type,
        profile.preferredLanguage
      ),
      formattedDate: formatSessionDateForLanguage(
        session.scheduled_at,
        profile.preferredLanguage
      ),
    });
    const html = buildEmailHtml(content.title, content.paragraphs);

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: session.email as string,
      subject: content.subject,
      html,
    });

    await sql(
      `INSERT INTO email_log (client_id, session_id, email_type, resend_id, status)
       VALUES ($1, $2, 'pre_session_reminder', $3, 'sent')`,
      [session.client_id, session.session_id, result.data?.id ?? null]
    );

    await sql(
      `UPDATE sessions
       SET reminder_status = 'sent',
           last_reminder_sent_at = now(),
           next_reminder_due_at = NULL
       WHERE id = $1`,
      [session.session_id]
    );

    sentCount++;
  }

  return res.json({
    success: true,
    processed: sessions.length,
    sent: sentCount,
  });
}

/**
 * Cron: POST-SESSION satisfaction survey
 * Schedule: daily at 20:00 (0 20 * * *)
 */
async function handlePostSession(res: VercelResponse) {
  const sql = getDb();
  const sessions = await sql(
    `SELECT s.id AS session_id, s.client_id, s.service_type,
            c.first_name, c.email
     FROM sessions s
     JOIN clients c ON c.id = s.client_id
     WHERE s.status = 'completed'
       AND s.scheduled_at::date = CURRENT_DATE
       AND s.satisfaction_sent = false
       AND c.email IS NOT NULL`
  );

  const resend = getResend();
  const baseUrl = getAppUrl();
  let sentCount = 0;

  for (const session of sessions) {
    const token = randomUUID();

    await sql(
      `INSERT INTO satisfaction_responses (session_id, client_id, token, token_expires_at)
       VALUES ($1, $2, $3, now() + interval '7 days')`,
      [session.session_id, session.client_id, token]
    );

    const satisfactionUrl = `${baseUrl}/satisfacao/${token}`;

    const html = buildEmailHtml(
      "Como foi a sua experiencia?",
      [
        `Ola ${session.first_name},`,
        "Espero que esteja a sentir-se maravilhosa apos a nossa sessao de hoje!",
        "A sua opiniao e muito importante para mim. Gostaria de saber como se sentiu e se a experiencia correspondeu as suas expectativas.",
        "Basta clicar no botao abaixo \u2014 demora menos de 2 minutos e ajuda-me a continuar a melhorar para si.",
      ],
      "Partilhar a Minha Experiencia",
      satisfactionUrl
    );

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: session.email as string,
      subject: "Como foi a sua experiencia? \u2014 Daniela Alves",
      html,
    });

    await sql(
      `INSERT INTO email_log (client_id, session_id, email_type, resend_id, status)
       VALUES ($1, $2, 'satisfaction', $3, 'sent')`,
      [session.client_id, session.session_id, result.data?.id ?? null]
    );

    await sql(
      `UPDATE sessions
       SET satisfaction_sent = true, satisfaction_sent_at = now()
       WHERE id = $1`,
      [session.session_id]
    );

    sentCount++;
  }

  return res.json({
    success: true,
    processed: sessions.length,
    sent: sentCount,
  });
}

/**
 * Cron: REBOOKING reminder for inactive clients
 * Schedule: every Monday at 10:00 (0 10 * * 1)
 */
async function handleRebooking(res: VercelResponse) {
  const sql = getDb();
  const rows = await sql(
    `SELECT c.id AS client_id, c.first_name, c.email,
            MAX(s.scheduled_at) AS last_session_at
     FROM clients c
     JOIN sessions s ON s.client_id = c.id AND s.status = 'completed'
     WHERE c.status = 'active'
       AND c.email IS NOT NULL
       AND NOT EXISTS (
         SELECT 1 FROM email_log el
         WHERE el.client_id = c.id
           AND el.email_type = 'rebooking'
           AND el.sent_at > now() - interval '60 days'
       )
       AND NOT EXISTS (
         SELECT 1 FROM sessions upcoming
         WHERE upcoming.client_id = c.id
           AND upcoming.status IN ('scheduled', 'confirmed')
           AND upcoming.scheduled_at > now()
       )
     GROUP BY c.id, c.first_name, c.email
     HAVING MAX(s.scheduled_at) < now() - interval '30 days'`
  );

  const resend = getResend();
  const baseUrl = getAppUrl();
  let sentCount = 0;

  for (const row of rows) {
    const html = buildEmailHtml(
      "Sentimos a sua falta",
      [
        `Ola ${row.first_name},`,
        "Ja passou algum tempo desde a nossa ultima sessao e quero que saiba que penso em si.",
        "O seu corpo e a sua mente merecem momentos regulares de cuidado e atencao. Cada sessao e uma oportunidade de reconectar consigo mesma e renovar a sua energia.",
        "Quando sentir que e o momento certo, estarei aqui para a receber de bracos abertos.",
        "Pode agendar a sua proxima sessao diretamente comigo ou atraves do site.",
      ],
      "Agendar Sessao",
      baseUrl
    );

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: row.email as string,
      subject: "Sentimos a sua falta \u2014 Daniela Alves",
      html,
    });

    await sql(
      `INSERT INTO email_log (client_id, email_type, resend_id, status)
       VALUES ($1, 'rebooking', $2, 'sent')`,
      [row.client_id, result.data?.id ?? null]
    );

    sentCount++;
  }

  return res.json({
    success: true,
    processed: rows.length,
    sent: sentCount,
  });
}

/**
 * Cron: REVIEW REQUEST for promoters (NPS >= 9)
 * Schedule: daily at 10:00 (0 10 * * *)
 */
async function handleReviewRequest(
  req: VercelRequest,
  res: VercelResponse
) {
  const googleReviewUrl = process.env.GOOGLE_REVIEW_URL;
  if (!googleReviewUrl) {
    return res.status(500).json({ error: "GOOGLE_REVIEW_URL not configured" });
  }

  const sql = getDb();
  const rows = await sql(
    `SELECT sr.id AS response_id, sr.session_id, sr.client_id, sr.nps_score,
            c.first_name, c.email
     FROM satisfaction_responses sr
     JOIN sessions s ON s.id = sr.session_id
     JOIN clients c ON c.id = sr.client_id
     WHERE sr.completed_at IS NOT NULL
       AND sr.nps_score >= 9
       AND s.review_request_sent = false
       AND sr.completed_at < now() - interval '3 days'
       AND c.email IS NOT NULL`
  );

  const resend = getResend();
  let sentCount = 0;

  for (const row of rows) {
    const html = buildEmailHtml(
      "Partilhe a sua experiencia",
      [
        `Ola ${row.first_name},`,
        "Fico tao feliz por saber que a sua experiencia foi especial! Significa muito para mim.",
        "Se tiver um momento, adoraria que partilhasse as suas palavras no Google. A sua avaliacao ajuda outras pessoas a encontrarem o caminho para o bem-estar e faz uma diferenca enorme no meu trabalho.",
        "Basta clicar no botao abaixo \u2014 e muito simples e rapido.",
        "Obrigada de coracao por confiar em mim.",
      ],
      "Deixar Avaliacao no Google",
      googleReviewUrl
    );

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: row.email as string,
      subject: "Partilhe a sua experiencia \u2014 Daniela Alves",
      html,
    });

    await sql(
      `INSERT INTO email_log (client_id, session_id, email_type, resend_id, status)
       VALUES ($1, $2, 'review_request', $3, 'sent')`,
      [row.client_id, row.session_id, result.data?.id ?? null]
    );

    await sql(
      `UPDATE sessions
       SET review_request_sent = true, review_request_sent_at = now()
       WHERE id = $1`,
      [row.session_id]
    );

    sentCount++;
  }

  return res.json({
    success: true,
    processed: rows.length,
    sent: sentCount,
  });
}

/**
 * Cron: CHECK-IN 24h after session
 * Schedule: daily at 10:00 (0 10 * * *)
 */
async function handleCheckin24h(res: VercelResponse) {
  const sql = getDb();

  const sessions = await sql(
    `SELECT s.id AS session_id, s.client_id,
            c.first_name, c.email
     FROM sessions s
     JOIN clients c ON c.id = s.client_id
     WHERE s.status = 'completed'
       AND s.scheduled_at BETWEEN now() - interval '26 hours' AND now() - interval '22 hours'
       AND c.email IS NOT NULL
       AND NOT EXISTS (
         SELECT 1 FROM email_log el
         WHERE el.session_id = s.id
           AND el.email_type = 'post_session_checkin'
           AND el.status = 'sent'
       )`
  );

  const resend = getResend();
  let sentCount = 0;

  for (const session of sessions) {
    const html = buildEmailHtml(
      "Como se esta a sentir hoje?",
      [
        `Ola ${session.first_name},`,
        "Esperamos que esteja a sentir os beneficios da sua sessao de ontem.",
        "Aqui ficam algumas dicas para potenciar os resultados: beba bastante agua, descanse e observe como o seu corpo responde. E perfeitamente normal sentir mudancas subtis nas horas e dias seguintes.",
        "Se tiver alguma duvida ou quiser partilhar como se sente, estou sempre disponivel.",
      ]
    );

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: session.email as string,
      subject: "Como se esta a sentir hoje? \u2014 Daniela Alves",
      html,
    });

    await sql(
      `INSERT INTO email_log (client_id, session_id, email_type, resend_id, status)
       VALUES ($1, $2, 'post_session_checkin', $3, 'sent')`,
      [session.client_id, session.session_id, result.data?.id ?? null]
    );

    sentCount++;
  }

  return res.json({
    success: true,
    processed: sessions.length,
    sent: sentCount,
  });
}

/**
 * Cron: NUDGE 7 days after session (no upcoming sessions)
 * Schedule: every Wednesday at 10:00 (0 10 * * 3)
 */
async function handleNudge7d(res: VercelResponse) {
  const sql = getDb();

  const rows = await sql(
    `SELECT s.id AS session_id, s.client_id,
            c.first_name, c.email
     FROM sessions s
     JOIN clients c ON c.id = s.client_id
     WHERE s.status = 'completed'
       AND s.scheduled_at BETWEEN now() - interval '8 days' AND now() - interval '6 days'
       AND c.email IS NOT NULL
       AND NOT EXISTS (
         SELECT 1 FROM sessions upcoming
         WHERE upcoming.client_id = c.id
           AND upcoming.status IN ('scheduled', 'confirmed')
           AND upcoming.scheduled_at > now()
       )
       AND NOT EXISTS (
         SELECT 1 FROM email_log el
         WHERE el.session_id = s.id
           AND el.email_type = 'rebooking'
           AND el.status = 'sent'
       )`
  );

  const resend = getResend();
  const baseUrl = getAppUrl();
  let sentCount = 0;

  for (const row of rows) {
    const html = buildEmailHtml(
      "Gostaria de agendar a proxima sessao?",
      [
        `Ola ${row.first_name},`,
        "Ja passou uma semana desde a nossa ultima sessao e espero que esteja a sentir-se bem!",
        "Para manter os beneficios e continuar o seu caminho de bem-estar, e ideal manter uma regularidade nas sessoes.",
        "Se sentir que e o momento certo, terei todo o gosto em recebe-la novamente.",
      ],
      "Agendar Sessao",
      baseUrl
    );

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: row.email as string,
      subject: "Gostaria de agendar a proxima sessao? \u2014 Daniela Alves",
      html,
    });

    await sql(
      `INSERT INTO email_log (client_id, session_id, email_type, resend_id, status)
       VALUES ($1, $2, 'rebooking', $3, 'sent')`,
      [row.client_id, row.session_id, result.data?.id ?? null]
    );

    sentCount++;
  }

  return res.json({
    success: true,
    processed: rows.length,
    sent: sentCount,
  });
}

/**
 * Cron: BIRTHDAY greetings
 * Schedule: daily at 08:00 (0 8 * * *)
 */
async function handleBirthday(res: VercelResponse) {
  const sql = getDb();

  const rows = await sql(
    `SELECT c.id AS client_id, c.first_name, c.email
     FROM clients c
     WHERE c.status = 'active'
       AND c.date_of_birth IS NOT NULL
       AND EXTRACT(MONTH FROM c.date_of_birth) = EXTRACT(MONTH FROM CURRENT_DATE)
       AND EXTRACT(DAY FROM c.date_of_birth) = EXTRACT(DAY FROM CURRENT_DATE)
       AND c.email IS NOT NULL
       AND NOT EXISTS (
         SELECT 1 FROM email_log el
         WHERE el.client_id = c.id
           AND el.email_type = 'reminder'
           AND el.sent_at::date = CURRENT_DATE
       )`
  );

  const resend = getResend();
  let sentCount = 0;

  for (const row of rows) {
    const html = buildEmailHtml(
      "Feliz Aniversario!",
      [
        `Querida ${row.first_name},`,
        "Hoje e um dia muito especial e quero que saiba que penso em si com muito carinho!",
        "Que este novo ano de vida traga muita saude, amor, paz e todas as coisas bonitas que merece.",
        "Para celebrar o seu dia, tenho uma surpresa especial: um desconto de 15% na sua proxima sessao. Porque voce merece todo o cuidado do mundo.",
        "Use o codigo ANIVERSARIO ao agendar. Valido durante 30 dias.",
      ]
    );

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: row.email as string,
      subject: "Feliz Aniversario! \u2014 Daniela Alves",
      html,
    });

    await sql(
      `INSERT INTO email_log (client_id, email_type, resend_id, status)
       VALUES ($1, 'reminder', $2, 'sent')`,
      [row.client_id, result.data?.id ?? null]
    );

    sentCount++;
  }

  return res.json({
    success: true,
    processed: rows.length,
    sent: sentCount,
  });
}

/**
 * Cron: FEEDBACK REQUEST for NPS 7-8
 * Schedule: daily at 10:00 (0 10 * * *)
 */
async function handleFeedbackRequest(res: VercelResponse) {
  const sql = getDb();

  const rows = await sql(
    `SELECT sr.id AS response_id, sr.session_id, sr.client_id, sr.nps_score,
            c.first_name, c.email
     FROM satisfaction_responses sr
     JOIN sessions s ON s.id = sr.session_id
     JOIN clients c ON c.id = sr.client_id
     WHERE sr.completed_at IS NOT NULL
       AND sr.nps_score BETWEEN 7 AND 8
       AND sr.completed_at BETWEEN now() - interval '3 days' AND now() - interval '1 day'
       AND c.email IS NOT NULL
       AND NOT EXISTS (
         SELECT 1 FROM email_log el
         WHERE el.session_id = sr.session_id
           AND el.email_type = 'review_request'
           AND el.status = 'sent'
       )`
  );

  const resend = getResend();
  let sentCount = 0;

  for (const row of rows) {
    const html = buildEmailHtml(
      "A sua opiniao e valiosa!",
      [
        `Ola ${row.first_name},`,
        "Obrigada por ter partilhado a sua experiencia comigo. A sua opiniao e extremamente importante e ajuda-me a crescer e a melhorar continuamente.",
        "Gostaria de saber: o que poderia ter tornado a sua experiencia ainda mais especial? Ha algo que gostasse de ver diferente ou melhorado?",
        "Pode responder diretamente a este email com as suas sugestoes. Cada palavra sua e preciosa para mim.",
      ]
    );

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: row.email as string,
      subject: "O que poderiamos fazer melhor? \u2014 Daniela Alves",
      html,
    });

    await sql(
      `INSERT INTO email_log (client_id, session_id, email_type, resend_id, status)
       VALUES ($1, $2, 'review_request', $3, 'sent')`,
      [row.client_id, row.session_id, result.data?.id ?? null]
    );

    sentCount++;
  }

  return res.json({
    success: true,
    processed: rows.length,
    sent: sentCount,
  });
}
