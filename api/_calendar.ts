import { google } from "googleapis";
import { GoogleAuth } from "google-auth-library";
import { getServerConfig, getServiceLabel, getServiceCalendarColor } from "./_config.js";

export function getCalendarClient() {
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
  clientEmail?: string | null;
  serviceType: string;
  scheduledAt: string;
  durationMinutes: number;
  sessionId: string;
  notes?: string;
  manageUrl?: string;
}): Promise<string | null> {
  const client = getCalendarClient();
  if (!client) return null;

  const { calendar, calendarId } = client;
  const start = new Date(params.scheduledAt);
  const end = new Date(start.getTime() + params.durationMinutes * 60 * 1000);
  const config = getServerConfig();
  const label = getServiceLabel(params.serviceType);
  const appUrl = config.appUrl;

  const event = await calendar.events.insert({
    calendarId,
    sendUpdates: params.clientEmail ? "all" : "none",
    requestBody: {
      summary: `${label} — ${params.clientName}`,
      description: [
        `Cliente: ${params.clientName}`,
        `Serviço: ${label}`,
        params.notes ? `Notas: ${params.notes}` : "",
        "",
        `Ver no CRM: ${appUrl}/admin/sessoes/${params.sessionId}`,
        params.manageUrl ? `Gerir sessão: ${params.manageUrl}` : "",
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
      location: config.address.full,
      colorId: getServiceCalendarColor(params.serviceType),
      attendees: params.clientEmail ? [{ email: params.clientEmail }] : undefined,
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
  clientEmail?: string | null;
  serviceType?: string;
  scheduledAt?: string;
  durationMinutes?: number;
  notes?: string;
  sessionId?: string;
  manageUrl?: string;
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
    const label = getServiceLabel(params.serviceType);
    const appUrl = getServerConfig().appUrl;
    updates.summary = `${label} — ${params.clientName}`;
    updates.description = [
      `Cliente: ${params.clientName}`,
      `Serviço: ${label}`,
      params.notes ? `Notas: ${params.notes}` : "",
      "",
      params.sessionId
        ? `Ver no CRM: ${appUrl}/admin/sessoes/${params.sessionId}`
        : "",
      params.manageUrl ? `Gerir sessão: ${params.manageUrl}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }

  if (params.serviceType) {
    updates.colorId = getServiceCalendarColor(params.serviceType);
  }

  if (params.clientEmail) {
    updates.attendees = [{ email: params.clientEmail }];
  }

  if (Object.keys(updates).length === 0) return;

  await calendar.events.patch({
    calendarId,
    eventId: params.eventId,
    sendUpdates: params.clientEmail ? "all" : "none",
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

export async function listCalendarEvents(params: {
  timeMin?: string;
  timeMax?: string;
  syncToken?: string;
}): Promise<{
  events: Array<{
    id?: string | null;
    status?: string | null;
    summary?: string | null;
    description?: string | null;
    start?: { dateTime?: string; date?: string } | null;
    end?: { dateTime?: string; date?: string } | null;
    attendees?: Array<{ email?: string }> | null;
  }>;
  nextSyncToken: string | null;
}> {
  const client = getCalendarClient();
  if (!client) return { events: [], nextSyncToken: null };

  const { calendar, calendarId } = client;
  const allEvents: Array<{
    id?: string | null;
    status?: string | null;
    summary?: string | null;
    description?: string | null;
    start?: { dateTime?: string; date?: string } | null;
    end?: { dateTime?: string; date?: string } | null;
    attendees?: Array<{ email?: string }> | null;
  }> = [];
  let pageToken: string | undefined;
  let nextSyncToken: string | null = null;

  do {
    const listParams: Record<string, unknown> = {
      calendarId,
      maxResults: 250,
      singleEvents: true,
      pageToken,
    };

    if (params.syncToken) {
      listParams.syncToken = params.syncToken;
    } else {
      if (params.timeMin) listParams.timeMin = params.timeMin;
      if (params.timeMax) listParams.timeMax = params.timeMax;
      listParams.orderBy = "startTime";
    }

    const response = await calendar.events.list(listParams as Parameters<typeof calendar.events.list>[0]);
    const items = response.data.items ?? [];
    allEvents.push(...(items as typeof allEvents));
    pageToken = response.data.nextPageToken ?? undefined;
    if (response.data.nextSyncToken) {
      nextSyncToken = response.data.nextSyncToken;
    }
  } while (pageToken);

  return { events: allEvents, nextSyncToken };
}
