export interface ChannelConsentSnapshot {
  email: boolean;
  sms: boolean;
  whatsapp: boolean;
}

type ConsentInput = Partial<{
  consent_data_processing: boolean | null;
  consent_marketing: boolean | null;
  consent_health_data: boolean | null;
  service_consent_email: boolean | null;
  service_consent_sms: boolean | null;
  service_consent_whatsapp: boolean | null;
  marketing_consent_email: boolean | null;
  marketing_consent_sms: boolean | null;
  marketing_consent_whatsapp: boolean | null;
}>;

export function buildServiceConsentSnapshot(
  input: ConsentInput
): ChannelConsentSnapshot {
  return {
    email: Boolean(input.service_consent_email),
    sms: Boolean(input.service_consent_sms),
    whatsapp: Boolean(input.service_consent_whatsapp),
  };
}

export function buildMarketingConsentSnapshot(
  input: ConsentInput
): ChannelConsentSnapshot {
  return {
    email: Boolean(input.marketing_consent_email),
    sms: Boolean(input.marketing_consent_sms),
    whatsapp: Boolean(input.marketing_consent_whatsapp),
  };
}

export function hasAnyChannelConsent(snapshot: ChannelConsentSnapshot) {
  return snapshot.email || snapshot.sms || snapshot.whatsapp;
}

export function deriveConsentFlags(input: ConsentInput) {
  const service = buildServiceConsentSnapshot(input);
  const marketing = buildMarketingConsentSnapshot(input);

  return {
    consentDataProcessing:
      Boolean(input.consent_data_processing) ||
      Boolean(input.consent_health_data) ||
      hasAnyChannelConsent(service),
    consentHealthData: Boolean(input.consent_health_data),
    consentMarketing:
      Boolean(input.consent_marketing) || hasAnyChannelConsent(marketing),
    service,
    marketing,
  };
}
