import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb } from "../_db.js";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const sql = getDb();

  try {
    if (req.method === "GET") {
      const rows = await sql(
        "SELECT * FROM tags ORDER BY category, name"
      );
      return res.json(rows);
    }

    if (req.method === "POST") {
      const { name, category, color } = req.body;
      const rows = await sql(
        `INSERT INTO tags (name, category, color)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [name, category ?? "custom", color ?? null]
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
