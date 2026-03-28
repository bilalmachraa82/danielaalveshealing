import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb } from "../_db";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const sql = getDb();

  try {
    const rows = await sql(`
      SELECT
        sr.id,
        c.first_name || ' ' || COALESCE(c.last_name, '') AS client_name,
        s.service_type,
        sr.nps_score,
        sr.comfort_rating,
        sr.completed_at
      FROM satisfaction_responses sr
      JOIN sessions s ON s.id = sr.session_id
      JOIN clients c ON c.id = sr.client_id
      WHERE sr.completed_at IS NOT NULL
      ORDER BY sr.completed_at DESC
      LIMIT 5
    `);

    return res.json(rows);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return res.status(500).json({ error: message });
  }
}
