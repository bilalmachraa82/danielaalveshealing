import type {
  ClientGender,
  ExtendedServiceType,
  PreferredChannel,
  PreferredLanguage,
  ReminderStatus,
} from "../communications/types.js";

// ============================================================
// Database Types - Daniela Alves CRM
// ============================================================

export interface PaginatedResponse<T> {
  data: T[];
  meta: { total: number; page: number; limit: number };
}

export interface Client {
  id: string;
  first_name: string;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  date_of_birth: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  profession: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  country: string;
  gender: ClientGender | null;
  preferred_language: PreferredLanguage;
  preferred_channel: PreferredChannel;
  source: "manual" | "website" | "referral";
  status: "active" | "inactive" | "archived";
  consent_data_processing: boolean;
  consent_marketing: boolean;
  consent_given_at: string | null;
  consent_health_data: boolean;
  consent_health_data_at?: string | null;
  consent_health_data_source?: string | null;
  service_consent_email: boolean;
  service_consent_sms: boolean;
  service_consent_whatsapp: boolean;
  marketing_consent_email: boolean;
  marketing_consent_sms: boolean;
  marketing_consent_whatsapp: boolean;
  consent_version: string;
  consent_updated_at?: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BodyMapMarker {
  muscle: string;
  side?: "left" | "right";
  intensity: 1 | 2 | 3 | 4 | 5;
  notes?: string;
}

export interface HealthQuestion {
  has: boolean;
  details: string;
}

export interface LifestyleQuestion {
  answer: string;
}

export interface HealthGeneral {
  medicacao: HealthQuestion;
  cirurgias: HealthQuestion;
  acidentes_fracturas_proteses: HealthQuestion;
  doenca_cronica: HealthQuestion;
  diabetes: HealthQuestion;
  sintomas_cardiacos: HealthQuestion;
  hipertensao_hipotensao: HealthQuestion;
  varizes_retencao_liquidos: HealthQuestion;
  sintomas_respiratorios: HealthQuestion;
  alergias_sensibilidades: HealthQuestion;
  sintomas_pele: HealthQuestion;
  sintomas_musculo_esqueleticos: HealthQuestion;
  sintomas_sistema_nervoso: HealthQuestion;
  sintomas_digestivos: HealthQuestion;
  boca_tratamentos: HealthQuestion;
  gravidez_filhos_hormonal: HealthQuestion;
  nascimento_amamentacao: HealthQuestion;
}

export interface Lifestyle {
  ingestao_liquidos: LifestyleQuestion;
  alimentacao_alcool: LifestyleQuestion;
  tabaco_drogas: LifestyleQuestion;
  actividade_fisica: LifestyleQuestion;
  qualidade_sono: LifestyleQuestion;
  ciclo_menstrual: LifestyleQuestion;
  sexualidade: LifestyleQuestion;
  funcionamento_intestinal: LifestyleQuestion;
}

export interface AnamnesisForm {
  id: string;
  client_id: string;
  health_general: HealthGeneral;
  lifestyle: Lifestyle;
  body_map_data: BodyMapMarker[];
  pain_trigger_task: string | null;
  has_pain_trigger: boolean | null;
  previous_massage_experience: boolean | null;
  previous_massage_details: string | null;
  session_objectives: string | null;
  declaration_accepted: boolean;
  declaration_date: string | null;
  token: string | null;
  token_expires_at: string | null;
  status: "draft" | "sent" | "completed" | "expired";
  version: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export type ServiceType = ExtendedServiceType;

export type SessionStatus =
  | "scheduled"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "no_show";

export interface Session {
  id: string;
  client_id: string;
  scheduled_at: string;
  duration_minutes: number;
  service_type: ServiceType;
  status: SessionStatus;
  price_cents: number | null;
  payment_status: "pending" | "paid" | "refunded";
  payment_method: string | null;
  satisfaction_sent: boolean;
  satisfaction_sent_at: string | null;
  review_request_sent: boolean;
  review_request_sent_at: string | null;
  notes: string | null;
  cancellation_reason: string | null;
  prepare_token?: string | null;
  prepare_token_expires_at?: string | null;
  manage_token?: string | null;
  manage_token_expires_at?: string | null;
  client_confirmed_at?: string | null;
  google_calendar_event_id?: string | null;
  calendar_sync_status?: "pending" | "synced" | "failed" | "not_configured";
  calendar_last_synced_at?: string | null;
  reminder_status?: ReminderStatus;
  last_reminder_sent_at?: string | null;
  next_reminder_due_at?: string | null;
  reschedule_reason?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SessionWithClient extends Session {
  client: Pick<Client, "id" | "first_name" | "last_name" | "email" | "phone">;
}

export type IntakeFormType = "healing_touch" | "pura_radiancia";

export interface SessionIntakeForm {
  id: string;
  client_id: string;
  session_id: string;
  form_type: IntakeFormType;
  referral_source: string | null;
  motivation: string | null;
  main_objective: string | null;
  health_conditions: string | null;
  current_treatment: string | null;
  pregnant_breastfeeding: string | null;
  allergies_sensitivities: string | null;
  feeling_physically: number | null;
  feeling_psychologically: number | null;
  feeling_emotionally: number | null;
  feeling_energetically: number | null;
  meditation_practice: string | null;
  current_challenges: string | null;
  immersion_motivation: string | null;
  main_intention: string | null;
  wishlist: string | null;
  aroma_preferences: string | null;
  music_preferences: string | null;
  beverage_preference: string | null;
  dietary_restrictions: string | null;
  color_preferences: string | null;
  additional_observations: string | null;
  token: string | null;
  token_expires_at: string | null;
  status: "draft" | "sent" | "completed" | "expired";
  completed_at: string | null;
  created_at: string;
}

export interface SessionNote {
  id: string;
  session_id: string;
  subjective: string | null;
  objective: string | null;
  assessment: string | null;
  plan: string | null;
  body_map_data: BodyMapMarker[];
  created_at: string;
  updated_at: string;
}

export interface SatisfactionResponse {
  id: string;
  session_id: string;
  client_id: string;
  nps_score: number | null;
  comfort_rating: number | null;
  liked_most: string | null;
  improvement_suggestions: string | null;
  would_rebook: "yes" | "no" | "maybe" | null;
  token: string | null;
  token_expires_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
  category: "status" | "service" | "segment" | "custom";
  color: string | null;
  created_at: string;
}

export interface ClientTag {
  id: string;
  client_id: string;
  tag_id: string;
  assigned_at: string;
}

export interface EmailLogEntry {
  id: string;
  client_id: string;
  session_id: string | null;
  email_type:
    | "anamnesis"
    | "intake_healing"
    | "intake_immersion"
    | "satisfaction"
    | "review_request"
    | "reminder"
    | "pre_session_reminder"
    | "post_session_checkin"
    | "rebooking"
    | "reactivation"
    | "birthday";
  resend_id: string | null;
  status: "sent" | "delivered" | "opened" | "bounced" | "failed";
  sent_at: string;
  created_at: string;
}

export interface CommunicationLogEntry {
  id: string;
  client_id: string;
  session_id: string | null;
  channel: "email" | "sms" | "whatsapp";
  template_key: string;
  provider_message_id: string | null;
  status: "queued" | "sent" | "delivered" | "opened" | "failed" | "cancelled";
  metadata: Record<string, unknown>;
  sent_at: string;
  created_at: string;
}

export interface SessionChangeLogEntry {
  id: string;
  session_id: string;
  client_id: string;
  action:
    | "created"
    | "confirmed"
    | "rescheduled"
    | "cancelled"
    | "completed"
    | "no_show"
    | "reminder_reset";
  previous_status: string | null;
  new_status: string | null;
  previous_scheduled_at: string | null;
  new_scheduled_at: string | null;
  reason: string | null;
  actor: "admin" | "client" | "system";
  created_at: string;
}

export interface ClientTimelineEvent {
  id: string;
  type:
    | "session"
    | "form"
    | "communication"
    | "consent";
  title: string;
  description: string | null;
  occurred_at: string;
  channel?: "email" | "sms" | "whatsapp" | null;
  status?: string | null;
  session_id?: string | null;
}

export type CalendarInboxStatus = 'pending' | 'matched' | 'created' | 'dismissed';

export interface CalendarInboxItem {
  id: string;
  google_event_id: string;
  summary: string;
  description: string | null;
  start_at: string;
  end_at: string;
  attendee_email: string | null;
  status: CalendarInboxStatus;
  matched_session_id: string | null;
  resolved_by: 'auto' | 'admin' | null;
  resolved_at: string | null;
  raw_event: Record<string, unknown>;
  synced_at: string;
  created_at: string;
}

export interface CalendarSyncState {
  id: string;
  sync_token: string | null;
  last_full_sync_at: string | null;
  last_incremental_sync_at: string | null;
  updated_at: string;
}
