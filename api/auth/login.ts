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

  try {
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
    if (!ADMIN_PASSWORD) {
      return res.status(500).json({ error: "Server authentication is not configured" });
    }

    const { email, password } = req.body ?? {};

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      return res.json({
        id: "admin-1",
        email: ADMIN_EMAIL,
        name: "Daniela Alves",
        token: process.env.ADMIN_API_TOKEN ?? null,
      });
    }

    return res.status(401).json({ error: "Credenciais inválidas" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return res.status(500).json({ error: message });
  }
}
