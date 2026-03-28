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

    // /api/clients/search
    if (pathSegments[0] === "search") {
      return await handleClientSearch(req, res, sql);
    }

    // /api/clients/import
    if (pathSegments[0] === "import") {
      return await handleClientImport(req, res, sql);
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

// ============================================================
// /api/clients/search — Quick client search with session info
// ============================================================

async function handleClientSearch(
  req: VercelRequest,
  res: VercelResponse,
  sql: ReturnType<typeof getDb>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

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
}

// ============================================================
// /api/clients/import — Bulk client import
// ============================================================

interface ClientImportRow {
  first_name: string;
  last_name?: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  profession?: string;
  notes?: string;
}

interface ImportError {
  row: number;
  error: string;
}

async function handleClientImport(
  req: VercelRequest,
  res: VercelResponse,
  sql: ReturnType<typeof getDb>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { clients } = req.body as { clients: ClientImportRow[] };

  if (!Array.isArray(clients) || clients.length === 0) {
    return res.status(400).json({ error: "clients array is required" });
  }

  let imported = 0;
  let skipped = 0;
  const errors: ImportError[] = [];

  // Find or create the "Importado" tag once
  let importedTagId: string | null = null;
  try {
    const tagRows = await sql(
      `INSERT INTO tags (name, color)
       VALUES ('Importado', '#985F97')
       ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      []
    );
    importedTagId = tagRows[0]?.id ?? null;
  } catch {
    // Non-critical — continue without tagging
  }

  for (let i = 0; i < clients.length; i++) {
    const client = clients[i];
    const rowNum = i + 1;

    if (!client.first_name?.trim()) {
      errors.push({ row: rowNum, error: "Nome é obrigatório" });
      continue;
    }

    try {
      // Check for duplicate email or phone
      if (client.email || client.phone) {
        const conditions: string[] = [];
        const params: unknown[] = [];

        if (client.email?.trim()) {
          conditions.push(`email = $${params.length + 1}`);
          params.push(client.email.trim().toLowerCase());
        }
        if (client.phone?.trim()) {
          conditions.push(`phone = $${params.length + 1}`);
          params.push(client.phone.trim());
        }

        const existing = await sql(
          `SELECT id FROM clients WHERE ${conditions.join(" OR ")} LIMIT 1`,
          params
        );

        if (existing.length > 0) {
          skipped++;
          continue;
        }
      }

      const rows = await sql(
        `INSERT INTO clients (first_name, last_name, email, phone, date_of_birth, profession, notes, source)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id`,
        [
          client.first_name.trim(),
          client.last_name?.trim() ?? null,
          client.email?.trim().toLowerCase() ?? null,
          client.phone?.trim() ?? null,
          client.date_of_birth?.trim() ?? null,
          client.profession?.trim() ?? null,
          client.notes?.trim() ?? null,
          "manual",
        ]
      );

      const newClientId = rows[0]?.id;

      if (newClientId && importedTagId) {
        try {
          await sql(
            `INSERT INTO client_tags (client_id, tag_id)
             VALUES ($1, $2)
             ON CONFLICT (client_id, tag_id) DO NOTHING`,
            [newClientId, importedTagId]
          );
        } catch {
          // Non-critical — tag insertion failure doesn't block import
        }
      }

      imported++;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      errors.push({ row: rowNum, error: message });
    }
  }

  return res.status(200).json({ imported, skipped, errors });
}
