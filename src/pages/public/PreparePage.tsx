/**
 * PreparePage — Unified client preparation form
 *
 * Route: /preparar/:token
 * No authentication required. Token identifies the session.
 *
 * Adaptive flow:
 *   - New client  (is_returning=false): Personal Data → Health → Lifestyle → Body Map → Session Form → Practical Info
 *   - Returning client (is_returning=true): Quick Check-in → Practical Info
 *
 * Usage:
 *   <Route path="/preparar/:token" element={<PreparePage />} />
 */

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { BodyMap } from "@/components/admin/sessions/BodyMap";
import type { BodyMapMarker } from "@/lib/types/database.types";
import { downloadICS } from "@/lib/ics";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";

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
  height_cm: number | null;
  weight_kg: number | null;
  profession: string | null;
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
  needs_anamnesis: boolean;
  needs_personal_data: boolean;
  form_type: "healing_touch" | "pura_radiancia";
  last_session_date: string | null;
  total_sessions: number;
}

// ============================================================
// Form state types
// ============================================================

interface HealthQuestion {
  has: boolean;
  details: string;
}

interface LifestyleQuestion {
  answer: string;
}

type HealthKey =
  | "medicacao"
  | "cirurgias"
  | "acidentes_fracturas_proteses"
  | "doenca_cronica"
  | "diabetes"
  | "sintomas_cardiacos"
  | "hipertensao_hipotensao"
  | "varizes_retencao_liquidos"
  | "sintomas_respiratorios"
  | "alergias_sensibilidades"
  | "sintomas_pele"
  | "sintomas_musculo_esqueleticos"
  | "sintomas_sistema_nervoso"
  | "sintomas_digestivos"
  | "boca_tratamentos"
  | "gravidez_filhos_hormonal"
  | "nascimento_amamentacao";

type LifestyleKey =
  | "ingestao_liquidos"
  | "alimentacao_alcool"
  | "tabaco_drogas"
  | "actividade_fisica"
  | "qualidade_sono"
  | "ciclo_menstrual"
  | "sexualidade"
  | "funcionamento_intestinal";

interface ClientUpdatesDraft {
  email: string;
  date_of_birth: string;
  profession: string;
  height_cm: string;
  weight_kg: string;
}

interface AnamnesisData {
  health_general: Record<HealthKey, HealthQuestion>;
  lifestyle: Record<LifestyleKey, LifestyleQuestion>;
  body_map_data: BodyMapMarker[];
  has_pain_trigger: boolean;
  pain_trigger_task: string;
}

