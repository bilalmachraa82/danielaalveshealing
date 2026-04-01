import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "node:crypto";

import { buildSessionManageState, createManageTokenExpiry } from "../../src/lib/communications/manage.ts";
import { deriveClientJourney } from "../../src/lib/communications/journey.ts";
import { buildClientCommunicationProfile } from "../../src/lib/communications/profile.ts";
import {
  buildBookingWhatsAppCopy,
  formatSessionDateForLanguage,
  getLocalizedServiceLabel,
} from "../../src/lib/communications/templates.ts";
import type {
  ClientGender,
  PreferredLanguage,
} from "../../src/lib/communications/types.ts";
import {
  createCalendarEvent,
  deleteCalendarEvent,
  updateCalendarEvent,
} from "../_calendar.js";
import { getDb } from "../_db.js";
import { verifyAdmin } from "../_auth.js";
import { getAppUrl } from "../_email.js";
import {
  createSessionSchema,
  updateSessionSchema,
} from "../../src/lib/schemas/session.schema.js";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function isValidUUID(str: string): boolean {
  return UUID_REGEX.test(str);
}

type SqlClient = ReturnType<typeof getDb>;

type SessionStatus =
  | "scheduled"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "no_show";

type SessionActor = "admin" | "client" | "system";

interface SessionClientRow {
  id: string;
  first_name: string;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  preferred_language?: PreferredLanguage | null;
  preferred_channel?: string | null;
  gender?: ClientGender | null;
}

interface SessionContextRow {
  id: string;
  client_id: string;
  scheduled_at: string;
  duration_minutes: number;
  service_type: string;
  status: SessionStatus;
  price_cents: number | null;
  payment_status: "pending" | "paid" | "refunded";
  payment_method: string | null;
  notes: string | null;
  cancellation_reason: string | null;
  reschedule_reason: string | null;
  prepare_token?: string | null;
  prepare_token_expires_at?: string | null;
  manage_token?: string | null;
  manage_token_expires_at?: string | null;
  client_confirmed_at?: string | null;
  google_calendar_event_id?: string | null;
  calendar_sync_status?: "pending" | "synced" | "failed" | "not_configured";
  calendar_last_synced_at?: string | null;
  reminder_status?: string | null;
  last_reminder_sent_at?: string | null;
  next_reminder_due_at?: string | null;
  client: SessionClientRow;
}

interface SessionUpdateData {
  scheduled_at?: string;
  duration_minutes?: number;
  service_type?: string;
  status?: SessionStatus;
  price_cents?: number | null;
  payment_status?: "pending" | "paid" | "refunded";
  payment_method?: string | null;
  notes?: string | null;
  cancellation_reason?: string | null;
  reschedule_reason?: string | null;
  actor?: SessionActor;
}

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
  manage_url: string;
  whatsapp_url: string;
  preferred_language: PreferredLanguage;
}

interface ManageSessionPayload {
  action: "confirm" | "cancel" | "reschedule";
  scheduled_at?: string;
  reason?: string;
}

const DEFAULT_DURATION_BY_SERVICE: Record<string, number> = {
  healing_wellness: 120,
  pura_radiancia: 180,
  pure_earth_love: 60,
  home_harmony: 120,
  other: 120,
};

const DEFAULT_PRICE_CENTS_BY_SERVICE: Record<string, number> = {
  healing_wellness: 12200,
  pura_radiancia: 0,
  pure_earth_love: 0,
  home_harmony: 0,
};

const SESSION_WITH_CLIENT_SELECT = `
  SELECT s.*,
    json_build_object(
      'id', c.id,
      'first_name', c.first_name,
      'last_name', c.last_name,
      'email', c.email,
      'phone', c.phone,
      'preferred_language', c.preferred_language,
      'preferred_channel', c.preferred_channel,
      'gender', c.gender
    ) AS client
  FROM sessions s
  JOIN clients c ON c.id = s.client_id
`;

