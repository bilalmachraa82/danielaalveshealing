import type { VercelRequest, VercelResponse } from "@vercel/node";

// Simple auth for single-user admin (Daniela)
// Will be replaced by Neon Auth when enabled on the dashboard
const ADMIN_EMAIL = "daniela@danielaalveshealing.com";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
  if (!ADMIN_PASSWORD) {
    throw new Error("ADMIN_PASSWORD environment variable is not configured");
  }

  const { email, password } = req.body ?? {};

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    return res.json({
      id: "admin-1",
      email: ADMIN_EMAIL,
      name: "Daniela Alves",
    });
  }

  return res.status(401).json({ error: "Credenciais inválidas" });
}
