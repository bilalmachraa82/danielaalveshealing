/**
 * PreparePage -- Pre-session questionnaire (public, no auth)
 *
 * Route: /preparar/:token
 *
 * Flow:
 *   - New client (healing_touch):  Single-page form matching Google Forms 3/4
 *   - New client (pura_radiancia): 5-page form matching Google Forms 1/2
 *   - Returning client:            Quick check-in (2 steps)
 *
 * Anamnesis (health history, lifestyle, body map) is NO LONGER part of this form.
 * It is done face-to-face by Daniela during the session.
 */

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { downloadICS } from "@/lib/ics";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

import {
  ChevronLeft,
  ChevronRight,
  Leaf,
  CheckCircle2,
  AlertCircle,
  Loader2,
  CalendarPlus,
  MapPin,
  Clock,
  Car,
  DoorOpen,
  Droplets,
} from "lucide-react";

// ============================================================
// API response types
// ============================================================

interface PrepareApiClient {
  first_name: string;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  date_of_birth: string | null;
  gender: "female" | "male" | null;
}

interface PrepareApiSession {
  id: string;
  scheduled_at: string;
  service_type: string;
  duration_minutes: number;
}

interface PrepareApiResponse {
  client: PrepareApiClient;
  session: PrepareApiSession;
  is_returning: boolean;
  needs_personal_data: boolean;
  form_type: "healing_touch" | "pura_radiancia";
  last_session_date: string | null;
  total_sessions: number;
}

// ============================================================
// Form state types
// ============================================================

type ReferralSource =
  | "amigo_familiar"
  | "redes_sociais"
  | "cheque_oferta"
  | "pesquisa_google"
  | "outra"
  | "";

type BeveragePreference =
  | "cha_ervas_simples"
  | "cha_especiarias"
  | "todos"
  | "nao_gosto"
  | "outra"
  | "";

interface ClientUpdatesDraft {
  email: string;
  date_of_birth: string;
}

interface HealingTouchData {
  referral_source: ReferralSource;
  motivation: string;
  main_objective: string;
  health_conditions: string;
  current_treatment: string;
  pregnant_breastfeeding: string;
  allergies_sensitivities: string;
  feeling_physically: number;
  feeling_psychologically: number;
  feeling_emotionally: number;
  feeling_energetically: number;
  additional_observations: string;
}

interface PuraRadianciaData {
  referral_source: ReferralSource;
  health_conditions: string;
  current_treatment: string;
  pregnant_breastfeeding: string;
  allergies_sensitivities: string;
  meditation_practice: string;
  current_challenges: string;
  immersion_motivation: string;
  main_intention: string;
  wishlist: string;
  aroma_preferences: string;
  music_preferences: string;
  beverage_preference: BeveragePreference;
  dietary_restrictions: string;
  color_preferences: string;
  additional_observations: string;
}

interface ReturningCheckinData {
  feeling_since_last: "better" | "same" | "worse" | "";
  feeling_physically: number;
  feeling_psychologically: number;
  feeling_emotionally: number;
  feeling_energetically: number;
  health_changes: boolean;
  health_changes_details: string;
  session_focus: "continuation" | "new_topic" | "";
  new_topic_details: string;
  additional_observations: string;
}

interface ConsentDraft {
  consent_health_data: boolean;
  service_consent_email: boolean;
  service_consent_sms: boolean;
  service_consent_whatsapp: boolean;
  marketing_consent_email: boolean;
  marketing_consent_sms: boolean;
  marketing_consent_whatsapp: boolean;
}

interface PrepareFormDraft {
  client_updates: ClientUpdatesDraft;
  consents: ConsentDraft;
  healing_touch: HealingTouchData;
  pura_radiancia: PuraRadianciaData;
  returning_checkin: ReturningCheckinData;
}

// ============================================================
// Constants
// ============================================================

const SESSION_ADDRESS =
  "R. do Regueiro do Tanque 3, Fontanelas, S\u00e3o Jo\u00e3o das Lampas, 2705-415 Sintra";
const GOOGLE_MAPS_URL =
  "https://maps.google.com/?q=R.+do+Regueiro+do+Tanque+3,+Fontanelas,+S%C3%A3o+Jo%C3%A3o+das+Lampas,+2705-415+Sintra";

const REFERRAL_OPTIONS: { value: ReferralSource; pt: string; en: string }[] = [
  { value: "amigo_familiar", pt: "Amigo/Familiar", en: "Friend/Family" },
  { value: "redes_sociais", pt: "Redes Sociais", en: "Social Media" },
  { value: "cheque_oferta", pt: "Cheque-Oferta", en: "Gift Voucher" },
  { value: "pesquisa_google", pt: "Pesquisa Google", en: "Google Search" },
  { value: "outra", pt: "Outra", en: "Other" },
];

const REFERRAL_OPTIONS_PR: { value: ReferralSource; pt: string; en: string }[] = [
  { value: "amigo_familiar", pt: "Amigo/Familiar", en: "Friend/Family" },
  { value: "redes_sociais", pt: "Redes Sociais", en: "Social Media" },
  { value: "pesquisa_google", pt: "Pesquisa Google", en: "Google Search" },
  { value: "outra", pt: "Outra", en: "Other" },
];

const BEVERAGE_OPTIONS: { value: BeveragePreference; pt: string; en: string }[] = [
  { value: "cha_ervas_simples", pt: "Ch\u00e1 de ervas simples", en: "Simple herbal tea" },
  { value: "cha_especiarias", pt: "Ch\u00e1 de especiarias", en: "Spiced tea" },
  { value: "todos", pt: "Gosto de todos os Ch\u00e1s", en: "I like all teas" },
  { value: "nao_gosto", pt: "N\u00e3o gosto de Ch\u00e1", en: "I don't like tea" },
  { value: "outra", pt: "Outra", en: "Other" },
];

// ============================================================
// Default draft state factories
// ============================================================

function defaultDraft(): PrepareFormDraft {
  return {
    client_updates: {
      email: "",
      date_of_birth: "",
    },
    consents: {
      consent_health_data: false,
      service_consent_email: false,
      service_consent_sms: false,
      service_consent_whatsapp: false,
      marketing_consent_email: false,
      marketing_consent_sms: false,
      marketing_consent_whatsapp: false,
    },
    healing_touch: {
      referral_source: "",
      motivation: "",
      main_objective: "",
      health_conditions: "",
      current_treatment: "",
      pregnant_breastfeeding: "",
      allergies_sensitivities: "",
      feeling_physically: 5,
      feeling_psychologically: 5,
      feeling_emotionally: 5,
      feeling_energetically: 5,
      additional_observations: "",
    },
    pura_radiancia: {
      referral_source: "",
      health_conditions: "",
      current_treatment: "",
      pregnant_breastfeeding: "",
      allergies_sensitivities: "",
      meditation_practice: "",
      current_challenges: "",
      immersion_motivation: "",
      main_intention: "",
      wishlist: "",
      aroma_preferences: "",
      music_preferences: "",
      beverage_preference: "",
      dietary_restrictions: "",
      color_preferences: "",
      additional_observations: "",
    },
    returning_checkin: {
      feeling_since_last: "",
      feeling_physically: 5,
      feeling_psychologically: 5,
      feeling_emotionally: 5,
      feeling_energetically: 5,
      health_changes: false,
      health_changes_details: "",
      session_focus: "",
      new_topic_details: "",
      additional_observations: "",
    },
  };
}

// ============================================================
// Utility helpers
// ============================================================

function lsKey(token: string): string {
  return `prepare_draft_${token}`;
}

