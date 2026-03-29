import { google } from "googleapis";
import { GoogleAuth } from "google-auth-library";

const SERVICE_COLORS: Record<string, string> = {
  healing_wellness: "3",   // Purple (Grape)
  pura_radiancia: "5",     // Banana (Gold)
  pure_earth_love: "10",   // Basil (Green)
  other: "8",              // Graphite
};

const SERVICE_LABELS: Record<string, string> = {
  healing_wellness: "Healing Touch",
  pura_radiancia: "Imersão Pura Radiância",
  pure_earth_love: "Pure Earth Love",
  other: "Sessão",
};

function getCalendarClient() {
  const calendarId = process.env.GOOGLE_CALENDAR_ID?.trim();
  if (!calendarId) return null;

  // Try JSON credentials first (most reliable for Vercel)
  const jsonCreds = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (jsonCreds) {
    const credentials = JSON.parse(jsonCreds.trim());
    const auth = new GoogleAuth({
      credentials: {
        client_email: credentials.client_email.trim(),
        private_key: credentials.private_key,
      },
      scopes: ["https://www.googleapis.com/auth/calendar"],
    });
    const calendar = google.calendar({ version: "v3", auth });
    return { calendar, calendarId };
  }

  // Fallback to separate env vars
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  if (!email || !privateKey) return null;

  const cleanKey = privateKey.includes("\\n")
    ? privateKey.replace(/\\n/g, "\n")
    : privateKey;

  const auth = new GoogleAuth({
    credentials: { client_email: email, private_key: cleanKey },
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });

  const calendar = google.calendar({ version: "v3", auth });
  return { calendar, calendarId };
}

export async function createCalendarEvent(params: {
  clientName: string;
  serviceType: string;
  scheduledAt: string;
  durationMinutes: number;
  sessionId: string;
  notes?: string;
}): Promise<string | null> {
  const client = getCalendarClient();
  if (!client) return null;

  const { calendar, calendarId } = client;
  const start = new Date(params.scheduledAt);
  const end = new Date(start.getTime() + params.durationMinutes * 60 * 1000);
  const label = SERVICE_LABELS[params.serviceType] ?? "Sessão";
  const appUrl = process.env.PUBLIC_URL ?? "https://danielaalveshealing.com";

  const event = await calendar.events.insert({
    calendarId,
    requestBody: {
      summary: `${label} — ${params.clientName}`,
      description: [
        `Cliente: ${params.clientName}`,
        `Serviço: ${label}`,
        params.notes ? `Notas: ${params.notes}` : "",
        "",
        `Ver no CRM: ${appUrl}/admin/sessoes/${params.sessionId}`,
      ]
        .filter(Boolean)
        .join("\n"),
      start: {
        dateTime: start.toISOString(),
        timeZone: "Europe/Lisbon",
      },
      end: {
        dateTime: end.toISOString(),
        timeZone: "Europe/Lisbon",
      },
      location:
        "R. do Regueiro do Tanque 3, Fontanelas, São João das Lampas, 2705-415 Sintra",
      colorId: SERVICE_COLORS[params.serviceType] ?? "8",
      reminders: {
        useDefault: false,
        overrides: [
          { method: "popup", minutes: 30 },
          { method: "popup", minutes: 10 },
        ],
      },
    },
  });

  return event.data.id ?? null;
}

export async function updateCalendarEvent(params: {
  eventId: string;
  clientName?: string;
  serviceType?: string;
  scheduledAt?: string;
  durationMinutes?: number;
  notes?: string;
}): Promise<void> {
  const client = getCalendarClient();
  if (!client) return;

  const { calendar, calendarId } = client;
  const updates: Record<string, unknown> = {};

  if (params.scheduledAt) {
    const start = new Date(params.scheduledAt);
    const duration = params.durationMinutes ?? 120;
    const end = new Date(start.getTime() + duration * 60 * 1000);
    updates.start = { dateTime: start.toISOString(), timeZone: "Europe/Lisbon" };
    updates.end = { dateTime: end.toISOString(), timeZone: "Europe/Lisbon" };
  }

  if (params.clientName && params.serviceType) {
    const label = SERVICE_LABELS[params.serviceType] ?? "Sessão";
    updates.summary = `${label} — ${params.clientName}`;
  }

  if (params.serviceType) {
    updates.colorId = SERVICE_COLORS[params.serviceType] ?? "8";
  }

  if (Object.keys(updates).length === 0) return;

  await calendar.events.patch({
    calendarId,
    eventId: params.eventId,
    requestBody: updates,
  });
}

export async function deleteCalendarEvent(eventId: string): Promise<void> {
  const client = getCalendarClient();
  if (!client) return;

  const { calendar, calendarId } = client;

  try {
    await calendar.events.delete({ calendarId, eventId });
  } catch {
    // Event may already be deleted
  }
}
