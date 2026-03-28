import type { VercelRequest, VercelResponse } from "@vercel/node";
import { randomUUID } from "crypto";
import { getDb } from "../../_db";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const sql = getDb();

  try {
    const { session_id } = req.body ?? {};

    if (!session_id) {
      return res.status(400).json({ error: "session_id is required" });
    }

    // Fetch session and verify it is completed
    const sessionRows = await sql(
      "SELECT id, client_id, status, satisfaction_sent FROM sessions WHERE id = $1",
      [session_id]
    );

    if (sessionRows.length === 0) {
      return res.status(404).json({ error: "Session not found" });
    }

    const session = sessionRows[0];

    if (session.status !== "completed") {
      return res
        .status(400)
        .json({ error: "Session must be completed before sending satisfaction form" });
    }

    if (session.satisfaction_sent) {
      return res
        .status(409)
        .json({ error: "Satisfaction form already sent for this session" });
    }

    // Generate token and create satisfaction response record
    const token = randomUUID();

    await sql(
      `INSERT INTO satisfaction_responses (session_id, client_id, token, token_expires_at)
       VALUES ($1, $2, $3, now() + interval '7 days')`,
      [session_id, session.client_id, token]
    );

    // Mark session as satisfaction sent
    await sql(
      `UPDATE sessions
       SET satisfaction_sent = true, satisfaction_sent_at = now()
       WHERE id = $1`,
      [session_id]
    );

    const baseUrl = process.env.PUBLIC_URL ?? `https://${req.headers.host}`;
    const url = `${baseUrl}/forms/satisfaction/${token}`;

    return res.status(201).json({ token, url });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return res.status(500).json({ error: message });
  }
}