function formatSessionDate(isoString: string, lang: "pt" | "en"): string {
  const date = new Date(isoString);
  const locale = lang === "pt" ? "pt-PT" : "en-GB";
  return date.toLocaleString(locale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ConsentSection({
  consents,
  onToggle,
  t,
}: {
  consents: ConsentDraft;
  onToggle: (field: keyof ConsentDraft, value: boolean) => void;
  t: (pt: string, en: string) => string;
}) {
  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-4">
      <div className="space-y-1">
        <h3 className="font-serif text-lg text-foreground">
          {t("Consentimentos e comunicação", "Consent and communication")}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t(
            "O consentimento para dados de saúde é obrigatório para submeter este questionário. As preferências de contacto abaixo ajudam a Daniela a confirmar, lembrar ou ajustar a sua sessão pelos canais autorizados.",
            "Health-data consent is required to submit this questionnaire. The contact preferences below help Daniela confirm, remind, or adjust your session through the channels you authorize."
          )}
        </p>
      </div>

      <label className="flex items-start gap-3">
        <Checkbox
          checked={consents.consent_health_data}
          onCheckedChange={(checked) =>
            onToggle("consent_health_data", checked === true)
          }
        />
        <span className="text-sm leading-relaxed text-foreground">
          {t(
            "Autorizo o tratamento dos meus dados pessoais e de saúde para preparação e acompanhamento da minha sessão terapêutica.",
            "I authorize the processing of my personal and health data for the preparation and follow-up of my therapeutic session."
          )}
        </span>
      </label>

      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">
          {t("Canais autorizados para serviço", "Channels authorized for service")}
        </p>
        <div className="grid gap-2 sm:grid-cols-3">
          <label className="flex items-center gap-3 rounded-lg border bg-background px-3 py-2 text-sm">
            <Checkbox
              checked={consents.service_consent_email}
              onCheckedChange={(checked) =>
                onToggle("service_consent_email", checked === true)
              }
            />
            Email
          </label>
          <label className="flex items-center gap-3 rounded-lg border bg-background px-3 py-2 text-sm">
            <Checkbox
              checked={consents.service_consent_sms}
              onCheckedChange={(checked) =>
                onToggle("service_consent_sms", checked === true)
              }
            />
            SMS
          </label>
          <label className="flex items-center gap-3 rounded-lg border bg-background px-3 py-2 text-sm">
            <Checkbox
              checked={consents.service_consent_whatsapp}
              onCheckedChange={(checked) =>
                onToggle("service_consent_whatsapp", checked === true)
              }
            />
            WhatsApp
          </label>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">
          {t("Canais autorizados para marketing", "Channels authorized for marketing")}
        </p>
        <div className="grid gap-2 sm:grid-cols-3">
          <label className="flex items-center gap-3 rounded-lg border bg-background px-3 py-2 text-sm">
            <Checkbox
              checked={consents.marketing_consent_email}
              onCheckedChange={(checked) =>
                onToggle("marketing_consent_email", checked === true)
              }
            />
            Email
          </label>
          <label className="flex items-center gap-3 rounded-lg border bg-background px-3 py-2 text-sm">
            <Checkbox
              checked={consents.marketing_consent_sms}
              onCheckedChange={(checked) =>
                onToggle("marketing_consent_sms", checked === true)
              }
            />
            SMS
          </label>
          <label className="flex items-center gap-3 rounded-lg border bg-background px-3 py-2 text-sm">
            <Checkbox
              checked={consents.marketing_consent_whatsapp}
              onCheckedChange={(checked) =>
                onToggle("marketing_consent_whatsapp", checked === true)
              }
            />
            WhatsApp
          </label>
        </div>
      </div>
    </div>
  );
}

/**
 * Gender-aware string: returns female or male variant.
 * Falls back to "o/a" combined form when gender is unknown.
 */
function g(
  gender: "female" | "male" | null,
  female: string,
  male: string,
  neutral: string
): string {
  if (gender === "female") return female;
  if (gender === "male") return male;
  return neutral;
}

// ============================================================
// Sub-components
// ============================================================

function PageHeader({
  clientName,
  t,
  lang,
  toggleLang,
}: {
  clientName: string;
  t: (pt: string, en: string) => string;
  lang: "pt" | "en";
  toggleLang: () => void;
}) {
  return (
    <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-border">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Leaf className="h-5 w-5 text-primary" strokeWidth={1.5} />
          <span className="font-serif text-lg text-foreground">Daniela Alves</span>
        </div>
        <div className="flex items-center gap-3">
          {clientName && (
            <span className="hidden sm:block text-xs text-muted-foreground font-sans">
              {t("Ol\u00e1", "Hello")}, {clientName}
            </span>
          )}
          <button
            type="button"
            onClick={toggleLang}
            className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded border border-border hover:border-primary"
            aria-label={t("Mudar para ingl\u00eas", "Switch to Portuguese")}
          >
            {lang === "pt" ? "EN" : "PT"}
          </button>
        </div>
      </div>
    </header>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h2 className="font-serif text-2xl text-foreground">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

function ScaleField({
  label,
  value,
  onChange,
  lowLabel,
  highLabel,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  lowLabel: string;
  highLabel: string;
}) {
  return (
    <div className="space-y-3 rounded-xl border border-border bg-muted/40 p-4">
      <div className="flex items-center justify-between">
        <Label className="font-sans text-sm font-medium">{label}</Label>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
          {value}
        </span>
      </div>
      <Slider
        min={1}
        max={10}
        step={1}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        className="w-full"
        aria-label={label}
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );
}

function NavButtons({
  step,
  totalSteps,
  onBack,
  onNext,
  isSubmitting,
  nextLabel,
  backLabel,
}: {
  step: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  isSubmitting?: boolean;
  nextLabel?: string;
  backLabel?: string;
}) {
  return (
    <div className="flex justify-between pt-6 mt-2">
      {step > 1 ? (
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="min-w-[6rem]"
          disabled={isSubmitting}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          {backLabel ?? "Anterior"}
        </Button>
      ) : (
        <div />
      )}
      <Button
        type="button"
        onClick={onNext}
        className="min-w-[6rem] bg-primary hover:bg-primary/90"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            {nextLabel ?? (step === totalSteps ? "Enviar" : "Seguinte")}
            {step < totalSteps && <ChevronRight className="h-4 w-4 ml-1" />}
          </>
        )}
      </Button>
    </div>
  );
}

