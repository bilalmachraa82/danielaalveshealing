/**
 * IntakePage - Pre-session intake form (public, token-based)
 *
 * Usage:
 *   <Route path="/pre-sessao/:token" element={<IntakePage />} />
 *   <Route path="/pre-imersao/:token" element={<IntakePage />} />
 *
 * The form_type from the API response determines which layout is rendered:
 *   - "healing_touch"  → single-page form with 4 wellbeing scales
 *   - "pura_radiancia" → multi-step form (5 pages)
 */

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  healingTouchIntakeSchema,
  puraRadianciaIntakeSchema,
  type HealingTouchIntakeInput,
  type PuraRadianciaIntakeInput,
} from "@/lib/schemas/intake.schema";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type FormType = "healing_touch" | "pura_radiancia";

interface IntakeMetadata {
  form_type: FormType;
  client_name: string;
  session_date?: string;
}

type ApiState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; meta: IntakeMetadata }
  | { status: "submitted" };

// ---------------------------------------------------------------------------
// Shared sub-components
// ---------------------------------------------------------------------------

function FormField({
  label,
  helper,
  children,
  required,
}: {
  label: string;
  helper?: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label className="font-sans text-sm font-medium text-foreground">
        {label}
        {required && <span className="ml-1 text-primary">*</span>}
      </Label>
      {helper && (
        <p className="text-xs text-muted-foreground leading-relaxed">{helper}</p>
      )}
      {children}
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
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Referral source radio
// ---------------------------------------------------------------------------

const REFERRAL_OPTIONS = [
  { value: "amigo_familiar", pt: "Amigo/Familiar", en: "Friend/Family" },
  { value: "redes_sociais", pt: "Redes Sociais", en: "Social Media" },
  { value: "cheque_oferta", pt: "Cheque-Oferta", en: "Gift Voucher" },
  { value: "pesquisa_google", pt: "Pesquisa Google", en: "Google Search" },
  { value: "outra", pt: "Outra", en: "Other" },
] as const;

const BEVERAGE_OPTIONS = [
  { value: "cha_ervas_simples", pt: "Chá ervas simples", en: "Simple herbal tea" },
  { value: "cha_especiarias", pt: "Chá especiarias", en: "Spiced tea" },
  { value: "todos", pt: "Todos", en: "All" },
  { value: "nao_gosto", pt: "Não gosto", en: "I don't like it" },
  { value: "outra", pt: "Outra", en: "Other" },
] as const;

// ---------------------------------------------------------------------------
// Page header (brand logo area)
// ---------------------------------------------------------------------------

function PageHeader({ clientName, t }: { clientName: string; t: (pt: string, en: string) => string }) {
  return (
    <header className="mb-8 text-center">
      <p className="font-serif text-sm font-light tracking-widest text-primary/70 uppercase mb-2">
        Daniela Alves
      </p>
      <h1 className="font-serif text-3xl font-light text-foreground leading-tight">
        {t("Olá", "Hello")},{" "}
        <span className="text-primary">{clientName}</span>
      </h1>
      <div className="mx-auto mt-3 h-px w-16 bg-primary/30" />
    </header>
  );
}

// ---------------------------------------------------------------------------
// Success screen
// ---------------------------------------------------------------------------

function SuccessScreen({ t }: { t: (pt: string, en: string) => string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[hsl(var(--mist))] to-background px-6 py-16 text-center">
      <div className="max-w-sm space-y-6">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <svg
            className="h-10 w-10 text-primary"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h2 className="font-serif text-3xl font-light text-foreground">
          {t("Obrigada", "Thank you")}
        </h2>
        <p className="font-sans text-base text-muted-foreground leading-relaxed">
          {t(
            "O seu formulário foi recebido com amor. Até breve!",
            "Your form has been received with love. See you soon!"
          )}
        </p>
        <blockquote className="border-l-2 border-primary/40 pl-4 text-left">
          <p className="font-serif text-lg italic text-primary/80 leading-relaxed">
            "O Amor é um Sol,
            <br />
            Que flui e nutre…"
          </p>
          <footer className="mt-2 font-sans text-xs text-muted-foreground">— Daniela Alves</footer>
        </blockquote>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Error / Loading screens
// ---------------------------------------------------------------------------

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[hsl(var(--mist))]">
      <div className="space-y-4 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="font-sans text-sm text-muted-foreground">A carregar…</p>
      </div>
    </div>
  );
}

function ErrorScreen({ message, t }: { message: string; t: (pt: string, en: string) => string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[hsl(var(--mist))] to-background px-6 py-16 text-center">
      <div className="max-w-sm space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <svg
            className="h-8 w-8 text-destructive"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h2 className="font-serif text-2xl font-light text-foreground">
          {t("Ligação inválida", "Invalid link")}
        </h2>
        <p className="font-sans text-sm text-muted-foreground leading-relaxed">{message}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Healing Touch form (single page)
// ---------------------------------------------------------------------------

function HealingTouchForm({
  token,
  clientName,
  onSuccess,
}: {
  token: string;
  clientName: string;
  onSuccess: () => void;
}) {
  const { t } = useLanguage();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<HealingTouchIntakeInput>({
    resolver: zodResolver(healingTouchIntakeSchema),
    defaultValues: {
      feeling_physically: 5,
      feeling_psychologically: 5,
      feeling_emotionally: 5,
      feeling_energetically: 5,
    },
  });

  const scaleValues = {
    physically: watch("feeling_physically") ?? 5,
    psychologically: watch("feeling_psychologically") ?? 5,
    emotionally: watch("feeling_emotionally") ?? 5,
    energetically: watch("feeling_energetically") ?? 5,
  };

  const onSubmit = async (data: HealingTouchIntakeInput) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const response = await fetch(`/api/forms/intake/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, form_type: "healing_touch" }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? `Erro ${response.status}`);
      }
      onSuccess();
    } catch (err: unknown) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : t("Ocorreu um erro. Tente novamente.", "An error occurred. Please try again.")
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(var(--mist))] to-background px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-lg">
        <PageHeader clientName={clientName} t={t} />

        <p className="mb-8 text-center font-sans text-sm text-muted-foreground leading-relaxed">
          {t(
            "Antes da sua sessão, gostaríamos de conhecê-la um pouco melhor. Por favor, preencha este breve formulário.",
            "Before your session, we'd love to get to know you a little better. Please fill in this short form."
          )}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">
          {/* Referral */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
            <h2 className="font-serif text-xl text-foreground">
              {t("Como nos conheceu?", "How did you find us?")}
            </h2>
            <FormField
              label={t("Como chegou até nós?", "How did you find us?")}
              required
            >
              <RadioGroup
                onValueChange={(v) =>
                  setValue("referral_source", v as HealingTouchIntakeInput["referral_source"], {
                    shouldValidate: true,
                  })
                }
                className="grid grid-cols-1 gap-2 sm:grid-cols-2"
              >
                {REFERRAL_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-background px-4 py-3 transition-colors hover:border-primary/50 hover:bg-muted/50 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
                  >
                    <RadioGroupItem value={opt.value} id={`referral-${opt.value}`} />
                    <span className="font-sans text-sm">{t(opt.pt, opt.en)}</span>
                  </label>
                ))}
              </RadioGroup>
              {errors.referral_source && (
                <p className="text-xs text-destructive mt-1">{errors.referral_source.message}</p>
              )}
            </FormField>
          </section>

          {/* Motivation & Objective */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
            <h2 className="font-serif text-xl text-foreground">
              {t("A sua intenção", "Your intention")}
            </h2>
            <FormField label={t("O que o motivou a agendar esta sessão?", "What motivated you to book this session?")} required>
              <Textarea
                {...register("motivation")}
                rows={3}
                placeholder={t("Partilhe livremente…", "Share freely…")}
                className="resize-none"
              />
              {errors.motivation && (
                <p className="text-xs text-destructive">{errors.motivation.message}</p>
              )}
            </FormField>

            <FormField label={t("Qual o principal objectivo?", "What is the main objective?")} required>
              <Textarea
                {...register("main_objective")}
                rows={3}
                placeholder={t("O que espera alcançar?", "What do you hope to achieve?")}
                className="resize-none"
              />
              {errors.main_objective && (
                <p className="text-xs text-destructive">{errors.main_objective.message}</p>
              )}
            </FormField>
          </section>

          {/* Health */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
            <h2 className="font-serif text-xl text-foreground">
              {t("Saúde & Bem-estar", "Health & Wellbeing")}
            </h2>
            <FormField label={t("Tem alguma situação de saúde relevante?", "Do you have any relevant health conditions?")}>
              <Textarea
                {...register("health_conditions")}
                rows={2}
                placeholder={t("Opcional", "Optional")}
                className="resize-none"
              />
            </FormField>

            <FormField label={t("Está a fazer tratamento médico ou medicação?", "Are you under medical treatment or taking medication?")}>
              <Input
                {...register("current_treatment")}
                placeholder={t("Opcional", "Optional")}
              />
            </FormField>

            <FormField label={t("Está grávida ou a amamentar?", "Are you pregnant or breastfeeding?")}>
              <Input
                {...register("pregnant_breastfeeding")}
                placeholder={t("Opcional", "Optional")}
              />
            </FormField>

            <FormField label={t("Tem alguma sensibilidade ou alergia?", "Do you have any sensitivities or allergies?")}>
              <Input
                {...register("allergies_sensitivities")}
                placeholder={t("Opcional", "Optional")}
              />
            </FormField>
          </section>

          {/* Wellbeing scales */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
            <h2 className="font-serif text-xl text-foreground">
              {t("Como se sente agora?", "How are you feeling right now?")}
            </h2>
            <p className="font-sans text-xs text-muted-foreground">
              {t("1 = nada bem · 10 = fenomenal", "1 = not well at all · 10 = phenomenal")}
            </p>

            <ScaleField
              label={t("Fisicamente", "Physically")}
              value={scaleValues.physically}
              onChange={(v) => setValue("feeling_physically", v)}
              lowLabel={t("Nada bem", "Not well")}
              highLabel={t("Fenomenal", "Phenomenal")}
            />
            <ScaleField
              label={t("Psicologicamente", "Psychologically")}
              value={scaleValues.psychologically}
              onChange={(v) => setValue("feeling_psychologically", v)}
              lowLabel={t("Nada bem", "Not well")}
              highLabel={t("Fenomenal", "Phenomenal")}
            />
            <ScaleField
              label={t("Emocionalmente", "Emotionally")}
              value={scaleValues.emotionally}
              onChange={(v) => setValue("feeling_emotionally", v)}
              lowLabel={t("Nada bem", "Not well")}
              highLabel={t("Fenomenal", "Phenomenal")}
            />
            <ScaleField
              label={t("Energeticamente", "Energetically")}
              value={scaleValues.energetically}
              onChange={(v) => setValue("feeling_energetically", v)}
              lowLabel={t("Nada bem", "Not well")}
              highLabel={t("Fenomenal", "Phenomenal")}
            />
          </section>

          {/* Additional observations */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
            <FormField label={t("Observações adicionais", "Additional observations")}>
              <Textarea
                {...register("additional_observations")}
                rows={3}
                placeholder={t("Alguma coisa que queira partilhar…", "Anything else you'd like to share…")}
                className="resize-none"
              />
            </FormField>
          </section>

          {submitError && (
            <p className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive text-center">
              {submitError}
            </p>
          )}

          <Button
            type="submit"
            disabled={submitting}
            size="lg"
            className="w-full font-sans text-base"
          >
            {submitting
              ? t("A enviar…", "Sending…")
              : t("Enviar formulário", "Submit form")}
          </Button>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pura Radiância multi-step form
// ---------------------------------------------------------------------------

const PURA_TOTAL_STEPS = 5;

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8" aria-label={`Passo ${current} de ${total}`}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-2 rounded-full transition-all duration-300",
            i + 1 === current
              ? "w-8 bg-primary"
              : i + 1 < current
              ? "w-2 bg-primary/50"
              : "w-2 bg-border"
          )}
        />
      ))}
    </div>
  );
}

function PuraRadianciaForm({
  token,
  clientName,
  onSuccess,
}: {
  token: string;
  clientName: string;
  onSuccess: () => void;
}) {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<PuraRadianciaIntakeInput>({
    resolver: zodResolver(puraRadianciaIntakeSchema),
    mode: "onTouched",
  });

  const goNext = async () => {
    // Validate fields relevant to the current step before advancing
    const stepFields: (keyof PuraRadianciaIntakeInput)[][] = [
      ["referral_source"],
      ["motivation", "main_objective"],
      ["immersion_motivation", "main_intention"],
      ["health_conditions", "current_treatment", "pregnant_breastfeeding", "allergies_sensitivities"],
      ["aroma_preferences", "music_preferences", "beverage_preference", "dietary_restrictions", "color_preferences", "wishlist", "additional_observations"],
    ];
    const valid = await trigger(stepFields[step - 1]);
    if (valid) setStep((s) => Math.min(s + 1, PURA_TOTAL_STEPS));
  };

  const onSubmit = async (data: PuraRadianciaIntakeInput) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const response = await fetch(`/api/forms/intake/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, form_type: "pura_radiancia" }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? `Erro ${response.status}`);
      }
      onSuccess();
    } catch (err: unknown) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : t("Ocorreu um erro. Tente novamente.", "An error occurred. Please try again.")
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(var(--section-lilac))] to-background px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-lg">
        <PageHeader clientName={clientName} t={t} />

        {/* Opening text — Pura Radiância specific */}
        <div className="mb-8 rounded-2xl bg-primary/5 border border-primary/20 px-6 py-5 text-center">
          <p className="font-serif text-base italic text-primary leading-relaxed">
            {t(
              "Querido Ser, Bem-vindo ao Primeiro Passo para a Imersão Pura Radiância!",
              "Dear Being, Welcome to the First Step of the Pura Radiância Immersion!"
            )}
          </p>
        </div>

        <StepIndicator current={step} total={PURA_TOTAL_STEPS} />

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Step 1: How did you find us */}
          {step === 1 && (
            <section className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
              <h2 className="font-serif text-xl text-foreground">
                {t("Como nos conheceu?", "How did you find us?")}
              </h2>
              <FormField
                label={t("Como chegou até nós?", "How did you find us?")}
                required
              >
                <RadioGroup
                  onValueChange={(v) =>
                    setValue("referral_source", v as PuraRadianciaIntakeInput["referral_source"], {
                      shouldValidate: true,
                    })
                  }
                  className="grid grid-cols-1 gap-2"
                >
                  {REFERRAL_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-background px-4 py-3 transition-colors hover:border-primary/50 hover:bg-muted/50 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
                    >
                      <RadioGroupItem value={opt.value} id={`pr-referral-${opt.value}`} />
                      <span className="font-sans text-sm">{t(opt.pt, opt.en)}</span>
                    </label>
                  ))}
                </RadioGroup>
                {errors.referral_source && (
                  <p className="text-xs text-destructive mt-1">{errors.referral_source.message}</p>
                )}
              </FormField>

              <FormField label={t("Pratica meditação?", "Do you practice meditation?")}>
                <Textarea
                  {...register("meditation_practice")}
                  rows={2}
                  placeholder={t("Partilhe a sua experiência…", "Share your experience…")}
                  className="resize-none"
                />
              </FormField>

              <FormField label={t("Tem algum desafio atual?", "Do you have any current challenge?")}>
                <Textarea
                  {...register("current_challenges")}
                  rows={2}
                  placeholder={t("Opcional", "Optional")}
                  className="resize-none"
                />
              </FormField>
            </section>
          )}

          {/* Step 2: Motivation & Objective */}
          {step === 2 && (
            <section className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
              <h2 className="font-serif text-xl text-foreground">
                {t("A sua motivação", "Your motivation")}
              </h2>

              <FormField label={t("O que o motivou a agendar esta sessão?", "What motivated you to book this session?")} required>
                <Textarea
                  {...register("motivation")}
                  rows={3}
                  placeholder={t("Partilhe livremente…", "Share freely…")}
                  className="resize-none"
                />
                {errors.motivation && (
                  <p className="text-xs text-destructive">{errors.motivation.message}</p>
                )}
              </FormField>

              <FormField label={t("Qual o principal objectivo?", "What is the main objective?")} required>
                <Textarea
                  {...register("main_objective")}
                  rows={3}
                  placeholder={t("O que espera alcançar?", "What do you hope to achieve?")}
                  className="resize-none"
                />
                {errors.main_objective && (
                  <p className="text-xs text-destructive">{errors.main_objective.message}</p>
                )}
              </FormField>
            </section>
          )}

          {/* Step 3: Immersion intention */}
          {step === 3 && (
            <section className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
              <h2 className="font-serif text-xl text-foreground">
                {t("A sua intenção para a imersão", "Your intention for the immersion")}
              </h2>

              <FormField label={t("O que o motiva a participar?", "What motivates you to participate?")} required>
                <Textarea
                  {...register("immersion_motivation")}
                  rows={3}
                  placeholder={t("Partilhe livremente…", "Share freely…")}
                  className="resize-none"
                />
                {errors.immersion_motivation && (
                  <p className="text-xs text-destructive">{errors.immersion_motivation.message}</p>
                )}
              </FormField>

              <FormField
                label={t("Qual a sua principal intenção?", "What is your main intention?")}
                helper={t(
                  "Em vez de algo resumido como 'relaxar', desenvolva — o que deseja transformar, sentir ou libertar?",
                  "Instead of something brief like 'relax', develop it — what do you wish to transform, feel, or release?"
                )}
                required
              >
                <Textarea
                  {...register("main_intention")}
                  rows={4}
                  placeholder={t("Desenvolva a sua intenção…", "Develop your intention…")}
                  className="resize-none"
                />
                {errors.main_intention && (
                  <p className="text-xs text-destructive">{errors.main_intention.message}</p>
                )}
              </FormField>

              <FormField label={t("Liste a sua Lista de Desejos!", "List your Wish List!")}>
                <Textarea
                  {...register("wishlist")}
                  rows={3}
                  placeholder={t("Escreva livremente…", "Write freely…")}
                  className="resize-none"
                />
              </FormField>
            </section>
          )}

          {/* Step 4: Health */}
          {step === 4 && (
            <section className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
              <h2 className="font-serif text-xl text-foreground">
                {t("Saúde & Bem-estar", "Health & Wellbeing")}
              </h2>

              <FormField label={t("Tem alguma situação de saúde relevante?", "Do you have any relevant health conditions?")}>
                <Textarea
                  {...register("health_conditions")}
                  rows={2}
                  placeholder={t("Opcional", "Optional")}
                  className="resize-none"
                />
              </FormField>

              <FormField label={t("Está a fazer tratamento médico ou medicação?", "Are you under medical treatment or taking medication?")}>
                <Input
                  {...register("current_treatment")}
                  placeholder={t("Opcional", "Optional")}
                />
              </FormField>

              <FormField label={t("Está grávida ou a amamentar?", "Are you pregnant or breastfeeding?")}>
                <Input
                  {...register("pregnant_breastfeeding")}
                  placeholder={t("Opcional", "Optional")}
                />
              </FormField>

              <FormField label={t("Tem alguma sensibilidade ou alergia?", "Do you have any sensitivities or allergies?")}>
                <Input
                  {...register("allergies_sensitivities")}
                  placeholder={t("Opcional", "Optional")}
                />
              </FormField>
            </section>
          )}

          {/* Step 5: Sensory preferences */}
          {step === 5 && (
            <section className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
              <h2 className="font-serif text-xl text-foreground">
                {t("Preferências sensoriais", "Sensory preferences")}
              </h2>

              <FormField label={t("Quais aromas gosta mais?", "Which aromas do you prefer?")}>
                <Input
                  {...register("aroma_preferences")}
                  placeholder={t("Lavanda, sândalo, cítricos…", "Lavender, sandalwood, citrus…")}
                />
              </FormField>

              <FormField label={t("Qual tipo de música prefere?", "What type of music do you prefer?")}>
                <Textarea
                  {...register("music_preferences")}
                  rows={2}
                  placeholder={t("Sons da natureza, meditação, ambient…", "Nature sounds, meditation, ambient…")}
                  className="resize-none"
                />
              </FormField>

              <FormField label={t("Preferência de bebida?", "Beverage preference?")}>
                <RadioGroup
                  onValueChange={(v) =>
                    setValue("beverage_preference", v as PuraRadianciaIntakeInput["beverage_preference"], {
                      shouldValidate: true,
                    })
                  }
                  className="grid grid-cols-1 gap-2 sm:grid-cols-2"
                >
                  {BEVERAGE_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-background px-4 py-3 transition-colors hover:border-primary/50 hover:bg-muted/50 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
                    >
                      <RadioGroupItem value={opt.value} id={`bev-${opt.value}`} />
                      <span className="font-sans text-sm">{t(opt.pt, opt.en)}</span>
                    </label>
                  ))}
                </RadioGroup>
              </FormField>

              <FormField label={t("Restrições alimentares?", "Dietary restrictions?")}>
                <Textarea
                  {...register("dietary_restrictions")}
                  rows={2}
                  placeholder={t("Opcional", "Optional")}
                  className="resize-none"
                />
              </FormField>

              <FormField label={t("Quais cores lhe trazem harmonia?", "Which colors bring you harmony?")}>
                <Textarea
                  {...register("color_preferences")}
                  rows={2}
                  placeholder={t("Azul, verde, branco…", "Blue, green, white…")}
                  className="resize-none"
                />
              </FormField>

              <FormField label={t("Observações adicionais", "Additional observations")}>
                <Textarea
                  {...register("additional_observations")}
                  rows={3}
                  placeholder={t("Alguma coisa que queira partilhar…", "Anything else you'd like to share…")}
                  className="resize-none"
                />
              </FormField>

              {submitError && (
                <p className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive text-center">
                  {submitError}
                </p>
              )}
            </section>
          )}

          {/* Navigation */}
          <div className={cn("mt-6 flex gap-3", step > 1 ? "justify-between" : "justify-end")}>
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => setStep((s) => s - 1)}
                className="min-w-[120px]"
              >
                {t("Anterior", "Previous")}
              </Button>
            )}

            {step < PURA_TOTAL_STEPS ? (
              <Button
                type="button"
                size="lg"
                onClick={goNext}
                className="min-w-[120px]"
              >
                {t("Seguinte", "Next")}
              </Button>
            ) : (
              <Button
                type="submit"
                size="lg"
                disabled={submitting}
                className="min-w-[120px]"
              >
                {submitting
                  ? t("A enviar…", "Sending…")
                  : t("Enviar", "Submit")}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page component
// ---------------------------------------------------------------------------

export default function IntakePage() {
  const { token } = useParams<{ token: string }>();
  const { t } = useLanguage();
  const [apiState, setApiState] = useState<ApiState>({ status: "loading" });

  useEffect(() => {
    if (!token) {
      setApiState({
        status: "error",
        message: t(
          "Este link não é válido. Por favor, contacte Daniela.",
          "This link is not valid. Please contact Daniela."
        ),
      });
      return;
    }

    fetch(`/api/forms/intake/${token}`)
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 404 || res.status === 410) {
            throw new Error(
              t(
                "Este link expirou ou não existe. Por favor, contacte Daniela.",
                "This link has expired or does not exist. Please contact Daniela."
              )
            );
          }
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? t("Erro ao carregar o formulário.", "Error loading the form."));
        }
        return res.json() as Promise<IntakeMetadata>;
      })
      .then((meta) => {
        setApiState({ status: "ready", meta });
      })
      .catch((err: unknown) => {
        setApiState({
          status: "error",
          message:
            err instanceof Error
              ? err.message
              : t("Erro desconhecido.", "Unknown error."),
        });
      });
  }, [token, t]);

  if (apiState.status === "loading") return <LoadingScreen />;
  if (apiState.status === "error") return <ErrorScreen message={apiState.message} t={t} />;
  if (apiState.status === "submitted") return <SuccessScreen t={t} />;

  const { meta } = apiState;

  if (meta.form_type === "pura_radiancia") {
    return (
      <PuraRadianciaForm
        token={token!}
        clientName={meta.client_name}
        onSuccess={() => setApiState({ status: "submitted" })}
      />
    );
  }

  return (
    <HealingTouchForm
      token={token!}
      clientName={meta.client_name}
      onSuccess={() => setApiState({ status: "submitted" })}
    />
  );
}
