import type { VercelRequest } from "@vercel/node";
import { timingSafeEqual } from "crypto";

export function verifyAdmin(req: VercelRequest): boolean {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return false;
  const token = authHeader.slice(7);
  const adminToken = process.env.ADMIN_API_TOKEN;
  if (!adminToken) return false;
  if (token.length !== adminToken.length) return false;
  return timingSafeEqual(Buffer.from(token), Buffer.from(adminToken));
}
