import { describe, expect, it } from "vitest";

import {
  buildServiceConsentSnapshot,
  buildMarketingConsentSnapshot,
  deriveConsentFlags,
  hasAnyChannelConsent,
} from "./consents";

describe("buildServiceConsentSnapshot", () => {
  it("defaults missing channel permissions to false", () => {
    expect(buildServiceConsentSnapshot({})).toMatchObject({
      email: false,
      sms: false,
      whatsapp: false,
    });
  });

  it("returns true for set channels", () => {
    expect(
      buildServiceConsentSnapshot({
        service_consent_email: true,
        service_consent_whatsapp: true,
      })
    ).toMatchObject({
      email: true,
      sms: false,
      whatsapp: true,
    });
  });
});

describe("buildMarketingConsentSnapshot", () => {
  it("defaults missing marketing channels to false", () => {
    expect(buildMarketingConsentSnapshot({})).toMatchObject({
      email: false,
      sms: false,
      whatsapp: false,
    });
  });

  it("returns true for set marketing channels", () => {
    expect(
      buildMarketingConsentSnapshot({
        marketing_consent_email: true,
        marketing_consent_sms: true,
      })
    ).toMatchObject({
      email: true,
      sms: true,
      whatsapp: false,
    });
  });
});

describe("hasAnyChannelConsent", () => {
  it("returns false when all channels are false", () => {
    expect(hasAnyChannelConsent({ email: false, sms: false, whatsapp: false })).toBe(false);
  });

  it("returns true when at least one channel is true", () => {
    expect(hasAnyChannelConsent({ email: false, sms: true, whatsapp: false })).toBe(true);
  });

  it("returns true when all channels are true", () => {
    expect(hasAnyChannelConsent({ email: true, sms: true, whatsapp: true })).toBe(true);
  });
});

describe("deriveConsentFlags", () => {
  it("returns all false flags for empty input", () => {
    const result = deriveConsentFlags({});
    expect(result.consentDataProcessing).toBe(false);
    expect(result.consentHealthData).toBe(false);
    expect(result.consentMarketing).toBe(false);
    expect(result.service).toMatchObject({ email: false, sms: false, whatsapp: false });
    expect(result.marketing).toMatchObject({ email: false, sms: false, whatsapp: false });
  });

  it("derives consentDataProcessing from consent_data_processing", () => {
    const result = deriveConsentFlags({ consent_data_processing: true });
    expect(result.consentDataProcessing).toBe(true);
  });

  it("derives consentDataProcessing from consent_health_data", () => {
    const result = deriveConsentFlags({ consent_health_data: true });
    expect(result.consentDataProcessing).toBe(true);
    expect(result.consentHealthData).toBe(true);
  });

  it("derives consentDataProcessing from any service channel consent", () => {
    const result = deriveConsentFlags({ service_consent_email: true });
    expect(result.consentDataProcessing).toBe(true);
  });

  it("derives consentMarketing from consent_marketing", () => {
    const result = deriveConsentFlags({ consent_marketing: true });
    expect(result.consentMarketing).toBe(true);
  });

  it("derives consentMarketing from any marketing channel consent", () => {
    const result = deriveConsentFlags({ marketing_consent_whatsapp: true });
    expect(result.consentMarketing).toBe(true);
  });

  it("treats null values as false", () => {
    const result = deriveConsentFlags({
      consent_data_processing: null,
      consent_health_data: null,
      consent_marketing: null,
    });
    expect(result.consentDataProcessing).toBe(false);
    expect(result.consentHealthData).toBe(false);
    expect(result.consentMarketing).toBe(false);
  });
});
