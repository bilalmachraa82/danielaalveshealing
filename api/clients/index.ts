import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb } from "../_db.js";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const sql = getDb();
  const rawPath = req.query.__path;
  const pathSegments = typeof rawPath === "string" && rawPath !== ""
    ? rawPath.split("/")
    : Array.isArray(rawPath)
      ? rawPath
      : [];

  try {
    // /api/clients (no path segments)
    if (pathSegments.length === 0) {
      return await handleClientsList(req, res, sql);
    }

    // /api/clients/[id]/tags
    if (pathSegments.length === 2 && pathSegments[1] === "tags") {
      return await handleClientTags(req, res, sql, pathSegments[0]);
    }

    // /api/clients/[id]
    if (pathSegments.length === 1) {
      return await handleClientById(req, res, sql, pathSegments[0]);
    }

    return res.status(404).json({ error: "Not found" });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return res.status(500).json({ error: message });
  }
}

async function handleClientsList(
  req: VercelRequest,
  res: VercelResponse,
  sql: ReturnType<typeof getDb>
) {
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
}

async function handleClientById(
  req: VercelRequest,
  res: VercelResponse,
  sql: ReturnType<typeof getDb>,
  id: string
) {
  if (req.method === "GET") {
    const rows = await sql("SELECT * FROM clients WHERE id = $1", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Client not found" });
    }
    return res.json(rows[0]);
  }

  if (req.method === "PUT" || req.method === "PATCH") {
    const data = req.body;
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value === "" ? null : value);
        paramIndex++;
      }
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    values.push(id);
    const rows = await sql(
      `UPDATE clients SET ${fields.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Client not found" });
    }

    return res.json(rows[0]);
  }

  if (req.method === "DELETE") {
    await sql("DELETE FROM clients WHERE id = $1", [id]);
    return res.status(204).end();
  }

  return res.status(405).json({ error: "Method not allowed" });
}

async function handleClientTags(
  req: VercelRequest,
  res: VercelResponse,
  sql: ReturnType<typeof getDb>,
  clientId: string
) {
  if (req.method === "GET") {
    const rows = await sql(
      `SELECT t.* FROM tags t
       JOIN client_tags ct ON ct.tag_id = t.id
       WHERE ct.client_id = $1
       ORDER BY t.name`,
      [clientId]
    );
    return res.json(rows);
  }

  if (req.method === "POST") {
    const { tag_id } = req.body;
    await sql(
      `INSERT INTO client_tags (client_id, tag_id)
       VALUES ($1, $2)
       ON CONFLICT (client_id, tag_id) DO NOTHING`,
      [clientId, tag_id]
    );
    return res.status(201).json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
