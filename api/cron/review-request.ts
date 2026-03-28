import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb } from "../_db";
import { getResend, getAppUrl, FROM_EMAIL, buildEmailHtml } from "../_email";

/**
 * Cron: REVIEW REQUEST for promoters (NPS >= 9)
 * Schedule: daily at 10:00 (0 10 * * *)
 *
 * Finds clients who gave NPS >= 9 on their satisfaction survey at least 3 days ago,
 * and whose session hasn't had a review request sent yet.
 * Sends a friendly Google review request email.
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

  const googleReviewUrl = process.env.GOOGLE_REVIEW_URL;
  if (!googleReviewUrl) {
    return res.status(500).json({ error: "GOOGLE_REVIEW_URL not configured" });
  }

  const sql = getDb();

  try {
    const rows = await sql(
      `SELECT sr.id AS response_id, sr.session_id, sr.client_id, sr.nps_score,
              c.first_name, c.email
       FROM satisfaction_responses sr
       JOIN sessions s ON s.id = sr.session_id
       JOIN clients c ON c.id = sr.client_id
       WHERE sr.completed_at IS NOT NULL
         AND sr.nps_score >= 9
         AND s.review_request_sent = false
         AND sr.completed_at < now() - interval '3 days'
         AND c.email IS NOT NULL`
    );

    const resend = getResend();
    let sentCount = 0;

    for (const row of rows) {
      const html = buildEmailHtml(
        "Partilhe a sua experiencia",
        [
          `Ola ${row.first_name},`,
          "Fico tao feliz por saber que a sua experiencia foi especial! Significa muito para mim.",
          "Se tiver um momento, adoraria que partilhasse as suas palavras no Google. A sua avaliacao ajuda outras pessoas a encontrarem o caminho para o bem-estar e faz uma diferenca enorme no meu trabalho.",
          "Basta clicar no botao abaixo \u2014 e muito simples e rapido.",
          "Obrigada de coracao por confiar em mim.",
        ],
        "Deixar Avaliacao no Google",
        googleReviewUrl
      );

      const result = await resend.emails.send({
        from: FROM_EMAIL,
        to: row.email as string,
        subject: "Partilhe a sua experiencia \u2014 Daniela Alves",
        html,
      });

      // Log email
      await sql(
        `INSERT INTO email_log (client_id, session_id, email_type, resend_id, status)
         VALUES ($1, $2, 'review_request', $3, 'sent')`,
        [row.client_id, row.session_id, result.data?.id ?? null]
      );

      // Mark session
      await sql(
        `UPDATE sessions
         SET review_request_sent = true, review_request_sent_at = now()
         WHERE id = $1`,
        [row.session_id]
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
