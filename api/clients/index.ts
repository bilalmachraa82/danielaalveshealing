import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb } from "../_db.js";
import {
  extractAnamnesisFromImages,
  extractSessionNotesFromImages,
} from "../_ocr.js";

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

    // /api/clients/ocr/*
    if (pathSegments[0] === "ocr") {
      return await handleOcr(req, res, sql, pathSegments.slice(1));
    }

    // /api/clients/[id]/wellness
    if (pathSegments.length === 2 && pathSegments[1] === "wellness") {
      return await handleClientWellness(req, res, sql, pathSegments[0]);
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

// ============================================================
// /api/clients/[id]/wellness — Wellness progress data
// ============================================================

async function handleClientWellness(
  req: VercelRequest,
  res: VercelResponse,
  sql: ReturnType<typeof getDb>,
  clientId: string
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const rows = await sql(
    `SELECT date, feeling_physically, feeling_psychologically, feeling_emotionally, feeling_energetically
     FROM (
       SELECT s.scheduled_at AS date,
              sif.feeling_physically,
              sif.feeling_psychologically,
              sif.feeling_emotionally,
              sif.feeling_energetically
       FROM session_intake_forms sif
       JOIN sessions s ON s.id = sif.session_id
       WHERE sif.client_id = $1 AND sif.feeling_physically IS NOT NULL
       UNION ALL
       SELECT s.scheduled_at AS date,
              rc.feeling_physically,
              rc.feeling_psychologically,
              rc.feeling_emotionally,
              rc.feeling_energetically
       FROM returning_checkins rc
       JOIN sessions s ON s.id = rc.session_id
       WHERE rc.client_id = $1
     ) combined
     ORDER BY date ASC`,
    [clientId]
  );

  return res.json(rows);
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

// ============================================================
// /api/clients/ocr/* — OCR-based client file import
// ============================================================

interface OcrImage {
  base64: string;
  mediaType: string;
}

interface OcrAnamnesisRequest {
  images: OcrImage[];
}

interface OcrSessionNotesRequest {
  images: OcrImage[];
}

interface OcrSaveRequest {
  client_id?: string;
  client: {
    first_name: string;
    last_name?: string;
    date_of_birth?: string | null;
    height_cm?: number | null;
    weight_kg?: number | null;
    profession?: string | null;
    phone?: string | null;
    email?: string | null;
  };
  health_general: Record<string, { has: boolean; details: string }>;
  lifestyle: Record<string, { answer: string }>;
  body_map_notes?: string;
  pain_trigger?: { has: boolean; details: string };
  massage_experience?: { has: boolean; details: string };
  session_objectives?: string;
  declaration_date?: string | null;
  sessions?: Array<{
    date: string;
    raw_text: string;
    treatments?: string[];
    body_areas?: string[];
    emotional_themes?: string[];
    supplements_florals?: string[];
    observations?: string;
    follow_up?: string;
  }>;
}

async function handleOcr(
  req: VercelRequest,
  res: VercelResponse,
  sql: ReturnType<typeof getDb>,
  pathSegments: string[]
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const action = pathSegments[0];

  // POST /api/clients/ocr/anamnesis — extract anamnesis from images
  if (action === "anamnesis") {
    const { images } = req.body as OcrAnamnesisRequest;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: "At least one image is required" });
    }

    if (images.length > 4) {
      return res.status(400).json({ error: "Maximum 4 images allowed" });
    }

    const extracted = await extractAnamnesisFromImages(images);
    return res.json({ extracted });
  }

  // POST /api/clients/ocr/session-notes — extract session notes from images
  if (action === "session-notes") {
    const { images } = req.body as OcrSessionNotesRequest;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: "At least one image is required" });
    }

    if (images.length > 6) {
      return res.status(400).json({ error: "Maximum 6 images allowed" });
    }

    const extracted = await extractSessionNotesFromImages(images);
    return res.json({ extracted });
  }

  // POST /api/clients/ocr/save — save reviewed/corrected data
  if (action === "save") {
    const data = req.body as OcrSaveRequest;

    if (!data.client?.first_name?.trim()) {
      return res.status(400).json({ error: "Client first_name is required" });
    }

    let clientId = data.client_id ?? null;

    // --- 1. Create or update client ---
    if (!clientId) {
      const clientRows = await sql(
        `INSERT INTO clients (first_name, last_name, email, phone, date_of_birth, height_cm, weight_kg, profession, source)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'manual')
         RETURNING id`,
        [
          data.client.first_name.trim(),
          data.client.last_name?.trim() ?? null,
          data.client.email?.trim().toLowerCase() ?? null,
          data.client.phone?.trim() ?? null,
          data.client.date_of_birth ?? null,
          data.client.height_cm ?? null,
          data.client.weight_kg ?? null,
          data.client.profession?.trim() ?? null,
        ]
      );
      clientId = clientRows[0].id;
    } else {
      // Update existing client with any new info from OCR
      await sql(
        `UPDATE clients
         SET height_cm = COALESCE($2, height_cm),
             weight_kg = COALESCE($3, weight_kg),
             profession = COALESCE($4, profession),
             date_of_birth = COALESCE($5, date_of_birth)
         WHERE id = $1`,
        [
          clientId,
          data.client.height_cm ?? null,
          data.client.weight_kg ?? null,
          data.client.profession?.trim() ?? null,
          data.client.date_of_birth ?? null,
        ]
      );
    }

    // --- 2. Create anamnesis form ---
    let anamnesisId: string | null = null;

    if (data.health_general || data.lifestyle) {
      const anamnesisRows = await sql(
        `INSERT INTO anamnesis_forms (
           client_id, health_general, lifestyle, body_map_data,
           has_pain_trigger, pain_trigger_task,
           previous_massage_experience, previous_massage_details,
           session_objectives, declaration_accepted, declaration_date,
           status, completed_at
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'completed', NOW())
         RETURNING id`,
        [
          clientId,
          JSON.stringify(data.health_general ?? {}),
          JSON.stringify(data.lifestyle ?? {}),
          JSON.stringify([]),
          data.pain_trigger?.has ?? null,
          data.pain_trigger?.details ?? null,
          data.massage_experience?.has ?? null,
          data.massage_experience?.details ?? null,
          data.session_objectives ?? null,
          true,
          data.declaration_date ?? null,
        ]
      );
      anamnesisId = anamnesisRows[0].id;
    }

    // --- 3. Create sessions from OCR session notes ---
    let sessionsCreated = 0;

    if (data.sessions && data.sessions.length > 0) {
      for (const sessionData of data.sessions) {
        if (!sessionData.date) continue;

        // Create a session record
        const sessionRows = await sql(
          `INSERT INTO sessions (client_id, scheduled_at, service_type, status, notes)
           VALUES ($1, $2, 'healing_wellness', 'completed', $3)
           RETURNING id`,
          [
            clientId,
            sessionData.date,
            sessionData.raw_text ?? null,
          ]
        );

        const sessionId = sessionRows[0].id;

        // Build SOAP-style note from OCR data
        const subjective = [
          sessionData.emotional_themes?.length
            ? `Temas emocionais: ${sessionData.emotional_themes.join(", ")}`
            : null,
          sessionData.observations || null,
        ]
          .filter(Boolean)
          .join("\n");

        const objective = [
          sessionData.body_areas?.length
            ? `Zonas trabalhadas: ${sessionData.body_areas.join(", ")}`
            : null,
          sessionData.treatments?.length
            ? `Tratamentos: ${sessionData.treatments.join(", ")}`
            : null,
        ]
          .filter(Boolean)
          .join("\n");

        const plan = [
          sessionData.supplements_florals?.length
            ? `Florais/Suplementos: ${sessionData.supplements_florals.join(", ")}`
            : null,
          sessionData.follow_up || null,
        ]
          .filter(Boolean)
          .join("\n");

        await sql(
          `INSERT INTO session_notes (session_id, subjective, objective, plan)
           VALUES ($1, $2, $3, $4)`,
          [
            sessionId,
            subjective || null,
            objective || null,
            plan || null,
          ]
        );

        sessionsCreated++;
      }
    }

    // --- 4. Tag client as "Digitalizado" ---
    try {
      const tagRows = await sql(
        `INSERT INTO tags (name, color)
         VALUES ('Digitalizado', '#985F97')
         ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
         RETURNING id`,
        []
      );
      const tagId = tagRows[0]?.id;
      if (tagId && clientId) {
        await sql(
          `INSERT INTO client_tags (client_id, tag_id)
           VALUES ($1, $2)
           ON CONFLICT (client_id, tag_id) DO NOTHING`,
          [clientId, tagId]
        );
      }
    } catch {
      // Non-critical
    }

    return res.status(201).json({
      client_id: clientId,
      anamnesis_id: anamnesisId,
      sessions_created: sessionsCreated,
    });
  }

  return res.status(404).json({ error: "OCR endpoint not found" });
}