function ReferralSourceField({
  value,
  onChange,
  options,
  t,
}: {
  value: ReferralSource;
  onChange: (v: ReferralSource) => void;
  options: { value: ReferralSource; pt: string; en: string }[];
  t: (pt: string, en: string) => string;
}) {
  return (
    <div className="space-y-3">
      <Label className="font-sans text-sm font-medium">
        {t("Como soube deste Servi\u00e7o?", "How did you hear about this Service?")}
      </Label>
      <RadioGroup
        value={value}
        onValueChange={(v) => onChange(v as ReferralSource)}
        className="space-y-2"
      >
        {options.map((opt) => (
          <div key={opt.value} className="flex items-center gap-3">
            <RadioGroupItem value={opt.value} id={`ref-${opt.value}`} />
            <Label htmlFor={`ref-${opt.value}`} className="text-sm cursor-pointer">
              {t(opt.pt, opt.en)}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}

function InfoCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-white/60 p-4">
      {icon}
      <div>
        <p className="font-sans text-xs font-medium text-foreground/70 uppercase tracking-wide mb-0.5">
          {title}
        </p>
        <p className="text-sm text-foreground/80 leading-relaxed">{body}</p>
      </div>
    </div>
  );
}

// ============================================================
// Success screen
// ============================================================

function SuccessScreen({
  session,
  t,
  lang,
}: {
  session: PrepareApiSession;
  t: (pt: string, en: string) => string;
  lang: "pt" | "en";
}) {
  const sessionDateFormatted = formatSessionDate(session.scheduled_at, lang);

  const handleDownloadICS = () => {
    downloadICS({
      title: t("Sess\u00e3o \u2014 Daniela Alves", "Session \u2014 Daniela Alves"),
      start: new Date(session.scheduled_at),
      duration: session.duration_minutes,
      location: SESSION_ADDRESS,
      description: t(
        `Sess\u00e3o com Daniela Alves.\n\nMorada: ${SESSION_ADDRESS}\nEstacionamento: Parque da Aguda\n\nLembre-se: sem perfume, refei\u00e7\u00e3o leve 24h antes, hidrata\u00e7\u00e3o cuidada.`,
        `Session with Daniela Alves.\n\nAddress: ${SESSION_ADDRESS}\nParking: Parque da Aguda\n\nRemember: no perfume, light meals 24h before, stay hydrated.`
      ),
    });
  };

  return (
    <div className="min-h-screen bg-mist flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-primary" strokeWidth={1.5} />
          </div>
        </div>

        <div className="space-y-3">
          <p className="font-serif text-sm font-light tracking-widest text-primary/70 uppercase">
            Daniela Alves
          </p>
          <h1 className="font-serif text-3xl font-light text-foreground leading-tight">
            {t(
              "Obrigada! Estamos preparados para a sua sess\u00e3o.",
              "Thank you! We're ready for your session."
            )}
          </h1>
        </div>

        <div className="mx-auto h-px w-16 bg-primary/30" />

        {/* Session reminder */}
        <div className="bg-white/70 border border-primary/15 rounded-2xl p-5 text-left space-y-3">
          <div className="flex items-start gap-3">
            <Clock className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <p className="text-sm text-foreground capitalize">{sessionDateFormatted}</p>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <a
              href={GOOGLE_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary underline underline-offset-2 hover:text-primary/70 transition-colors"
            >
              {SESSION_ADDRESS}
            </a>
          </div>
        </div>

        {/* Preparation reminder */}
        <div className="bg-muted/40 rounded-xl p-4 text-left space-y-2">
          <p className="text-xs font-medium text-foreground/70 uppercase tracking-wide">
            {t("Prepara\u00e7\u00e3o", "Preparation")}
          </p>
          <ul className="text-sm text-foreground/80 space-y-1 list-disc list-inside">
            <li>{t("Sem perfume no dia da sess\u00e3o", "No perfume on the day of the session")}</li>
            <li>{t("Refei\u00e7\u00e3o leve nas 24h anteriores", "Light meals in the 24 hours before")}</li>
            <li>{t("Mantenha-se hidratada e evite estimulantes", "Stay hydrated and avoid stimulants")}</li>
            <li>{t("N\u00e3o h\u00e1 chuveiro dispon\u00edvel", "No shower available")}</li>
          </ul>
        </div>

        {/* Calendar button */}
        <Button
          type="button"
          variant="outline"
          onClick={handleDownloadICS}
          className="w-full gap-2"
        >
          <CalendarPlus className="h-4 w-4" />
          {t("Adicionar ao Calend\u00e1rio", "Add to Calendar")}
        </Button>

        {/* Daniela's quote */}
        <blockquote className="border-l-2 border-primary/40 pl-4 text-left">
          <p className="font-serif text-base italic text-primary/80 leading-relaxed">
            &ldquo;{t(
              "Quando o corpo relaxa e harmoniza, o Ser cria condi\u00e7\u00f5es para regressar \u00e0 sua mais genu\u00edna Express\u00e3o.",
              "When the body relaxes and harmonises, the Being creates the conditions to return to its most genuine Expression."
            )}&rdquo;
          </p>
          <footer className="mt-2 font-sans text-xs text-muted-foreground">
            &mdash; Daniela Alves
          </footer>
        </blockquote>

        <Leaf className="mx-auto h-7 w-7 text-primary/30" strokeWidth={1} />
      </div>
    </div>
  );
}

// ============================================================
// Error / Loading screens
// ============================================================

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-mist flex items-center justify-center">
      <div className="space-y-4 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="font-sans text-sm text-muted-foreground">A carregar...</p>
      </div>
    </div>
  );
}

function ErrorScreen({
  message,
  t,
}: {
  message: string;
  t: (pt: string, en: string) => string;
}) {
  return (
    <div className="min-h-screen bg-mist flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-4 py-16">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive/70" strokeWidth={1.5} />
        <h1 className="font-serif text-2xl text-foreground">
          {t("Liga\u00e7\u00e3o inv\u00e1lida", "Invalid link")}
        </h1>
        <p className="text-muted-foreground text-sm">{message}</p>
        <p className="text-muted-foreground text-sm">
          {t(
            "Por favor contacte a Daniela para receber um novo link.",
            "Please contact Daniela to receive a new link."
          )}
        </p>
      </div>
    </div>
  );
}

// ============================================================
// Healing Touch - Practical info section (displayed at bottom, not a form field)
// ============================================================

function HealingTouchPracticalInfo({
  t,
}: {
  t: (pt: string, en: string) => string;
}) {
  return (
    <div className="space-y-4 border-t border-border pt-6 mt-6">
      <h3 className="font-serif text-lg text-foreground">
        {t("Informa\u00e7\u00f5es Pr\u00e1ticas", "Practical Information")}
      </h3>

      <div className="space-y-3">
        <InfoCard
          icon={<MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />}
          title={t("Localiza\u00e7\u00e3o", "Location")}
          body="Rua Regueiro do Tanque, 3, 2705-415 S\u00e3o Jo\u00e3o das Lampas"
        />
        <InfoCard
          icon={<Car className="h-4 w-4 text-primary shrink-0 mt-0.5" />}
          title={t("Estacionamento", "Parking")}
          body={t("Parque da Aguda", "Parque da Aguda")}
        />
        <InfoCard
          icon={<DoorOpen className="h-4 w-4 text-primary shrink-0 mt-0.5" />}
          title={t("Entrada", "Entry")}
          body={t(
            "Entre pelo port\u00e3o, n\u00e3o toque na campainha. Siga o caminho at\u00e9 \u00e0 casa de madeira.",
            "Enter through the gate, no need to ring the doorbell. Follow the path to the wooden house."
          )}
        />
        <InfoCard
          icon={<Droplets className="h-4 w-4 text-primary shrink-0 mt-0.5" />}
          title={t("Prepara\u00e7\u00e3o", "Preparation")}
          body={t(
            "Sem perfume no dia da sess\u00e3o. Refei\u00e7\u00e3o leve nas 24h anteriores. Mantenha-se hidratada e evite estimulantes (caf\u00e9, \u00e1lcool). N\u00e3o h\u00e1 chuveiro dispon\u00edvel.",
            "No perfume on the day of the session. Light meals in the 24 hours before. Stay hydrated and avoid stimulants (coffee, alcohol). No shower available."
          )}
        />
      </div>

      <blockquote className="border-l-2 border-primary/40 pl-4 mt-4">
        <p className="font-serif text-sm italic text-primary/80 leading-relaxed">
          &ldquo;{t(
            "Quando o corpo relaxa e harmoniza, o Ser cria condi\u00e7\u00f5es para regressar \u00e0 sua mais genu\u00edna Express\u00e3o.",
            "When the body relaxes and harmonises, the Being creates the conditions to return to its most genuine Expression."
          )}&rdquo;
        </p>
        <footer className="mt-1 font-sans text-xs text-muted-foreground">
          &mdash; Daniela Alves
        </footer>
      </blockquote>
    </div>
  );
}

// ============================================================
// Returning client - Practical info step (step 2)
// ============================================================

function ReturningPracticalInfoStep({
  session,
  t,
  lang,
}: {
  session: PrepareApiSession;
  t: (pt: string, en: string) => string;
  lang: "pt" | "en";
}) {
  const sessionDateFormatted = formatSessionDate(session.scheduled_at, lang);

  const handleDownloadICS = () => {
    downloadICS({
      title: t("Sess\u00e3o \u2014 Daniela Alves", "Session \u2014 Daniela Alves"),
      start: new Date(session.scheduled_at),
      duration: session.duration_minutes,
      location: SESSION_ADDRESS,
      description: t(
        `Sess\u00e3o com Daniela Alves.\n\nMorada: ${SESSION_ADDRESS}\nEstacionamento: Parque da Aguda\n\nLembre-se: sem perfume, refei\u00e7\u00e3o leve 24h antes, hidrata\u00e7\u00e3o cuidada.`,
        `Session with Daniela Alves.\n\nAddress: ${SESSION_ADDRESS}\nParking: Parque da Aguda\n\nRemember: no perfume, light meals 24h before, stay hydrated.`
      ),
    });
  };

  return (
    <div className="space-y-6">
      <SectionTitle
        title={t("Informa\u00e7\u00f5es Pr\u00e1ticas", "Practical Information")}
        subtitle={t(
          "Tudo o que precisa de saber para a sua sess\u00e3o.",
          "Everything you need to know for your session."
        )}
      />

      <div className="bg-primary/5 border border-primary/15 rounded-2xl p-5 space-y-3">
        <p className="font-sans text-xs font-medium text-primary/70 uppercase tracking-wider mb-1">
          {t("A sua sess\u00e3o", "Your session")}
        </p>
        <div className="flex items-start gap-3">
          <Clock className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <p className="text-sm text-foreground capitalize">{sessionDateFormatted}</p>
        </div>
        <div className="flex items-start gap-3">
          <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <a
            href={GOOGLE_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary underline underline-offset-2 hover:text-primary/70 transition-colors"
          >
            {SESSION_ADDRESS}
          </a>
        </div>
      </div>

      <div className="space-y-3">
        <InfoCard
          icon={<Car className="h-4 w-4 text-primary shrink-0 mt-0.5" />}
          title={t("Estacionamento", "Parking")}
          body={t("Parque da Aguda (indicado na chegada).", "Parque da Aguda (signposted on arrival).")}
        />
        <InfoCard
          icon={<DoorOpen className="h-4 w-4 text-primary shrink-0 mt-0.5" />}
          title={t("Entrada", "Entry")}
          body={t(
            "Entre pelo port\u00e3o, n\u00e3o toque na campainha. Siga o caminho at\u00e9 \u00e0 casa de madeira.",
            "Enter through the gate, no need to ring the doorbell. Follow the path to the wooden house."
          )}
        />
        <InfoCard
          icon={<Droplets className="h-4 w-4 text-primary shrink-0 mt-0.5" />}
          title={t("Prepara\u00e7\u00e3o", "Preparation")}
          body={t(
            "Sem perfume no dia da sess\u00e3o. Refei\u00e7\u00e3o leve nas 24h anteriores. Mantenha-se hidratada e evite estimulantes (caf\u00e9, \u00e1lcool). N\u00e3o h\u00e1 chuveiro dispon\u00edvel.",
            "No perfume on the day of the session. Light meals in the 24 hours before. Stay hydrated and avoid stimulants (coffee, alcohol). No shower available."
          )}
        />
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={handleDownloadICS}
        className="w-full gap-2"
      >
        <CalendarPlus className="h-4 w-4" />
        {t("Adicionar ao Calend\u00e1rio", "Add to Calendar")}
      </Button>
    </div>
  );
}

// ============================================================
// Main page component
// ============================================================

export default function PreparePage() {
  const { token } = useParams<{ token: string }>();
  const { t, lang, toggleLang } = useLanguage();

  const [apiData, setApiData] = useState<PrepareApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);

  const [draft, setDraft] = useState<PrepareFormDraft>(defaultDraft());

  const draftRef = useRef(draft);
  draftRef.current = draft;

  // ============================================================
  // Compute total steps
  // ============================================================

  const computeTotalSteps = useCallback(
    (data: PrepareApiResponse): number => {
      if (data.is_returning) return 2; // check-in + practical
      if (data.form_type === "healing_touch") return 1; // single page
      // pura_radiancia: 5 pages
      return 5;
    },
    []
  );

  const getStepLabel = useCallback(
    (stepNum: number, data: PrepareApiResponse): string => {
      if (data.is_returning) {
        const labels = [
          t("Check-in R\u00e1pido", "Quick Check-in"),
          t("Informa\u00e7\u00f5es Pr\u00e1ticas", "Practical Info"),
        ];
        return labels[stepNum - 1] ?? String(stepNum);
      }
      if (data.form_type === "healing_touch") {
        return t("Question\u00e1rio Pr\u00e9-Sess\u00e3o", "Pre-Session Questionnaire");
      }
      // Pura Radiancia pages
      const labels = [
        t("Dados Pessoais", "Personal Info"),
        t("Sa\u00fade e Bem-Estar", "Health & Well-being"),
        t("Alinhamento", "Alignment"),
        t("Cuidando dos seus Sentidos", "Caring for your Senses"),
        t("Finaliza\u00e7\u00e3o", "Final Notes"),
      ];
      return labels[stepNum - 1] ?? String(stepNum);
    },
    [t]
  );

  // ============================================================
  // Fetch
  // ============================================================

  useEffect(() => {
    if (!token) {
      setTokenError(
        t(
          "Link inv\u00e1lido. Por favor use o link enviado por e-mail.",
          "Invalid link. Please use the link sent by email."
        )
      );
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/forms/prepare/${token}`);

        if (res.status === 404 || res.status === 410) {
          setTokenError(
            t(
              "Este link expirou ou n\u00e3o \u00e9 v\u00e1lido.",
              "This link has expired or is not valid."
            )
          );
          setLoading(false);
          return;
        }

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data: PrepareApiResponse = await res.json();
        setApiData(data);

        // Restore draft from localStorage
        const saved = localStorage.getItem(lsKey(token));
        if (saved) {
          try {
            const parsed: PrepareFormDraft = JSON.parse(saved);
            setDraft(parsed);
          } catch {
            // Silently fall through to default draft
          }
        } else {
          // Pre-fill known client data
          setDraft((prev) => ({
            ...prev,
            client_updates: {
              email: data.client.email ?? "",
              date_of_birth: data.client.date_of_birth ?? "",
            },
          }));
        }
      } catch {
        setTokenError(
          t(
            "Ocorreu um erro ao carregar o formul\u00e1rio. Tente novamente.",
            "An error occurred loading the form. Please try again."
          )
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // ============================================================
  // Auto-save draft
  // ============================================================

  useEffect(() => {
    if (!token || loading) return;
    const id = setInterval(() => {
      localStorage.setItem(lsKey(token), JSON.stringify(draftRef.current));
    }, 3000);
    return () => clearInterval(id);
  }, [token, loading]);

  // ============================================================
  // Navigation
  // ============================================================

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const totalSteps = apiData ? computeTotalSteps(apiData) : 1;

  const goBack = useCallback(() => {
    setStep((s) => Math.max(1, s - 1));
    scrollTop();
  }, []);

  const goNext = useCallback(() => {
    setStep((s) => Math.min(totalSteps, s + 1));
    scrollTop();
  }, [totalSteps]);

  // ============================================================
  // Submit
  // ============================================================

  const handleSubmit = useCallback(async () => {
    if (!token || !apiData) return;

    setSubmitting(true);

    try {
      const payload: Record<string, unknown> = {};

      // Client updates (only if there are editable fields with values)
      const cu = draft.client_updates;
      const hasUpdates = cu.email || cu.date_of_birth;
      if (hasUpdates) {
        payload.client_updates = {
          email: cu.email || null,
          date_of_birth: cu.date_of_birth || null,
        };
      }

      if (!apiData.is_returning) {
        if (!draft.consents.consent_health_data) {
          throw new Error(
            t(
              "É necessário autorizar o tratamento de dados de saúde antes de enviar.",
              "Health-data consent is required before submitting."
            )
          );
        }

        payload.consents = draft.consents;
      }

      if (apiData.is_returning) {
        payload.returning_checkin = draft.returning_checkin;
      } else if (apiData.form_type === "healing_touch") {
        payload.intake = {
          form_type: "healing_touch",
          ...draft.healing_touch,
        };
      } else {
        payload.intake = {
          form_type: "pura_radiancia",
          ...draft.pura_radiancia,
        };
      }

      const res = await fetch(`/api/forms/prepare/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(
          (errBody as { error?: string }).error ?? `HTTP ${res.status}`
        );
      }

      localStorage.removeItem(lsKey(token));
      setSubmitted(true);
    } catch (err: unknown) {
      alert(
        t(
          `Erro ao enviar. Por favor tente novamente.\n${err instanceof Error ? err.message : ""}`,
          `Submission error. Please try again.\n${err instanceof Error ? err.message : ""}`
        )
      );
    } finally {
      setSubmitting(false);
    }
  }, [token, apiData, draft, t]);

  const handleNextOrSubmit = useCallback(() => {
    if (step === totalSteps) {
      handleSubmit();
    } else {
      goNext();
    }
  }, [step, totalSteps, handleSubmit, goNext]);

  // ============================================================
  // Draft update helpers
  // ============================================================

  const updateClientUpdates = useCallback(
    (field: keyof ClientUpdatesDraft, value: string) => {
      setDraft((prev) => ({
        ...prev,
        client_updates: { ...prev.client_updates, [field]: value },
      }));
    },
    []
  );

  const updateConsent = useCallback(
    (field: keyof ConsentDraft, value: boolean) => {
      setDraft((prev) => ({
        ...prev,
        consents: { ...prev.consents, [field]: value },
      }));
    },
    []
  );

  const updateHT = useCallback(
    <K extends keyof HealingTouchData>(field: K, value: HealingTouchData[K]) => {
      setDraft((prev) => ({
        ...prev,
        healing_touch: { ...prev.healing_touch, [field]: value },
      }));
    },
    []
  );

  const updatePR = useCallback(
    <K extends keyof PuraRadianciaData>(field: K, value: PuraRadianciaData[K]) => {
      setDraft((prev) => ({
        ...prev,
        pura_radiancia: { ...prev.pura_radiancia, [field]: value },
      }));
    },
    []
  );

  const updateCheckin = useCallback(
    <K extends keyof ReturningCheckinData>(
      field: K,
      value: ReturningCheckinData[K]
    ) => {
      setDraft((prev) => ({
        ...prev,
        returning_checkin: { ...prev.returning_checkin, [field]: value },
      }));
    },
    []
  );

  // ============================================================
  // Guard states
  // ============================================================

  if (loading) return <LoadingScreen />;

  if (tokenError) return <ErrorScreen message={tokenError} t={t} />;

  if (submitted && apiData) {
    return <SuccessScreen session={apiData.session} t={t} lang={lang} />;
  }

  if (!apiData) return null;

  const clientFullName = [apiData.client.first_name, apiData.client.last_name]
    .filter(Boolean)
    .join(" ");

  const clientGender = apiData.client.gender;

  // Gender-aware helpers
  const oa = g(clientGender, "a", "o", "o/a");
  const welcomeWord = g(
    clientGender,
    t("Bem-vinda", "Welcome"),
    t("Bem-vindo", "Welcome"),
    t("Bem-vindo/a", "Welcome")
  );

  // ============================================================
  // Render
  // ============================================================

  return (
    <div className="min-h-screen bg-mist">
      <PageHeader
        clientName={apiData.client.first_name}
        t={t}
        lang={lang}
        toggleLang={toggleLang}
      />

      {/* Progress bar (only for multi-step forms) */}
      {totalSteps > 1 && (
        <div className="max-w-2xl mx-auto px-4 pt-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">
              {getStepLabel(step, apiData)}
            </span>
            <span className="text-xs text-muted-foreground">
              {t(
                `Passo ${step} de ${totalSteps}`,
                `Step ${step} of ${totalSteps}`
              )}
            </span>
          </div>
          <Progress value={(step / totalSteps) * 100} className="h-1.5" />
        </div>
      )}

      {/* Form card */}
      <main className="max-w-2xl mx-auto px-4 py-6 pb-16">
        <Card className="shadow-sm border-border/50">
          <CardContent className="pt-6 px-5 sm:px-8">

            {/* ================================================ */}
            {/* RETURNING CLIENT FLOW                            */}
            {/* ================================================ */}

            {apiData.is_returning && (
              <>
                {/* --- Step 1: Quick Check-in --- */}
                {step === 1 && (
                  <div className="space-y-6">
                    <SectionTitle
                      title={t("Check-in R\u00e1pido", "Quick Check-in")}
                      subtitle={t(
                        `${welcomeWord} de volta${apiData.client.first_name ? `, ${apiData.client.first_name}` : ""}. Como tem estado?`,
                        `Welcome back${apiData.client.first_name ? `, ${apiData.client.first_name}` : ""}. How have you been?`
                      )}
                    />

                    {/* Feeling since last session */}
                    <div className="space-y-3">
                      <Label className="font-sans text-sm font-medium">
                        {t(
                          "Como se tem sentido desde a \u00faltima sess\u00e3o?",
                          "How have you been feeling since your last session?"
                        )}
                      </Label>
                      <div className="grid grid-cols-3 gap-3">
                        {(
                          [
                            { value: "better", pt: "Melhor", en: "Better" },
                            { value: "same", pt: "Igual", en: "Same" },
                            { value: "worse", pt: "Pior", en: "Worse" },
                          ] as const
                        ).map(({ value, pt, en }) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() =>
                              updateCheckin("feeling_since_last", value)
                            }
                            className={`rounded-xl border-2 p-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 ${
                              draft.returning_checkin.feeling_since_last ===
                              value
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border bg-white/60 text-foreground hover:border-primary/50"
                            }`}
                            aria-pressed={
                              draft.returning_checkin.feeling_since_last ===
                              value
                            }
                          >
                            {t(pt, en)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Wellness scales */}
                    <div className="space-y-4">
                      <Label className="font-sans text-sm font-medium">
                        {t(
                          "Como se sente hoje? (1 = muito mal, 10 = excelente)",
                          "How are you feeling today? (1 = very poor, 10 = excellent)"
                        )}
                      </Label>
                      <ScaleField
                        label={t("F\u00edsico", "Physical")}
                        value={draft.returning_checkin.feeling_physically}
                        onChange={(v) =>
                          updateCheckin("feeling_physically", v)
                        }
                        lowLabel="1"
                        highLabel="10"
                      />
                      <ScaleField
                        label={t("Psicol\u00f3gico", "Psychological")}
                        value={
                          draft.returning_checkin.feeling_psychologically
                        }
                        onChange={(v) =>
                          updateCheckin("feeling_psychologically", v)
                        }
                        lowLabel="1"
                        highLabel="10"
                      />
                      <ScaleField
                        label={t("Emocional", "Emotional")}
                        value={draft.returning_checkin.feeling_emotionally}
                        onChange={(v) =>
                          updateCheckin("feeling_emotionally", v)
                        }
                        lowLabel="1"
                        highLabel="10"
                      />
                      <ScaleField
                        label={t("Energ\u00e9tico", "Energetic")}
                        value={
                          draft.returning_checkin.feeling_energetically
                        }
                        onChange={(v) =>
                          updateCheckin("feeling_energetically", v)
                        }
                        lowLabel="1"
                        highLabel="10"
                      />
                    </div>

                    {/* Health changes */}
                    <div className="space-y-3 py-4 border-t border-border">
                      <div className="flex items-start gap-4">
                        <Switch
                          checked={draft.returning_checkin.health_changes}
                          onCheckedChange={(v) =>
                            updateCheckin("health_changes", v)
                          }
                          aria-label={t(
                            "Alguma altera\u00e7\u00e3o de sa\u00fade?",
                            "Any health changes?"
                          )}
                          className="mt-0.5 shrink-0"
                        />
                        <span className="text-sm leading-snug text-foreground flex-1">
                          {t(
                            "Alguma altera\u00e7\u00e3o de sa\u00fade desde a \u00faltima sess\u00e3o?",
                            "Any health changes since the last session?"
                          )}
                        </span>
                        <span
                          className={`text-xs font-medium shrink-0 ${draft.returning_checkin.health_changes ? "text-primary" : "text-muted-foreground"}`}
                        >
                          {draft.returning_checkin.health_changes
                            ? t("Sim", "Yes")
                            : t("N\u00e3o", "No")}
                        </span>
                      </div>
                      {draft.returning_checkin.health_changes && (
                        <div className="pl-14">
                          <Textarea
                            value={
                              draft.returning_checkin.health_changes_details
                            }
                            onChange={(e) =>
                              updateCheckin(
                                "health_changes_details",
                                e.target.value
                              )
                            }
                            placeholder={t(
                              "Descreva as altera\u00e7\u00f5es de sa\u00fade...",
                              "Describe the health changes..."
                            )}
                            rows={2}
                            className="text-sm resize-none"
                          />
                        </div>
                      )}
                    </div>

                    {/* Session focus */}
                    <div className="space-y-3 border-t border-border pt-4">
                      <Label className="font-sans text-sm font-medium">
                        {t(
                          "Continua\u00e7\u00e3o do trabalho anterior ou tema novo?",
                          "Continue previous work or explore a new theme?"
                        )}
                      </Label>
                      <div className="grid grid-cols-2 gap-3">
                        {(
                          [
                            {
                              value: "continuation",
                              pt: "Continua\u00e7\u00e3o",
                              en: "Continuation",
                            },
                            {
                              value: "new_topic",
                              pt: "Tema Novo",
                              en: "New Theme",
                            },
                          ] as const
                        ).map(({ value, pt, en }) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() =>
                              updateCheckin("session_focus", value)
                            }
                            className={`rounded-xl border-2 p-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 ${
                              draft.returning_checkin.session_focus === value
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border bg-white/60 text-foreground hover:border-primary/50"
                            }`}
                            aria-pressed={
                              draft.returning_checkin.session_focus === value
                            }
                          >
                            {t(pt, en)}
                          </button>
                        ))}
                      </div>
                      {draft.returning_checkin.session_focus ===
                        "new_topic" && (
                        <Textarea
                          value={draft.returning_checkin.new_topic_details}
                          onChange={(e) =>
                            updateCheckin("new_topic_details", e.target.value)
                          }
                          placeholder={t(
                            "O que gostaria de trabalhar nesta sess\u00e3o?",
                            "What would you like to explore in this session?"
                          )}
                          rows={3}
                          className="text-sm resize-none"
                        />
                      )}
                    </div>

                    {/* Additional observations */}
                    <div className="space-y-2 border-t border-border pt-4">
                      <Label className="font-sans text-sm font-medium">
                        {t(
                          "Observa\u00e7\u00f5es adicionais",
                          "Additional observations"
                        )}
                      </Label>
                      <Textarea
                        value={
                          draft.returning_checkin.additional_observations
                        }
                        onChange={(e) =>
                          updateCheckin(
                            "additional_observations",
                            e.target.value
                          )
                        }
                        placeholder={t(
                          "Partilhe tudo o que considere relevante para a sess\u00e3o...",
                          "Share anything you feel is relevant for the session..."
                        )}
                        rows={3}
                        className="text-sm resize-none"
                      />
                    </div>

                    <NavButtons
                      step={step}
                      totalSteps={totalSteps}
                      onBack={goBack}
                      onNext={handleNextOrSubmit}
                      isSubmitting={submitting}
                      backLabel={t("Anterior", "Previous")}
                      nextLabel={t("Seguinte", "Next")}
                    />
                  </div>
                )}

                {/* --- Step 2: Practical Info --- */}
                {step === 2 && (
                  <div>
                    <ReturningPracticalInfoStep
                      session={apiData.session}
                      t={t}
                      lang={lang}
                    />
                    <NavButtons
                      step={step}
                      totalSteps={totalSteps}
                      onBack={goBack}
                      onNext={handleNextOrSubmit}
                      isSubmitting={submitting}
                      backLabel={t("Anterior", "Previous")}
                      nextLabel={t("Enviar", "Submit")}
                    />
                  </div>
                )}
              </>
            )}

            {/* ================================================ */}
            {/* NEW CLIENT: HEALING TOUCH (single page)          */}
            {/* ================================================ */}

            {!apiData.is_returning &&
              apiData.form_type === "healing_touch" && (
                <div className="space-y-6">
                  {/* Welcome */}
                  <div className="text-center mb-4 space-y-3">
                    <Leaf
                      className="mx-auto h-8 w-8 text-primary/60"
                      strokeWidth={1}
                    />
                    <h1 className="font-serif text-3xl text-foreground leading-tight">
                      {welcomeWord},{" "}
                      <span className="text-primary">
                        {apiData.client.first_name}
                      </span>
                    </h1>
                    <div className="mx-auto h-px w-16 bg-primary/30" />
                  </div>

                  {/* Personal info (read-only + editable if missing) */}
                  {apiData.needs_personal_data && (
                    <div className="space-y-4">
                      <div className="rounded-xl bg-muted/30 border border-border p-4 space-y-2">
                        <div>
                          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-0.5">
                            {t("Nome", "Name")}
                          </p>
                          <p className="text-sm text-foreground">
                            {clientFullName}
                          </p>
                        </div>
                        {apiData.client.phone && (
                          <div>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-0.5">
                              {t("Contacto telef\u00f3nico", "Phone")}
                            </p>
                            <p className="text-sm text-foreground">
                              {apiData.client.phone}
                            </p>
                          </div>
                        )}
                      </div>

                      {apiData.client.email === null && (
                        <div className="space-y-1.5">
                          <Label htmlFor="ht-email" className="text-sm font-medium">
                            {t("E-mail", "Email")}
                          </Label>
                          <Input
                            id="ht-email"
                            type="email"
                            value={draft.client_updates.email}
                            onChange={(e) =>
                              updateClientUpdates("email", e.target.value)
                            }
                            placeholder="nome@exemplo.com"
                            className="h-11"
                            autoComplete="email"
                          />
                        </div>
                      )}

                      {apiData.client.date_of_birth === null && (
                        <div className="space-y-1.5">
                          <Label htmlFor="ht-dob" className="text-sm font-medium">
                            {t("Data de Nascimento", "Date of Birth")}
                          </Label>
                          <Input
                            id="ht-dob"
                            type="date"
                            value={draft.client_updates.date_of_birth}
                            onChange={(e) =>
                              updateClientUpdates(
                                "date_of_birth",
                                e.target.value
                              )
                            }
                            className="h-11"
                            max={new Date().toISOString().split("T")[0]}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  <ConsentSection
                    consents={draft.consents}
                    onToggle={updateConsent}
                    t={t}
                  />

                  {/* Referral source */}
                  <ReferralSourceField
                    value={draft.healing_touch.referral_source}
                    onChange={(v) => updateHT("referral_source", v)}
                    options={REFERRAL_OPTIONS}
                    t={t}
                  />

                  {/* Q1: Motivation */}
                  <div className="space-y-1.5">
                    <Label className="font-sans text-sm font-medium">
                      {t(
                        `O que ${oa} motivou a agendar esta sess\u00e3o?`,
                        "What motivated you to book this session?"
                      )}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {t(
                        "Ex.: relaxamento, dor f\u00edsica, desafios emocionais, necessidade de equil\u00edbrio energ\u00e9tico, outros",
                        "E.g.: relaxation, physical pain, emotional challenges, need for energetic balance, other"
                      )}
                    </p>
                    <Textarea
                      value={draft.healing_touch.motivation}
                      onChange={(e) =>
                        updateHT("motivation", e.target.value)
                      }
                      rows={3}
                      className="text-sm resize-none"
                    />
                  </div>

                  {/* Q2: Main objective */}
                  <div className="space-y-1.5">
                    <Label className="font-sans text-sm font-medium">
                      {t(
                        "Qual o principal objectivo para esta sess\u00e3o?",
                        "What is your main objective for this session?"
                      )}
                    </Label>
                    <Textarea
                      value={draft.healing_touch.main_objective}
                      onChange={(e) =>
                        updateHT("main_objective", e.target.value)
                      }
                      rows={3}
                      className="text-sm resize-none"
                    />
                  </div>

                  {/* Q3: Health conditions */}
                  <div className="space-y-1.5">
                    <Label className="font-sans text-sm font-medium">
                      {t(
                        "Tem alguma situa\u00e7\u00e3o de sa\u00fade que seja relevante mencionar previamente?",
                        "Do you have any health condition that is relevant to mention beforehand?"
                      )}
                    </Label>
                    <Textarea
                      value={draft.healing_touch.health_conditions}
                      onChange={(e) =>
                        updateHT("health_conditions", e.target.value)
                      }
                      rows={2}
                      className="text-sm resize-none"
                    />
                  </div>

                  {/* Q4: Treatment / medication */}
                  <div className="space-y-1.5">
                    <Label className="font-sans text-sm font-medium">
                      {t(
                        "Est\u00e1 a fazer algum tratamento m\u00e9dico ou medica\u00e7\u00e3o?",
                        "Are you undergoing any medical treatment or medication?"
                      )}
                    </Label>
                    <Textarea
                      value={draft.healing_touch.current_treatment}
                      onChange={(e) =>
                        updateHT("current_treatment", e.target.value)
                      }
                      rows={2}
                      className="text-sm resize-none"
                    />
                  </div>

                  {/* Q5: Pregnant / breastfeeding */}
                  <div className="space-y-1.5">
                    <Label className="font-sans text-sm font-medium">
                      {t(
                        "Est\u00e1 gr\u00e1vida ou a amamentar?",
                        "Are you pregnant or breastfeeding?"
                      )}
                    </Label>
                    <Textarea
                      value={draft.healing_touch.pregnant_breastfeeding}
                      onChange={(e) =>
                        updateHT("pregnant_breastfeeding", e.target.value)
                      }
                      rows={2}
                      className="text-sm resize-none"
                    />
                  </div>

                  {/* Q6: Allergies */}
                  <div className="space-y-1.5">
                    <Label className="font-sans text-sm font-medium">
                      {t(
                        "Tem alguma sensibilidade ou alergia a algum produto, nomeadamente \u00f3leos essenciais?",
                        "Do you have any sensitivity or allergy to any product, namely essential oils?"
                      )}
                    </Label>
                    <Textarea
                      value={draft.healing_touch.allergies_sensitivities}
                      onChange={(e) =>
                        updateHT("allergies_sensitivities", e.target.value)
                      }
                      rows={2}
                      className="text-sm resize-none"
                    />
                  </div>

                  {/* Scales 1-10 */}
                  <div className="space-y-4 border-t border-border pt-5">
                    <ScaleField
                      label={t(
                        "Como se tem sentido fisicamente?",
                        "How have you been feeling physically?"
                      )}
                      value={draft.healing_touch.feeling_physically}
                      onChange={(v) => updateHT("feeling_physically", v)}
                      lowLabel={t("nada bem", "not well at all")}
                      highLabel={t("fenomenal", "phenomenal")}
                    />
                    <ScaleField
                      label={t(
                        "Como se tem sentido psicologicamente?",
                        "How have you been feeling psychologically?"
                      )}
                      value={draft.healing_touch.feeling_psychologically}
                      onChange={(v) =>
                        updateHT("feeling_psychologically", v)
                      }
                      lowLabel={t("nada bem", "not well at all")}
                      highLabel={t("fenomenal", "phenomenal")}
                    />
                    <ScaleField
                      label={t(
                        "Como se tem sentido emocionalmente?",
                        "How have you been feeling emotionally?"
                      )}
                      value={draft.healing_touch.feeling_emotionally}
                      onChange={(v) => updateHT("feeling_emotionally", v)}
                      lowLabel={t("nada bem", "not well at all")}
                      highLabel={t("fenomenal", "phenomenal")}
                    />
                    <ScaleField
                      label={t(
                        "Como se tem sentido energeticamente?",
                        "How have you been feeling energetically?"
                      )}
                      value={draft.healing_touch.feeling_energetically}
                      onChange={(v) =>
                        updateHT("feeling_energetically", v)
                      }
                      lowLabel={t("nada bem", "not well at all")}
                      highLabel={t("fenomenal", "phenomenal")}
                    />
                  </div>

                  {/* Q11: Additional observations */}
                  <div className="space-y-1.5">
                    <Label className="font-sans text-sm font-medium">
                      {t(
                        "H\u00e1 alguma outra observa\u00e7\u00e3o que seja relevante de partilhar?",
                        "Is there any other observation that is relevant to share?"
                      )}
                    </Label>
                    <Textarea
                      value={draft.healing_touch.additional_observations}
                      onChange={(e) =>
                        updateHT("additional_observations", e.target.value)
                      }
                      rows={3}
                      className="text-sm resize-none"
                    />
                  </div>

                  {/* Practical info section (displayed, not a form field) */}
                  <HealingTouchPracticalInfo t={t} />

                  {/* Submit */}
                  <div className="pt-4">
                    <Button
                      type="button"
                      onClick={handleSubmit}
                      className="w-full bg-primary hover:bg-primary/90"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        t("Enviar", "Submit")
                      )}
                    </Button>
                  </div>
                </div>
              )}

            {/* ================================================ */}
            {/* NEW CLIENT: PURA RADIANCIA (5 pages)             */}
            {/* ================================================ */}

            {!apiData.is_returning &&
              apiData.form_type === "pura_radiancia" && (
                <>
                  {/* --- Page 1: Personal Info --- */}
                  {step === 1 && (
                    <div className="space-y-6">
                      {/* Welcome text */}
                      <div className="text-center mb-4 space-y-3">
                        <Leaf
                          className="mx-auto h-8 w-8 text-primary/60"
                          strokeWidth={1}
                        />
                        <h1 className="font-serif text-2xl text-foreground leading-tight">
                          {t(
                            `${g(clientGender, "Querida", "Querido", "Querido/a")} Ser, ${welcomeWord} ao Primeiro Passo para a Immers\u00e3o Pura Radi\u00e2ncia!`,
                            `Dear Being, ${welcomeWord} to the First Step of the Pura Radiancia Immersion!`
                          )}
                        </h1>
                        <div className="mx-auto h-px w-16 bg-primary/30" />
                        <div className="bg-primary/5 border border-primary/15 rounded-xl p-5 text-left">
                          <p className="text-sm leading-relaxed text-foreground/80 italic font-serif">
                            {t(
                              "Este question\u00e1rio foi criado com todo o amor e dedica\u00e7\u00e3o para que possamos personalizar a sua experi\u00eancia.",
                              "This questionnaire was created with all the love and dedication so that we can personalise your experience."
                            )}
                          </p>
                        </div>
                      </div>

                      <SectionTitle
                        title={t("Dados Pessoais", "Personal Info")}
                      />

                      {/* Read-only fields */}
                      <div className="rounded-xl bg-muted/30 border border-border p-4 space-y-2">
                        <div>
                          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-0.5">
                            {t("Nome", "Name")}
                          </p>
                          <p className="text-sm text-foreground">
                            {clientFullName}
                          </p>
                        </div>
                        {apiData.client.phone && (
                          <div>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-0.5">
                              {t(
                                "Contacto telef\u00f3nico",
                                "Phone"
                              )}
                            </p>
                            <p className="text-sm text-foreground">
                              {apiData.client.phone}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Editable fields */}
                      {apiData.client.email === null && (
                        <div className="space-y-1.5">
                          <Label htmlFor="pr-email" className="text-sm font-medium">
                            {t("E-mail", "Email")}
                          </Label>
                          <Input
                            id="pr-email"
                            type="email"
                            value={draft.client_updates.email}
                            onChange={(e) =>
                              updateClientUpdates("email", e.target.value)
                            }
                            placeholder="nome@exemplo.com"
                            className="h-11"
                            autoComplete="email"
                          />
                        </div>
                      )}

                      {apiData.client.date_of_birth === null && (
                        <div className="space-y-1.5">
                          <Label htmlFor="pr-dob" className="text-sm font-medium">
                            {t("Data de Nascimento", "Date of Birth")}
                          </Label>
                          <Input
                            id="pr-dob"
                            type="date"
                            value={draft.client_updates.date_of_birth}
                            onChange={(e) =>
                              updateClientUpdates(
                                "date_of_birth",
                                e.target.value
                              )
                            }
                            className="h-11"
                            max={new Date().toISOString().split("T")[0]}
                          />
                        </div>
                      )}

                      <ConsentSection
                        consents={draft.consents}
                        onToggle={updateConsent}
                        t={t}
                      />

                      {/* Referral source (PR version without cheque-oferta) */}
                      <ReferralSourceField
                        value={draft.pura_radiancia.referral_source}
                        onChange={(v) => updatePR("referral_source", v)}
                        options={REFERRAL_OPTIONS_PR}
                        t={t}
                      />

                      <NavButtons
                        step={step}
                        totalSteps={totalSteps}
                        onBack={goBack}
                        onNext={handleNextOrSubmit}
                        isSubmitting={submitting}
                        backLabel={t("Anterior", "Previous")}
                        nextLabel={t("Seguinte", "Next")}
                      />
                    </div>
                  )}

                  {/* --- Page 2: Saude e Bem-Estar --- */}
                  {step === 2 && (
                    <div className="space-y-6">
                      <SectionTitle
                        title={t(
                          "Sa\u00fade e Bem-Estar",
                          "Health & Well-being"
                        )}
                      />

                      {/* Q1 */}
                      <div className="space-y-1.5">
                        <Label className="font-sans text-sm font-medium">
                          {t(
                            "Possui alguma condi\u00e7\u00e3o de sa\u00fade que precise ser considerada?",
                            "Do you have any health condition that needs to be considered?"
                          )}
                        </Label>
                        <Textarea
                          value={draft.pura_radiancia.health_conditions}
                          onChange={(e) =>
                            updatePR("health_conditions", e.target.value)
                          }
                          rows={2}
                          className="text-sm resize-none"
                        />
                      </div>

                      {/* Q2 */}
                      <div className="space-y-1.5">
                        <Label className="font-sans text-sm font-medium">
                          {t(
                            "Est\u00e1 a fazer algum tratamento m\u00e9dico ou medica\u00e7\u00e3o?",
                            "Are you undergoing any medical treatment or medication?"
                          )}
                        </Label>
                        <Textarea
                          value={draft.pura_radiancia.current_treatment}
                          onChange={(e) =>
                            updatePR("current_treatment", e.target.value)
                          }
                          rows={2}
                          className="text-sm resize-none"
                        />
                      </div>

                      {/* Q3 */}
                      <div className="space-y-1.5">
                        <Label className="font-sans text-sm font-medium">
                          {t(
                            "Est\u00e1 gr\u00e1vida ou a amamentar?",
                            "Are you pregnant or breastfeeding?"
                          )}
                        </Label>
                        <Textarea
                          value={
                            draft.pura_radiancia.pregnant_breastfeeding
                          }
                          onChange={(e) =>
                            updatePR(
                              "pregnant_breastfeeding",
                              e.target.value
                            )
                          }
                          rows={2}
                          className="text-sm resize-none"
                        />
                      </div>

                      {/* Q4 */}
                      <div className="space-y-1.5">
                        <Label className="font-sans text-sm font-medium">
                          {t(
                            "Tem alguma sensibilidade ou alergia a algum produto, nomeadamente \u00f3leos essenciais?",
                            "Do you have any sensitivity or allergy to any product, namely essential oils?"
                          )}
                        </Label>
                        <Textarea
                          value={
                            draft.pura_radiancia.allergies_sensitivities
                          }
                          onChange={(e) =>
                            updatePR(
                              "allergies_sensitivities",
                              e.target.value
                            )
                          }
                          rows={2}
                          className="text-sm resize-none"
                        />
                      </div>

                      {/* Q5 */}
                      <div className="space-y-1.5">
                        <Label className="font-sans text-sm font-medium">
                          {t(
                            "Pratica medita\u00e7\u00e3o ou outras t\u00e9cnicas de bem-estar?",
                            "Do you practice meditation or other well-being techniques?"
                          )}
                        </Label>
                        <Textarea
                          value={draft.pura_radiancia.meditation_practice}
                          onChange={(e) =>
                            updatePR("meditation_practice", e.target.value)
                          }
                          rows={2}
                          className="text-sm resize-none"
                        />
                      </div>

                      {/* Q6 */}
                      <div className="space-y-1.5">
                        <Label className="font-sans text-sm font-medium">
                          {t(
                            "Tem algum desafio actual que gostasse de mencionar?",
                            "Do you have any current challenge you would like to mention?"
                          )}
                        </Label>
                        <Textarea
                          value={draft.pura_radiancia.current_challenges}
                          onChange={(e) =>
                            updatePR("current_challenges", e.target.value)
                          }
                          rows={2}
                          className="text-sm resize-none"
                        />
                      </div>

                      <NavButtons
                        step={step}
                        totalSteps={totalSteps}
                        onBack={goBack}
                        onNext={handleNextOrSubmit}
                        isSubmitting={submitting}
                        backLabel={t("Anterior", "Previous")}
                        nextLabel={t("Seguinte", "Next")}
                      />
                    </div>
                  )}

                  {/* --- Page 3: Alinhamento --- */}
                  {step === 3 && (
                    <div className="space-y-6">
                      <SectionTitle
                        title={t("Alinhamento", "Alignment")}
                      />

                      {/* Q7 */}
                      <div className="space-y-1.5">
                        <Label className="font-sans text-sm font-medium">
                          {t(
                            `O que ${oa} motiva a participar nesta Immers\u00e3o?`,
                            "What motivates you to participate in this Immersion?"
                          )}
                        </Label>
                        <Textarea
                          value={
                            draft.pura_radiancia.immersion_motivation
                          }
                          onChange={(e) =>
                            updatePR(
                              "immersion_motivation",
                              e.target.value
                            )
                          }
                          rows={3}
                          className="text-sm resize-none"
                        />
                      </div>

                      {/* Q8 */}
                      <div className="space-y-1.5">
                        <Label className="font-sans text-sm font-medium">
                          {t(
                            "Qual a sua principal inten\u00e7\u00e3o para a Immers\u00e3o?",
                            "What is your main intention for the Immersion?"
                          )}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {t(
                            "Em vez de partilhar algo muito resumido como 'relaxar', permita-se desenvolver um pouco mais as suas necessidades e vontades.",
                            "Instead of sharing something very brief like 'relax', allow yourself to develop your needs and wishes a little more."
                          )}
                        </p>
                        <Textarea
                          value={draft.pura_radiancia.main_intention}
                          onChange={(e) =>
                            updatePR("main_intention", e.target.value)
                          }
                          rows={3}
                          className="text-sm resize-none"
                        />
                      </div>

                      {/* Q9 */}
                      <div className="space-y-1.5">
                        <Label className="font-sans text-sm font-medium">
                          {t(
                            "O que sem d\u00favida gostaria de fazer ou receber na Immers\u00e3o? Deixe o seu Cora\u00e7\u00e3o dizer-lhe o que o/a faz sorrir e enumere a sua Lista de Desejos!",
                            "What would you definitely like to do or receive during the Immersion? Let your Heart tell you what makes you smile and list your Wishlist!"
                          )}
                        </Label>
                        <Textarea
                          value={draft.pura_radiancia.wishlist}
                          onChange={(e) =>
                            updatePR("wishlist", e.target.value)
                          }
                          rows={3}
                          className="text-sm resize-none"
                        />
                      </div>

                      <NavButtons
                        step={step}
                        totalSteps={totalSteps}
                        onBack={goBack}
                        onNext={handleNextOrSubmit}
                        isSubmitting={submitting}
                        backLabel={t("Anterior", "Previous")}
                        nextLabel={t("Seguinte", "Next")}
                      />
                    </div>
                  )}

                  {/* --- Page 4: Cuidando dos seus Sentidos --- */}
                  {step === 4 && (
                    <div className="space-y-6">
                      <SectionTitle
                        title={t(
                          "Cuidando dos seus Sentidos",
                          "Caring for your Senses"
                        )}
                      />

                      {/* Q10 */}
                      <div className="space-y-1.5">
                        <Label className="font-sans text-sm font-medium">
                          {t(
                            "Quais os aromas que gosta mais? H\u00e1 algum que n\u00e3o goste?",
                            "Which aromas do you like the most? Is there any you don't like?"
                          )}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {t(
                            "Se n\u00e3o souber os nomes, indique o tipo: floral, c\u00edtrico, amadeirado, suave, forte, etc.",
                            "If you don't know the names, indicate the type: floral, citrus, woody, soft, strong, etc."
                          )}
                        </p>
                        <Textarea
                          value={draft.pura_radiancia.aroma_preferences}
                          onChange={(e) =>
                            updatePR("aroma_preferences", e.target.value)
                          }
                          rows={3}
                          className="text-sm resize-none"
                        />
                      </div>

                      {/* Q11 */}
                      <div className="space-y-1.5">
                        <Label className="font-sans text-sm font-medium">
                          {t(
                            "Qual o tipo de m\u00fasica que prefere para a Immers\u00e3o? H\u00e1 algum instrumento que n\u00e3o goste?",
                            "What type of music do you prefer for the Immersion? Is there any instrument you don't like?"
                          )}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {t(
                            "Mesmo sendo m\u00fasica calma: detalhe se prefere mais instrumental, com letras ou mantras, com sons de natureza, flauta, tambores, etc.",
                            "Even if it's calm music: detail whether you prefer more instrumental, with lyrics or mantras, with nature sounds, flute, drums, etc."
                          )}
                        </p>
                        <Textarea
                          value={draft.pura_radiancia.music_preferences}
                          onChange={(e) =>
                            updatePR("music_preferences", e.target.value)
                          }
                          rows={3}
                          className="text-sm resize-none"
                        />
                      </div>

                      {/* Q12: Beverage */}
                      <div className="space-y-3">
                        <Label className="font-sans text-sm font-medium">
                          {t(
                            "Qual \u00e9 o tipo de bebida que gosta mais?",
                            "What type of beverage do you like the most?"
                          )}
                        </Label>
                        <RadioGroup
                          value={draft.pura_radiancia.beverage_preference}
                          onValueChange={(v) =>
                            updatePR(
                              "beverage_preference",
                              v as BeveragePreference
                            )
                          }
                          className="space-y-2"
                        >
                          {BEVERAGE_OPTIONS.map((opt) => (
                            <div
                              key={opt.value}
                              className="flex items-center gap-3"
                            >
                              <RadioGroupItem
                                value={opt.value}
                                id={`bev-${opt.value}`}
                              />
                              <Label
                                htmlFor={`bev-${opt.value}`}
                                className="text-sm cursor-pointer"
                              >
                                {t(opt.pt, opt.en)}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>

                      {/* Q13 */}
                      <div className="space-y-1.5">
                        <Label className="font-sans text-sm font-medium">
                          {t(
                            "Tem alguma necessidade ou restri\u00e7\u00e3o diet\u00e9tica espec\u00edfica?",
                            "Do you have any specific dietary need or restriction?"
                          )}
                        </Label>
                        <Textarea
                          value={
                            draft.pura_radiancia.dietary_restrictions
                          }
                          onChange={(e) =>
                            updatePR(
                              "dietary_restrictions",
                              e.target.value
                            )
                          }
                          rows={2}
                          className="text-sm resize-none"
                        />
                      </div>

                      {/* Q14 */}
                      <div className="space-y-1.5">
                        <Label className="font-sans text-sm font-medium">
                          {t(
                            "Quais as cores que lhe trazem maior harmonia?",
                            "Which colours bring you the most harmony?"
                          )}
                        </Label>
                        <Textarea
                          value={draft.pura_radiancia.color_preferences}
                          onChange={(e) =>
                            updatePR("color_preferences", e.target.value)
                          }
                          rows={2}
                          className="text-sm resize-none"
                        />
                      </div>

                      <NavButtons
                        step={step}
                        totalSteps={totalSteps}
                        onBack={goBack}
                        onNext={handleNextOrSubmit}
                        isSubmitting={submitting}
                        backLabel={t("Anterior", "Previous")}
                        nextLabel={t("Seguinte", "Next")}
                      />
                    </div>
                  )}

                  {/* --- Page 5: Finalizacao --- */}
                  {step === 5 && (
                    <div className="space-y-6">
                      <SectionTitle
                        title={t("Finaliza\u00e7\u00e3o", "Final Notes")}
                      />

                      {/* Q15 */}
                      <div className="space-y-1.5">
                        <Label className="font-sans text-sm font-medium">
                          {t(
                            "Tem alguma quest\u00e3o ou observa\u00e7\u00e3o que gostasse de partilhar?",
                            "Do you have any question or observation you would like to share?"
                          )}
                        </Label>
                        <Textarea
                          value={
                            draft.pura_radiancia.additional_observations
                          }
                          onChange={(e) =>
                            updatePR(
                              "additional_observations",
                              e.target.value
                            )
                          }
                          rows={4}
                          className="text-sm resize-none"
                        />
                      </div>

                      {/* Note about deadline */}
                      <div className="bg-primary/5 border border-primary/15 rounded-xl p-4">
                        <p className="text-sm text-foreground/80 leading-relaxed">
                          {t(
                            "Por favor, responda a este question\u00e1rio at\u00e9 5 dias antes da data agendada para a Immers\u00e3o.",
                            "Please answer this questionnaire up to 5 days before the scheduled date of the Immersion."
                          )}
                        </p>
                      </div>

                      {/* Closing poem */}
                      <blockquote className="border-l-2 border-primary/40 pl-4">
                        <p className="font-serif text-sm italic text-primary/80 leading-relaxed whitespace-pre-line">
                          {t(
                            `O Amor \u00e9 um Sol,
Que flui e nutre.
Auto-suficiente
Na sua presen\u00e7a inabal\u00e1vel.
A beleza do seu brilho e calor
Vem de dentro,
Uma profunda combust\u00e3o de si mesmo.
Respira\u00e7\u00e3o, Vida, Esplendor...
O Amor \u00c9... Um Sol.`,
                            `Love is a Sun,
That flows and nourishes.
Self-sufficient
In its unwavering presence.
The beauty of its glow and warmth
Comes from within,
A deep combustion of itself.
Breath, Life, Splendour...
Love Is... A Sun.`
                          )}
                        </p>
                        <footer className="mt-2 font-sans text-xs text-muted-foreground">
                          &mdash; Daniela Alves
                        </footer>
                      </blockquote>

                      <NavButtons
                        step={step}
                        totalSteps={totalSteps}
                        onBack={goBack}
                        onNext={handleNextOrSubmit}
                        isSubmitting={submitting}
                        backLabel={t("Anterior", "Previous")}
                        nextLabel={t("Enviar", "Submit")}
                      />
                    </div>
                  )}
                </>
              )}

          </CardContent>
        </Card>
      </main>
    </div>
  );
}
