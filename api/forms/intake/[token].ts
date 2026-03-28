import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb } from "../../_db.js";

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

async function handleGet(
  sql: ReturnType<typeof import("../../_db.js").getDb>,
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

async function handlePost(
  sql: ReturnType<typeof import("../../_db.js").getDb>,
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
