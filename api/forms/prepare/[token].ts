/**
 * Unified client preparation endpoint
 *
 * Route: /api/forms/prepare/:token
 *
 * GET  — Validate token, return adaptive form payload
 * POST — Save all form data in a single transaction
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb } from "../../_db.js";

// ============================================================
// Types
// ============================================================

type ServiceType = "healing_wellness" | "pura_radiancia" | string;
type FormType = "healing_touch" | "pura_radiancia";

function mapServiceTypeToFormType(serviceType: ServiceType): FormType {
  if (serviceType === "pura_radiancia") return "pura_radiancia";
  return "healing_touch";
}

// ============================================================
// Handler
// ============================================================

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const sql = getDb();
  const { token } = req.query;

  if (!token || typeof token !== "string") {
    return res.status(400).json({ error: "Token is required" });
  }

  try {
    if (req.method === "GET") {
      return await handleGet(sql, token, res);
    }

    if (req.method === "POST") {
      return await handlePost(sql, token, req, res);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return res.status(500).json({ error: message });
  }
}

// ============================================================
// GET — load adaptive form context
// ============================================================

async function handleGet(
  sql: ReturnType<typeof import("../../_db.js").getDb>,
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
       c.height_cm,
       c.weight_kg,
       c.profession
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
  if (isReturning) {
    const lastRows = await sql(
      `SELECT scheduled_at FROM sessions WHERE client_id = $1 AND status = 'completed' ORDER BY scheduled_at DESC LIMIT 1`,
      [clientId]
    );
    lastSessionDate = lastRows[0]?.scheduled_at ?? null;
  }

  // Determine if anamnesis is needed
  const anamnesisRows = await sql(
    `SELECT id FROM anamnesis_forms WHERE client_id = $1 AND status = 'completed' LIMIT 1`,
    [clientId]
  );
  const needsAnamnesis = anamnesisRows.length === 0;

  // Determine if personal data completion is needed
  const needsPersonalData =
    row.email === null || row.date_of_birth === null;

  const formType = mapServiceTypeToFormType(row.service_type as ServiceType);

  return res.json({
    client: {
      first_name: row.first_name,
      last_name: row.last_name ?? null,
      email: row.email ?? null,
      phone: row.phone ?? null,
      date_of_birth: row.date_of_birth ?? null,
      height_cm: row.height_cm ?? null,
      weight_kg: row.weight_kg ?? null,
      profession: row.profession ?? null,
    },
    session: {
      id: sessionId,
      scheduled_at: row.scheduled_at,
      service_type: row.service_type,
      duration_minutes: row.duration_minutes ?? 90,
    },
    is_returning: isReturning,
    needs_anamnesis: needsAnamnesis,
    needs_personal_data: needsPersonalData,
    form_type: formType,
    last_session_date: lastSessionDate,
    total_sessions: totalCompleted,
  });
}

// ============================================================
// POST — save all form data in one transaction
// ============================================================

async function handlePost(
  sql: ReturnType<typeof import("../../_db.js").getDb>,
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
    anamnesis,
    intake,
    returning_checkin,
    declaration_accepted,
  } = body;

  // ---- 1. Update client with non-null fields ----
  if (client_updates && typeof client_updates === "object") {
    const updates = client_updates as Record<string, unknown>;
    const allowedFields = [
      "email",
      "date_of_birth",
      "profession",
      "height_cm",
      "weight_kg",
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

  // ---- 2. Create anamnesis_forms record ----
  if (anamnesis && typeof anamnesis === "object") {
    const a = anamnesis as Record<string, unknown>;
    await sql(
      `INSERT INTO anamnesis_forms
         (client_id, session_id, health_general, lifestyle, body_map_data,
          has_pain_trigger, pain_trigger_task, declaration_accepted,
          declaration_date, status, completed_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now(), 'completed', now())`,
      [
        clientId,
        sessionId,
        JSON.stringify(a.health_general ?? {}),
        JSON.stringify(a.lifestyle ?? {}),
        JSON.stringify(a.body_map_data ?? []),
        a.has_pain_trigger ?? false,
        a.pain_trigger_task ?? null,
        declaration_accepted ?? false,
      ]
    );
  }

  // ---- 3. Create session_intake_forms record ----
  if (intake && typeof intake === "object") {
    const i = intake as Record<string, unknown>;
    await sql(
      `INSERT INTO session_intake_forms
         (client_id, session_id, form_type,
          motivation, main_objective, health_conditions, current_treatment,
          pregnant_breastfeeding, allergies_sensitivities,
          feeling_physically, feeling_psychologically, feeling_emotionally, feeling_energetically,
          meditation_practice, immersion_motivation, main_intention, wishlist,
          aroma_preferences, music_preferences, beverage_preference, color_preferences,
          additional_observations, status, completed_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, 'completed', now())`,
      [
        clientId,
        sessionId,
        i.form_type ?? "healing_touch",
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
        i.immersion_motivation ?? null,
        i.main_intention ?? null,
        i.wishlist ?? null,
        i.aroma_preferences ?? null,
        i.music_preferences ?? null,
        i.beverage_preference ?? null,
        i.color_preferences ?? null,
        i.additional_observations ?? null,
      ]
    );
  }

  // ---- 4. Create returning_checkins record ----
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

  // ---- 5. Clear prepare_token to prevent reuse ----
  await sql(
    `UPDATE sessions SET prepare_token = NULL, prepare_token_expires_at = NULL WHERE id = $1`,
    [sessionId]
  );

  return res.json({ success: true });
}
