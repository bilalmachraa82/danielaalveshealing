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
        el.id,
        c.first_name || ' ' || COALESCE(c.last_name, '') AS client_name,
        el.email_type,
        el.status,
        el.sent_at
      FROM email_log el
      JOIN clients c ON c.id = el.client_id
      ORDER BY el.sent_at DESC
      LIMIT 10
    `);

    return res.json(rows);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return res.status(500).json({ error: message });
  }
}
