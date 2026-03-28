import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb } from "../_db";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const sql = getDb();
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Client ID is required" });
  }

  try {
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
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return res.status(500).json({ error: message });
  }
}
