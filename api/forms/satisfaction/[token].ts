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

async function handlePost(
  sql: ReturnType<typeof import("../../_db").getDb>,
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
