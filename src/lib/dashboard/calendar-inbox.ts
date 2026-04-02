export interface CalendarInboxPrefillSource {
  summary: string;
  attendee_email: string | null;
  start_at: string;
  end_at: string;
}

export interface QuickBookingInitialData {
  clientName?: string;
  clientEmail?: string;
  scheduledAt?: string;
  durationMinutes?: number;
}

function toDateTimeLocalValue(iso: string) {
  const date = new Date(iso);
  const pad = (value: number) => String(value).padStart(2, "0");

  return (
    [
      date.getFullYear(),
      pad(date.getMonth() + 1),
      pad(date.getDate()),
    ].join("-") +
    "T" +
    [pad(date.getHours()), pad(date.getMinutes())].join(":")
  );
}

export function buildQuickBookingInitialData(
  item: CalendarInboxPrefillSource
): QuickBookingInitialData {
  const clientName =
    item.summary.split("—").pop()?.trim() || item.summary.trim();
  const durationMinutes = Math.max(
    0,
    Math.round(
      (new Date(item.end_at).getTime() - new Date(item.start_at).getTime()) /
        (1000 * 60)
    )
  );

  return {
    clientName,
    clientEmail: item.attendee_email ?? "",
    scheduledAt: toDateTimeLocalValue(item.start_at),
    durationMinutes,
  };
}
