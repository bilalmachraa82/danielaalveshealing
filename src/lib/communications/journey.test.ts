import { describe, expect, it } from "vitest";

import { deriveClientJourney } from "./journey";
import { buildClientCommunicationProfile } from "./profile";

describe("deriveClientJourney", () => {
  it("marks clients without completed sessions as new and supports home harmony", () => {
    const journey = deriveClientJourney({
      completedSessions: 0,
      serviceType: "home_harmony",
      referralSourceKnown: false,
    });

    expect(journey.clientKind).toBe("new");
    expect(journey.formVariant).toBe("healing_touch");
    expect(journey.shouldAskReferralSource).toBe(true);
    expect(journey.shouldSendAnamnesis).toBe(true);
  });

  it("marks clients with completed sessions as returning and suppresses referral source when already known", () => {
    const journey = deriveClientJourney({
      completedSessions: 2,
      serviceType: "pura_radiancia",
      referralSourceKnown: true,
    });

    expect(journey.clientKind).toBe("returning");
    expect(journey.formVariant).toBe("pura_radiancia");
    expect(journey.shouldAskReferralSource).toBe(false);
    expect(journey.shouldSendAnamnesis).toBe(false);
  });
});

describe("buildClientCommunicationProfile", () => {
  it("defaults to PT and email when data is missing", () => {
    expect(buildClientCommunicationProfile({})).toMatchObject({
      preferredLanguage: "pt",
      preferredChannel: "email",
      gender: null,
    });
  });

  it("keeps explicit language, channel and gender values", () => {
    expect(
      buildClientCommunicationProfile({
        preferred_language: "en",
        preferred_channel: "whatsapp",
        gender: "female",
      })
    ).toMatchObject({
      preferredLanguage: "en",
      preferredChannel: "whatsapp",
      gender: "female",
    });
  });
});
