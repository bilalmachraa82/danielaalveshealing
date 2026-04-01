import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb } from "../_db.js";
import { getAppUrl } from "../_email.js";
import { createCalendarEvent, updateCalendarEvent, deleteCalendarEvent } from "../_calendar.js";
import crypto from "node:crypto";
import { buildClientCommunicationProfile } from "../../src/lib/communications/profile.ts";
import { deriveClientJourney } from "../../src/lib/communications/journey.ts";
import {
  buildBookingWhatsAppCopy,
  formatSessionDateForLanguage,
  getLocalizedServiceLabel,
} from "../../src/lib/communications/templates.ts";
import type {
  ClientGender,
  PreferredLanguage,
} from "../../src/lib/communications/types.ts";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const sql = getDb();
  const rawPath = req.query.__path;
  const pathSegments = typeof rawPath === "string" && rawPath !== ""
    ? rawPath.split("/")
    : Array.isArray(rawPath)
      ? rawPath
      : [];

  try {
    // /api/sessions (no path segments)
    if (pathSegments.length === 0) {
      return await handleSessionsList(req, res, sql);
    }

    // /api/sessions/quick — Quick booking
    if (pathSegments[0] === "quick") {
      return await handleQuickBooking(req, res, sql);
    }

    // /api/sessions/[id]/notes
    if (pathSegments.length === 2 && pathSegments[1] === "notes") {
      return await handleSessionNotes(req, res, sql, pathSegments[0]);
    }

    // /api/sessions/[id]
    if (pathSegments.length === 1) {
      return await handleSessionById(req, res, sql, pathSegments[0]);
    }

    return res.status(404).json({ error: "Not found" });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return res.status(500).json({ error: message });
  }
}

