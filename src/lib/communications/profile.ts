import type {
  ClientGender,
  PreferredChannel,
  PreferredLanguage,
} from "./types.js";

export function buildClientCommunicationProfile(input: {
  preferred_language?: PreferredLanguage | null;
  preferred_channel?: PreferredChannel | null;
  gender?: ClientGender | null;
}) {
  return {
    preferredLanguage: input.preferred_language ?? "pt",
    preferredChannel: input.preferred_channel ?? "email",
    gender: input.gender ?? null,
  };
}
