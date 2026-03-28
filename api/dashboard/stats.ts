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
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return res.status(500).json({ error: message });
  }
}