interface IntakeData {
  form_type: "healing_touch" | "pura_radiancia";
  motivation: string;
  main_objective: string;
  health_conditions: string;
  current_treatment: string;
  allergies_sensitivities: string;
  feeling_physically: number;
  feeling_psychologically: number;
  feeling_emotionally: number;
  feeling_energetically: number;
  // Pura Radiância extras
  meditation_practice: string;
  immersion_motivation: string;
  main_intention: string;
  wishlist: string;
  aroma_preferences: string;
  music_preferences: string;
  beverage_preference: string;
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

interface PrepareFormDraft {
  client_updates: ClientUpdatesDraft;
  anamnesis: AnamnesisData;
  intake: IntakeData;
  returning_checkin: ReturningCheckinData;
  declaration_accepted: boolean;
}

// ============================================================
// Constants
// ============================================================

const SESSION_ADDRESS = "R. do Regueiro do Tanque 3, Fontanelas, São João das Lampas, 2705-415 Sintra";
const GOOGLE_MAPS_URL = "https://maps.google.com/?q=R.+do+Regueiro+do+Tanque+3,+Fontanelas,+S%C3%A3o+Jo%C3%A3o+das+Lampas,+2705-415+Sintra";
const DANIELA_QUOTE = "Quando o corpo relaxa e harmoniza, o Ser cria condições para regressar à sua mais genuína Expressão.";

const HEALTH_LABELS_PT: Record<HealthKey, string> = {
  medicacao: "Toma alguma medicação? (inclua suplementos e contracetivos)",
  cirurgias: "Cirurgias ou intervenções médicas recentes ou passadas",
  acidentes_fracturas_proteses: "Acidentes, fracturas ou próteses",
  doenca_cronica: "Doença crónica diagnosticada",
  diabetes: "Diabetes",
  sintomas_cardiacos: "Sintomas cardíacos (palpitações, dores no peito…)",
  hipertensao_hipotensao: "Hipertensão ou hipotensão",
  varizes_retencao_liquidos: "Varizes ou retenção de líquidos",
  sintomas_respiratorios: "Sintomas respiratórios (asma, bronquite…)",
  alergias_sensibilidades: "Alergias ou sensibilidades (pele, óleos, perfumes…)",
  sintomas_pele: "Sintomas de pele (eczema, psoríase, feridas abertas…)",
  sintomas_musculo_esqueleticos: "Sintomas músculo-esqueléticos (dores crónicas, inflamações…)",
  sintomas_sistema_nervoso: "Sintomas do sistema nervoso (enxaquecas, ansiedade, burnout…)",
  sintomas_digestivos: "Sintomas digestivos (refluxo, cólon irritável…)",
  boca_tratamentos: "Tratamentos dentários ou de boca recentes",
  gravidez_filhos_hormonal: "Gravidez, filhos ou alterações hormonais (menopausa, tiróide…)",
  nascimento_amamentacao: "Parto recente ou a amamentar",
};

const HEALTH_LABELS_EN: Record<HealthKey, string> = {
  medicacao: "Are you taking any medication? (include supplements & contraceptives)",
  cirurgias: "Recent or past surgeries / medical procedures",
  acidentes_fracturas_proteses: "Accidents, fractures or prosthetics",
  doenca_cronica: "Diagnosed chronic illness",
  diabetes: "Diabetes",
  sintomas_cardiacos: "Cardiac symptoms (palpitations, chest pain…)",
  hipertensao_hipotensao: "Hypertension or hypotension",
  varizes_retencao_liquidos: "Varicose veins or fluid retention",
  sintomas_respiratorios: "Respiratory symptoms (asthma, bronchitis…)",
  alergias_sensibilidades: "Allergies or sensitivities (skin, oils, fragrances…)",
  sintomas_pele: "Skin symptoms (eczema, psoriasis, open wounds…)",
  sintomas_musculo_esqueleticos: "Musculoskeletal symptoms (chronic pain, inflammation…)",
  sintomas_sistema_nervoso: "Nervous system symptoms (migraines, anxiety, burnout…)",
  sintomas_digestivos: "Digestive symptoms (reflux, irritable bowel…)",
  boca_tratamentos: "Recent dental or mouth treatments",
  gravidez_filhos_hormonal: "Pregnancy, children or hormonal changes (menopause, thyroid…)",
  nascimento_amamentacao: "Recent birth or breastfeeding",
};

const LIFESTYLE_LABELS_PT: Record<LifestyleKey, string> = {
  ingestao_liquidos: "Ingestão de líquidos diária (água, sumos, chás…)",
  alimentacao_alcool: "Alimentação e consumo de álcool",
  tabaco_drogas: "Tabaco ou substâncias",
  actividade_fisica: "Actividade física (tipo, frequência, intensidade)",
  qualidade_sono: "Qualidade do sono (horas, descanso, sonhos recorrentes…)",
  ciclo_menstrual: "Ciclo menstrual (regularidade, sintomas, data da última menstruação)",
  sexualidade: "Sexualidade (libido, bem-estar íntimo…)",
  funcionamento_intestinal: "Funcionamento intestinal (frequência, consistência, bem-estar digestivo)",
};

const LIFESTYLE_LABELS_EN: Record<LifestyleKey, string> = {
  ingestao_liquidos: "Daily fluid intake (water, juices, teas…)",
  alimentacao_alcool: "Diet and alcohol consumption",
  tabaco_drogas: "Tobacco or substances",
  actividade_fisica: "Physical activity (type, frequency, intensity)",
  qualidade_sono: "Sleep quality (hours, rest, recurring dreams…)",
  ciclo_menstrual: "Menstrual cycle (regularity, symptoms, date of last period)",
  sexualidade: "Sexuality (libido, intimate well-being…)",
  funcionamento_intestinal: "Bowel function (frequency, consistency, digestive well-being)",
};

const HEALTH_KEYS: HealthKey[] = [
  "medicacao",
  "cirurgias",
  "acidentes_fracturas_proteses",
  "doenca_cronica",
  "diabetes",
  "sintomas_cardiacos",
  "hipertensao_hipotensao",
  "varizes_retencao_liquidos",
  "sintomas_respiratorios",
  "alergias_sensibilidades",
  "sintomas_pele",
  "sintomas_musculo_esqueleticos",
  "sintomas_sistema_nervoso",
  "sintomas_digestivos",
  "boca_tratamentos",
  "gravidez_filhos_hormonal",
  "nascimento_amamentacao",
];

const LIFESTYLE_KEYS: LifestyleKey[] = [
  "ingestao_liquidos",
  "alimentacao_alcool",
  "tabaco_drogas",
  "actividade_fisica",
  "qualidade_sono",
  "ciclo_menstrual",
  "sexualidade",
  "funcionamento_intestinal",
];

// ============================================================
// Default draft state factories
// ============================================================

function defaultHealthGeneral(): Record<HealthKey, HealthQuestion> {
  return Object.fromEntries(
    HEALTH_KEYS.map((k) => [k, { has: false, details: "" }])
  ) as Record<HealthKey, HealthQuestion>;
}

function defaultLifestyle(): Record<LifestyleKey, LifestyleQuestion> {
  return Object.fromEntries(
    LIFESTYLE_KEYS.map((k) => [k, { answer: "" }])
  ) as Record<LifestyleKey, LifestyleQuestion>;
}

function defaultDraft(): PrepareFormDraft {
  return {
    client_updates: {
      email: "",
      date_of_birth: "",
      profession: "",
      height_cm: "",
      weight_kg: "",
    },
    anamnesis: {
      health_general: defaultHealthGeneral(),
      lifestyle: defaultLifestyle(),
      body_map_data: [],
      has_pain_trigger: false,
      pain_trigger_task: "",
    },
    intake: {
      form_type: "healing_touch",
      motivation: "",
      main_objective: "",
      health_conditions: "",
      current_treatment: "",
      allergies_sensitivities: "",
      feeling_physically: 5,
      feeling_psychologically: 5,
      feeling_emotionally: 5,
      feeling_energetically: 5,
      meditation_practice: "",
      immersion_motivation: "",
      main_intention: "",
      wishlist: "",
      aroma_preferences: "",
      music_preferences: "",
      beverage_preference: "",
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
    declaration_accepted: false,
  };
}

// ============================================================
// Utility helpers
// ============================================================

function lsKey(token: string) {
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
              {t("Olá", "Hello")}, {clientName}
            </span>
          )}
          <button
            type="button"
            onClick={toggleLang}
            className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded border border-border hover:border-primary"
            aria-label={t("Mudar para inglês", "Switch to Portuguese")}
          >
            {lang === "pt" ? "EN" : "PT"}
          </button>
        </div>
      </div>
    </header>
  );
}

function StepHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h2 className="font-serif text-2xl text-foreground">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

