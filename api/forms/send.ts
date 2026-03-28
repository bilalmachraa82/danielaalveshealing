import type { VercelRequest, VercelResponse } from "@vercel/node";
import { randomUUID } from "crypto";
import { getDb } from "../_db.js";

const SERVICE_FORM_TYPE_MAP: Record<string, string> = {
  healing_wellness: "healing_touch",
  pura_radiancia: "pura_radiancia",
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const sql = getDb();

  try {
    const { client_id, session_id, service_type, send_anamnesis } =
      req.body ?? {};

    if (!client_id || !session_id || !service_type) {
      return res.status(400).json({
        error: "client_id, session_id, and service_type are required",
      });
    }

    const formType = SERVICE_FORM_TYPE_MAP[service_type];
    if (!formType) {
      return res.status(400).json({
        error: `Invalid service_type. Expected: ${Object.keys(SERVICE_FORM_TYPE_MAP).join(", ")}`,
      });
    }

    // Verify client and session exist
    const [clientRows, sessionRows] = await Promise.all([
      sql("SELECT id FROM clients WHERE id = $1", [client_id]),
      sql("SELECT id FROM sessions WHERE id = $1 AND client_id = $2", [
        session_id,
        client_id,
      ]),
    ]);

    if (clientRows.length === 0) {
      return res.status(404).json({ error: "Client not found" });
    }

    if (sessionRows.length === 0) {
      return res.status(404).json({ error: "Session not found" });
    }

    const baseUrl = process.env.PUBLIC_URL ?? `https://${req.headers.host}`;
    const tokens: { anamnesis?: string; intake: string } = { intake: "" };
    const urls: { anamnesis?: string; intake: string } = { intake: "" };

    // Create anamnesis form if requested (first-time clients)
    if (send_anamnesis) {
      const anamnesisToken = randomUUID();
      await sql(
        `INSERT INTO anamnesis_forms (client_id, token, token_expires_at, status)
         VALUES ($1, $2, now() + interval '7 days', 'sent')`,
        [client_id, anamnesisToken]
      );
      tokens.anamnesis = anamnesisToken;
      urls.anamnesis = `${baseUrl}/forms/anamnesis/${anamnesisToken}`;
    }

    // Create session intake form
    const intakeToken = randomUUID();
    await sql(
      `INSERT INTO session_intake_forms (client_id, session_id, form_type, token, token_expires_at, status)
       VALUES ($1, $2, $3, $4, now() + interval '7 days', 'sent')`,
      [client_id, session_id, formType, intakeToken]
    );
    tokens.intake = intakeToken;
    urls.intake = `${baseUrl}/forms/intake/${intakeToken}`;

    return res.status(201).json({ tokens, urls });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return res.status(500).json({ error: message });
  }
}
