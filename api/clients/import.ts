import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb } from "../_db.js";

interface ClientRow {
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const sql = getDb();
  const { clients } = req.body as { clients: ClientRow[] };

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
