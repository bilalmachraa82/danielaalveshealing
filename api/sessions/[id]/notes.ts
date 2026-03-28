import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb } from "../../_db";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const sql = getDb();
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Session ID is required" });
  }

  try {
    if (req.method === "GET") {
      const rows = await sql(
        "SELECT * FROM session_notes WHERE session_id = $1 ORDER BY created_at DESC LIMIT 1",
        [id]
      );
      return res.json(rows[0] ?? null);
    }

    if (req.method === "POST" || req.method === "PUT") {
      const data = req.body;

      // Upsert: check if note exists
      const existing = await sql(
        "SELECT id FROM session_notes WHERE session_id = $1 LIMIT 1",
        [id]
      );

      if (existing.length > 0) {
        const rows = await sql(
          `UPDATE session_notes
           SET subjective = $1, objective = $2, assessment = $3, plan = $4, body_map_data = $5
           WHERE id = $6
           RETURNING *`,
          [
            data.subjective ?? null,
            data.objective ?? null,
            data.assessment ?? null,
            data.plan ?? null,
            JSON.stringify(data.body_map_data ?? []),
            existing[0].id,
          ]
        );
        return res.json(rows[0]);
      }

      const rows = await sql(
        `INSERT INTO session_notes (session_id, subjective, objective, assessment, plan, body_map_data)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          id,
          data.subjective ?? null,
          data.objective ?? null,
          data.assessment ?? null,
          data.plan ?? null,
          JSON.stringify(data.body_map_data ?? []),
        ]
      );
      return res.status(201).json(rows[0]);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return res.status(500).json({ error: message });
  }
}
