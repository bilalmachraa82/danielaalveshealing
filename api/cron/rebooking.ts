import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb } from "../_db";
import { getResend, getAppUrl, FROM_EMAIL, buildEmailHtml } from "../_email";

/**
 * Cron: REBOOKING reminder for inactive clients
 * Schedule: every Monday at 10:00 (0 10 * * 1)
 *
 * Finds active clients whose last completed session was 30+ days ago,
 * and who haven't received a rebooking email in the last 60 days.
 * Sends a warm rebooking reminder.
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Verify cron secret to prevent unauthorized access
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && req.headers.authorization !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const sql = getDb();

  try {
    // Find active clients whose last completed session was 30+ days ago
    // and who haven't received a rebooking email in the last 60 days
    const rows = await sql(
      `SELECT c.id AS client_id, c.first_name, c.email,
              MAX(s.scheduled_at) AS last_session_at
       FROM clients c
       JOIN sessions s ON s.client_id = c.id AND s.status = 'completed'
       WHERE c.status = 'active'
         AND c.email IS NOT NULL
         AND NOT EXISTS (
           SELECT 1 FROM email_log el
           WHERE el.client_id = c.id
             AND el.email_type = 'rebooking'
             AND el.sent_at > now() - interval '60 days'
         )
         AND NOT EXISTS (
           SELECT 1 FROM sessions upcoming
           WHERE upcoming.client_id = c.id
             AND upcoming.status IN ('scheduled', 'confirmed')
             AND upcoming.scheduled_at > now()
         )
       GROUP BY c.id, c.first_name, c.email
       HAVING MAX(s.scheduled_at) < now() - interval '30 days'`
    );

    const resend = getResend();
    const baseUrl = getAppUrl();
    let sentCount = 0;

    for (const row of rows) {
      const html = buildEmailHtml(
        "Sentimos a sua falta",
        [
          `Ola ${row.first_name},`,
          "Ja passou algum tempo desde a nossa ultima sessao e quero que saiba que penso em si.",
          "O seu corpo e a sua mente merecem momentos regulares de cuidado e atencao. Cada sessao e uma oportunidade de reconectar consigo mesma e renovar a sua energia.",
          "Quando sentir que e o momento certo, estarei aqui para a receber de bracos abertos.",
          "Pode agendar a sua proxima sessao diretamente comigo ou atraves do site.",
        ],
        "Agendar Sessao",
        baseUrl
      );

      const result = await resend.emails.send({
        from: FROM_EMAIL,
        to: row.email as string,
        subject: "Sentimos a sua falta \u2014 Daniela Alves",
        html,
      });

      // Log email
      await sql(
        `INSERT INTO email_log (client_id, email_type, resend_id, status)
         VALUES ($1, 'rebooking', $2, 'sent')`,
        [row.client_id, result.data?.id ?? null]
      );

      sentCount++;
    }

    return res.json({
      success: true,
      processed: rows.length,
      sent: sentCount,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return res.status(500).json({ error: message });
  }
}
