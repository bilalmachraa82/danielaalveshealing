import type { VercelRequest, VercelResponse } from "@vercel/node";
import { randomUUID } from "crypto";
import { getDb } from "../_db";
import { getResend, getAppUrl, FROM_EMAIL, buildEmailHtml } from "../_email";

/**
 * Cron: POST-SESSION satisfaction survey
 * Schedule: daily at 20:00 (0 20 * * *)
 *
 * Finds sessions completed today that haven't had a satisfaction form sent,
 * creates the satisfaction_responses record, sends the email, and marks the session.
 */
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

  const sql = getDb();

  try {
    // Find sessions completed today that haven't had satisfaction sent
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

      // Create satisfaction_responses record
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

      // Log email
      await sql(
        `INSERT INTO email_log (client_id, session_id, email_type, resend_id, status)
         VALUES ($1, $2, 'satisfaction', $3, 'sent')`,
        [session.client_id, session.session_id, result.data?.id ?? null]
      );

      // Mark session
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
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return res.status(500).json({ error: message });
  }
}