function normalizePhoneForLookup(phone: string) {
  return phone.replace(/\D/g, "");
}

function normalizePhoneForStorage(phone: string) {
  const digits = normalizePhoneForLookup(phone);
  if (!digits) return "";
  return phone.trim().startsWith("+") ? `+${digits}` : digits;
}

function buildManageUrl(manageToken: string) {
  return `${getAppUrl()}/marcacao/${manageToken}`;
}

function getNextReminderDueAt(scheduledAt: string) {
  const scheduledDate = new Date(scheduledAt);
  if (Number.isNaN(scheduledDate.getTime())) return null;

  const msUntilSession = scheduledDate.getTime() - Date.now();
  if (msUntilSession <= 24 * 60 * 60 * 1000) return null;

  return new Date(
    scheduledDate.getTime() - 24 * 60 * 60 * 1000
  ).toISOString();
}

function normalizeOptionalText(value: unknown) {
  if (typeof value !== "string") return value ?? null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function hasOwn(data: object, key: string) {
  return Object.prototype.hasOwnProperty.call(data, key);
}

function buildClientFullName(session: SessionContextRow) {
  const fullName = [
    session.client.first_name,
    session.client.last_name,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || "Cliente";
}

async function fetchSessionContextById(sql: SqlClient, id: string) {
  const rows = await sql(
    `${SESSION_WITH_CLIENT_SELECT}
     WHERE s.id = $1`,
    [id]
  );
  return (rows[0] ?? null) as SessionContextRow | null;
}

async function fetchSessionContextByManageToken(sql: SqlClient, manageToken: string) {
  const rows = await sql(
    `${SESSION_WITH_CLIENT_SELECT}
     WHERE s.manage_token = $1`,
    [manageToken]
  );
  return (rows[0] ?? null) as SessionContextRow | null;
}

async function ensureManageToken(sql: SqlClient, session: SessionContextRow) {
  if (session.manage_token) return session;

  const manageToken = crypto.randomUUID();
  const manageTokenExpiresAt = createManageTokenExpiry(
    new Date(session.scheduled_at)
  );

  await sql(
    `UPDATE sessions
     SET manage_token = $1,
         manage_token_expires_at = $2
     WHERE id = $3`,
    [manageToken, manageTokenExpiresAt, session.id]
  );

  return await fetchSessionContextById(sql, session.id);
}

async function logSessionChange(
  sql: SqlClient,
  input: {
    sessionId: string;
    clientId: string;
    action:
      | "created"
      | "confirmed"
      | "rescheduled"
      | "cancelled"
      | "completed"
      | "no_show"
      | "reminder_reset";
    previousStatus?: string | null;
    newStatus?: string | null;
    previousScheduledAt?: string | null;
    newScheduledAt?: string | null;
    reason?: string | null;
    actor: SessionActor;
  }
) {
  await sql(
    `INSERT INTO session_change_log (
      session_id,
      client_id,
      action,
      previous_status,
      new_status,
      previous_scheduled_at,
      new_scheduled_at,
      reason,
      actor
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      input.sessionId,
      input.clientId,
      input.action,
      input.previousStatus ?? null,
      input.newStatus ?? null,
      input.previousScheduledAt ?? null,
      input.newScheduledAt ?? null,
      input.reason ?? null,
      input.actor,
    ]
  );
}

async function syncCalendarForSession(sql: SqlClient, session: SessionContextRow) {
  const manageUrl = session.manage_token
    ? buildManageUrl(session.manage_token)
    : undefined;

  try {
    if (session.status === "cancelled" || session.status === "no_show") {
      if (session.google_calendar_event_id) {
        await deleteCalendarEvent(session.google_calendar_event_id);
      }

      await sql(
        `UPDATE sessions
         SET google_calendar_event_id = NULL,
             calendar_sync_status = $2,
             calendar_last_synced_at = now()
         WHERE id = $1`,
        [
          session.id,
          session.google_calendar_event_id ? "synced" : "not_configured",
        ]
      );

      return;
    }

    const calendarPayload = {
      clientName: buildClientFullName(session),
      clientEmail: session.client.email,
      serviceType: session.service_type,
      scheduledAt: session.scheduled_at,
      durationMinutes:
        session.duration_minutes ??
        DEFAULT_DURATION_BY_SERVICE[session.service_type] ??
        120,
      sessionId: session.id,
      notes: session.notes ?? undefined,
      manageUrl,
    };

    if (session.google_calendar_event_id) {
      await updateCalendarEvent({
        eventId: session.google_calendar_event_id,
        ...calendarPayload,
      });

      await sql(
        `UPDATE sessions
         SET calendar_sync_status = 'synced',
             calendar_last_synced_at = now()
         WHERE id = $1`,
        [session.id]
      );
      return;
    }

    const eventId = await createCalendarEvent(calendarPayload);

    if (eventId) {
      await sql(
        `UPDATE sessions
         SET google_calendar_event_id = $2,
             calendar_sync_status = 'synced',
             calendar_last_synced_at = now()
         WHERE id = $1`,
        [session.id, eventId]
      );
      return;
    }

    await sql(
      `UPDATE sessions
       SET calendar_sync_status = 'not_configured',
           calendar_last_synced_at = now()
       WHERE id = $1`,
      [session.id]
    );
  } catch (error: unknown) {
    // Calendar sync failure is non-blocking — log for Vercel runtime logs
    console.error("Calendar sync failed:", error instanceof Error ? error.message : error);

    await sql(
      `UPDATE sessions
       SET calendar_sync_status = 'failed',
           calendar_last_synced_at = now()
       WHERE id = $1`,
      [session.id]
    );
  }
}

async function logLifecycleChanges(
  sql: SqlClient,
  previous: SessionContextRow,
  next: SessionContextRow,
  actor: SessionActor
) {
  const scheduleChanged = previous.scheduled_at !== next.scheduled_at;
  const statusChanged = previous.status !== next.status;

  if (scheduleChanged) {
    await logSessionChange(sql, {
      sessionId: next.id,
      clientId: next.client_id,
      action: "rescheduled",
      previousStatus: previous.status,
      newStatus: next.status,
      previousScheduledAt: previous.scheduled_at,
      newScheduledAt: next.scheduled_at,
      reason: next.reschedule_reason,
      actor,
    });

    await logSessionChange(sql, {
      sessionId: next.id,
      clientId: next.client_id,
      action: "reminder_reset",
      previousStatus: previous.status,
      newStatus: next.status,
      previousScheduledAt: previous.scheduled_at,
      newScheduledAt: next.scheduled_at,
      reason: next.reschedule_reason,
      actor,
    });
  }

  if (!statusChanged) {
    return;
  }

  const actionByStatus: Partial<
    Record<
      SessionStatus,
      "confirmed" | "cancelled" | "completed" | "no_show"
    >
  > = {
    confirmed: "confirmed",
    cancelled: "cancelled",
    completed: "completed",
    no_show: "no_show",
  };

  const action = actionByStatus[next.status];
  if (!action) {
    return;
  }

  await logSessionChange(sql, {
    sessionId: next.id,
    clientId: next.client_id,
    action,
    previousStatus: previous.status,
    newStatus: next.status,
    previousScheduledAt: previous.scheduled_at,
    newScheduledAt: next.scheduled_at,
    reason:
      next.status === "cancelled"
        ? next.cancellation_reason
        : next.reschedule_reason,
    actor,
  });
}

async function applySessionUpdate(
  sql: SqlClient,
  current: SessionContextRow,
  data: SessionUpdateData,
  actor: SessionActor
) {
  const updates = new Map<string, unknown>();
  let nextStatus = data.status ?? current.status;

  if (hasOwn(data, "scheduled_at")) {
    if (!data.scheduled_at) {
      throw new Error("scheduled_at is required");
    }

    const scheduledDate = new Date(data.scheduled_at);
    if (Number.isNaN(scheduledDate.getTime())) {
      throw new Error("scheduled_at is invalid");
    }

    if (nextStatus === "confirmed") {
      nextStatus = "scheduled";
    }

    updates.set("scheduled_at", data.scheduled_at);
    updates.set(
      "manage_token_expires_at",
      createManageTokenExpiry(scheduledDate)
    );
    updates.set("reminder_status", "pending");
    updates.set("last_reminder_sent_at", null);
    updates.set("next_reminder_due_at", getNextReminderDueAt(data.scheduled_at));
    updates.set("client_confirmed_at", null);
  }

  if (hasOwn(data, "duration_minutes")) {
    updates.set("duration_minutes", data.duration_minutes ?? 120);
  }

  if (hasOwn(data, "service_type")) {
    updates.set("service_type", data.service_type ?? current.service_type);
  }

  if (hasOwn(data, "price_cents")) {
    updates.set("price_cents", data.price_cents ?? null);
  }

  if (hasOwn(data, "payment_status")) {
    updates.set("payment_status", data.payment_status ?? "pending");
  }

  if (hasOwn(data, "payment_method")) {
    updates.set("payment_method", normalizeOptionalText(data.payment_method));
  }

  if (hasOwn(data, "notes")) {
    updates.set("notes", normalizeOptionalText(data.notes));
  }

  if (hasOwn(data, "reschedule_reason")) {
    updates.set(
      "reschedule_reason",
      normalizeOptionalText(data.reschedule_reason)
    );
  }

  if (hasOwn(data, "cancellation_reason")) {
    updates.set(
      "cancellation_reason",
      normalizeOptionalText(data.cancellation_reason)
    );
  }

  if (nextStatus !== current.status) {
    updates.set("status", nextStatus);
  }

  if (current.status === "confirmed" && nextStatus === "scheduled") {
    updates.set("client_confirmed_at", null);
  }

  if (nextStatus === "confirmed" && current.status !== "confirmed") {
    updates.set("client_confirmed_at", new Date().toISOString());
  }

  if (
    nextStatus === "cancelled" ||
    nextStatus === "no_show" ||
    nextStatus === "completed"
  ) {
    updates.set("next_reminder_due_at", null);
  }

  if (nextStatus === "cancelled" || nextStatus === "no_show") {
    updates.set("reminder_status", "skipped");
  }

  if (updates.size === 0) {
    throw new Error("No fields to update");
  }

  const fields = Array.from(updates.keys()).map(
    (key, index) => `${key} = $${index + 1}`
  );
  const values = Array.from(updates.values());

  values.push(current.id);

  await sql(
    `UPDATE sessions
     SET ${fields.join(", ")}
     WHERE id = $${values.length}`,
    values
  );

  let refreshed = await fetchSessionContextById(sql, current.id);
  if (!refreshed) {
    throw new Error("Session not found");
  }

  refreshed = await ensureManageToken(sql, refreshed);
  if (!refreshed) {
    throw new Error("Session not found");
  }

  await syncCalendarForSession(sql, refreshed);

  const afterSync = await fetchSessionContextById(sql, current.id);
  if (!afterSync) {
    throw new Error("Session not found");
  }

  await logLifecycleChanges(sql, current, afterSync, actor);

  return afterSync;
}

async function createManagedSession(
  sql: SqlClient,
  input: {
    clientId: string;
    scheduledAt: string;
    durationMinutes?: number;
    serviceType: string;
    priceCents?: number | null;
    paymentMethod?: string | null;
    notes?: string | null;
    prepareToken?: string | null;
    prepareTokenExpiresAt?: string | null;
    actor: SessionActor;
  }
) {
  const scheduledDate = new Date(input.scheduledAt);

  if (Number.isNaN(scheduledDate.getTime())) {
    throw new Error("scheduled_at is invalid");
  }

  const durationMinutes =
    input.durationMinutes ??
    DEFAULT_DURATION_BY_SERVICE[input.serviceType] ??
    120;

  const sessionRows = await sql(
    `INSERT INTO sessions (
      client_id,
      scheduled_at,
      duration_minutes,
      service_type,
      price_cents,
      payment_method,
      notes,
      prepare_token,
      prepare_token_expires_at,
      manage_token,
      manage_token_expires_at,
      reminder_status,
      next_reminder_due_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pending', $12)
    RETURNING id`,
    [
      input.clientId,
      input.scheduledAt,
      durationMinutes,
      input.serviceType,
      input.priceCents ?? null,
      normalizeOptionalText(input.paymentMethod),
      normalizeOptionalText(input.notes),
      input.prepareToken ?? null,
      input.prepareTokenExpiresAt ?? null,
      crypto.randomUUID(),
      createManageTokenExpiry(scheduledDate),
      getNextReminderDueAt(input.scheduledAt),
    ]
  );

  const sessionId = sessionRows[0]?.id;
  if (!sessionId) {
    throw new Error("Failed to create session");
  }

  let created = await fetchSessionContextById(sql, sessionId);
  if (!created) {
    throw new Error("Session not found");
  }

  created = await ensureManageToken(sql, created);
  if (!created) {
    throw new Error("Session not found");
  }

  await syncCalendarForSession(sql, created);

  const afterSync = await fetchSessionContextById(sql, sessionId);
  if (!afterSync) {
    throw new Error("Session not found");
  }

  await logSessionChange(sql, {
    sessionId: afterSync.id,
    clientId: afterSync.client_id,
    action: "created",
    previousStatus: null,
    newStatus: afterSync.status,
    previousScheduledAt: null,
    newScheduledAt: afterSync.scheduled_at,
    actor: input.actor,
  });

  return afterSync;
}

function serializeManageSession(session: SessionContextRow) {
  return {
    session: {
      id: session.id,
      scheduled_at: session.scheduled_at,
      duration_minutes: session.duration_minutes,
      service_type: session.service_type,
      status: session.status,
      notes: session.notes,
      cancellation_reason: session.cancellation_reason,
      reschedule_reason: session.reschedule_reason,
      client_confirmed_at: session.client_confirmed_at ?? null,
      manage_token_expires_at: session.manage_token_expires_at ?? null,
    },
    client: session.client,
    manage_state: buildSessionManageState({
      now: new Date(),
      scheduledAt: new Date(session.scheduled_at),
      status: session.status,
    }),
    manage_url: session.manage_token ? buildManageUrl(session.manage_token) : null,
  };
}

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

  // manage/ routes are public (token-based)
  if (pathSegments[0] === "manage" && pathSegments.length === 2) {
    try {
      return await handleManageSession(req, res, sql, pathSegments[1]);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Internal server error";
      return res.status(500).json({ error: message });
    }
  }

  if (!verifyAdmin(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    if (pathSegments.length === 0) {
      return await handleSessionsList(req, res, sql);
    }

    if (pathSegments[0] === "quick") {
      return await handleQuickBooking(req, res, sql);
    }

    if (pathSegments.length === 2 && pathSegments[1] === "notes") {
      return await handleSessionNotes(req, res, sql, pathSegments[0]);
    }

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
  sql: SqlClient
) {
  if (req.method === "GET") {
    const { client_id, status, from, to } = req.query;
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

    const whereClause = conditions.length > 0
      ? " WHERE " + conditions.join(" AND ")
      : "";

    const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit ?? "50"), 10) || 50));
    const offset = (page - 1) * limit;

    const countRows = await sql(
      `SELECT COUNT(*)::int AS total FROM sessions s${whereClause}`,
      params
    );
    const total = countRows[0]?.total ?? 0;

    const limitIdx = params.length + 1;
    const offsetIdx = params.length + 2;
    const rows = await sql(
      `${SESSION_WITH_CLIENT_SELECT}${whereClause} ORDER BY s.scheduled_at DESC LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
      [...params, limit, offset]
    );
    return res.json({ data: rows, meta: { total, page, limit } });
  }

  if (req.method === "POST") {
    const parsed = createSessionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Validation failed", details: parsed.error.flatten().fieldErrors });
    }
    const data = parsed.data as typeof parsed.data & SessionUpdateData;

    const created = await createManagedSession(sql, {
      clientId: data.client_id,
      scheduledAt: data.scheduled_at,
      durationMinutes: data.duration_minutes,
      serviceType: data.service_type,
      priceCents: data.price_cents,
      paymentMethod: data.payment_method,
      notes: data.notes,
      actor: "admin",
    });

    return res.status(201).json(created);
  }

  return res.status(405).json({ error: "Method not allowed" });
}

async function handleSessionById(
  req: VercelRequest,
  res: VercelResponse,
  sql: SqlClient,
  id: string
) {
  if (!isValidUUID(id)) {
    return res.status(400).json({ error: "Invalid ID format" });
  }

  if (req.method === "GET") {
    const current = await fetchSessionContextById(sql, id);

    if (!current) {
      return res.status(404).json({ error: "Session not found" });
    }

    const withToken = await ensureManageToken(sql, current);
    return res.json(withToken);
  }

  if (req.method === "PUT" || req.method === "PATCH") {
    const parsed = updateSessionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Validation failed", details: parsed.error.flatten().fieldErrors });
    }

    const current = await fetchSessionContextById(sql, id);

    if (!current) {
      return res.status(404).json({ error: "Session not found" });
    }

    const withToken = await ensureManageToken(sql, current);
    if (!withToken) {
      return res.status(404).json({ error: "Session not found" });
    }

    const data = parsed.data as SessionUpdateData;
    const actor =
      data.actor === "client" || data.actor === "system"
        ? data.actor
        : "admin";

    const updated = await applySessionUpdate(sql, withToken, data, actor);
    return res.json(updated);
  }

  return res.status(405).json({ error: "Method not allowed" });
}

