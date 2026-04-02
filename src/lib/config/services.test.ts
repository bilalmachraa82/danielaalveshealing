import { describe, it, expect } from "vitest";
import {
  getService,
  getServiceLabel,
  getServicePrice,
  getServicePriceDisplay,
  getServiceDuration,
  getServiceCalendarColor,
  getServiceLabelsRecord,
  getServiceColorsRecord,
} from "./services";

describe("getService", () => {
  it("returns the service config for a known id", () => {
    const result = getService("healing_wellness");
    expect(result).toBeDefined();
    expect(result!.id).toBe("healing_wellness");
    expect(result!.priceCents).toBe(15000);
  });

  it("returns undefined for an unknown id", () => {
    expect(getService("nonexistent")).toBeUndefined();
  });
});

describe("getServiceLabel", () => {
  it("returns the Portuguese label by default", () => {
    expect(getServiceLabel("healing_wellness")).toBe("Sessão Healing Touch");
  });

  it("returns the English label when lang is en", () => {
    expect(getServiceLabel("healing_wellness", "en")).toBe(
      "Healing Touch Session"
    );
  });

  it("returns the id as fallback for unknown services", () => {
    expect(getServiceLabel("unknown_service")).toBe("unknown_service");
  });
});

describe("getServicePrice", () => {
  it("returns price in cents for a known service", () => {
    expect(getServicePrice("pura_radiancia")).toBe(45000);
  });

  it("returns 0 for an unknown service", () => {
    expect(getServicePrice("nonexistent")).toBe(0);
  });
});

describe("getServicePriceDisplay", () => {
  it("returns the display price string", () => {
    expect(getServicePriceDisplay("healing_wellness")).toBe("150€");
  });

  it("returns empty string for an unknown service", () => {
    expect(getServicePriceDisplay("nonexistent")).toBe("");
  });
});

describe("getServiceDuration", () => {
  it("returns duration in minutes for a known service", () => {
    expect(getServiceDuration("healing_wellness")).toBe(120);
  });

  it("returns 0 for an unknown service", () => {
    expect(getServiceDuration("nonexistent")).toBe(0);
  });
});

describe("getServiceCalendarColor", () => {
  it("returns the calendar color id for each service", () => {
    expect(getServiceCalendarColor("healing_wellness")).toBe("3");
    expect(getServiceCalendarColor("pura_radiancia")).toBe("5");
    expect(getServiceCalendarColor("pure_earth_love")).toBe("10");
    expect(getServiceCalendarColor("home_harmony")).toBe("7");
    expect(getServiceCalendarColor("other")).toBe("8");
  });

  it("returns default color '8' for unknown service", () => {
    expect(getServiceCalendarColor("nonexistent")).toBe("8");
  });
});

describe("getServiceLabelsRecord", () => {
  it("returns a record of all service labels in Portuguese", () => {
    const labels = getServiceLabelsRecord();
    expect(labels.healing_wellness).toBe("Sessão Healing Touch");
    expect(labels.pura_radiancia).toBe("Imersão Pura Radiância");
    expect(labels.home_harmony).toBe("Home Harmony");
    expect(Object.keys(labels)).toHaveLength(5);
  });

  it("returns a record of all service labels in English", () => {
    const labels = getServiceLabelsRecord("en");
    expect(labels.healing_wellness).toBe("Healing Touch Session");
    expect(labels.pura_radiancia).toBe("Pura Radiance Immersion");
  });
});

describe("getServiceColorsRecord", () => {
  it("returns a record mapping service ids to calendar color ids", () => {
    const colors = getServiceColorsRecord();
    expect(colors.healing_wellness).toBe("3");
    expect(colors.pura_radiancia).toBe("5");
    expect(colors.pure_earth_love).toBe("10");
    expect(colors.home_harmony).toBe("7");
    expect(colors.other).toBe("8");
    expect(Object.keys(colors)).toHaveLength(5);
  });
});
