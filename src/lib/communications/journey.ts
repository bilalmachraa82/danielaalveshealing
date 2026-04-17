import type {
  ClientKind,
  ExtendedServiceType,
  FormVariant,
  ReturningFlowVariant,
} from "./types.js";

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

export function deriveReturningVariant(input: {
  healthChanges: boolean;
  sessionFocus: "continuation" | "new_topic" | "";
  feelingSinceLast: "better" | "same" | "worse" | "";
}): ReturningFlowVariant {
  if (input.healthChanges) return "changed_context";
  if (input.sessionFocus === "new_topic") return "changed_context";
  if (input.feelingSinceLast === "worse") return "changed_context";
  return "simple";
}