async function handleManageSession(
  req: VercelRequest,
  res: VercelResponse,
  sql: SqlClient,
  manageToken: string
) {
  let current = await fetchSessionContextByManageToken(sql, manageToken);

  if (!current) {
    return res.status(404).json({ error: "Session not found" });
  }

  if (
    current.manage_token_expires_at &&
    new Date(current.manage_token_expires_at).getTime() < Date.now()
  ) {
    return res.status(410).json({ error: "This session link has expired" });
  }

  if (req.method === "GET") {
    return res.json(serializeManageSession(current));
  }

  if (req.method === "POST") {
    const data = (req.body ?? {}) as ManageSessionPayload;
    const manageState = buildSessionManageState({
      now: new Date(),
      scheduledAt: new Date(current.scheduled_at),
      status: current.status,
    });

    if (data.action === "confirm") {
      if (current.status === "confirmed") {
        return res.json(serializeManageSession(current));
      }

      if (!manageState.canConfirm) {
        return res.status(400).json({
          error: "This session can no longer be confirmed online",
        });
      }

      current = await applySessionUpdate(
        sql,
        current,
        { status: "confirmed" },
        "client"
      );

      return res.json(serializeManageSession(current));
    }

    if (data.action === "reschedule") {
      if (!manageState.canReschedule) {
        return res.status(400).json({
          error:
            "This session can no longer be rescheduled online. Please contact Daniela for support.",
        });
      }

      if (!data.scheduled_at) {
        return res.status(400).json({
          error: "scheduled_at is required to reschedule the session",
        });
      }

      const nextDate = new Date(data.scheduled_at);
      if (Number.isNaN(nextDate.getTime()) || nextDate.getTime() <= Date.now()) {
        return res.status(400).json({
          error: "Please choose a valid future date and time",
        });
      }

      current = await applySessionUpdate(
        sql,
        current,
        {
          scheduled_at: data.scheduled_at,
          status: "scheduled",
          reschedule_reason: normalizeOptionalText(data.reason),
        },
        "client"
      );

      return res.json(serializeManageSession(current));
    }

    if (data.action === "cancel") {
      if (!manageState.canCancel) {
        return res.status(400).json({
          error:
            "This session can no longer be cancelled online. Please contact Daniela for support.",
        });
      }

      current = await applySessionUpdate(
        sql,
        current,
        {
          status: "cancelled",
          cancellation_reason: normalizeOptionalText(data.reason),
        },
        "client"
      );

      return res.json(serializeManageSession(current));
    }

    return res.status(400).json({ error: "Unknown manage action" });
  }

  return res.status(405).json({ error: "Method not allowed" });
}

