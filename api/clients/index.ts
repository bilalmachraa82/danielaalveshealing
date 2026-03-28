import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb } from "../_db";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const sql = getDb();

  try {
    if (req.method === "GET") {
      const { status, search } = req.query;
      let query = "SELECT * FROM clients";
      const conditions: string[] = [];
      const params: unknown[] = [];

      if (status && typeof status === "string") {
        conditions.push(`status = $${conditions.length + 1}`);
        params.push(status);
      }

      if (search && typeof search === "string") {
        const paramIdx = conditions.length + 1;
        conditions.push(
          `(first_name ILIKE $${paramIdx} OR last_name ILIKE $${paramIdx} OR email ILIKE $${paramIdx} OR phone ILIKE $${paramIdx})`
        );
        params.push(`%${search}%`);
      }

      if (conditions.length > 0) {
        query += " WHERE " + conditions.join(" AND ");
      }

      query += " ORDER BY created_at DESC";
      const rows = await sql(query, params);
      return res.json(rows);
    }

    if (req.method === "POST") {
      const data = req.body;

      const rows = await sql(
        `INSERT INTO clients (first_name, last_name, email, phone, date_of_birth, height_cm, weight_kg, profession, address, city, postal_code, country, source, consent_data_processing, consent_marketing, consent_given_at, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
         RETURNING *`,
        [
          data.first_name,
          data.last_name ?? null,
          data.email || null,
          data.phone ?? null,
          data.date_of_birth ?? null,
          data.height_cm ?? null,
          data.weight_kg ?? null,
          data.profession ?? null,
          data.address ?? null,
          data.city ?? null,
          data.postal_code ?? null,
          data.country ?? "PT",
          data.source ?? "manual",
          data.consent_data_processing ?? false,
          data.consent_marketing ?? false,
          data.consent_data_processing ? new Date().toISOString() : null,
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
