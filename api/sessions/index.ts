import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb } from "../_db";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const sql = getDb();

  try {
    if (req.method === "GET") {
      const { client_id, status, from, to } = req.query;
      let query = `
        SELECT s.*,
          json_build_object(
            'id', c.id,
            'first_name', c.first_name,
            'last_name', c.last_name,
            'email', c.email,
            'phone', c.phone
          ) AS client
        FROM sessions s
        JOIN clients c ON c.id = s.client_id
      `;
      const conditions: string[] = [];
      const params: unknown[] = [];

      if (client_id && typeof client_id === "string") {
        conditions.push(`s.client_id = $${conditions.length + 1}`);
        params.push(client_id);
      }

      if (status && typeof status === "string") {
        conditions.push(`s.status = $${conditions.length + 1}`);
        params.push(status);
      }

      if (from && typeof from === "string") {
        conditions.push(`s.scheduled_at >= $${conditions.length + 1}`);
        params.push(from);
      }

      if (to && typeof to === "string") {
        conditions.push(`s.scheduled_at <= $${conditions.length + 1}`);
        params.push(to);
      }

      if (conditions.length > 0) {
        query += " WHERE " + conditions.join(" AND ");
      }

      query += " ORDER BY s.scheduled_at DESC";
      const rows = await sql(query, params);
      return res.json(rows);
    }

    if (req.method === "POST") {
      const data = req.body;

      const rows = await sql(
        `INSERT INTO sessions (client_id, scheduled_at, duration_minutes, service_type, price_cents, payment_method, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          data.client_id,
          data.scheduled_at,
          data.duration_minutes ?? 120,
          data.service_type,
          data.price_cents ?? null,
          data.payment_method ?? null,
          data.notes ?? null,
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
