import { neon } from "@neondatabase/serverless";

/**
 * Returns a query function compatible with conventional parameterized calls:
 *   const rows = await sql("SELECT * FROM t WHERE id = $1", [id]);
 *
 * Wraps neon's tagged-template function via its .query() method.
 */
export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not configured");
  }
  const sql = neon(url);
  return (query: string, params?: unknown[]) => sql.query(query, params ?? []);
}