async function handleSessionsList(
  req: VercelRequest,
  res: VercelResponse,
  sql: ReturnType<typeof getDb>
) {
  if (req.method === "GET") {
    const { client_id, status, from, to } = req.query;
    let query = `
      SELECT s.*,
        json_build_object(
          'id', c.id,
          'first_name', c.first_name,
          'last_name', c.last_name,
          'email', c.email,
          'phone', c.phone
        ) AS client
      FROM sessions s
      JOIN clients c ON c.id = s.client_id
    `;
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (client_id && typeof client_id === "string") {
      conditions.push(`s.client_id = $${conditions.length + 1}`);
      params.push(client_id);
    }

    if (status && typeof status === "string") {
      conditions.push(`s.status = $${conditions.length + 1}`);
      params.push(status);
    }

    if (from && typeof from === "string") {
      conditions.push(`s.scheduled_at >= $${conditions.length + 1}`);
      params.push(from);
    }

    if (to && typeof to === "string") {
      conditions.push(`s.scheduled_at <= $${conditions.length + 1}`);
      params.push(to);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY s.scheduled_at DESC";
    const rows = await sql(query, params);
    return res.json(rows);
  }

  if (req.method === "POST") {
    const data = req.body;

    const rows = await sql(
      `INSERT INTO sessions (client_id, scheduled_at, duration_minutes, service_type, price_cents, payment_method, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        data.client_id,
        data.scheduled_at,
        data.duration_minutes ?? 120,
        data.service_type,
        data.price_cents ?? null,
        data.payment_method ?? null,
        data.notes ?? null,
      ]
    );
    return res.status(201).json(rows[0]);
  }

  return res.status(405).json({ error: "Method not allowed" });
}

async function handleSessionById(
  req: VercelRequest,
  res: VercelResponse,
  sql: ReturnType<typeof getDb>,
  id: string
) {
  if (req.method === "GET") {
    const rows = await sql(
      `SELECT s.*,
        json_build_object(
          'id', c.id,
          'first_name', c.first_name,
          'last_name', c.last_name,
          'email', c.email,
          'phone', c.phone
        ) AS client
       FROM sessions s
       JOIN clients c ON c.id = s.client_id
       WHERE s.id = $1`,
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Session not found" });
    }
    return res.json(rows[0]);
  }

  if (req.method === "PUT" || req.method === "PATCH") {
    const data = req.body;
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    values.push(id);
    const rows = await sql(
      `UPDATE sessions SET ${fields.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Session not found" });
    }

    const updated = rows[0];

    // Sync with Google Calendar if event exists
    try {
      if (updated.google_calendar_event_id) {
        if (data.status === "cancelled" || data.status === "no_show") {
          await deleteCalendarEvent(updated.google_calendar_event_id);
          await sql(
            "UPDATE sessions SET google_calendar_event_id = NULL WHERE id = $1",
            [id]
          );
        } else if (data.scheduled_at || data.service_type) {
          await updateCalendarEvent({
            eventId: updated.google_calendar_event_id,
            scheduledAt: data.scheduled_at,
            durationMinutes: data.duration_minutes,
            serviceType: data.service_type,
          });
        }
      }
    } catch {
      // Calendar sync is non-blocking
    }

    return res.json(updated);
  }

  return res.status(405).json({ error: "Method not allowed" });
}

async function handleSessionNotes(
  req: VercelRequest,
  res: VercelResponse,
  sql: ReturnType<typeof getDb>,
  sessionId: string
) {
  if (req.method === "GET") {
    const rows = await sql(
      "SELECT * FROM session_notes WHERE session_id = $1 ORDER BY created_at DESC LIMIT 1",
      [sessionId]
    );
    return res.json(rows[0] ?? null);
  }

  if (req.method === "POST" || req.method === "PUT") {
    const data = req.body;

    // Upsert: check if note exists
    const existing = await sql(
      "SELECT id FROM session_notes WHERE session_id = $1 LIMIT 1",
      [sessionId]
    );

    if (existing.length > 0) {
      const rows = await sql(
        `UPDATE session_notes
         SET subjective = $1, objective = $2, assessment = $3, plan = $4, body_map_data = $5
         WHERE id = $6
         RETURNING *`,
        [
          data.subjective ?? null,
          data.objective ?? null,
          data.assessment ?? null,
          data.plan ?? null,
          JSON.stringify(data.body_map_data ?? []),
          existing[0].id,
        ]
      );
      return res.json(rows[0]);
    }

    const rows = await sql(
      `INSERT INTO session_notes (session_id, subjective, objective, assessment, plan, body_map_data)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        sessionId,
        data.subjective ?? null,
        data.objective ?? null,
        data.assessment ?? null,
        data.plan ?? null,
        JSON.stringify(data.body_map_data ?? []),
      ]
    );
    return res.status(201).json(rows[0]);
  }

  return res.status(405).json({ error: "Method not allowed" });
}

// ============================================================
// /api/sessions/quick — Quick booking (was bookings/quick)
// ============================================================

interface QuickBookingRequest {
  client_name: string;
  client_phone: string;
  client_gender?: "female" | "male";
  client_language?: PreferredLanguage;
  scheduled_at: string;
  service_type: string;
}

interface QuickBookingResponse {
  session_id: string;
  client_id: string;
  client_is_new: boolean;
  prepare_url: string;
  whatsapp_url: string;
  preferred_language: PreferredLanguage;
}

function normalizePhoneForLookup(phone: string) {
  return phone.replace(/\D/g, "");
}

function normalizePhoneForStorage(phone: string) {
  const digits = normalizePhoneForLookup(phone);
  if (!digits) return "";
  return phone.trim().startsWith("+") ? `+${digits}` : digits;
}

async function handleQuickBooking(
  req: VercelRequest,
  res: VercelResponse,
  sql: ReturnType<typeof getDb>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    client_name,
    client_phone,
    client_gender,
    client_language,
    scheduled_at,
    service_type,
  } = req.body as QuickBookingRequest;

  if (!client_name || !client_phone || !scheduled_at || !service_type) {
    return res.status(400).json({
      error: "client_name, client_phone, scheduled_at and service_type are required",
    });
  }

  const normalizedPhone = normalizePhoneForLookup(client_phone);
  const storedPhone = normalizePhoneForStorage(client_phone);
  const scheduledDate = new Date(scheduled_at);

  if (!normalizedPhone) {
    return res.status(400).json({ error: "client_phone is invalid" });
  }

  if (Number.isNaN(scheduledDate.getTime())) {
    return res.status(400).json({ error: "scheduled_at is invalid" });
  }

  // --- 1. Search for existing client by phone (exact match) ---
  const existingClients = await sql(
    `SELECT id, first_name, last_name, email, gender, preferred_language, source
     FROM clients
     WHERE regexp_replace(COALESCE(phone, ''), '\\D', '', 'g') = $1
     LIMIT 1`,
    [normalizedPhone]
  );

  let clientId: string;
  let clientIsNew = false;
  let clientEmail: string | null = null;
  let clientGender: ClientGender | null = client_gender ?? null;
  let clientPreferredLanguage: PreferredLanguage = client_language ?? "pt";
  let clientFirstName = client_name.trim().split(/\s+/)[0];
  let clientFullName = client_name.trim();
  let referralSourceKnown = false;

  if (existingClients.length > 0) {
    clientId = existingClients[0].id;
    clientEmail = existingClients[0].email;
    clientGender = existingClients[0].gender ?? clientGender;
    clientPreferredLanguage =
      buildClientCommunicationProfile(existingClients[0]).preferredLanguage;
    clientFirstName = existingClients[0].first_name ?? clientFirstName;
    clientFullName = [
      existingClients[0].first_name,
      existingClients[0].last_name,
    ].filter(Boolean).join(" ");
    referralSourceKnown = existingClients[0].source != null &&
      existingClients[0].source !== "manual";
  } else {
    // --- 2. Create new client with just name + phone ---
    const nameParts = client_name.trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : null;

    const newClientRows = await sql(
      `INSERT INTO clients (first_name, last_name, phone, gender, preferred_language, source)
       VALUES ($1, $2, $3, $4, $5, 'manual')
       RETURNING id, email, gender, preferred_language`,
      [
        firstName,
        lastName,
        storedPhone,
        client_gender ?? null,
        clientPreferredLanguage,
      ]
    );

    clientId = newClientRows[0].id;
    clientEmail = newClientRows[0].email;
    clientGender = newClientRows[0].gender ?? clientGender;
    clientPreferredLanguage =
      newClientRows[0].preferred_language ?? clientPreferredLanguage;
    clientFirstName = firstName;
    clientFullName = [firstName, lastName].filter(Boolean).join(" ");
    clientIsNew = true;
  }

  const [completedSessionCountRows, completedAnamnesisCountRows] =
    await Promise.all([
      sql(
        "SELECT COUNT(*)::int AS count FROM sessions WHERE client_id = $1 AND status = 'completed'",
        [clientId]
      ),
      sql(
        "SELECT COUNT(*)::int AS count FROM anamnesis_forms WHERE client_id = $1 AND status = 'completed'",
        [clientId]
      ),
    ]);

  const completedSessions = Math.max(
    completedSessionCountRows[0]?.count ?? 0,
    completedAnamnesisCountRows[0]?.count ?? 0
  );
  const journey = deriveClientJourney({
    completedSessions,
    serviceType: service_type,
    referralSourceKnown,
  });

  // --- 3. Determine price based on service type ---
  const priceCentsMap: Record<string, number> = {
    healing_wellness: 12200,
    pura_radiancia: 0,
    pure_earth_love: 0,
    home_harmony: 0,
  };
  const priceCents = priceCentsMap[service_type] ?? null;
  const nextReminderDueAt =
    scheduledDate.getTime() - Date.now() > 24 * 60 * 60 * 1000
      ? new Date(scheduledDate.getTime() - 24 * 60 * 60 * 1000).toISOString()
      : null;

  // --- 4. Create session ---
  const sessionRows = await sql(
    `INSERT INTO sessions (client_id, scheduled_at, service_type, price_cents, reminder_status, next_reminder_due_at)
     VALUES ($1, $2, $3, $4, 'pending', $5)
     RETURNING id`,
    [clientId, scheduled_at, service_type, priceCents, nextReminderDueAt]
  );

  const sessionId = sessionRows[0].id;

  // --- 5. Generate prepare token ---
  const prepareToken = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  await sql(
    "UPDATE sessions SET prepare_token = $1, prepare_token_expires_at = $2 WHERE id = $3",
    [prepareToken, expiresAt, sessionId]
  );

  // --- 6. Build URLs ---
  const appUrl = getAppUrl();
  const prepareUrl = `${appUrl}/preparar/${prepareToken}`;

  const serviceLabel = getLocalizedServiceLabel(
    service_type,
    clientPreferredLanguage
  );
  const formattedDate = formatSessionDateForLanguage(
    scheduled_at,
    clientPreferredLanguage
  );
  const whatsappText = buildBookingWhatsAppCopy({
    clientName: clientFirstName,
    preferredLanguage: clientPreferredLanguage,
    clientKind: journey.clientKind,
    serviceLabel,
    formattedDate,
    prepareUrl,
    gender: clientGender,
  });

  const cleanPhone = normalizedPhone;
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappText)}`;

  // --- 7. Create Google Calendar event ---
  const durationMap: Record<string, number> = {
    healing_wellness: 120,
    pura_radiancia: 180,
    pure_earth_love: 60,
    home_harmony: 120,
  };

  let calendarEventId: string | null = null;
  try {
    calendarEventId = await createCalendarEvent({
      clientName: clientFullName,
      serviceType: service_type,
      scheduledAt: scheduled_at,
      durationMinutes: durationMap[service_type] ?? 120,
      sessionId,
    });

    if (calendarEventId) {
      await sql(
        "UPDATE sessions SET google_calendar_event_id = $1 WHERE id = $2",
        [calendarEventId, sessionId]
      );
    }
  } catch (calError: unknown) {
    // Calendar sync is non-blocking, but log the error
    console.error("Calendar sync failed:", calError instanceof Error ? calError.message : calError);
  }

  const response: QuickBookingResponse = {
    session_id: sessionId,
    client_id: clientId,
    client_is_new: clientIsNew,
    prepare_url: prepareUrl,
    whatsapp_url: whatsappUrl,
    preferred_language: clientPreferredLanguage,
  };

  return res.status(201).json(response);
}
