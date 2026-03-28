import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb } from "../../_db";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const sql = getDb();
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Client ID is required" });
  }

  try {
    if (req.method === "GET") {
      const rows = await sql(
        `SELECT t.* FROM tags t
         JOIN client_tags ct ON ct.tag_id = t.id
         WHERE ct.client_id = $1
         ORDER BY t.name`,
        [id]
      );
      return res.json(rows);
    }

    if (req.method === "POST") {
      const { tag_id } = req.body;
      await sql(
        `INSERT INTO client_tags (client_id, tag_id)
         VALUES ($1, $2)
         ON CONFLICT (client_id, tag_id) DO NOTHING`,
        [id, tag_id]
      );
      return res.status(201).json({ ok: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return res.status(500).json({ error: message });
  }
}
