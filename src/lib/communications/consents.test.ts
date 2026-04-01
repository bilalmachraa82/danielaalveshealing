import { describe, expect, it } from "vitest";

import { buildServiceConsentSnapshot } from "./consents";

describe("buildServiceConsentSnapshot", () => {
  it("defaults missing channel permissions to false", () => {
    expect(buildServiceConsentSnapshot({})).toMatchObject({
      email: false,
      sms: false,
      whatsapp: false,
    });
  });
});
