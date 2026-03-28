import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb } from "../_db.js";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const sql = getDb();

  try {
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";

    if (!q || q.length < 2) {
      return res.json([]);
    }

    const searchPattern = `%${q}%`;

    const rows = await sql(
      `SELECT
        c.id,
        c.first_name,
        c.last_name,
        c.phone,
        c.email,
        MAX(s.scheduled_at) AS last_session_date,
        COUNT(s.id)::int AS total_sessions,
        EXISTS(
          SELECT 1 FROM anamnesis_forms af
          WHERE af.client_id = c.id AND af.status = 'completed'
        ) AS has_anamnesis
      FROM clients c
      LEFT JOIN sessions s ON s.client_id = c.id
      WHERE
        c.first_name ILIKE $1
        OR c.last_name ILIKE $1
        OR c.phone ILIKE $1
        OR c.email ILIKE $1
      GROUP BY c.id
      ORDER BY MAX(s.scheduled_at) DESC NULLS LAST, c.first_name ASC
      LIMIT 5`,
      [searchPattern]
    );

    return res.json(rows);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return res.status(500).json({ error: message });
  }
}
