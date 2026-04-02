import { DEFAULT_CONFIG } from "./therapist";
import type { ServiceConfig } from "./therapist";

type Lang = "pt" | "en";

export function getService(id: string): ServiceConfig | undefined {
  return DEFAULT_CONFIG.services.find((s) => s.id === id);
}

export function getServiceLabel(id: string, lang: Lang = "pt"): string {
  const service = getService(id);
  if (!service) return id;
  return lang === "en" ? service.nameEn : service.namePt;
}

export function getServicePrice(id: string): number {
  return getService(id)?.priceCents ?? 0;
}

export function getServicePriceDisplay(id: string): string {
  return getService(id)?.priceDisplay ?? "";
}

export function getServiceDuration(id: string): number {
  return getService(id)?.durationMinutes ?? 0;
}

export function getServiceCalendarColor(id: string): string {
  return getService(id)?.calendarColorId ?? "8";
}

export function getServiceLabelsRecord(
  lang: Lang = "pt"
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const s of DEFAULT_CONFIG.services) {
    result[s.id] = lang === "en" ? s.nameEn : s.namePt;
  }
  return result;
}

export function getServiceColorsRecord(): Record<string, string> {
  const result: Record<string, string> = {};
  for (const s of DEFAULT_CONFIG.services) {
    result[s.id] = s.calendarColorId;
  }
  return result;
}
