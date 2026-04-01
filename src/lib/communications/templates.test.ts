import { describe, expect, it } from "vitest";

import {
  buildAnamnesisEmailContent,
  buildBookingWhatsAppCopy,
  getLocalizedServiceLabel,
} from "./templates";

describe("buildBookingWhatsAppCopy", () => {
  it("uses a returning-client PT message without onboarding language", () => {
    const copy = buildBookingWhatsAppCopy({
      clientName: "Maria",
      preferredLanguage: "pt",
      clientKind: "returning",
      serviceLabel: "Sessão Healing Touch",
      formattedDate: "3 de abril às 10:00",
      prepareUrl: "https://example.com/preparar/token",
    });

    expect(copy).toContain("Que bom voltar a recebê-la");
    expect(copy).not.toContain("Bem-vinda ao espaço");
  });

  it("uses an English new-client message with a preparation CTA", () => {
    const copy = buildBookingWhatsAppCopy({
      clientName: "Emma",
      preferredLanguage: "en",
      clientKind: "new",
      serviceLabel: "Healing Touch Session",
      formattedDate: "3 April at 10:00",
      prepareUrl: "https://example.com/preparar/token",
    });

    expect(copy).toContain("Welcome");
    expect(copy).toContain("Please complete this short preparation form");
  });
});

describe("getLocalizedServiceLabel", () => {
  it("returns localized labels for supported service types", () => {
    expect(getLocalizedServiceLabel("home_harmony", "pt")).toBe("Home Harmony");
    expect(getLocalizedServiceLabel("healing_wellness", "en")).toBe(
      "Healing Touch Session"
    );
  });
});

describe("buildAnamnesisEmailContent", () => {
  it("returns English onboarding copy for first-time clients", () => {
    const content = buildAnamnesisEmailContent({
      firstName: "Emma",
      preferredLanguage: "en",
      anamnesisUrl: "https://example.com/anamnesis/token",
    });

    expect(content.subject).toContain("Health Form");
    expect(content.paragraphs[0]).toContain("Hello Emma");
    expect(content.ctaText).toContain("Complete Health Form");
  });
});
