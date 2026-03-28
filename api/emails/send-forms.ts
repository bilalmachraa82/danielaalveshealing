import type { VercelRequest, VercelResponse } from "@vercel/node";
import { randomUUID } from "crypto";
import { getDb } from "../_db.js";
import { getResend, getAppUrl, FROM_EMAIL, buildEmailHtml } from "../_email.js";

type ServiceType = "healing_wellness" | "pura_radiancia";

interface SendFormsBody {
  client_id: string;
  session_id: string;
  service_type: ServiceType;
  send_anamnesis: boolean;
}

const SERVICE_FORM_TYPE_MAP: Record<ServiceType, string> = {
  healing_wellness: "healing_touch",
  pura_radiancia: "pura_radiancia",
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const sql = getDb();

  try {
    const {
      client_id,
      session_id,
      service_type,
      send_anamnesis,
    } = (req.body ?? {}) as Partial<SendFormsBody>;

    if (!client_id || !session_id || !service_type) {
      return res.status(400).json({
        error: "client_id, session_id, and service_type are required",
      });
    }

    const formType = SERVICE_FORM_TYPE_MAP[service_type];
    if (!formType) {
      return res.status(400).json({
        error: `Invalid service_type. Expected: ${Object.keys(SERVICE_FORM_TYPE_MAP).join(", ")}`,
      });
    }

    // Fetch client data
    const clientRows = await sql(
      "SELECT id, first_name, last_name, email FROM clients WHERE id = $1",
      [client_id]
    );

    if (clientRows.length === 0) {
      return res.status(404).json({ error: "Client not found" });
    }

    const client = clientRows[0] as {
      id: string;
      first_name: string;
      last_name: string | null;
      email: string | null;
    };

    if (!client.email) {
      return res.status(400).json({
        error: "Client does not have an email address",
      });
    }

    // Verify session exists
    const sessionRows = await sql(
      "SELECT id FROM sessions WHERE id = $1 AND client_id = $2",
      [session_id, client_id]
    );

    if (sessionRows.length === 0) {
      return res.status(404).json({ error: "Session not found" });
    }

    const resend = getResend();
    const baseUrl = getAppUrl();
    const clientName = client.first_name;
    const sentEmails: string[] = [];

    // --- Anamnesis email ---
    if (send_anamnesis) {
      const anamnesisToken = randomUUID();

      await sql(
        `INSERT INTO anamnesis_forms (client_id, token, token_expires_at, status)
         VALUES ($1, $2, now() + interval '7 days', 'sent')`,
        [client_id, anamnesisToken]
      );

      const anamnesisUrl = `${baseUrl}/anamnese/${anamnesisToken}`;
      const anamnesisHtml = buildEmailHtml(
        "Ficha de Saude",
        [
          `Ola ${clientName},`,
          "Que bom ter-te connosco! Para que a sua experiencia seja verdadeiramente personalizada, peco-lhe que preencha esta breve ficha de saude antes da nossa sessao.",
          "As suas respostas ajudam-me a compreender melhor o seu corpo e as suas necessidades, para que cada momento seja dedicado ao seu bem-estar.",
          "Leva apenas alguns minutos e faz toda a diferenca.",
        ],
        "Preencher Ficha de Saude",
        anamnesisUrl
      );

      const anamnesisResult = await resend.emails.send({
        from: FROM_EMAIL,
        to: client.email,
        subject: "Ficha de Saude \u2014 Daniela Alves Healing & Wellness",
        html: anamnesisHtml,
      });

      await sql(
        `INSERT INTO email_log (client_id, session_id, email_type, resend_id, status)
         VALUES ($1, $2, 'anamnesis', $3, 'sent')`,
        [client_id, session_id, anamnesisResult.data?.id ?? null]
      );

      sentEmails.push("anamnesis");
    }

    // --- Intake email ---
    const intakeToken = randomUUID();

    await sql(
      `INSERT INTO session_intake_forms (client_id, session_id, form_type, token, token_expires_at, status)
       VALUES ($1, $2, $3, $4, now() + interval '7 days', 'sent')`,
      [client_id, session_id, formType, intakeToken]
    );

    const isImmersion = service_type === "pura_radiancia";
    const intakePath = isImmersion
      ? `/pre-imersao/${intakeToken}`
      : `/pre-sessao/${intakeToken}`;
    const intakeUrl = `${baseUrl}${intakePath}`;

    const intakeEmailType = isImmersion ? "intake_immersion" : "intake_healing";

    const intakeSubject = isImmersion
      ? "Primeiro Passo para a Imersao Pura Radiancia"
      : "Preparacao para a sua Sessao \u2014 Daniela Alves";

    const intakeBodyParagraphs = isImmersion
      ? [
          `Ola ${clientName},`,
          "Estou muito feliz por te acompanhar nesta jornada de transformacao! A Imersao Pura Radiancia e um momento so seu, e quero que seja inesquecivel.",
          "Para que eu possa preparar cada detalhe a pensar em si, peco-lhe que preencha este breve questionario. Partilhe comigo as suas preferencias, intencoes e tudo o que a faca sentir especial.",
          "Cada resposta ajuda-me a criar uma experiencia unica.",
        ]
      : [
          `Ola ${clientName},`,
          "A sua sessao esta quase a chegar e quero que seja um momento verdadeiramente especial para si.",
          "Para que eu possa preparar tudo da melhor forma, peco-lhe que preencha este breve questionario. Demora apenas alguns minutos e ajuda-me a personalizar a sua experiencia.",
          "Estou ansiosa por recebe-la!",
        ];

    const intakeCtaText = isImmersion
      ? "Preparar a Minha Imersao"
      : "Preparar a Minha Sessao";

    const intakeHtml = buildEmailHtml(
      isImmersion ? "Preparacao para a Imersao" : "Preparacao para a Sessao",
      intakeBodyParagraphs,
      intakeCtaText,
      intakeUrl
    );

    const intakeResult = await resend.emails.send({
      from: FROM_EMAIL,
      to: client.email,
      subject: intakeSubject,
      html: intakeHtml,
    });

    await sql(
      `INSERT INTO email_log (client_id, session_id, email_type, resend_id, status)
       VALUES ($1, $2, $3, $4, 'sent')`,
      [client_id, session_id, intakeEmailType, intakeResult.data?.id ?? null]
    );

    sentEmails.push(intakeEmailType);

    return res.status(201).json({
      success: true,
      emails_sent: sentEmails,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return res.status(500).json({ error: message });
  }
}
