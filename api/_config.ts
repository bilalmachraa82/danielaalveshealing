import { DEFAULT_CONFIG } from "../src/lib/config/therapist";
import type { TherapistConfig } from "../src/lib/config/therapist";

export type ServerConfig = TherapistConfig & {
  readonly fromEmail: string;
  readonly appUrl: string;
};

export function getServerConfig(): ServerConfig {
  return {
    ...DEFAULT_CONFIG,
    fromEmail:
      process.env.FROM_EMAIL ?? `noreply@${DEFAULT_CONFIG.email.split("@")[1]}`,
    appUrl: process.env.APP_URL ?? "https://danielaalveshealing.com",
  };
}

export {
  getService,
  getServiceLabel,
  getServicePrice,
  getServicePriceDisplay,
  getServiceDuration,
  getServiceCalendarColor,
  getServiceLabelsRecord,
  getServiceColorsRecord,
} from "../src/lib/config/services";
