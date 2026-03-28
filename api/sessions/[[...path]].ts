import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb } from "../_db.js";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const sql = getDb();
  const pathSegments = Array.isArray(req.query.path)
    ? req.query.path
    : req.query.path
      ? [req.query.path]
      : [];

  try {
    // /api/sessions (no path segments)
    if (pathSegments.length === 0) {
      return await handleSessionsList(req, res, sql);
    }

    // /api/sessions/[id]/notes
    if (pathSegments.length === 2 && pathSegments[1] === "notes") {
      return await handleSessionNotes(req, res, sql, pathSegments[0]);
    }

    // /api/sessions/[id]
    if (pathSegments.length === 1) {
      return await handleSessionById(req, res, sql, pathSegments[0]);
    }

    return res.status(404).json({ error: "Not found" });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return res.status(500).json({ error: message });
  }
}

async function handleSessionsList(
  req: VercelRequest,
  res: VercelResponse,
  sql: ReturnType<typeof getDb>
) {
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
}

async function handleSessionById(
  req: VercelRequest,
  res: VercelResponse,
  sql: ReturnType<typeof getDb>,
  id: string
) {
  if (req.method === "GET") {
    const rows = await sql(
      `SELECT s.*,
        json_build_object(
          'id', c.id,
          'first_name', c.first_name,
          'last_name', c.last_name,
          'email', c.email,
          'phone', c.phone
        ) AS client
       FROM sessions s
       JOIN clients c ON c.id = s.client_id
       WHERE s.id = $1`,
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Session not found" });
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
        values.push(value);
        paramIndex++;
      }
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    values.push(id);
    const rows = await sql(
      `UPDATE sessions SET ${fields.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Session not found" });
    }

    return res.json(rows[0]);
  }

  return res.status(405).json({ error: "Method not allowed" });
}

async function handleSessionNotes(
  req: VercelRequest,
  res: VercelResponse,
  sql: ReturnType<typeof getDb>,
  sessionId: string
) {
  if (req.method === "GET") {
    const rows = await sql(
      "SELECT * FROM session_notes WHERE session_id = $1 ORDER BY created_at DESC LIMIT 1",
      [sessionId]
    );
    return res.json(rows[0] ?? null);
  }

  if (req.method === "POST" || req.method === "PUT") {
    const data = req.body;

    // Upsert: check if note exists
    const existing = await sql(
      "SELECT id FROM session_notes WHERE session_id = $1 LIMIT 1",
      [sessionId]
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
        sessionId,
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
}
