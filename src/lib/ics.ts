/**
 * ICS calendar file generation helper.
 *
 * Usage:
 *   import { downloadICS } from "@/lib/ics";
 *
 *   downloadICS({
 *     title: "Sessão Healing Touch — Daniela Alves",
 *     start: new Date("2025-09-01T10:00:00"),
 *     duration: 120,
 *     location: "R. do Regueiro do Tanque 3, Fontanelas, 2705-415 Sintra",
 *     description: "Sessão de Healing Touch com Daniela Alves.",
 *   });
 */

export interface ICSEvent {
  title: string;
  start: Date;
  /** Duration in minutes */
  duration: number;
  location: string;
  description: string;
}

// ============================================================
// Internal helpers
// ============================================================

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/**
 * Format a Date as a UTC YYYYMMDDTHHMMSSZ string.
 */
function formatDateUTC(date: Date): string {
  return (
    `${date.getUTCFullYear()}` +
    `${pad(date.getUTCMonth() + 1)}` +
    `${pad(date.getUTCDate())}T` +
    `${pad(date.getUTCHours())}` +
    `${pad(date.getUTCMinutes())}` +
    `${pad(date.getUTCSeconds())}Z`
  );
}

/**
 * Escape special characters required by the iCalendar spec (RFC 5545).
 */
function escapeICS(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

/**
 * Generate a simple random UID for the event.
 */
function generateUID(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}@danielaalves.pt`;
}

// ============================================================
// Public API
// ============================================================

/**
 * Generate the raw .ics file content as a string.
 */
export function generateICS(event: ICSEvent): string {
  const { title, start, duration, location, description } = event;

  const endDate = new Date(start.getTime() + duration * 60 * 1000);
  const now = new Date();

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Daniela Alves//CRM//PT",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${generateUID()}`,
    `DTSTAMP:${formatDateUTC(now)}`,
    `DTSTART:${formatDateUTC(start)}`,
    `DTEND:${formatDateUTC(endDate)}`,
    `SUMMARY:${escapeICS(title)}`,
    `LOCATION:${escapeICS(location)}`,
    `DESCRIPTION:${escapeICS(description)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return lines.join("\r\n");
}

/**
 * Generate and trigger a browser download of a .ics file.
 */
export function downloadICS(event: ICSEvent, filename?: string): void {
  const content = generateICS(event);
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename ?? "sessao-daniela-alves.ics";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Revoke the object URL after a short delay to allow the download to start
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
