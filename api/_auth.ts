import type { VercelRequest } from "@vercel/node";

export function verifyAdmin(req: VercelRequest): boolean {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return false;
  const token = authHeader.slice(7);
  const adminToken = process.env.ADMIN_API_TOKEN;
  if (!adminToken) return false;
  return token === adminToken;
}
