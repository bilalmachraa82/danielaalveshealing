/**
 * Consolidated forms handler
 *
 * Routes (via __path query param):
 *   POST  /api/forms/send                  — Create form tokens (no email)
 *   POST  /api/forms/emails/send            — Create form tokens + send emails
 *   GET   /api/forms/anamnesis/:token       — Load anamnesis form
 *   POST  /api/forms/anamnesis/:token       — Submit anamnesis form
 *   GET   /api/forms/intake/:token          — Load intake form
 *   POST  /api/forms/intake/:token          — Submit intake form
 *   GET   /api/forms/prepare/:token         — Load prepare form context
 *   POST  /api/forms/prepare/:token         — Submit prepare form data
 *   GET   /api/forms/satisfaction/:token     — Load satisfaction form
 *   POST  /api/forms/satisfaction/:token     — Submit satisfaction form
 *   POST  /api/forms/satisfaction/send       — Create + send satisfaction form
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { randomUUID } from "crypto";
import { getDb } from "../_db.js";
import { verifyAdmin } from "../_auth.js";
import { getResend, getAppUrl, FROM_EMAIL, buildEmailHtml } from "../_email.js";
import { buildClientCommunicationProfile } from "../../src/lib/communications/profile.ts";
import { deriveConsentFlags } from "../../src/lib/communications/consents.ts";
import { deriveClientJourney } from "../../src/lib/communications/journey.ts";
import {
  buildAnamnesisEmailContent,
  buildPreparationEmailContent,
  getLocalizedServiceLabel,
} from "../../src/lib/communications/templates.ts";
import type { ExtendedServiceType } from "../../src/lib/communications/types.ts";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const sql = getDb();
  const rawPath = req.query.__path;
  const pathSegments =
    typeof rawPath === "string" && rawPath !== ""
      ? rawPath.split("/")
      : Array.isArray(rawPath)
        ? rawPath
        : [];

  try {
    // /api/forms/send — create tokens only (admin)
    if (pathSegments.length === 1 && pathSegments[0] === "send") {
      if (!verifyAdmin(req)) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      return await handleFormsSend(req, res, sql);
    }

    // /api/forms/emails/send — create tokens + send emails (admin)
    if (
      pathSegments.length === 2 &&
      pathSegments[0] === "emails" &&
      pathSegments[1] === "send"
    ) {
      if (!verifyAdmin(req)) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      return await handleEmailsSendForms(req, res, sql);
    }

    // /api/forms/anamnesis/:token
    if (pathSegments.length === 2 && pathSegments[0] === "anamnesis") {
      return await handleAnamnesis(req, res, sql, pathSegments[1]);
    }

    // /api/forms/intake/:token
    if (pathSegments.length === 2 && pathSegments[0] === "intake") {
      return await handleIntake(req, res, sql, pathSegments[1]);
    }

    // /api/forms/prepare/:token
    if (pathSegments.length === 2 && pathSegments[0] === "prepare") {
      return await handlePrepare(req, res, sql, pathSegments[1]);
    }

    // /api/forms/satisfaction/send — must be checked BEFORE satisfaction/:token (admin)
    if (
      pathSegments.length === 2 &&
      pathSegments[0] === "satisfaction" &&
      pathSegments[1] === "send"
    ) {
      if (!verifyAdmin(req)) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      return await handleSatisfactionSend(req, res, sql);
    }

    // /api/forms/satisfaction/:token
    if (pathSegments.length === 2 && pathSegments[0] === "satisfaction") {
      return await handleSatisfaction(req, res, sql, pathSegments[1]);
    }

    return res.status(404).json({ error: "Not found" });
  } catch (error: unknown) {
    console.error("Forms error:", error instanceof Error ? error.message : error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// ============================================================
// /api/forms/send — Create form tokens (no email)
// ============================================================

const SERVICE_FORM_TYPE_MAP: Record<ExtendedServiceType, string> = {
  healing_wellness: "healing_touch",
  pura_radiancia: "pura_radiancia",
  pure_earth_love: "healing_touch",
  home_harmony: "healing_touch",
  other: "healing_touch",
};

async function applyClientConsentUpdate(
  sql: ReturnType<typeof getDb>,
  clientId: string,
  payload: Record<string, unknown>,
  source: string
) {
  const flags = deriveConsentFlags(payload);
  const now = new Date().toISOString();

  await sql(
    `UPDATE clients
     SET consent_data_processing = $1,
         consent_health_data = $2,
         consent_health_data_at = CASE
           WHEN $2 THEN COALESCE(consent_health_data_at, $3)
           ELSE consent_health_data_at
         END,
         consent_health_data_source = CASE
           WHEN $2 THEN $4
           ELSE consent_health_data_source
         END,
         service_consent_email = $5,
         service_consent_sms = $6,
         service_consent_whatsapp = $7,
         consent_marketing = $8,
         marketing_consent_email = $9,
         marketing_consent_sms = $10,
         marketing_consent_whatsapp = $11,
         consent_given_at = CASE
           WHEN $1 THEN COALESCE(consent_given_at, $3)
           ELSE consent_given_at
         END,
         consent_version = '2026-04',
         consent_updated_at = $3,
         updated_at = now()
     WHERE id = $12`,
    [
      flags.consentDataProcessing,
      flags.consentHealthData,
      now,
      source,
      flags.service.email,
      flags.service.sms,
      flags.service.whatsapp,
      flags.consentMarketing,
      flags.marketing.email,
      flags.marketing.sms,
      flags.marketing.whatsapp,
      clientId,
    ]
  );
}

async function getClientCommunicationContext(
  sql: ReturnType<typeof getDb>,
  clientId: string,
  serviceType: ExtendedServiceType
) {
  const clientRows = await sql(
    `SELECT id, first_name, last_name, email, gender, preferred_language, preferred_channel, source
     FROM clients
     WHERE id = $1`,
    [clientId]
  );

  if (clientRows.length === 0) {
    return null;
  }

  const [completedSessionCountRows, completedAnamnesisCountRows] =
    await Promise.all([
      sql(
        "SELECT COUNT(*)::int AS count FROM sessions WHERE client_id = $1 AND status = 'completed'",
        [clientId]
      ),
      sql(
        "SELECT COUNT(*)::int AS count FROM anamnesis_forms WHERE client_id = $1 AND status = 'completed'",
        [clientId]
      ),
    ]);

  const completedSessions = Math.max(
    completedSessionCountRows[0]?.count ?? 0,
    completedAnamnesisCountRows[0]?.count ?? 0
  );
  const journey = deriveClientJourney({
    completedSessions,
    serviceType,
    referralSourceKnown: clientRows[0].source != null &&
      clientRows[0].source !== "manual",
  });

  return {
    client: clientRows[0] as {
      id: string;
      first_name: string;
      last_name: string | null;
      email: string | null;
      source: string | null;
      preferred_language: "pt" | "en" | null;
      preferred_channel: "email" | "sms" | "whatsapp" | null;
      gender: "female" | "male" | null;
    },
    profile: buildClientCommunicationProfile(clientRows[0]),
    journey,
  };
}

async function handleFormsSend(
  req: VercelRequest,
  res: VercelResponse,
  sql: ReturnType<typeof getDb>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { client_id, session_id, service_type, send_anamnesis } =
    req.body ?? {};

  if (!client_id || !session_id || !service_type) {
    return res.status(400).json({
      error: "client_id, session_id, and service_type are required",
    });
  }

  const formType = SERVICE_FORM_TYPE_MAP[service_type as ExtendedServiceType];
  if (!formType) {
    return res.status(400).json({
      error: `Invalid service_type. Expected: ${Object.keys(SERVICE_FORM_TYPE_MAP).join(", ")}`,
    });
  }

  // Verify client and session exist
  const [context, sessionRows] = await Promise.all([
    getClientCommunicationContext(
      sql,
      client_id,
      service_type as ExtendedServiceType
    ),
    sql("SELECT id FROM sessions WHERE id = $1 AND client_id = $2", [
      session_id,
      client_id,
    ]),
  ]);

  if (!context) {
    return res.status(404).json({ error: "Client not found" });
  }

  if (sessionRows.length === 0) {
    return res.status(404).json({ error: "Session not found" });
  }

  const baseUrl = process.env.PUBLIC_URL ?? `https://${req.headers.host}`;
  const tokens: { anamnesis?: string; intake: string } = { intake: "" };
  const urls: { anamnesis?: string; intake: string } = { intake: "" };
  const shouldSendAnamnesis =
    (send_anamnesis ?? true) && context.journey.shouldSendAnamnesis;

  // Create anamnesis form if requested (first-time clients)
  if (shouldSendAnamnesis) {
    const anamnesisToken = randomUUID();
    await sql(
      `INSERT INTO anamnesis_forms (client_id, token, token_expires_at, status)
       VALUES ($1, $2, now() + interval '7 days', 'sent')`,
      [client_id, anamnesisToken]
    );
    tokens.anamnesis = anamnesisToken;
    urls.anamnesis = `${baseUrl}/forms/anamnesis/${anamnesisToken}`;
  }

  // Create session intake form
  const intakeToken = randomUUID();
  await sql(
    `INSERT INTO session_intake_forms (client_id, session_id, form_type, token, token_expires_at, status)
     VALUES ($1, $2, $3, $4, now() + interval '7 days', 'sent')`,
    [client_id, session_id, formType, intakeToken]
  );
  tokens.intake = intakeToken;
  urls.intake = `${baseUrl}/forms/intake/${intakeToken}`;

  return res.status(201).json({
    tokens,
    urls,
    client_kind: context.journey.clientKind,
    sent_anamnesis: shouldSendAnamnesis,
  });
}

// ============================================================
// /api/forms/emails/send — Create tokens + send emails (was emails/send-forms)
// ============================================================

interface SendFormsBody {
  client_id: string;
  session_id: string;
  service_type: ExtendedServiceType;
  send_anamnesis: boolean;
}

async function handleEmailsSendForms(
  req: VercelRequest,
  res: VercelResponse,
  sql: ReturnType<typeof getDb>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

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

  const context = await getClientCommunicationContext(sql, client_id, service_type);

  if (!context) {
    return res.status(404).json({ error: "Client not found" });
  }

  const { client, journey, profile } = context;

  if (!client.email) {
    return res.status(400).json({
      error: "Client does not have an email address",
    });
  }

  // Verify session exists
  const sessionRows = await sql(
    "SELECT id, scheduled_at FROM sessions WHERE id = $1 AND client_id = $2",
    [session_id, client_id]
  );

  if (sessionRows.length === 0) {
    return res.status(404).json({ error: "Session not found" });
  }

  const resend = getResend();
  const baseUrl = getAppUrl();
  const clientName = client.first_name;
  const sentEmails: string[] = [];
  const shouldSendAnamnesis = (send_anamnesis ?? true) &&
    journey.shouldSendAnamnesis;
  const serviceLabel = getLocalizedServiceLabel(
    service_type,
    profile.preferredLanguage
  );

  // --- Anamnesis email ---
  if (shouldSendAnamnesis) {
    const anamnesisToken = randomUUID();

    await sql(
      `INSERT INTO anamnesis_forms (client_id, token, token_expires_at, status)
       VALUES ($1, $2, now() + interval '7 days', 'sent')`,
      [client_id, anamnesisToken]
    );

    const anamnesisUrl = `${baseUrl}/anamnese/${anamnesisToken}`;
    const anamnesisContent = buildAnamnesisEmailContent({
      firstName: clientName,
      preferredLanguage: profile.preferredLanguage,
      anamnesisUrl,
    });
    const anamnesisHtml = buildEmailHtml(
      anamnesisContent.title,
      anamnesisContent.paragraphs,
      anamnesisContent.ctaText,
      anamnesisContent.ctaUrl
    );

    const anamnesisResult = await resend.emails.send({
      from: FROM_EMAIL,
      to: client.email,
      subject: anamnesisContent.subject,
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
  const intakeContent = buildPreparationEmailContent({
    firstName: clientName,
    preferredLanguage: profile.preferredLanguage,
    clientKind: journey.clientKind,
    serviceLabel,
    prepareUrl: intakeUrl,
  });
  const intakeHtml = buildEmailHtml(
    intakeContent.title,
    intakeContent.paragraphs,
    intakeContent.ctaText,
    intakeContent.ctaUrl
  );

  const intakeResult = await resend.emails.send({
    from: FROM_EMAIL,
    to: client.email,
    subject: intakeContent.subject,
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
    client_kind: journey.clientKind,
    sent_anamnesis: shouldSendAnamnesis,
  });
}

// ============================================================
// /api/forms/anamnesis/:token
// ============================================================

async function handleAnamnesis(
  req: VercelRequest,
  res: VercelResponse,
  sql: ReturnType<typeof getDb>,
  token: string
) {
  if (!token) {
    return res.status(400).json({ error: "Token is required" });
  }

  if (req.method === "GET") {
    return await handleAnamnesisGet(sql, token, res);
  }

  if (req.method === "POST") {
    return await handleAnamnesisPost(sql, token, req, res);
  }

  return res.status(405).json({ error: "Method not allowed" });
}

async function handleAnamnesisGet(
  sql: ReturnType<typeof getDb>,
  token: string,
  res: VercelResponse
) {
  const rows = await sql(
    `SELECT af.*,
       json_build_object(
         'first_name', c.first_name,
         'last_name', c.last_name,
         'email', c.email
       ) AS client
     FROM anamnesis_forms af
     JOIN clients c ON c.id = af.client_id
     WHERE af.token = $1`,
    [token]
  );

  if (rows.length === 0) {
    return res.status(404).json({ error: "Form not found" });
  }

  const form = rows[0];

  if (form.status === "completed") {
    return res.status(409).json({ error: "Form already completed" });
  }

  if (new Date(form.token_expires_at) < new Date()) {
    return res.status(410).json({ error: "Token expired" });
  }

  return res.json({
    form_id: form.id,
    client: form.client,
    status: form.status,
    health_general: form.health_general,
    lifestyle: form.lifestyle,
    body_map_data: form.body_map_data,
    pain_trigger_task: form.pain_trigger_task,
    has_pain_trigger: form.has_pain_trigger,
    previous_massage_experience: form.previous_massage_experience,
    previous_massage_details: form.previous_massage_details,
    session_objectives: form.session_objectives,
    declaration_accepted: form.declaration_accepted,
    declaration_date: form.declaration_date,
  });
}

async function handleAnamnesisPost(
  sql: ReturnType<typeof getDb>,
  token: string,
  req: VercelRequest,
  res: VercelResponse
) {
  // Validate token
  const rows = await sql(
    "SELECT id, client_id, status, token_expires_at FROM anamnesis_forms WHERE token = $1",
    [token]
  );

  if (rows.length === 0) {
    return res.status(404).json({ error: "Form not found" });
  }

  const form = rows[0];

  if (form.status === "completed") {
    return res.status(409).json({ error: "Form already completed" });
  }

  if (new Date(form.token_expires_at) < new Date()) {
    return res.status(410).json({ error: "Token expired" });
  }

  const data = req.body ?? {};

  await applyClientConsentUpdate(
    sql,
    form.client_id,
    data,
    "anamnesis_public"
  );

  const updated = await sql(
    `UPDATE anamnesis_forms
     SET health_general = $1,
         lifestyle = $2,
         body_map_data = $3,
         pain_trigger_task = $4,
         has_pain_trigger = $5,
         previous_massage_experience = $6,
         previous_massage_details = $7,
         session_objectives = $8,
         declaration_accepted = $9,
         declaration_date = $10,
         status = 'completed',
         completed_at = now()
     WHERE id = $11
     RETURNING *`,
    [
      JSON.stringify(data.health_general ?? {}),
      JSON.stringify(data.lifestyle ?? {}),
      JSON.stringify(data.body_map_data ?? []),
      data.pain_trigger_task ?? null,
      data.has_pain_trigger ?? null,
      data.previous_massage_experience ?? null,
      data.previous_massage_details ?? null,
      data.session_objectives ?? null,
      data.declaration_accepted ?? false,
      data.declaration_date ?? null,
      form.id,
    ]
  );

  return res.json(updated[0]);
}

// ============================================================
// /api/forms/intake/:token
// ============================================================

async function handleIntake(
  req: VercelRequest,
  res: VercelResponse,
  sql: ReturnType<typeof getDb>,
  token: string
) {
  if (!token) {
    return res.status(400).json({ error: "Token is required" });
  }

  if (req.method === "GET") {
    return await handleIntakeGet(sql, token, res);
  }

  if (req.method === "POST") {
    return await handleIntakePost(sql, token, req, res);
  }

  return res.status(405).json({ error: "Method not allowed" });
}

async function handleIntakeGet(
  sql: ReturnType<typeof getDb>,
  token: string,
  res: VercelResponse
) {
  const rows = await sql(
    `SELECT sif.*,
       json_build_object(
         'first_name', c.first_name,
         'last_name', c.last_name,
         'email', c.email
       ) AS client
     FROM session_intake_forms sif
     JOIN clients c ON c.id = sif.client_id
     WHERE sif.token = $1`,
    [token]
  );

  if (rows.length === 0) {
    return res.status(404).json({ error: "Form not found" });
  }

  const form = rows[0];

  if (form.status === "completed") {
    return res.status(409).json({ error: "Form already completed" });
  }

  if (new Date(form.token_expires_at) < new Date()) {
    return res.status(410).json({ error: "Token expired" });
  }

  return res.json({
    form_id: form.id,
    form_type: form.form_type,
    client: form.client,
    status: form.status,
    // Common fields
    referral_source: form.referral_source,
    motivation: form.motivation,
    main_objective: form.main_objective,
    health_conditions: form.health_conditions,
    current_treatment: form.current_treatment,
    pregnant_breastfeeding: form.pregnant_breastfeeding,
    allergies_sensitivities: form.allergies_sensitivities,
    // Healing Touch scales
    feeling_physically: form.feeling_physically,
    feeling_psychologically: form.feeling_psychologically,
    feeling_emotionally: form.feeling_emotionally,
    feeling_energetically: form.feeling_energetically,
    // Pura Radiancia extras
    meditation_practice: form.meditation_practice,
    current_challenges: form.current_challenges,
    immersion_motivation: form.immersion_motivation,
    main_intention: form.main_intention,
    wishlist: form.wishlist,
    aroma_preferences: form.aroma_preferences,
    music_preferences: form.music_preferences,
    beverage_preference: form.beverage_preference,
    dietary_restrictions: form.dietary_restrictions,
    color_preferences: form.color_preferences,
    // General
    additional_observations: form.additional_observations,
  });
}

async function handleIntakePost(
  sql: ReturnType<typeof getDb>,
  token: string,
  req: VercelRequest,
  res: VercelResponse
) {
  // Validate token
  const rows = await sql(
    "SELECT id, form_type, status, token_expires_at FROM session_intake_forms WHERE token = $1",
    [token]
  );

  if (rows.length === 0) {
    return res.status(404).json({ error: "Form not found" });
  }

  const form = rows[0];

  if (form.status === "completed") {
    return res.status(409).json({ error: "Form already completed" });
  }

  if (new Date(form.token_expires_at) < new Date()) {
    return res.status(410).json({ error: "Token expired" });
  }

  const data = req.body ?? {};

  const updated = await sql(
    `UPDATE session_intake_forms
     SET referral_source = $1,
         motivation = $2,
         main_objective = $3,
         health_conditions = $4,
         current_treatment = $5,
         pregnant_breastfeeding = $6,
         allergies_sensitivities = $7,
         feeling_physically = $8,
         feeling_psychologically = $9,
         feeling_emotionally = $10,
         feeling_energetically = $11,
         meditation_practice = $12,
         current_challenges = $13,
         immersion_motivation = $14,
         main_intention = $15,
         wishlist = $16,
         aroma_preferences = $17,
         music_preferences = $18,
         beverage_preference = $19,
         dietary_restrictions = $20,
         color_preferences = $21,
         additional_observations = $22,
         status = 'completed',
         completed_at = now()
     WHERE id = $23
     RETURNING *`,
    [
      data.referral_source ?? null,
      data.motivation ?? null,
      data.main_objective ?? null,
      data.health_conditions ?? null,
      data.current_treatment ?? null,
      data.pregnant_breastfeeding ?? null,
      data.allergies_sensitivities ?? null,
      data.feeling_physically ?? null,
      data.feeling_psychologically ?? null,
      data.feeling_emotionally ?? null,
      data.feeling_energetically ?? null,
      data.meditation_practice ?? null,
      data.current_challenges ?? null,
      data.immersion_motivation ?? null,
      data.main_intention ?? null,
      data.wishlist ?? null,
      data.aroma_preferences ?? null,
      data.music_preferences ?? null,
      data.beverage_preference ?? null,
      data.dietary_restrictions ?? null,
      data.color_preferences ?? null,
      data.additional_observations ?? null,
      form.id,
    ]
  );

  return res.json(updated[0]);
}

// ============================================================
// /api/forms/prepare/:token — Unified client preparation
// ============================================================

type PrepareServiceType = "healing_wellness" | "pura_radiancia" | string;
type FormType = "healing_touch" | "pura_radiancia";

function mapServiceTypeToFormType(serviceType: PrepareServiceType): FormType {
  if (serviceType === "pura_radiancia") return "pura_radiancia";
  return "healing_touch";
}

async function handlePrepare(
  req: VercelRequest,
  res: VercelResponse,
  sql: ReturnType<typeof getDb>,
  token: string
) {
  if (!token) {
    return res.status(400).json({ error: "Token is required" });
  }

  if (req.method === "GET") {
    return await handlePrepareGet(sql, token, res);
  }

  if (req.method === "POST") {
    return await handlePreparePost(sql, token, req, res);
  }

  return res.status(405).json({ error: "Method not allowed" });
}

async function handlePrepareGet(
  sql: ReturnType<typeof getDb>,
  token: string,
  res: VercelResponse
) {
  // Fetch session + client via prepare_token
  const rows = await sql(
    `SELECT
       s.id                      AS session_id,
       s.scheduled_at,
       s.service_type,
       s.duration_minutes,
       s.prepare_token_expires_at,
       c.id                      AS client_id,
       c.first_name,
       c.last_name,
       c.email,
       c.phone,
       c.date_of_birth,
       c.gender,
       c.source
     FROM sessions s
     JOIN clients c ON c.id = s.client_id
     WHERE s.prepare_token = $1`,
    [token]
  );

  if (rows.length === 0) {
    return res.status(404).json({ error: "Prepare link not found" });
  }

  const row = rows[0];

  if (new Date(row.prepare_token_expires_at) < new Date()) {
    return res.status(410).json({ error: "Prepare link has expired" });
  }

  const clientId: string = row.client_id;
  const sessionId: string = row.session_id;

  // Count completed sessions (determines is_returning)
  const completedRows = await sql(
    `SELECT COUNT(*) AS cnt FROM sessions WHERE client_id = $1 AND status = 'completed'`,
    [clientId]
  );
  const totalCompleted = parseInt(completedRows[0]?.cnt ?? "0", 10);
  const isReturning = totalCompleted >= 1;

  // Last session date for returning clients
  let lastSessionDate: string | null = null;
  let lastCheckinScales: {
    physically: number;
    psychologically: number;
    emotionally: number;
    energetically: number;
  } | null = null;
  if (isReturning) {
    const lastRows = await sql(
      `SELECT scheduled_at FROM sessions WHERE client_id = $1 AND status = 'completed' ORDER BY scheduled_at DESC LIMIT 1`,
      [clientId]
    );
    lastSessionDate = lastRows[0]?.scheduled_at ?? null;

    // Fetch last checkin scales for returning clients
    const lastCheckinRows = await sql(
      `SELECT feeling_physically, feeling_psychologically, feeling_emotionally, feeling_energetically
       FROM returning_checkins
       WHERE client_id = $1
       ORDER BY completed_at DESC
       LIMIT 1`,
      [clientId]
    );
    if (lastCheckinRows.length > 0) {
      const lastCheckin = lastCheckinRows[0];
      lastCheckinScales = {
        physically: lastCheckin.feeling_physically as number,
        psychologically: lastCheckin.feeling_psychologically as number,
        emotionally: lastCheckin.feeling_emotionally as number,
        energetically: lastCheckin.feeling_energetically as number,
      };
    }
  }

  // Determine if personal data completion is needed
  const needsPersonalData =
    row.email === null || row.date_of_birth === null;
  const referralSourceKnown =
    row.source != null && row.source !== "manual";

  const formType = mapServiceTypeToFormType(row.service_type as PrepareServiceType);

  return res.json({
    client: {
      first_name: row.first_name,
      last_name: row.last_name ?? null,
      email: row.email ?? null,
      phone: row.phone ?? null,
      date_of_birth: row.date_of_birth ?? null,
      gender: row.gender ?? null,
    },
    session: {
      id: sessionId,
      scheduled_at: row.scheduled_at,
      service_type: row.service_type,
      duration_minutes: row.duration_minutes ?? 90,
    },
    is_returning: isReturning,
    needs_personal_data: needsPersonalData,
    referral_source_known: referralSourceKnown,
    form_type: formType,
    last_session_date: lastSessionDate,
    total_sessions: totalCompleted,
    last_checkin_scales: lastCheckinScales,
  });
}

async function handlePreparePost(
  sql: ReturnType<typeof getDb>,
  token: string,
  req: VercelRequest,
  res: VercelResponse
) {
  // Re-validate token and fetch context
  const rows = await sql(
    `SELECT
       s.id       AS session_id,
       s.prepare_token_expires_at,
       c.id       AS client_id
     FROM sessions s
     JOIN clients c ON c.id = s.client_id
     WHERE s.prepare_token = $1`,
    [token]
  );

  if (rows.length === 0) {
    return res.status(404).json({ error: "Prepare link not found" });
  }

  const row = rows[0];

  if (new Date(row.prepare_token_expires_at) < new Date()) {
    return res.status(410).json({ error: "Prepare link has expired" });
  }

  const clientId: string = row.client_id;
  const sessionId: string = row.session_id;

  const body = req.body ?? {};
  const {
    client_updates,
    intake,
    returning_checkin,
    consents,
  } = body;

  // ---- 1. Update client with non-null fields ----
  if (client_updates && typeof client_updates === "object") {
    const updates = client_updates as Record<string, unknown>;
    const allowedFields = [
      "email",
      "date_of_birth",
    ] as const;

    const setClauses: string[] = [];
    const values: unknown[] = [];
    let paramIdx = 1;

    for (const field of allowedFields) {
      const val = updates[field];
      if (val !== null && val !== undefined && val !== "") {
        setClauses.push(`${field} = $${paramIdx}`);
        values.push(val);
        paramIdx++;
      }
    }

    if (setClauses.length > 0) {
      values.push(clientId);
      await sql(
        `UPDATE clients SET ${setClauses.join(", ")}, updated_at = now() WHERE id = $${paramIdx}`,
        values
      );
    }
  }

  if (consents && typeof consents === "object") {
    await applyClientConsentUpdate(
      sql,
      clientId,
      consents as Record<string, unknown>,
      "prepare_public"
    );
  }

  // ---- 2. Create session_intake_forms record (new clients) ----
  if (intake && typeof intake === "object") {
    const i = intake as Record<string, unknown>;
    await sql(
      `INSERT INTO session_intake_forms
         (client_id, session_id, form_type, referral_source,
          motivation, main_objective, health_conditions, current_treatment,
          pregnant_breastfeeding, allergies_sensitivities,
          feeling_physically, feeling_psychologically, feeling_emotionally, feeling_energetically,
          meditation_practice, current_challenges, immersion_motivation, main_intention, wishlist,
          aroma_preferences, music_preferences, beverage_preference, dietary_restrictions, color_preferences,
          additional_observations, status, completed_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, 'completed', now())`,
      [
        clientId,
        sessionId,
        i.form_type ?? "healing_touch",
        i.referral_source ?? null,
        i.motivation ?? null,
        i.main_objective ?? null,
        i.health_conditions ?? null,
        i.current_treatment ?? null,
        i.pregnant_breastfeeding ?? null,
        i.allergies_sensitivities ?? null,
        i.feeling_physically ?? null,
        i.feeling_psychologically ?? null,
        i.feeling_emotionally ?? null,
        i.feeling_energetically ?? null,
        i.meditation_practice ?? null,
        i.current_challenges ?? null,
        i.immersion_motivation ?? null,
        i.main_intention ?? null,
        i.wishlist ?? null,
        i.aroma_preferences ?? null,
        i.music_preferences ?? null,
        i.beverage_preference ?? null,
        i.dietary_restrictions ?? null,
        i.color_preferences ?? null,
        i.additional_observations ?? null,
      ]
    );
  }

  // ---- 3. Create returning_checkins record (returning clients) ----
  if (returning_checkin && typeof returning_checkin === "object") {
    const rc = returning_checkin as Record<string, unknown>;
    await sql(
      `INSERT INTO returning_checkins
         (client_id, session_id,
          feeling_since_last, feeling_physically, feeling_psychologically,
          feeling_emotionally, feeling_energetically,
          health_changes, health_changes_details,
          session_focus, new_topic_details,
          additional_observations, completed_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, now())`,
      [
        clientId,
        sessionId,
        rc.feeling_since_last ?? null,
        rc.feeling_physically ?? null,
        rc.feeling_psychologically ?? null,
        rc.feeling_emotionally ?? null,
        rc.feeling_energetically ?? null,
        rc.health_changes ?? false,
        rc.health_changes_details ?? null,
        rc.session_focus ?? null,
        rc.new_topic_details ?? null,
        rc.additional_observations ?? null,
      ]
    );
  }

  // ---- 4. Clear prepare_token to prevent reuse ----
  await sql(
    `UPDATE sessions SET prepare_token = NULL, prepare_token_expires_at = NULL WHERE id = $1`,
    [sessionId]
  );

  return res.json({ success: true });
}

// ============================================================
// /api/forms/satisfaction/:token
// ============================================================

async function handleSatisfaction(
  req: VercelRequest,
  res: VercelResponse,
  sql: ReturnType<typeof getDb>,
  token: string
) {
  if (!token) {
    return res.status(400).json({ error: "Token is required" });
  }

  if (req.method === "GET") {
    return await handleSatisfactionGet(sql, token, res);
  }

  if (req.method === "POST") {
    return await handleSatisfactionPost(sql, token, req, res);
  }

  return res.status(405).json({ error: "Method not allowed" });
}

async function handleSatisfactionGet(
  sql: ReturnType<typeof getDb>,
  token: string,
  res: VercelResponse
) {
  const rows = await sql(
    `SELECT sr.*,
       json_build_object(
         'first_name', c.first_name,
         'last_name', c.last_name
       ) AS client,
       json_build_object(
         'service_type', s.service_type,
         'scheduled_at', s.scheduled_at,
         'duration_minutes', s.duration_minutes
       ) AS session
     FROM satisfaction_responses sr
     JOIN sessions s ON s.id = sr.session_id
     JOIN clients c ON c.id = sr.client_id
     WHERE sr.token = $1`,
    [token]
  );

  if (rows.length === 0) {
    return res.status(404).json({ error: "Form not found" });
  }

  const form = rows[0];

  if (form.completed_at !== null) {
    return res.status(409).json({ error: "Form already completed" });
  }

  if (new Date(form.token_expires_at) < new Date()) {
    return res.status(410).json({ error: "Token expired" });
  }

  return res.json({
    form_id: form.id,
    client: form.client,
    session: form.session,
  });
}

async function handleSatisfactionPost(
  sql: ReturnType<typeof getDb>,
  token: string,
  req: VercelRequest,
  res: VercelResponse
) {
  // Validate token
  const rows = await sql(
    "SELECT id, completed_at, token_expires_at FROM satisfaction_responses WHERE token = $1",
    [token]
  );

  if (rows.length === 0) {
    return res.status(404).json({ error: "Form not found" });
  }

  const form = rows[0];

  if (form.completed_at !== null) {
    return res.status(409).json({ error: "Form already completed" });
  }

  if (new Date(form.token_expires_at) < new Date()) {
    return res.status(410).json({ error: "Token expired" });
  }

  const data = req.body ?? {};

  // Validate required fields
  if (data.nps_score === undefined || data.nps_score === null) {
    return res.status(400).json({ error: "nps_score is required" });
  }

  if (data.nps_score < 0 || data.nps_score > 10) {
    return res.status(400).json({ error: "nps_score must be between 0 and 10" });
  }

  if (
    data.comfort_rating !== undefined &&
    data.comfort_rating !== null &&
    (data.comfort_rating < 1 || data.comfort_rating > 5)
  ) {
    return res
      .status(400)
      .json({ error: "comfort_rating must be between 1 and 5" });
  }

  const VALID_REBOOK = ["yes", "no", "maybe"];
  if (
    data.would_rebook !== undefined &&
    data.would_rebook !== null &&
    !VALID_REBOOK.includes(data.would_rebook)
  ) {
    return res
      .status(400)
      .json({ error: `would_rebook must be one of: ${VALID_REBOOK.join(", ")}` });
  }

  const updated = await sql(
    `UPDATE satisfaction_responses
     SET nps_score = $1,
         comfort_rating = $2,
         liked_most = $3,
         improvement_suggestions = $4,
         would_rebook = $5,
         completed_at = now()
     WHERE id = $6
     RETURNING *`,
    [
      data.nps_score,
      data.comfort_rating ?? null,
      data.liked_most ?? null,
      data.improvement_suggestions ?? null,
      data.would_rebook ?? null,
      form.id,
    ]
  );

  return res.json(updated[0]);
}

// ============================================================
// /api/forms/satisfaction/send — Create + send satisfaction form
// ============================================================

async function handleSatisfactionSend(
  req: VercelRequest,
  res: VercelResponse,
  sql: ReturnType<typeof getDb>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { session_id } = req.body ?? {};

  if (!session_id) {
    return res.status(400).json({ error: "session_id is required" });
  }

  // Fetch session and verify it is completed
  const sessionRows = await sql(
    "SELECT id, client_id, status, satisfaction_sent FROM sessions WHERE id = $1",
    [session_id]
  );

  if (sessionRows.length === 0) {
    return res.status(404).json({ error: "Session not found" });
  }

  const session = sessionRows[0];

  if (session.status !== "completed") {
    return res
      .status(400)
      .json({ error: "Session must be completed before sending satisfaction form" });
  }

  if (session.satisfaction_sent) {
    return res
      .status(409)
      .json({ error: "Satisfaction form already sent for this session" });
  }

  // Generate token and create satisfaction response record
  const token = randomUUID();

  await sql(
    `INSERT INTO satisfaction_responses (session_id, client_id, token, token_expires_at)
     VALUES ($1, $2, $3, now() + interval '7 days')`,
    [session_id, session.client_id, token]
  );

  // Mark session as satisfaction sent
  await sql(
    `UPDATE sessions
     SET satisfaction_sent = true, satisfaction_sent_at = now()
     WHERE id = $1`,
    [session_id]
  );

  const baseUrl = process.env.PUBLIC_URL ?? `https://${req.headers.host}`;
  const url = `${baseUrl}/satisfacao/${token}`;

  return res.status(201).json({ token, url });
}
