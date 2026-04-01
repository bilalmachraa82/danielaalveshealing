/**
 * AnamnesisPage — Public multi-step health intake form
 *
 * Route: /anamnese/:token
 * No authentication required. Token identifies the client + form record.
 *
 * Usage: accessed via link sent to client by therapist
 */

import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  anamnesisFormSchema,
  anamnesisDefaultValues,
  type AnamnesisFormInput,
} from "@/lib/schemas/anamnesis.schema";
import { useLanguage } from "@/contexts/LanguageContext";
import { BodyMap } from "@/components/admin/sessions/BodyMap";
import type { BodyMapMarker } from "@/lib/types/database.types";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

import { ChevronLeft, ChevronRight, Leaf, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

// ============================================================
// Types for API contract
// ============================================================

interface FormApiResponse {
  client_name?: string;
  client_email?: string;
  existing_data?: Partial<AnamnesisFormInput>;
}

// ============================================================
// Constants
// ============================================================

const TOTAL_STEPS = 6;
const LS_KEY = (token: string) => `anamnesis_draft_${token}`;

// ============================================================
// Health question label maps (PT / EN)
// ============================================================

type HealthKey = keyof AnamnesisFormInput["health_general"];
type LifestyleKey = keyof AnamnesisFormInput["lifestyle"];

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
  sintomas_musculo_esqueleticos:
    "Sintomas músculo-esqueléticos (dores crónicas, inflamações…)",
  sintomas_sistema_nervoso:
    "Sintomas do sistema nervoso (enxaquecas, ansiedade, burnout…)",
  sintomas_digestivos: "Sintomas digestivos (refluxo, cólon irritável…)",
  boca_tratamentos: "Tratamentos dentários ou de boca recentes",
  gravidez_filhos_hormonal:
    "Gravidez, filhos ou alterações hormonais (menopausa, tiróide…)",
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
  sintomas_musculo_esqueleticos:
    "Musculoskeletal symptoms (chronic pain, inflammation…)",
  sintomas_sistema_nervoso:
    "Nervous system symptoms (migraines, anxiety, burnout…)",
  sintomas_digestivos: "Digestive symptoms (reflux, irritable bowel…)",
  boca_tratamentos: "Recent dental or mouth treatments",
  gravidez_filhos_hormonal:
    "Pregnancy, children or hormonal changes (menopause, thyroid…)",
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
  ciclo_menstrual:
    "Menstrual cycle (regularity, symptoms, date of last period)",
  sexualidade: "Sexuality (libido, intimate well-being…)",
  funcionamento_intestinal:
    "Bowel function (frequency, consistency, digestive well-being)",
};

// ============================================================
// Step header component
// ============================================================

function StepHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-6">
      <h2 className="font-serif text-2xl text-foreground">{title}</h2>
      {subtitle && (
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
}

// ============================================================
// Health question row
// ============================================================

interface HealthQuestionRowProps {
  label: string;
  fieldPath: HealthKey;
  has: boolean;
  details: string;
  onToggle: (val: boolean) => void;
  onDetails: (val: string) => void;
  detailsPlaceholder: string;
}

function HealthQuestionRow({
  label,
  has,
  details,
  onToggle,
  onDetails,
  detailsPlaceholder,
}: HealthQuestionRowProps) {
  return (
    <div className="space-y-2 py-4 border-b border-border last:border-b-0">
      <div className="flex items-start gap-4">
        <Switch
          checked={has}
          onCheckedChange={onToggle}
          aria-label={label}
          className="mt-0.5 shrink-0"
        />
        <span className="text-sm leading-snug text-foreground flex-1">
          {label}
        </span>
        <span
          className={`text-xs font-medium shrink-0 ${
            has ? "text-primary" : "text-muted-foreground"
          }`}
        >
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

// ============================================================
// Navigation buttons
// ============================================================

interface NavButtonsProps {
  step: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  isSubmitting?: boolean;
  nextLabel?: string;
  backLabel?: string;
}

function NavButtons({
  step,
  totalSteps,
  onBack,
  onNext,
  isSubmitting = false,
  nextLabel,
  backLabel,
}: NavButtonsProps) {
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

function SuccessScreen({ t }: { t: (pt: string, en: string) => string }) {
  return (
    <div className="min-h-screen bg-mist flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6 py-16">
        <div className="flex justify-center">
          <CheckCircle2 className="h-16 w-16 text-primary" strokeWidth={1.5} />
        </div>
        <h1 className="font-serif text-3xl text-foreground">
          {t("Obrigada", "Thank you")}
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          {t(
            "A sua ficha de anamnese foi recebida com sucesso. A Daniela irá analisá-la antes da sua sessão para que possamos oferecer-lhe o melhor cuidado possível.",
            "Your anamnesis form has been received successfully. Daniela will review it before your session to provide you with the best care possible."
          )}
        </p>
        <Leaf className="mx-auto h-8 w-8 text-primary/40" strokeWidth={1} />
      </div>
    </div>
  );
}

// ============================================================
// Error/expired screen
// ============================================================

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
// Main page
// ============================================================

export default function AnamnesisPage() {
  const { token } = useParams<{ token: string }>();
  const { t, lang, toggleLang } = useLanguage();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [clientName, setClientName] = useState("");

  const form = useForm<AnamnesisFormInput>({
    resolver: zodResolver(anamnesisFormSchema),
    defaultValues: anamnesisDefaultValues,
    mode: "onChange",
  });

  const { control, watch, setValue, getValues, trigger } = form;

  // ----------------------------------------------------------
  // Fetch form data via token
  // ----------------------------------------------------------

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

    const fetchForm = async () => {
      try {
        const response = await fetch(`/api/forms/anamnesis/${token}`);
        if (response.status === 404 || response.status === 410) {
          setTokenError(
            t(
              "Este link expirou ou não é válido.",
              "This link has expired or is not valid."
            )
          );
          setLoading(false);
          return;
        }
        if (!response.ok) {
          throw new Error("Network error");
        }
        const data: FormApiResponse = await response.json();

        if (data.client_name) setClientName(data.client_name);

        // Restore from localStorage first (user's in-progress draft)
        const savedDraft = localStorage.getItem(LS_KEY(token));
        if (savedDraft) {
          try {
            const parsed: AnamnesisFormInput = JSON.parse(savedDraft);
            form.reset(parsed);
          } catch {
            // Draft parse failed — fall through to server data
          }
        } else if (data.existing_data) {
          form.reset({
            ...anamnesisDefaultValues,
            ...data.existing_data,
            first_name: data.client_name?.split(" ")[0] ?? "",
            email: data.client_email ?? "",
          });
        }

        // Pre-fill read-only personal info
        if (data.client_name) {
          const [first, ...rest] = data.client_name.split(" ");
          setValue("first_name", first ?? "");
          setValue("last_name", rest.join(" ") ?? "");
        }
        if (data.client_email) setValue("email", data.client_email);
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

    fetchForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // ----------------------------------------------------------
  // Auto-save draft to localStorage on every change
  // ----------------------------------------------------------

  useEffect(() => {
    if (!token || loading) return;
    const sub = form.watch((values) => {
      localStorage.setItem(LS_KEY(token), JSON.stringify(values));
    });
    return () => sub.unsubscribe();
  }, [form, token, loading]);

  // ----------------------------------------------------------
  // Navigation
  // ----------------------------------------------------------

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const goBack = useCallback(() => {
    setStep((s) => Math.max(1, s - 1));
    scrollTop();
  }, []);

  const goNext = useCallback(async () => {
    // Validate fields relevant to current step
    const fieldsToValidate: (keyof AnamnesisFormInput)[] = (() => {
      switch (step) {
        case 1:
          return [];
        case 2:
          return ["health_general"];
        case 3:
          return ["lifestyle"];
        case 4:
          return ["body_map_data", "has_pain_trigger"];
        case 5:
          return ["previous_massage_experience", "session_objectives"];
        case 6:
          return ["consent_health_data", "declaration_accepted"];
        default:
          return [];
      }
    })();

    const valid = fieldsToValidate.length
      ? await trigger(fieldsToValidate)
      : true;

    if (!valid) return;

    if (step === TOTAL_STEPS) {
      await handleSubmit();
      return;
    }
    setStep((s) => Math.min(TOTAL_STEPS, s + 1));
    scrollTop();
  }, [step, trigger]);

  // ----------------------------------------------------------
  // Submit
  // ----------------------------------------------------------

  const handleSubmit = useCallback(async () => {
    const valid = await trigger();
    if (!valid || !token) return;

    setSubmitting(true);
    try {
      const payload = getValues();
      const response = await fetch(`/api/forms/anamnesis/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(
          (err as { message?: string }).message ?? "Submission failed"
        );
      }

      // Clear draft after successful submission
      localStorage.removeItem(LS_KEY(token));
      setSubmitted(true);
    } catch (err: unknown) {
      // Surface error without crashing
      alert(
        t(
          `Erro ao enviar. Por favor tente novamente.\n${err instanceof Error ? err.message : ""}`,
          `Submission error. Please try again.\n${err instanceof Error ? err.message : ""}`
        )
      );
    } finally {
      setSubmitting(false);
    }
  }, [token, getValues, trigger, t]);

  // ============================================================
  // Loading state
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-mist flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  if (tokenError) {
    return <ErrorScreen message={tokenError} t={t} />;
  }

  if (submitted) {
    return <SuccessScreen t={t} />;
  }

  // ============================================================
  // Helpers to bind health / lifestyle fields cleanly
  // ============================================================

  const healthKeys = Object.keys(
    anamnesisDefaultValues.health_general
  ) as HealthKey[];

  const lifestyleKeys = Object.keys(
    anamnesisDefaultValues.lifestyle
  ) as LifestyleKey[];

  const healthLabels = lang === "pt" ? HEALTH_LABELS_PT : HEALTH_LABELS_EN;
  const lifestyleLabels =
    lang === "pt" ? LIFESTYLE_LABELS_PT : LIFESTYLE_LABELS_EN;

  // ============================================================
  // Render
  // ============================================================

  return (
    <div className="min-h-screen bg-mist">
      {/* Header bar */}
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-primary" strokeWidth={1.5} />
            <span className="font-serif text-lg text-foreground">
              Daniela Alves
            </span>
          </div>
          {/* Language toggle */}
          <button
            type="button"
            onClick={toggleLang}
            className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded border border-border hover:border-primary"
            aria-label={t("Mudar para inglês", "Switch to Portuguese")}
          >
            {lang === "pt" ? "EN" : "PT"}
          </button>
        </div>
      </header>

      {/* Progress bar */}
      <div className="max-w-2xl mx-auto px-4 pt-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-foreground">
            {t(`Passo ${step} de ${TOTAL_STEPS}`, `Step ${step} of ${TOTAL_STEPS}`)}
          </span>
          <span className="text-xs text-muted-foreground">
            {Math.round((step / TOTAL_STEPS) * 100)}%
          </span>
        </div>
        <Progress
          value={(step / TOTAL_STEPS) * 100}
          className="h-1.5"
        />
      </div>

      {/* Form card */}
      <main className="max-w-2xl mx-auto px-4 py-6 pb-16">
        <Card className="shadow-sm border-border/50">
          <CardContent className="pt-6 px-5 sm:px-8">

            {/* -------------------------------------------------- */}
            {/* Step 1 — Welcome + personal info                    */}
            {/* -------------------------------------------------- */}
            {step === 1 && (
              <div>
                <div className="text-center mb-8 space-y-3">
                  <Leaf className="mx-auto h-8 w-8 text-primary/60" strokeWidth={1} />
                  <h1 className="font-serif text-3xl text-foreground leading-tight">
                    {t("Ficha de Anamnese", "Anamnesis Form")}
                  </h1>
                  {clientName && (
                    <p className="text-muted-foreground text-sm">
                      {t(`Olá, ${clientName}`, `Hello, ${clientName}`)}
                    </p>
                  )}
                </div>

                <div className="bg-primary/5 border border-primary/15 rounded-xl p-5 mb-8">
                  <p className="text-sm leading-relaxed text-foreground/80 italic font-serif text-base">
                    {t(
                      "Querido Ser, esta ficha permite-nos conhecer melhor as suas necessidades, história de saúde e intenções para a sessão. As informações partilhadas são confidenciais e utilizadas apenas para oferecer um cuidado mais consciente e personalizado.",
                      "Dear Being, this form helps us understand your needs, health history and intentions for the session. All information shared is confidential and used solely to offer more conscious and personalised care."
                    )}
                  </p>
                </div>

                <StepHeader
                  title={t("Informação Pessoal", "Personal Information")}
                  subtitle={t(
                    "Os seus dados pessoais estão pré-preenchidos.",
                    "Your personal details are pre-filled."
                  )}
                />

                <div className="space-y-4">
                  <Controller
                    control={control}
                    name="first_name"
                    render={({ field }) => (
                      <div className="space-y-1.5">
                        <Label className="text-sm text-muted-foreground">
                          {t("Primeiro nome", "First name")}
                        </Label>
                        <input
                          {...field}
                          readOnly
                          className="w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-foreground cursor-not-allowed"
                          aria-readonly="true"
                        />
                      </div>
                    )}
                  />
                  <Controller
                    control={control}
                    name="last_name"
                    render={({ field }) => (
                      <div className="space-y-1.5">
                        <Label className="text-sm text-muted-foreground">
                          {t("Apelido", "Last name")}
                        </Label>
                        <input
                          {...field}
                          readOnly
                          className="w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-foreground cursor-not-allowed"
                          aria-readonly="true"
                        />
                      </div>
                    )}
                  />
                  <Controller
                    control={control}
                    name="email"
                    render={({ field }) => (
                      <div className="space-y-1.5">
                        <Label className="text-sm text-muted-foreground">
                          {t("E-mail", "Email")}
                        </Label>
                        <input
                          {...field}
                          readOnly
                          className="w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-foreground cursor-not-allowed"
                          aria-readonly="true"
                        />
                      </div>
                    )}
                  />
                </div>
              </div>
            )}

            {/* -------------------------------------------------- */}
            {/* Step 2 — Health general                             */}
            {/* -------------------------------------------------- */}
            {step === 2 && (
              <div>
                <StepHeader
                  title={t("Saúde Geral", "General Health")}
                  subtitle={t(
                    "Indique se alguma das seguintes situações se aplica a si. Em caso afirmativo, partilhe detalhes que considere relevantes.",
                    "Indicate whether any of the following situations apply to you. If so, share details you consider relevant."
                  )}
                />
                <div>
                  {healthKeys.map((key) => {
                    const has = watch(`health_general.${key}.has`);
                    const details = watch(`health_general.${key}.details`);
                    return (
                      <HealthQuestionRow
                        key={key}
                        fieldPath={key}
                        label={healthLabels[key]}
                        has={has}
                        details={details}
                        onToggle={(val) =>
                          setValue(`health_general.${key}.has`, val, {
                            shouldDirty: true,
                          })
                        }
                        onDetails={(val) =>
                          setValue(`health_general.${key}.details`, val, {
                            shouldDirty: true,
                          })
                        }
                        detailsPlaceholder={t(
                          "Partilhe mais detalhes…",
                          "Share more details…"
                        )}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* -------------------------------------------------- */}
            {/* Step 3 — Lifestyle                                  */}
            {/* -------------------------------------------------- */}
            {step === 3 && (
              <div>
                <StepHeader
                  title={t("Estilo de Vida", "Lifestyle")}
                  subtitle={t(
                    "Partilhe como é o seu quotidiano nas seguintes áreas. Responda com tanta ou tão pouca profundidade quanto sentir confortável.",
                    "Share how your daily life is in the following areas. Answer with as much or as little depth as you feel comfortable with."
                  )}
                />
                <div className="space-y-5">
                  {lifestyleKeys.map((key) => {
                    const answer = watch(`lifestyle.${key}.answer`);
                    return (
                      <div key={key} className="space-y-1.5">
                        <Label className="text-sm font-medium leading-snug">
                          {lifestyleLabels[key]}
                        </Label>
                        <Textarea
                          value={answer}
                          onChange={(e) =>
                            setValue(`lifestyle.${key}.answer`, e.target.value, {
                              shouldDirty: true,
                            })
                          }
                          placeholder={t(
                            "A sua resposta…",
                            "Your answer…"
                          )}
                          rows={3}
                          className="text-sm resize-none"
                          aria-label={lifestyleLabels[key]}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* -------------------------------------------------- */}
            {/* Step 4 — Body map + pain trigger                    */}
            {/* -------------------------------------------------- */}
            {step === 4 && (
              <div>
                <StepHeader
                  title={t("Mapa Corporal", "Body Map")}
                  subtitle={t(
                    "Clique nas zonas do corpo onde sente dor, tensão ou desconforto. Seleccione a intensidade antes de marcar cada zona.",
                    "Click the body areas where you feel pain, tension or discomfort. Select the intensity before marking each area."
                  )}
                />

                <Controller
                  control={control}
                  name="body_map_data"
                  render={({ field }) => (
                    <BodyMap
                      value={field.value as BodyMapMarker[]}
                      onChange={(markers) =>
                        setValue("body_map_data", markers, { shouldDirty: true })
                      }
                    />
                  )}
                />

                <Separator className="my-6" />

                <div className="space-y-4">
                  <h3 className="font-medium text-sm">
                    {t(
                      "Existe alguma actividade ou posição que desencadeie dor?",
                      "Is there any activity or position that triggers pain?"
                    )}
                  </h3>

                  <div className="flex items-center gap-3">
                    <Controller
                      control={control}
                      name="has_pain_trigger"
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          aria-label={t("Tem gatilho de dor", "Has pain trigger")}
                        />
                      )}
                    />
                    <span className="text-sm text-muted-foreground">
                      {watch("has_pain_trigger")
                        ? t("Sim", "Yes")
                        : t("Não", "No")}
                    </span>
                  </div>

                  {watch("has_pain_trigger") && (
                    <Controller
                      control={control}
                      name="pain_trigger_task"
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          placeholder={t(
                            "Descreva a actividade ou posição que desencadeia a dor…",
                            "Describe the activity or position that triggers the pain…"
                          )}
                          rows={3}
                          className="text-sm resize-none"
                        />
                      )}
                    />
                  )}
                </div>
              </div>
            )}

            {/* -------------------------------------------------- */}
            {/* Step 5 — Session goals + massage experience         */}
            {/* -------------------------------------------------- */}
            {step === 5 && (
              <div>
                <StepHeader
                  title={t("Intenções da Sessão", "Session Intentions")}
                  subtitle={t(
                    "Ajude-nos a preparar a sessão de acordo com as suas necessidades.",
                    "Help us prepare the session according to your needs."
                  )}
                />

                <div className="space-y-6">
                  {/* Previous massage */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">
                      {t(
                        "Já recebeu uma massagem ou tratamento corporal anteriormente?",
                        "Have you previously received a massage or body treatment?"
                      )}
                    </Label>
                    <div className="flex items-center gap-3">
                      <Controller
                        control={control}
                        name="previous_massage_experience"
                        render={({ field }) => (
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            aria-label={t(
                              "Experiência prévia de massagem",
                              "Previous massage experience"
                            )}
                          />
                        )}
                      />
                      <span className="text-sm text-muted-foreground">
                        {watch("previous_massage_experience")
                          ? t("Sim", "Yes")
                          : t("Não / Primeira vez", "No / First time")}
                      </span>
                    </div>

                    {watch("previous_massage_experience") && (
                      <Controller
                        control={control}
                        name="previous_massage_details"
                        render={({ field }) => (
                          <Textarea
                            {...field}
                            placeholder={t(
                              "Que tipo de massagem? Como foi a experiência?",
                              "What type of massage? How was the experience?"
                            )}
                            rows={3}
                            className="text-sm resize-none"
                          />
                        )}
                      />
                    )}
                  </div>

                  <Separator />

                  {/* Session objectives */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      {t(
                        "O que pretende alcançar ou experienciar nesta sessão?",
                        "What do you wish to achieve or experience in this session?"
                      )}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {t(
                        "(Ex: relaxamento, alívio de tensão, equilíbrio emocional, descanso profundo…)",
                        "(E.g. relaxation, tension relief, emotional balance, deep rest…)"
                      )}
                    </p>
                    <Controller
                      control={control}
                      name="session_objectives"
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          placeholder={t(
                            "Partilhe a sua intenção para esta sessão…",
                            "Share your intention for this session…"
                          )}
                          rows={4}
                          className="text-sm resize-none"
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* -------------------------------------------------- */}
            {/* Step 6 — Declaration                               */}
            {/* -------------------------------------------------- */}
            {step === 6 && (
              <div>
                <StepHeader
                  title={t("Declaração", "Declaration")}
                />

                <div className="bg-primary/5 border border-primary/15 rounded-xl p-5 mb-6 space-y-3">
                  <p className="font-serif text-base italic text-foreground/80 leading-relaxed">
                    {t(
                      "Querido Ser, obrigada por partilhar a sua história comigo com tanta abertura e confiança.",
                      "Dear Being, thank you for sharing your history with me with such openness and trust."
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t(
                      "A informação aqui prestada é verdadeira e actualizada ao melhor do meu conhecimento. Compreendo que é usada exclusivamente para adequar o tratamento às minhas necessidades e que será tratada com total confidencialidade.",
                      "The information provided here is true and up to date to the best of my knowledge. I understand it is used exclusively to adapt the treatment to my needs and will be handled with complete confidentiality."
                    )}
                  </p>
                </div>

                <div className="space-y-4">
                  <Controller
                    control={control}
                    name="consent_health_data"
                    render={({ field, fieldState }) => (
                      <div className="space-y-2">
                        <div
                          className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                            field.value
                              ? "border-primary bg-primary/5"
                              : "border-border bg-white"
                          } ${fieldState.error ? "border-destructive" : ""}`}
                          onClick={() => field.onChange(!field.value)}
                          role="checkbox"
                          aria-checked={field.value}
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === " " || e.key === "Enter") {
                              e.preventDefault();
                              field.onChange(!field.value);
                            }
                          }}
                        >
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            id="consent_health_data"
                            aria-required="true"
                            className="mt-0.5 shrink-0"
                          />
                          <label
                            htmlFor="consent_health_data"
                            className="text-sm leading-relaxed cursor-pointer"
                          >
                            {t(
                              "Autorizo o tratamento dos meus dados pessoais e de saúde para preparação e acompanhamento da minha sessão terapêutica.",
                              "I authorise the processing of my personal and health data for the preparation and follow-up of my therapeutic session."
                            )}
                          </label>
                        </div>
                        {fieldState.error && (
                          <p className="text-xs text-destructive pl-1">
                            {t(
                              "O consentimento de dados de saúde deve ser aceite para continuar.",
                              "Health-data consent must be accepted to continue."
                            )}
                          </p>
                        )}
                      </div>
                    )}
                  />

                  <div className="rounded-lg border border-border bg-white p-4 space-y-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {t(
                          "Canais autorizados para comunicações de serviço",
                          "Channels authorised for service communication"
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t(
                          "Confirmações, reminders, alterações e gestão da sessão.",
                          "Confirmations, reminders, changes and session management."
                        )}
                      </p>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-3">
                      <Controller
                        control={control}
                        name="service_consent_email"
                        render={({ field }) => (
                          <label className="flex items-center gap-2 text-sm">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            Email
                          </label>
                        )}
                      />
                      <Controller
                        control={control}
                        name="service_consent_sms"
                        render={({ field }) => (
                          <label className="flex items-center gap-2 text-sm">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            SMS
                          </label>
                        )}
                      />
                      <Controller
                        control={control}
                        name="service_consent_whatsapp"
                        render={({ field }) => (
                          <label className="flex items-center gap-2 text-sm">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            WhatsApp
                          </label>
                        )}
                      />
                    </div>
                  </div>

                  <div className="rounded-lg border border-border bg-white p-4 space-y-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {t(
                          "Canais autorizados para marketing",
                          "Channels authorised for marketing"
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t(
                          "Novidades, ofertas e convites. Opcional.",
                          "News, offers and invitations. Optional."
                        )}
                      </p>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-3">
                      <Controller
                        control={control}
                        name="marketing_consent_email"
                        render={({ field }) => (
                          <label className="flex items-center gap-2 text-sm">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            Email
                          </label>
                        )}
                      />
                      <Controller
                        control={control}
                        name="marketing_consent_sms"
                        render={({ field }) => (
                          <label className="flex items-center gap-2 text-sm">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            SMS
                          </label>
                        )}
                      />
                      <Controller
                        control={control}
                        name="marketing_consent_whatsapp"
                        render={({ field }) => (
                          <label className="flex items-center gap-2 text-sm">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            WhatsApp
                          </label>
                        )}
                      />
                    </div>
                  </div>

                  <Controller
                    control={control}
                    name="declaration_accepted"
                    render={({ field, fieldState }) => (
                      <div className="space-y-2">
                        <div
                          className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                            field.value
                              ? "border-primary bg-primary/5"
                              : "border-border bg-white"
                          } ${fieldState.error ? "border-destructive" : ""}`}
                          onClick={() => field.onChange(!field.value)}
                          role="checkbox"
                          aria-checked={field.value}
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === " " || e.key === "Enter") {
                              e.preventDefault();
                              field.onChange(!field.value);
                            }
                          }}
                        >
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            id="declaration_accepted"
                            aria-required="true"
                            className="mt-0.5 shrink-0"
                          />
                          <label
                            htmlFor="declaration_accepted"
                            className="text-sm leading-relaxed cursor-pointer"
                          >
                            {t(
                              "Declaro que li e compreendi a informação acima, que os dados prestados são verdadeiros e que autorizo a sua utilização para fins terapêuticos.",
                              "I declare that I have read and understood the information above, that the data provided is accurate, and that I authorise its use for therapeutic purposes."
                            )}
                          </label>
                        </div>
                        {fieldState.error && (
                          <p className="text-xs text-destructive pl-1">
                            {t(
                              "A declaração deve ser aceite para continuar.",
                              "The declaration must be accepted to continue."
                            )}
                          </p>
                        )}
                      </div>
                    )}
                  />

                  <p className="text-xs text-muted-foreground text-center pt-2">
                    {t(
                      `Data de hoje: ${new Date().toLocaleDateString("pt-PT", { dateStyle: "long" })}`,
                      `Today's date: ${new Date().toLocaleDateString("en-GB", { dateStyle: "long" })}`
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* -------------------------------------------------- */}
            {/* Navigation                                          */}
            {/* -------------------------------------------------- */}
            <NavButtons
              step={step}
              totalSteps={TOTAL_STEPS}
              onBack={goBack}
              onNext={goNext}
              isSubmitting={submitting}
              backLabel={t("Anterior", "Back")}
              nextLabel={
                step === TOTAL_STEPS
                  ? t("Enviar", "Submit")
                  : t("Seguinte", "Next")
              }
            />
          </CardContent>
        </Card>

        {/* Step indicator dots */}
        <div className="flex justify-center gap-2 mt-6" aria-hidden="true">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i + 1 === step
                  ? "w-6 bg-primary"
                  : i + 1 < step
                  ? "w-2 bg-primary/50"
                  : "w-2 bg-border"
              }`}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
