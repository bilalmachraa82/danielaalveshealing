import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb } from "../_db.js";
import { verifyAdmin } from "../_auth.js";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (!verifyAdmin(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const sql = getDb();
  const rawPath = req.query.__path;
  const pathSegments = typeof rawPath === "string" && rawPath !== ""
    ? rawPath.split("/")
    : Array.isArray(rawPath)
      ? rawPath
      : [];

  const route = pathSegments[0] ?? "stats";

  // POST-only routes
  if (route === "calendar-inbox-resolve") {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
    try {
      return await handleCalendarInboxResolve(req, res, sql);
    } catch (error: unknown) {
      console.error("Dashboard error:", error instanceof Error ? error.message : error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  // All other routes are GET-only
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

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
      case "calendar-inbox":
        return await handleCalendarInbox(res, sql);
      default:
        return res.status(404).json({ error: "Not found" });
    }
  } catch (error: unknown) {
    console.error("Dashboard error:", error instanceof Error ? error.message : error);
    return res.status(500).json({ error: "Internal server error" });
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

async function handleCalendarInbox(
  res: VercelResponse,
  sql: ReturnType<typeof getDb>
) {
  const rows = await sql(
    `SELECT id, google_event_id, summary, start_at, end_at, attendee_email, status, synced_at
     FROM calendar_inbox
     WHERE status = 'pending'
     ORDER BY start_at ASC
     LIMIT 20`
  );
  return res.json(rows);
}

async function handleCalendarInboxResolve(
  req: VercelRequest,
  res: VercelResponse,
  sql: ReturnType<typeof getDb>
) {
  const { inbox_id, action } = req.body ?? {};

  if (!inbox_id || !action) {
    return res.status(400).json({ error: "inbox_id and action are required" });
  }

  if (action === "dismiss") {
    await sql(
      `UPDATE calendar_inbox
       SET status = 'dismissed', resolved_by = 'admin', resolved_at = now()
       WHERE id = $1 AND status = 'pending'`,
      [inbox_id]
    );
    return res.json({ success: true });
  }

  if (action === "get_for_create") {
    const [item] = await sql(
      `SELECT id, summary, start_at, end_at, attendee_email
       FROM calendar_inbox WHERE id = $1`,
      [inbox_id]
    );
    if (!item) return res.status(404).json({ error: "Not found" });
    return res.json(item);
  }

  return res.status(400).json({ error: "Invalid action" });
}
