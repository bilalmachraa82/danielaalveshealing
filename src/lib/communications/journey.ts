import type {
  ClientKind,
  ExtendedServiceType,
  FormVariant,
} from "./types";

export function deriveClientJourney(input: {
  completedSessions: number;
  serviceType: ExtendedServiceType | string;
  referralSourceKnown: boolean;
}) {
  const clientKind: ClientKind =
    input.completedSessions > 0 ? "returning" : "new";
  const formVariant: FormVariant =
    input.serviceType === "pura_radiancia"
      ? "pura_radiancia"
      : "healing_touch";

  return {
    clientKind,
    formVariant,
    shouldAskReferralSource: clientKind === "new" && !input.referralSourceKnown,
    shouldSendAnamnesis: clientKind === "new",
  };
}
