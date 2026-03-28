import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb } from "../_db.js";
import { getAppUrl } from "../_email.js";
import { createCalendarEvent } from "../_calendar.js";
import crypto from "node:crypto";

interface QuickBookingRequest {
  client_name: string;
  client_phone: string;
  scheduled_at: string;
  service_type: string;
}

interface QuickBookingResponse {
  session_id: string;
  client_id: string;
  client_is_new: boolean;
  prepare_url: string;
  whatsapp_url: string;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const sql = getDb();

  try {
    const {
      client_name,
      client_phone,
      scheduled_at,
      service_type,
    } = req.body as QuickBookingRequest;

    if (!client_name || !client_phone || !scheduled_at || !service_type) {
      return res.status(400).json({
        error: "client_name, client_phone, scheduled_at and service_type are required",
      });
    }

    // --- 1. Search for existing client by phone (exact match) ---
    const existingClients = await sql(
      "SELECT id, first_name, last_name, email FROM clients WHERE phone = $1 LIMIT 1",
      [client_phone]
    );

    let clientId: string;
    let clientIsNew = false;
    let clientEmail: string | null = null;

    if (existingClients.length > 0) {
      clientId = existingClients[0].id;
      clientEmail = existingClients[0].email;
    } else {
      // --- 2. Create new client with just name + phone ---
      const nameParts = client_name.trim().split(/\s+/);
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : null;

      const newClientRows = await sql(
        `INSERT INTO clients (first_name, last_name, phone, source)
         VALUES ($1, $2, $3, 'manual')
         RETURNING id, email`,
        [firstName, lastName, client_phone]
      );

      clientId = newClientRows[0].id;
      clientEmail = newClientRows[0].email;
      clientIsNew = true;
    }

    // --- 3. Determine price based on service type ---
    const priceCentsMap: Record<string, number> = {
      healing_wellness: 12200,
      pura_radiancia: 0,
      pure_earth_love: 0,
    };
    const priceCents = priceCentsMap[service_type] ?? null;

    // --- 4. Create session ---
    const sessionRows = await sql(
      `INSERT INTO sessions (client_id, scheduled_at, service_type, price_cents)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [clientId, scheduled_at, service_type, priceCents]
    );

    const sessionId = sessionRows[0].id;

    // --- 5. Check if client needs anamnesis ---
    const anamnesisCount = await sql(
      "SELECT COUNT(*)::int AS count FROM anamnesis_forms WHERE client_id = $1 AND status = 'completed'",
      [clientId]
    );
    const needsAnamnesis = (anamnesisCount[0]?.count ?? 0) === 0;

    // --- 6. Generate prepare token ---
    const prepareToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    await sql(
      "UPDATE sessions SET prepare_token = $1, prepare_token_expires_at = $2 WHERE id = $3",
      [prepareToken, expiresAt, sessionId]
    );

    // --- 7. Build URLs ---
    const appUrl = getAppUrl();
    const prepareUrl = `${appUrl}/preparar/${prepareToken}`;

    // Build WhatsApp message
    const firstName = client_name.trim().split(/\s+/)[0];
    const sessionDate = new Date(scheduled_at);
    const formattedDate = sessionDate.toLocaleDateString("pt-PT", {
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    });

    const whatsappText = `Ola ${firstName}! 😊 Aqui esta o link para preparar a sua sessao do dia ${formattedDate}: ${prepareUrl} — Daniela Alves, Healing & Wellness`;

    const cleanPhone = client_phone.replace(/[^0-9]/g, "");
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappText)}`;

    // --- 8. Create Google Calendar event ---
    const durationMap: Record<string, number> = {
      healing_wellness: 120,
      pura_radiancia: 180,
      pure_earth_love: 60,
    };

    let calendarEventId: string | null = null;
    try {
      calendarEventId = await createCalendarEvent({
        clientName: client_name,
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
    } catch {
      // Calendar sync is non-blocking
    }

    const response: QuickBookingResponse = {
      session_id: sessionId,
      client_id: clientId,
      client_is_new: clientIsNew,
      prepare_url: prepareUrl,
      whatsapp_url: whatsappUrl,
    };

    return res.status(201).json(response);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return res.status(500).json({ error: message });
  }
}
