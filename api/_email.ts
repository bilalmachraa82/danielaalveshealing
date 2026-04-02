import { Resend } from "resend";
import { getServerConfig } from "./_config.js";

export function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY not configured");
  return new Resend(key);
}

export function getAppUrl(): string {
  return getServerConfig().appUrl;
}

const _config = getServerConfig();
export const FROM_EMAIL = `${_config.name} <${_config.fromEmail}>`;

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sanitizeUrl(url: string): string {
  if (url.startsWith("https://") || url.startsWith("http://")) {
    return encodeURI(url);
  }
  return encodeURI(`https://${url}`);
}

/**
 * Builds a branded HTML email with Daniela's warm cream + purple style.
 * Uses inline CSS for maximum email-client compatibility.
 */
export function buildEmailHtml(
  title: string,
  bodyParagraphs: string[],
  ctaText?: string,
  ctaUrl?: string
): string {
  const safeTitle = escapeHtml(title);
  const paragraphsHtml = bodyParagraphs
    .map(
      (p) =>
        `<p style="margin:0 0 16px;color:#4A4A4A;font-size:16px;line-height:1.6;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${escapeHtml(p)}</p>`
    )
    .join("");

  const ctaHtml =
    ctaText && ctaUrl
      ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px auto;">
          <tr>
            <td align="center" style="border-radius:8px;background-color:${_config.colors.primary};">
              <a href="${sanitizeUrl(ctaUrl)}" target="_blank"
                style="display:inline-block;padding:14px 32px;font-size:16px;font-weight:600;color:#FFFFFF;text-decoration:none;border-radius:8px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
                ${escapeHtml(ctaText)}
              </a>
            </td>
          </tr>
        </table>`
      : "";

  return `<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${safeTitle}</title>
</head>
<body style="margin:0;padding:0;background-color:${_config.colors.background};">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%"
    style="background-color:${_config.colors.background};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0"
          width="600" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td align="center" style="padding:24px 0 32px;">
              <h1 style="margin:0;font-size:28px;font-weight:400;color:${_config.colors.primary};font-family:Georgia,'Times New Roman',serif;letter-spacing:0.5px;">
                ${_config.name}
              </h1>
              <p style="margin:4px 0 0;font-size:13px;color:#B89AB7;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;letter-spacing:1px;text-transform:uppercase;">
                ${_config.tagline}
              </p>
            </td>
          </tr>

          <!-- Body Card -->
          <tr>
            <td style="background-color:#FFFFFF;border-radius:12px;padding:40px 36px;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
              <h2 style="margin:0 0 24px;font-size:22px;font-weight:400;color:${_config.colors.primary};font-family:Georgia,'Times New Roman',serif;">
                ${safeTitle}
              </h2>

              ${paragraphsHtml}
              ${ctaHtml}

              <p style="margin:28px 0 0;color:#4A4A4A;font-size:16px;line-height:1.6;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
                Com amor,<br/>
                <strong style="color:${_config.colors.primary};">${_config.name.split(" ")[0]}</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:28px 0 8px;">
              <p style="margin:0;font-size:13px;color:#9B9B9B;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.5;">
                ${_config.name} &mdash; ${_config.tagline}<br/>
                ${_config.address.city}, ${_config.address.country}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
