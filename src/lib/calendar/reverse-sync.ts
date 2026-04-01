interface CalendarEventLike {
  id?: string | null;
  summary?: string | null;
  description?: string | null;
  start?: { dateTime?: string; date?: string } | null;
  end?: { dateTime?: string; date?: string } | null;
  attendees?: Array<{ email?: string }> | null;
}

interface InboxItemDraft {
  google_event_id: string;
  summary: string;
  description: string | null;
  start_at: string;
  end_at: string;
  attendee_email: string | null;
  raw_event: Record<string, unknown>;
}

interface ReconcileResult {
  matched: InboxItemDraft[];
  pending: InboxItemDraft[];
  skipped: InboxItemDraft[];
}

const CRM_URL_PATTERN = /\/admin\/sessoes\//;

export function isAppCreatedEvent(event: {
  description?: string | null;
}): boolean {
  if (!event.description) return false;
  return CRM_URL_PATTERN.test(event.description);
}

export function parseEventToInboxItem(event: CalendarEventLike): InboxItemDraft {
  return {
    google_event_id: event.id ?? "",
    summary: event.summary ?? "(sem título)",
    description: event.description ?? null,
    start_at: event.start?.dateTime ?? event.start?.date ?? "",
    end_at: event.end?.dateTime ?? event.end?.date ?? "",
    attendee_email: event.attendees?.[0]?.email ?? null,
    raw_event: event as Record<string, unknown>,
  };
}

export function reconcileEvents(
  events: CalendarEventLike[],
  knownSessionEventIds: Set<string>,
  existingInboxEventIds: Set<string>
): ReconcileResult {
  const matched: InboxItemDraft[] = [];
  const pending: InboxItemDraft[] = [];
  const skipped: InboxItemDraft[] = [];

  for (const event of events) {
    const eventId = event.id ?? "";
    const item = parseEventToInboxItem(event);

    if (existingInboxEventIds.has(eventId)) {
      skipped.push(item);
      continue;
    }

    if (knownSessionEventIds.has(eventId) || isAppCreatedEvent(event)) {
      matched.push(item);
      continue;
    }

    pending.push(item);
  }

  return { matched, pending, skipped };
}
