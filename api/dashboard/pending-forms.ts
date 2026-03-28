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
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return res.status(500).json({ error: message });
  }
}