async function handleSessionNotes(
  req: VercelRequest,
  res: VercelResponse,
  sql: SqlClient,
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

async function handleQuickBooking(
  req: VercelRequest,
  res: VercelResponse,
  sql: SqlClient
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
      error:
        "client_name, client_phone, scheduled_at and service_type are required",
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

  const existingClients = await sql(
    `SELECT id, first_name, last_name, email, gender, preferred_language, source
     FROM clients
     WHERE regexp_replace(COALESCE(phone, ''), '\\D', '', 'g') = $1
     LIMIT 1`,
    [normalizedPhone]
  );

  let clientId: string;
  let clientIsNew = false;
  let clientGender: ClientGender | null = client_gender ?? null;
  let clientPreferredLanguage: PreferredLanguage = client_language ?? "pt";
  let clientFirstName = client_name.trim().split(/\s+/)[0];
  let referralSourceKnown = false;

  if (existingClients.length > 0) {
    clientId = existingClients[0].id;
    clientGender = existingClients[0].gender ?? clientGender;
    clientPreferredLanguage =
      buildClientCommunicationProfile(existingClients[0]).preferredLanguage;
    clientFirstName = existingClients[0].first_name ?? clientFirstName;
    referralSourceKnown =
      existingClients[0].source != null &&
      existingClients[0].source !== "manual";
  } else {
    const nameParts = client_name.trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : null;

    const newClientRows = await sql(
      `INSERT INTO clients (first_name, last_name, phone, gender, preferred_language, source)
       VALUES ($1, $2, $3, $4, $5, 'manual')
       RETURNING id, gender, preferred_language`,
      [
        firstName,
        lastName,
        storedPhone,
        client_gender ?? null,
        clientPreferredLanguage,
      ]
    );

    clientId = newClientRows[0].id;
    clientGender = newClientRows[0].gender ?? clientGender;
    clientPreferredLanguage =
      newClientRows[0].preferred_language ?? clientPreferredLanguage;
    clientFirstName = firstName;
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

  const prepareToken = crypto.randomUUID();
  const prepareTokenExpiresAt = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000
  ).toISOString();

  const created = await createManagedSession(sql, {
    clientId,
    scheduledAt: scheduled_at,
    durationMinutes: DEFAULT_DURATION_BY_SERVICE[service_type] ?? 120,
    serviceType: service_type,
    priceCents: DEFAULT_PRICE_CENTS_BY_SERVICE[service_type] ?? null,
    prepareToken,
    prepareTokenExpiresAt,
    actor: "admin",
  });

  const prepareUrl = `${getAppUrl()}/preparar/${prepareToken}`;
  const manageUrl = created.manage_token
    ? buildManageUrl(created.manage_token)
    : `${getAppUrl()}/marcacao`;

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

  const whatsappUrl = `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(
    whatsappText
  )}`;

  const response: QuickBookingResponse = {
    session_id: created.id,
    client_id: clientId,
    client_is_new: clientIsNew,
    prepare_url: prepareUrl,
    manage_url: manageUrl,
    whatsapp_url: whatsappUrl,
    preferred_language: clientPreferredLanguage,
  };

  return res.status(201).json(response);
}