function HealthQuestionRow({
  label,
  has,
  details,
  onToggle,
  onDetails,
  detailsPlaceholder,
}: {
  label: string;
  has: boolean;
  details: string;
  onToggle: (val: boolean) => void;
  onDetails: (val: string) => void;
  detailsPlaceholder: string;
}) {
  return (
    <div className="space-y-2 py-4 border-b border-border last:border-b-0">
      <div className="flex items-start gap-4">
        <Switch
          checked={has}
          onCheckedChange={onToggle}
          aria-label={label}
          className="mt-0.5 shrink-0"
        />
        <span className="text-sm leading-snug text-foreground flex-1">{label}</span>
        <span className={`text-xs font-medium shrink-0 ${has ? "text-primary" : "text-muted-foreground"}`}>
          {has ? "Sim" : "Não"}
        </span>
      </div>
      {has && (
        <div className="pl-14">
          <Textarea
            value={details}
            onChange={(e) => onDetails(e.target.value)}
            placeholder={detailsPlaceholder}
            rows={2}
            className="text-sm resize-none"
          />
        </div>
      )}
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
      title: t("Sessão — Daniela Alves", "Session — Daniela Alves"),
      start: new Date(session.scheduled_at),
      duration: session.duration_minutes,
      location: SESSION_ADDRESS,
      description: t(
        `Sessão com Daniela Alves.\n\nMorada: ${SESSION_ADDRESS}\nEstacionamento: Parque da Aguda\n\nLembre-se: sem perfume, refeição leve 24h antes, hidratação cuidada.`,
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
            {t("Obrigada! Estamos preparados para a sua sessão.", "Thank you! We're ready for your session.")}
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

        {/* Calendar button */}
        <Button
          type="button"
          variant="outline"
          onClick={handleDownloadICS}
          className="w-full gap-2"
        >
          <CalendarPlus className="h-4 w-4" />
          {t("Adicionar ao Calendário", "Add to Calendar")}
        </Button>

        {/* Daniela's quote */}
        <blockquote className="border-l-2 border-primary/40 pl-4 text-left">
          <p className="font-serif text-base italic text-primary/80 leading-relaxed">
            "{DANIELA_QUOTE}"
          </p>
          <footer className="mt-2 font-sans text-xs text-muted-foreground">— Daniela Alves</footer>
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
        <p className="font-sans text-sm text-muted-foreground">A carregar…</p>
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
          {t("Ligação inválida", "Invalid link")}
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
// Practical info step (shared between new + returning)
// ============================================================

function PracticalInfoStep({
  session,
  declaration_accepted,
  onDeclarationChange,
  t,
  lang,
}: {
  session: PrepareApiSession;
  declaration_accepted: boolean;
  onDeclarationChange: (val: boolean) => void;
  t: (pt: string, en: string) => string;
  lang: "pt" | "en";
}) {
  const sessionDateFormatted = formatSessionDate(session.scheduled_at, lang);

  const handleDownloadICS = () => {
    downloadICS({
      title: t("Sessão — Daniela Alves", "Session — Daniela Alves"),
      start: new Date(session.scheduled_at),
      duration: session.duration_minutes,
      location: SESSION_ADDRESS,
      description: t(
        `Sessão com Daniela Alves.\n\nMorada: ${SESSION_ADDRESS}\nEstacionamento: Parque da Aguda\n\nLembre-se: sem perfume, refeição leve 24h antes, hidratação cuidada.`,
        `Session with Daniela Alves.\n\nAddress: ${SESSION_ADDRESS}\nParking: Parque da Aguda\n\nRemember: no perfume, light meals 24h before, stay hydrated.`
      ),
    });
  };

  return (
    <div className="space-y-6">
      <StepHeader
        title={t("Informações Práticas", "Practical Information")}
        subtitle={t("Tudo o que precisa de saber para a sua sessão.", "Everything you need to know for your session.")}
      />

      {/* Session confirmation */}
      <div className="bg-primary/5 border border-primary/15 rounded-2xl p-5 space-y-3">
        <p className="font-sans text-xs font-medium text-primary/70 uppercase tracking-wider mb-1">
          {t("A sua sessão", "Your session")}
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

      {/* Info cards */}
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
            "Entre pelo portão, não toque na campainha. Siga o caminho até à casa de madeira.",
            "Enter through the gate, no need to ring the doorbell. Follow the path to the wooden house."
          )}
        />
        <InfoCard
          icon={<Droplets className="h-4 w-4 text-primary shrink-0 mt-0.5" />}
          title={t("Preparação", "Preparation")}
          body={t(
            "Sem perfume no dia da sessão. Refeição leve nas 24h anteriores. Mantenha-se hidratada e evite estimulantes (café, álcool). Não há chuveiro disponível.",
            "No perfume on the day of the session. Light meals in the 24 hours before. Stay hydrated and avoid stimulants (coffee, alcohol). No shower available."
          )}
        />
      </div>

      {/* Calendar button */}
      <Button
        type="button"
        variant="outline"
        onClick={handleDownloadICS}
        className="w-full gap-2"
      >
        <CalendarPlus className="h-4 w-4" />
        {t("Adicionar ao Calendário", "Add to Calendar")}
      </Button>

      {/* Declaration */}
      <div className="bg-muted/40 rounded-xl p-4 space-y-3">
        <p className="text-sm text-foreground font-sans leading-relaxed">
          {t(
            "Declaro que compreendi as informações práticas relativas à sessão e que as informações fornecidas neste formulário são verdadeiras.",
            "I declare that I have understood the practical information regarding the session and that the information provided in this form is true."
          )}
        </p>
        <div className="flex items-center gap-3">
          <Checkbox
            id="declaration"
            checked={declaration_accepted}
            onCheckedChange={(checked) => onDeclarationChange(checked === true)}
            aria-required="true"
          />
          <Label htmlFor="declaration" className="text-sm cursor-pointer">
            {t("Confirmo e aceito", "I confirm and accept")}
          </Label>
        </div>
      </div>
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

  // Ref so auto-save effect always has up-to-date draft without re-subscribing
  const draftRef = useRef(draft);
  draftRef.current = draft;

  // ============================================================
  // Compute total steps based on context
  // ============================================================

  const computeTotalSteps = useCallback(
    (data: PrepareApiResponse): number => {
      if (data.is_returning) return 2; // check-in + practical
      // new client
      let count = 0;
      if (data.needs_personal_data) count++; // Step 1
      if (data.needs_anamnesis) count += 3; // health + lifestyle + body map
      count++; // session-specific form
      count++; // practical info
      return count;
    },
    []
  );

  // Maps from logical step to a step label; used for progress display
  const getStepLabel = useCallback(
    (stepNum: number, data: PrepareApiResponse): string => {
      if (data.is_returning) {
        const labels = [
          t("Check-in Rápido", "Quick Check-in"),
          t("Informações Práticas", "Practical Info"),
        ];
        return labels[stepNum - 1] ?? String(stepNum);
      }
      const steps: string[] = [];
      if (data.needs_personal_data) steps.push(t("Os seus dados", "Your data"));
      if (data.needs_anamnesis) {
        steps.push(t("Saúde", "Health"));
        steps.push(t("Estilo de Vida", "Lifestyle"));
        steps.push(t("Mapa Corporal", "Body Map"));
      }
      steps.push(t("Sessão", "Session"));
      steps.push(t("Informações Práticas", "Practical Info"));
      return steps[stepNum - 1] ?? String(stepNum);
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
          "Link inválido. Por favor use o link enviado por e-mail.",
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
              "Este link expirou ou não é válido.",
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
            // Seed form_type from api data
            parsed.intake.form_type = data.form_type;
            setDraft(parsed);
          } catch {
            // Silently fall through; use default draft
          }
        } else {
          // Pre-fill known client data
          setDraft((prev) => ({
            ...prev,
            intake: { ...prev.intake, form_type: data.form_type },
            client_updates: {
              email: data.client.email ?? "",
              date_of_birth: data.client.date_of_birth ?? "",
              profession: data.client.profession ?? "",
              height_cm: data.client.height_cm != null ? String(data.client.height_cm) : "",
              weight_kg: data.client.weight_kg != null ? String(data.client.weight_kg) : "",
            },
          }));
        }
      } catch {
        setTokenError(
          t(
            "Ocorreu um erro ao carregar o formulário. Tente novamente.",
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

    if (!draft.declaration_accepted) {
      alert(
        t(
          "Por favor aceite a declaração antes de continuar.",
          "Please accept the declaration before continuing."
        )
      );
      return;
    }

    setSubmitting(true);

    try {
      const payload: Record<string, unknown> = {
        declaration_accepted: draft.declaration_accepted,
      };

      // Only send client_updates if they have meaningful values
      const cu = draft.client_updates;
      const hasUpdates = cu.email || cu.date_of_birth || cu.profession || cu.height_cm || cu.weight_kg;
      if (hasUpdates) {
        payload.client_updates = {
          email: cu.email || null,
          date_of_birth: cu.date_of_birth || null,
          profession: cu.profession || null,
          height_cm: cu.height_cm ? parseFloat(cu.height_cm) : null,
          weight_kg: cu.weight_kg ? parseFloat(cu.weight_kg) : null,
        };
      }

      if (apiData.is_returning) {
        payload.returning_checkin = draft.returning_checkin;
      } else {
        if (apiData.needs_anamnesis) {
          payload.anamnesis = draft.anamnesis;
        }
        payload.intake = draft.intake;
      }

      const res = await fetch(`/api/forms/prepare/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error((errBody as { error?: string }).error ?? `HTTP ${res.status}`);
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

  const updateHealthQuestion = useCallback(
    (key: HealthKey, field: "has" | "details", value: boolean | string) => {
      setDraft((prev) => ({
        ...prev,
        anamnesis: {
          ...prev.anamnesis,
          health_general: {
            ...prev.anamnesis.health_general,
            [key]: { ...prev.anamnesis.health_general[key], [field]: value },
          },
        },
      }));
    },
    []
  );

  const updateLifestyleQuestion = useCallback(
    (key: LifestyleKey, value: string) => {
      setDraft((prev) => ({
        ...prev,
        anamnesis: {
          ...prev.anamnesis,
          lifestyle: {
            ...prev.anamnesis.lifestyle,
            [key]: { answer: value },
          },
        },
      }));
    },
    []
  );

  const updateBodyMap = useCallback((markers: BodyMapMarker[]) => {
    setDraft((prev) => ({
      ...prev,
      anamnesis: { ...prev.anamnesis, body_map_data: markers },
    }));
  }, []);

  const updateAnamnesis = useCallback(
    <K extends keyof Omit<AnamnesisData, "health_general" | "lifestyle" | "body_map_data">>(
      field: K,
      value: AnamnesisData[K]
    ) => {
      setDraft((prev) => ({
        ...prev,
        anamnesis: { ...prev.anamnesis, [field]: value },
      }));
    },
    []
  );

  const updateIntake = useCallback(
    <K extends keyof IntakeData>(field: K, value: IntakeData[K]) => {
      setDraft((prev) => ({
        ...prev,
        intake: { ...prev.intake, [field]: value },
      }));
    },
    []
  );

  const updateCheckin = useCallback(
    <K extends keyof ReturningCheckinData>(field: K, value: ReturningCheckinData[K]) => {
      setDraft((prev) => ({
        ...prev,
        returning_checkin: { ...prev.returning_checkin, [field]: value },
      }));
    },
    []
  );

  // ============================================================
  // Compute logical step order for new clients
  // ============================================================

  /**
   * Returns which "named step" the current numeric step corresponds to.
   * Steps for new clients:
   *   (optional) personalData -> (optional x3) health/lifestyle/bodymap -> sessionForm -> practicalInfo
   */
  function getNewClientStepName(stepNum: number): string {
    if (!apiData) return "";
    const order: string[] = [];
    if (apiData.needs_personal_data) order.push("personalData");
    if (apiData.needs_anamnesis) {
      order.push("health");
      order.push("lifestyle");
      order.push("bodyMap");
    }
    order.push("sessionForm");
    order.push("practicalInfo");
    return order[stepNum - 1] ?? "";
  }

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

  const healthLabels = lang === "pt" ? HEALTH_LABELS_PT : HEALTH_LABELS_EN;
  const lifestyleLabels = lang === "pt" ? LIFESTYLE_LABELS_PT : LIFESTYLE_LABELS_EN;

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

      {/* Progress bar */}
      <div className="max-w-2xl mx-auto px-4 pt-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-foreground">
            {apiData ? getStepLabel(step, apiData) : ""}
          </span>
          <span className="text-xs text-muted-foreground">
            {t(`Passo ${step} de ${totalSteps}`, `Step ${step} of ${totalSteps}`)}
          </span>
        </div>
        <Progress value={(step / totalSteps) * 100} className="h-1.5" />
      </div>

      {/* Form card */}
      <main className="max-w-2xl mx-auto px-4 py-6 pb-16">
        <Card className="shadow-sm border-border/50">
          <CardContent className="pt-6 px-5 sm:px-8">

            {/* ================================================ */}
            {/* RETURNING CLIENT FLOW                            */}
            {/* ================================================ */}

            {apiData.is_returning && (
              <>
                {/* --- Returning Step 1: Quick Check-in --- */}
                {step === 1 && (
                  <div className="space-y-6">
                    <StepHeader
                      title={t("Check-in Rápido", "Quick Check-in")}
                      subtitle={t(
                        `Bem-vinda de volta${apiData.client.first_name ? `, ${apiData.client.first_name}` : ""}. Como tem estado?`,
                        `Welcome back${apiData.client.first_name ? `, ${apiData.client.first_name}` : ""}. How have you been?`
                      )}
                    />

                    {/* Feeling since last session */}
                    <div className="space-y-3">
                      <Label className="font-sans text-sm font-medium">
                        {t(
                          "Como se tem sentido desde a última sessão?",
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
                            onClick={() => updateCheckin("feeling_since_last", value)}
                            className={`rounded-xl border-2 p-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 ${
                              draft.returning_checkin.feeling_since_last === value
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border bg-white/60 text-foreground hover:border-primary/50"
                            }`}
                            aria-pressed={draft.returning_checkin.feeling_since_last === value}
                          >
                            {t(pt, en)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Wellness scales */}
                    <div className="space-y-4">
                      <Label className="font-sans text-sm font-medium">
                        {t("Como se sente hoje? (1 = muito mal, 10 = excelente)", "How are you feeling today? (1 = very poor, 10 = excellent)")}
                      </Label>
                      <ScaleField
                        label={t("Físico", "Physical")}
                        value={draft.returning_checkin.feeling_physically}
                        onChange={(v) => updateCheckin("feeling_physically", v)}
                        lowLabel="1"
                        highLabel="10"
                      />
                      <ScaleField
                        label={t("Psicológico", "Psychological")}
                        value={draft.returning_checkin.feeling_psychologically}
                        onChange={(v) => updateCheckin("feeling_psychologically", v)}
                        lowLabel="1"
                        highLabel="10"
                      />
                      <ScaleField
                        label={t("Emocional", "Emotional")}
                        value={draft.returning_checkin.feeling_emotionally}
                        onChange={(v) => updateCheckin("feeling_emotionally", v)}
                        lowLabel="1"
                        highLabel="10"
                      />
                      <ScaleField
                        label={t("Energético", "Energetic")}
                        value={draft.returning_checkin.feeling_energetically}
                        onChange={(v) => updateCheckin("feeling_energetically", v)}
                        lowLabel="1"
                        highLabel="10"
                      />
                    </div>

                    {/* Health changes */}
                    <div className="space-y-3 py-4 border-t border-border">
                      <div className="flex items-start gap-4">
                        <Switch
                          checked={draft.returning_checkin.health_changes}
                          onCheckedChange={(v) => updateCheckin("health_changes", v)}
                          aria-label={t("Alguma alteração de saúde?", "Any health changes?")}
                          className="mt-0.5 shrink-0"
                        />
                        <span className="text-sm leading-snug text-foreground flex-1">
                          {t(
                            "Alguma alteração de saúde desde a última sessão?",
                            "Any health changes since the last session?"
                          )}
                        </span>
                        <span className={`text-xs font-medium shrink-0 ${draft.returning_checkin.health_changes ? "text-primary" : "text-muted-foreground"}`}>
                          {draft.returning_checkin.health_changes ? "Sim" : "Não"}
                        </span>
                      </div>
                      {draft.returning_checkin.health_changes && (
                        <div className="pl-14">
                          <Textarea
                            value={draft.returning_checkin.health_changes_details}
                            onChange={(e) => updateCheckin("health_changes_details", e.target.value)}
                            placeholder={t(
                              "Descreva as alterações de saúde…",
                              "Describe the health changes…"
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
                          "Continuação do trabalho anterior ou tema novo?",
                          "Continue previous work or explore a new theme?"
                        )}
                      </Label>
                      <div className="grid grid-cols-2 gap-3">
                        {(
                          [
                            { value: "continuation", pt: "Continuação", en: "Continuation" },
                            { value: "new_topic", pt: "Tema Novo", en: "New Theme" },
                          ] as const
                        ).map(({ value, pt, en }) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => updateCheckin("session_focus", value)}
                            className={`rounded-xl border-2 p-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 ${
                              draft.returning_checkin.session_focus === value
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border bg-white/60 text-foreground hover:border-primary/50"
                            }`}
                            aria-pressed={draft.returning_checkin.session_focus === value}
                          >
                            {t(pt, en)}
                          </button>
                        ))}
                      </div>
                      {draft.returning_checkin.session_focus === "new_topic" && (
                        <Textarea
                          value={draft.returning_checkin.new_topic_details}
                          onChange={(e) => updateCheckin("new_topic_details", e.target.value)}
                          placeholder={t(
                            "O que gostaria de trabalhar nesta sessão?",
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
                        {t("Observações adicionais", "Additional observations")}
                      </Label>
                      <Textarea
                        value={draft.returning_checkin.additional_observations}
                        onChange={(e) => updateCheckin("additional_observations", e.target.value)}
                        placeholder={t(
                          "Partilhe tudo o que considere relevante para a sessão…",
                          "Share anything you feel is relevant for the session…"
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
                      nextLabel={step === totalSteps ? t("Enviar", "Submit") : t("Seguinte", "Next")}
                    />
                  </div>
                )}

                {/* --- Returning Step 2: Practical Info --- */}
                {step === 2 && (
                  <div>
                    <PracticalInfoStep
                      session={apiData.session}
                      declaration_accepted={draft.declaration_accepted}
                      onDeclarationChange={(v) =>
                        setDraft((prev) => ({ ...prev, declaration_accepted: v }))
                      }
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
            {/* NEW CLIENT FLOW                                   */}
            {/* ================================================ */}

            {!apiData.is_returning && (
              <>
                {/* ---- Welcome message (all new clients) ---- */}
                {step === 1 && (
                  <div className="text-center mb-8 space-y-3">
                    <Leaf className="mx-auto h-8 w-8 text-primary/60" strokeWidth={1} />
                    <h1 className="font-serif text-3xl text-foreground leading-tight">
                      {t("Bem-vinda", "Welcome")},{" "}
                      <span className="text-primary">{apiData.client.first_name}</span>
                    </h1>
                    <div className="mx-auto h-px w-16 bg-primary/30" />
                    <div className="bg-primary/5 border border-primary/15 rounded-xl p-5 text-left mt-4">
                      <p className="text-sm leading-relaxed text-foreground/80 italic font-serif text-base">
                        {t(
                          "Querida, este formulário permite-nos conhecer melhor as suas necessidades, história de saúde e intenções para a sessão. As informações são confidenciais e utilizadas apenas para oferecer um cuidado mais consciente e personalizado.",
                          "Dear one, this form helps us understand your needs, health history and intentions for the session. All information is confidential and used solely to offer more conscious and personalised care."
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {/* ---- Step: Personal Data ---- */}
                {getNewClientStepName(step) === "personalData" && (
                  <div>
                    <StepHeader
                      title={t("Complete os seus dados", "Complete your details")}
                      subtitle={t(
                        "Por favor complete os campos em falta.",
                        "Please complete the missing fields."
                      )}
                    />

                    {/* Read-only pre-filled info */}
                    <div className="mb-6 rounded-xl bg-muted/30 border border-border p-4 space-y-2">
                      <div>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-0.5">
                          {t("Nome", "Name")}
                        </p>
                        <p className="text-sm text-foreground">{clientFullName}</p>
                      </div>
                      {apiData.client.phone && (
                        <div>
                          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-0.5">
                            {t("Telefone", "Phone")}
                          </p>
                          <p className="text-sm text-foreground">{apiData.client.phone}</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      {/* Email */}
                      {apiData.client.email === null && (
                        <div className="space-y-1.5">
                          <Label htmlFor="email" className="text-sm font-medium">
                            {t("E-mail", "Email")}
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={draft.client_updates.email}
                            onChange={(e) => updateClientUpdates("email", e.target.value)}
                            placeholder="nome@exemplo.com"
                            className="h-11"
                            autoComplete="email"
                          />
                        </div>
                      )}

                      {/* Date of birth */}
                      {apiData.client.date_of_birth === null && (
                        <div className="space-y-1.5">
                          <Label htmlFor="dob" className="text-sm font-medium">
                            {t("Data de nascimento", "Date of birth")}
                          </Label>
                          <Input
                            id="dob"
                            type="date"
                            value={draft.client_updates.date_of_birth}
                            onChange={(e) => updateClientUpdates("date_of_birth", e.target.value)}
                            className="h-11"
                            max={new Date().toISOString().split("T")[0]}
                          />
                        </div>
                      )}

                      {/* Profession */}
                      {apiData.client.profession === null && (
                        <div className="space-y-1.5">
                          <Label htmlFor="profession" className="text-sm font-medium">
                            {t("Profissão", "Profession")}
                          </Label>
                          <Input
                            id="profession"
                            type="text"
                            value={draft.client_updates.profession}
                            onChange={(e) => updateClientUpdates("profession", e.target.value)}
                            placeholder={t("A sua profissão", "Your profession")}
                            className="h-11"
                            autoComplete="organization-title"
                          />
                        </div>
                      )}

                      {/* Height */}
                      {apiData.client.height_cm === null && (
                        <div className="space-y-1.5">
                          <Label htmlFor="height" className="text-sm font-medium">
                            {t("Altura (cm)", "Height (cm)")}
                          </Label>
                          <Input
                            id="height"
                            type="number"
                            inputMode="numeric"
                            value={draft.client_updates.height_cm}
                            onChange={(e) => updateClientUpdates("height_cm", e.target.value)}
                            placeholder="170"
                            className="h-11"
                            min="100"
                            max="250"
                          />
                        </div>
                      )}

                      {/* Weight */}
                      {apiData.client.weight_kg === null && (
                        <div className="space-y-1.5">
                          <Label htmlFor="weight" className="text-sm font-medium">
                            {t("Peso (kg)", "Weight (kg)")}
                          </Label>
                          <Input
                            id="weight"
                            type="number"
                            inputMode="numeric"
                            value={draft.client_updates.weight_kg}
                            onChange={(e) => updateClientUpdates("weight_kg", e.target.value)}
                            placeholder="65"
                            className="h-11"
                            min="30"
                            max="300"
                          />
                        </div>
                      )}
                    </div>

                    <NavButtons
                      step={step}
                      totalSteps={totalSteps}
                      onBack={goBack}
                      onNext={handleNextOrSubmit}
                      isSubmitting={submitting}
                      backLabel={t("Anterior", "Previous")}
                      nextLabel={step === totalSteps ? t("Enviar", "Submit") : t("Seguinte", "Next")}
                    />
                  </div>
                )}

                {/* ---- Step: Health ---- */}
                {getNewClientStepName(step) === "health" && (
                  <div>
                    <StepHeader
                      title={t("Sobre a sua Saúde", "About Your Health")}
                      subtitle={t(
                        "Para cada item, indique se se aplica e partilhe detalhes se desejar.",
                        "For each item, indicate whether it applies and share details if you wish."
                      )}
                    />

                    <div>
                      {HEALTH_KEYS.map((key) => (
                        <HealthQuestionRow
                          key={key}
                          label={healthLabels[key]}
                          has={draft.anamnesis.health_general[key].has}
                          details={draft.anamnesis.health_general[key].details}
                          onToggle={(v) => updateHealthQuestion(key, "has", v)}
                          onDetails={(v) => updateHealthQuestion(key, "details", v)}
                          detailsPlaceholder={t("Partilhe mais detalhes…", "Share more details…")}
                        />
                      ))}
                    </div>

                    <NavButtons
                      step={step}
                      totalSteps={totalSteps}
                      onBack={goBack}
                      onNext={handleNextOrSubmit}
                      isSubmitting={submitting}
                      backLabel={t("Anterior", "Previous")}
                      nextLabel={step === totalSteps ? t("Enviar", "Submit") : t("Seguinte", "Next")}
                    />
                  </div>
                )}

                {/* ---- Step: Lifestyle ---- */}
                {getNewClientStepName(step) === "lifestyle" && (
                  <div>
                    <StepHeader
                      title={t("Estilo de Vida", "Lifestyle")}
                      subtitle={t(
                        "Partilhe o que considerar relevante.",
                        "Share whatever you find relevant."
                      )}
                    />

                    <div className="space-y-5">
                      {LIFESTYLE_KEYS.map((key) => (
                        <div key={key} className="space-y-1.5">
                          <Label className="font-sans text-sm font-medium">
                            {lifestyleLabels[key]}
                          </Label>
                          <Textarea
                            value={draft.anamnesis.lifestyle[key].answer}
                            onChange={(e) => updateLifestyleQuestion(key, e.target.value)}
                            placeholder={t("A sua resposta…", "Your answer…")}
                            rows={2}
                            className="text-sm resize-none"
                          />
                        </div>
                      ))}
                    </div>

                    <NavButtons
                      step={step}
                      totalSteps={totalSteps}
                      onBack={goBack}
                      onNext={handleNextOrSubmit}
                      isSubmitting={submitting}
                      backLabel={t("Anterior", "Previous")}
                      nextLabel={step === totalSteps ? t("Enviar", "Submit") : t("Seguinte", "Next")}
                    />
                  </div>
                )}

                {/* ---- Step: Body Map ---- */}
                {getNewClientStepName(step) === "bodyMap" && (
                  <div>
                    <StepHeader
                      title={t("Mapa Corporal", "Body Map")}
                      subtitle={t(
                        "Toque nas áreas do corpo onde sente tensão, dor ou desconforto.",
                        "Tap on the body areas where you feel tension, pain or discomfort."
                      )}
                    />

                    <div className="mb-6">
                      <BodyMap
                        value={draft.anamnesis.body_map_data}
                        onChange={updateBodyMap}
                      />
                    </div>

                    {/* Pain trigger */}
                    <div className="space-y-3 border-t border-border pt-5">
                      <div className="flex items-start gap-4">
                        <Switch
                          checked={draft.anamnesis.has_pain_trigger}
                          onCheckedChange={(v) => updateAnamnesis("has_pain_trigger", v)}
                          aria-label={t(
                            "Existe algo que desencadeie ou agrave a dor?",
                            "Is there anything that triggers or worsens the pain?"
                          )}
                          className="mt-0.5 shrink-0"
                        />
                        <span className="text-sm leading-snug text-foreground flex-1">
                          {t(
                            "Existe algo que desencadeie ou agrave a dor / desconforto?",
                            "Is there anything that triggers or worsens the pain / discomfort?"
                          )}
                        </span>
                        <span className={`text-xs font-medium shrink-0 ${draft.anamnesis.has_pain_trigger ? "text-primary" : "text-muted-foreground"}`}>
                          {draft.anamnesis.has_pain_trigger ? "Sim" : "Não"}
                        </span>
                      </div>
                      {draft.anamnesis.has_pain_trigger && (
                        <div className="pl-14">
                          <Textarea
                            value={draft.anamnesis.pain_trigger_task}
                            onChange={(e) => updateAnamnesis("pain_trigger_task", e.target.value)}
                            placeholder={t("Descreva o que desencadeia a dor…", "Describe what triggers the pain…")}
                            rows={2}
                            className="text-sm resize-none"
                          />
                        </div>
                      )}
                    </div>

                    <NavButtons
                      step={step}
                      totalSteps={totalSteps}
                      onBack={goBack}
                      onNext={handleNextOrSubmit}
                      isSubmitting={submitting}
                      backLabel={t("Anterior", "Previous")}
                      nextLabel={step === totalSteps ? t("Enviar", "Submit") : t("Seguinte", "Next")}
                    />
                  </div>
                )}

                {/* ---- Step: Session Form ---- */}
                {getNewClientStepName(step) === "sessionForm" && (
                  <div className="space-y-5">
                    {apiData.form_type === "healing_touch" && (
                      <>
                        <StepHeader
                          title={t("Antes da sua Sessão", "Before Your Session")}
                          subtitle={t(
                            "Ajude-nos a personalizar o melhor cuidado para si.",
                            "Help us personalise the best care for you."
                          )}
                        />

                        <div className="space-y-1.5">
                          <Label className="font-sans text-sm font-medium">
                            {t("O que a motiva a vir hoje?", "What brings you here today?")}
                            <span className="ml-1 text-primary">*</span>
                          </Label>
                          <Textarea
                            value={draft.intake.motivation}
                            onChange={(e) => updateIntake("motivation", e.target.value)}
                            placeholder={t("Partilhe a sua motivação…", "Share your motivation…")}
                            rows={3}
                            className="text-sm resize-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="font-sans text-sm font-medium">
                            {t("Principal objectivo para esta sessão", "Main objective for this session")}
                            <span className="ml-1 text-primary">*</span>
                          </Label>
                          <Textarea
                            value={draft.intake.main_objective}
                            onChange={(e) => updateIntake("main_objective", e.target.value)}
                            placeholder={t("O que pretende alcançar?", "What do you want to achieve?")}
                            rows={3}
                            className="text-sm resize-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="font-sans text-sm font-medium">
                            {t("Condições de saúde relevantes", "Relevant health conditions")}
                          </Label>
                          <Textarea
                            value={draft.intake.health_conditions}
                            onChange={(e) => updateIntake("health_conditions", e.target.value)}
                            placeholder={t("Alergias, lesões, medicação actual…", "Allergies, injuries, current medication…")}
                            rows={2}
                            className="text-sm resize-none"
                          />
                        </div>

                        {/* Wellness scales */}
                        <div className="space-y-4 border-t border-border pt-5">
                          <Label className="font-sans text-sm font-medium block">
                            {t("Como se sente hoje? (1 = muito mal, 10 = excelente)", "How are you feeling today? (1 = very poor, 10 = excellent)")}
                          </Label>
                          <ScaleField
                            label={t("Físico", "Physical")}
                            value={draft.intake.feeling_physically}
                            onChange={(v) => updateIntake("feeling_physically", v)}
                            lowLabel="1"
                            highLabel="10"
                          />
                          <ScaleField
                            label={t("Psicológico", "Psychological")}
                            value={draft.intake.feeling_psychologically}
                            onChange={(v) => updateIntake("feeling_psychologically", v)}
                            lowLabel="1"
                            highLabel="10"
                          />
                          <ScaleField
                            label={t("Emocional", "Emotional")}
                            value={draft.intake.feeling_emotionally}
                            onChange={(v) => updateIntake("feeling_emotionally", v)}
                            lowLabel="1"
                            highLabel="10"
                          />
                          <ScaleField
                            label={t("Energético", "Energetic")}
                            value={draft.intake.feeling_energetically}
                            onChange={(v) => updateIntake("feeling_energetically", v)}
                            lowLabel="1"
                            highLabel="10"
                          />
                        </div>
                      </>
                    )}

                    {apiData.form_type === "pura_radiancia" && (
                      <>
                        <StepHeader
                          title={t("Antes da sua Imersão", "Before Your Immersion")}
                          subtitle={t(
                            "Ajude-nos a criar uma experiência completamente personalizada.",
                            "Help us create a completely personalised experience."
                          )}
                        />

                        <div className="space-y-1.5">
                          <Label className="font-sans text-sm font-medium">
                            {t("Qual a sua motivação para esta imersão?", "What is your motivation for this immersion?")}
                            <span className="ml-1 text-primary">*</span>
                          </Label>
                          <Textarea
                            value={draft.intake.immersion_motivation}
                            onChange={(e) => updateIntake("immersion_motivation", e.target.value)}
                            placeholder={t("Partilhe a sua motivação…", "Share your motivation…")}
                            rows={3}
                            className="text-sm resize-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="font-sans text-sm font-medium">
                            {t("Intenção principal para a imersão", "Main intention for the immersion")}
                            <span className="ml-1 text-primary">*</span>
                          </Label>
                          <Textarea
                            value={draft.intake.main_intention}
                            onChange={(e) => updateIntake("main_intention", e.target.value)}
                            placeholder={t("A sua intenção…", "Your intention…")}
                            rows={3}
                            className="text-sm resize-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="font-sans text-sm font-medium">
                            {t("Prática de meditação / mindfulness", "Meditation / mindfulness practice")}
                          </Label>
                          <Textarea
                            value={draft.intake.meditation_practice}
                            onChange={(e) => updateIntake("meditation_practice", e.target.value)}
                            placeholder={t("Tipo e frequência da prática…", "Type and frequency of practice…")}
                            rows={2}
                            className="text-sm resize-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="font-sans text-sm font-medium">
                            {t("Wishlist — o que gostaria de vivenciar?", "Wishlist — what would you like to experience?")}
                          </Label>
                          <Textarea
                            value={draft.intake.wishlist}
                            onChange={(e) => updateIntake("wishlist", e.target.value)}
                            placeholder={t("Sensações, experiências, intenções…", "Sensations, experiences, intentions…")}
                            rows={2}
                            className="text-sm resize-none"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border pt-4">
                          <div className="space-y-1.5">
                            <Label className="font-sans text-sm font-medium">
                              {t("Preferências de aroma", "Aroma preferences")}
                            </Label>
                            <Textarea
                              value={draft.intake.aroma_preferences}
                              onChange={(e) => updateIntake("aroma_preferences", e.target.value)}
                              placeholder={t("Flores, madeiras, cítricos…", "Floral, woody, citrus…")}
                              rows={2}
                              className="text-sm resize-none"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="font-sans text-sm font-medium">
                              {t("Preferências de música", "Music preferences")}
                            </Label>
                            <Textarea
                              value={draft.intake.music_preferences}
                              onChange={(e) => updateIntake("music_preferences", e.target.value)}
                              placeholder={t("Sons da natureza, canto tibetano…", "Nature sounds, tibetan singing bowls…")}
                              rows={2}
                              className="text-sm resize-none"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="font-sans text-sm font-medium">
                              {t("Preferência de bebida", "Beverage preference")}
                            </Label>
                            <Textarea
                              value={draft.intake.beverage_preference}
                              onChange={(e) => updateIntake("beverage_preference", e.target.value)}
                              placeholder={t("Chá de ervas, especiarias…", "Herbal tea, spiced tea…")}
                              rows={2}
                              className="text-sm resize-none"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="font-sans text-sm font-medium">
                              {t("Preferências de cor", "Colour preferences")}
                            </Label>
                            <Textarea
                              value={draft.intake.color_preferences}
                              onChange={(e) => updateIntake("color_preferences", e.target.value)}
                              placeholder={t("Cores que a ressoam…", "Colours that resonate with you…")}
                              rows={2}
                              className="text-sm resize-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5 border-t border-border pt-4">
                          <Label className="font-sans text-sm font-medium">
                            {t("Condições de saúde relevantes", "Relevant health conditions")}
                          </Label>
                          <Textarea
                            value={draft.intake.health_conditions}
                            onChange={(e) => updateIntake("health_conditions", e.target.value)}
                            placeholder={t("Alergias, lesões, medicação actual…", "Allergies, injuries, current medication…")}
                            rows={2}
                            className="text-sm resize-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="font-sans text-sm font-medium">
                            {t("Observações adicionais", "Additional observations")}
                          </Label>
                          <Textarea
                            value={draft.intake.additional_observations}
                            onChange={(e) => updateIntake("additional_observations", e.target.value)}
                            placeholder={t("Tudo o que considere relevante…", "Anything else you feel is relevant…")}
                            rows={2}
                            className="text-sm resize-none"
                          />
                        </div>
                      </>
                    )}

                    <NavButtons
                      step={step}
                      totalSteps={totalSteps}
                      onBack={goBack}
                      onNext={handleNextOrSubmit}
                      isSubmitting={submitting}
                      backLabel={t("Anterior", "Previous")}
                      nextLabel={step === totalSteps ? t("Enviar", "Submit") : t("Seguinte", "Next")}
                    />
                  </div>
                )}

                {/* ---- Step: Practical Info ---- */}
                {getNewClientStepName(step) === "practicalInfo" && (
                  <div>
                    <PracticalInfoStep
                      session={apiData.session}
                      declaration_accepted={draft.declaration_accepted}
                      onDeclarationChange={(v) =>
                        setDraft((prev) => ({ ...prev, declaration_accepted: v }))
                      }
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

          </CardContent>
        </Card>
      </main>
    </div>
  );
}
