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
  sql: ReturnType<typeof import("../../_db").getDb>,
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

async function handlePost(
  sql: ReturnType<typeof import("../../_db").getDb>,
  token: string,
  req: VercelRequest,
  res: VercelResponse
) {
  // Validate token
  const rows = await sql(
    "SELECT id, status, token_expires_at FROM anamnesis_forms WHERE token = $1",
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
