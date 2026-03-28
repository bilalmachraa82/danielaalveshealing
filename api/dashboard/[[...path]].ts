import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb } from "../_db.js";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const sql = getDb();
  const pathSegments = Array.isArray(req.query.path)
    ? req.query.path
    : req.query.path
      ? [req.query.path]
      : [];

  const route = pathSegments[0] ?? "stats";

  try {
    switch (route) {
      case "stats":
        return await handleStats(res, sql);
      case "pending-forms":
        return await handlePendingForms(res, sql);
      case "recent-satisfaction":
        return await handleRecentSatisfaction(res, sql);
      case "email-log":
        return await handleEmailLog(res, sql);
      default:
        return res.status(404).json({ error: "Not found" });
    }
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return res.status(500).json({ error: message });
  }
}

async function handleStats(
  res: VercelResponse,
  sql: ReturnType<typeof getDb>
) {
  const [clientStats] = await sql(`
    SELECT
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status = 'active') as active
    FROM clients
  `);

  const [sessionStats] = await sql(`
    SELECT
      COUNT(*) FILTER (WHERE scheduled_at >= date_trunc('month', now()) AND scheduled_at < date_trunc('month', now()) + interval '1 month') as this_month,
      COUNT(*) FILTER (WHERE scheduled_at >= now() AND status IN ('scheduled', 'confirmed')) as upcoming
    FROM sessions
  `);

  const [npsStats] = await sql(`
    SELECT
      ROUND(AVG(nps_score)::numeric, 1) as avg_nps,
      COUNT(*) as total_responses
    FROM satisfaction_responses
    WHERE completed_at IS NOT NULL
  `);

  return res.json({
    clients: {
      total: Number(clientStats.total),
      active: Number(clientStats.active),
    },
    sessions: {
      this_month: Number(sessionStats.this_month),
      upcoming: Number(sessionStats.upcoming),
    },
    nps: {
      average: npsStats.avg_nps ? Number(npsStats.avg_nps) : null,
      total_responses: Number(npsStats.total_responses),
    },
  });
}

async function handlePendingForms(
  res: VercelResponse,
  sql: ReturnType<typeof getDb>
) {
  const anamnesisForms = await sql(`
    SELECT
      af.id,
      'anamnesis' AS type,
      c.first_name || ' ' || COALESCE(c.last_name, '') AS client_name,
      'anamnese' AS form_type,
      af.created_at AS sent_at
    FROM anamnesis_forms af
    JOIN clients c ON c.id = af.client_id
    WHERE af.status = 'sent'
    ORDER BY af.created_at DESC
  `);

  const intakeForms = await sql(`
    SELECT
      sif.id,
      'intake' AS type,
      c.first_name || ' ' || COALESCE(c.last_name, '') AS client_name,
      sif.form_type,
      sif.created_at AS sent_at
    FROM session_intake_forms sif
    JOIN clients c ON c.id = sif.client_id
    WHERE sif.status = 'sent'
    ORDER BY sif.created_at DESC
  `);

  const combined = [...anamnesisForms, ...intakeForms].sort(
    (a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime()
  );

  return res.json(combined);
}

async function handleRecentSatisfaction(
  res: VercelResponse,
  sql: ReturnType<typeof getDb>
) {
  const rows = await sql(`
    SELECT
      sr.id,
      c.first_name || ' ' || COALESCE(c.last_name, '') AS client_name,
      s.service_type,
      sr.nps_score,
      sr.comfort_rating,
      sr.completed_at
    FROM satisfaction_responses sr
    JOIN sessions s ON s.id = sr.session_id
    JOIN clients c ON c.id = sr.client_id
    WHERE sr.completed_at IS NOT NULL
    ORDER BY sr.completed_at DESC
    LIMIT 5
  `);

  return res.json(rows);
}

async function handleEmailLog(
  res: VercelResponse,
  sql: ReturnType<typeof getDb>
) {
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
}
