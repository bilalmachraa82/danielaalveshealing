/**
 * SatisfactionPage - Post-session satisfaction survey (public, token-based)
 *
 * Usage:
 *   <Route path="/satisfacao/:token" element={<SatisfactionPage />} />
 */

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  satisfactionSchema,
  type SatisfactionInput,
} from "@/lib/schemas/satisfaction.schema";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SatisfactionMetadata {
  client_name: string;
  session_date?: string;
  service_type?: string;
}

type ApiState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; meta: SatisfactionMetadata }
  | { status: "submitted" };

// ---------------------------------------------------------------------------
// NPS component
// ---------------------------------------------------------------------------

function NpsScale({
  value,
  onChange,
  error,
  t,
}: {
  value: number | null;
  onChange: (v: number) => void;
  error?: string;
  t: (pt: string, en: string) => string;
}) {
  const getColor = (score: number) => {
    if (score <= 6) return "bg-red-500 text-white border-red-500 hover:bg-red-600";
    if (score <= 8) return "bg-yellow-400 text-white border-yellow-400 hover:bg-yellow-500";
    return "bg-green-500 text-white border-green-500 hover:bg-green-600";
  };

  const getSelectedColor = (score: number) => {
    if (score <= 6) return "ring-2 ring-red-400 ring-offset-2 scale-110";
    if (score <= 8) return "ring-2 ring-yellow-300 ring-offset-2 scale-110";
    return "ring-2 ring-green-400 ring-offset-2 scale-110";
  };

  const getUnselectedColor = (score: number) => {
    if (score <= 6)
      return "bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:border-red-400";
    if (score <= 8)
      return "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100 hover:border-yellow-400";
    return "bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:border-green-400";
  };

  return (
    <div className="space-y-4" role="group" aria-label={t("Pontuação NPS 0 a 10", "NPS score 0 to 10")}>
      <div className="flex flex-wrap justify-center gap-2">
        {Array.from({ length: 11 }, (_, i) => i).map((score) => {
          const isSelected = value === score;
          return (
            <button
              key={score}
              type="button"
              onClick={() => onChange(score)}
              aria-label={`${score} ${t("pontos", "points")}`}
              aria-pressed={isSelected}
              className={cn(
                "flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border font-sans text-sm font-semibold transition-all duration-150",
                isSelected
                  ? `${getColor(score)} ${getSelectedColor(score)}`
                  : getUnselectedColor(score)
              )}
            >
              {score}
            </button>
          );
        })}
      </div>

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{t("De forma alguma", "Not at all")}</span>
        <span>{t("Definitivamente sim", "Definitely yes")}</span>
      </div>

      {error && (
        <p className="text-xs text-destructive text-center">{error}</p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Star rating component
// ---------------------------------------------------------------------------

function StarRating({
  value,
  onChange,
  error,
  t,
}: {
  value: number | null;
  onChange: (v: number) => void;
  error?: string;
  t: (pt: string, en: string) => string;
}) {
  const [hovered, setHovered] = useState<number | null>(null);

  const STAR_LABELS = [
    t("Mau", "Poor"),
    t("Razoável", "Fair"),
    t("Bom", "Good"),
    t("Muito bom", "Very good"),
    t("Excelente", "Excellent"),
  ];

  const active = hovered ?? value ?? 0;

  return (
    <div className="space-y-2" role="group" aria-label={t("Avaliação de conforto", "Comfort rating")}>
      <div className="flex justify-center gap-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(null)}
            aria-label={STAR_LABELS[star - 1]}
            aria-pressed={value === star}
            className="group p-1 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:rounded"
          >
            <svg
              className={cn(
                "h-10 w-10 transition-colors duration-150",
                star <= active ? "text-yellow-400" : "text-border"
              )}
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
          </button>
        ))}
      </div>
      {active > 0 && (
        <p className="text-center text-xs font-medium text-primary">
          {STAR_LABELS[active - 1]}
        </p>
      )}
      {error && (
        <p className="text-xs text-destructive text-center">{error}</p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="font-sans text-sm font-medium text-foreground">{label}</Label>
      {children}
    </div>
  );
}

function PageHeader({ clientName, t }: { clientName: string; t: (pt: string, en: string) => string }) {
  return (
    <header className="mb-8 text-center">
      <p className="font-serif text-sm font-light tracking-widest text-primary/70 uppercase mb-2">
        Daniela Alves
      </p>
      <h1 className="font-serif text-3xl font-light text-foreground leading-tight">
        {t("Como correu,", "How was it,")} <span className="text-primary">{clientName}</span>?
      </h1>
      <div className="mx-auto mt-3 h-px w-16 bg-primary/30" />
      <p className="mt-4 font-sans text-sm text-muted-foreground leading-relaxed">
        {t(
          "A sua opinião é muito valiosa. Obrigada por partilhar a sua experiência.",
          "Your feedback is very valuable. Thank you for sharing your experience."
        )}
      </p>
    </header>
  );
}

// ---------------------------------------------------------------------------
// Loading / Error / Success screens
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
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </div>
        <h2 className="font-serif text-3xl font-light text-foreground">
          {t("Com gratidão", "With gratitude")}
        </h2>
        <p className="font-sans text-base text-muted-foreground leading-relaxed">
          {t(
            "A sua avaliação foi recebida. O seu feedback ajuda a criar experiências ainda mais transformadoras.",
            "Your review has been received. Your feedback helps create even more transformative experiences."
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
// Main satisfaction form
// ---------------------------------------------------------------------------

function SatisfactionForm({
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
    control,
    formState: { errors },
  } = useForm<SatisfactionInput>({
    resolver: zodResolver(satisfactionSchema),
    defaultValues: {
      nps_score: undefined as unknown as number,
      comfort_rating: undefined as unknown as number,
    },
  });

  const onSubmit = async (data: SatisfactionInput) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const response = await fetch(`/api/forms/satisfaction/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
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
    <div className="min-h-screen bg-gradient-to-b from-[hsl(var(--section-warm-soft))] to-background px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-lg">
        <PageHeader clientName={clientName} t={t} />

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
          {/* NPS */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
            <div className="space-y-1">
              <h2 className="font-serif text-xl text-foreground">
                {t("Recomendaria a Daniela?", "Would you recommend Daniela?")}
              </h2>
              <p className="font-sans text-xs text-muted-foreground">
                {t(
                  "Numa escala de 0 a 10, qual a probabilidade de recomendar a Daniela Alves a um amigo ou familiar?",
                  "On a scale of 0 to 10, how likely are you to recommend Daniela Alves to a friend or family member?"
                )}
              </p>
            </div>

            <Controller
              control={control}
              name="nps_score"
              render={({ field }) => (
                <NpsScale
                  value={field.value ?? null}
                  onChange={(v) => field.onChange(v)}
                  error={errors.nps_score?.message}
                  t={t}
                />
              )}
            />
          </section>

          {/* Star rating */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
            <div className="space-y-1">
              <h2 className="font-serif text-xl text-foreground">
                {t("Como avalia o seu conforto?", "How do you rate your comfort?")}
              </h2>
              <p className="font-sans text-xs text-muted-foreground">
                {t("Durante a sessão", "During the session")}
              </p>
            </div>

            <Controller
              control={control}
              name="comfort_rating"
              render={({ field }) => (
                <StarRating
                  value={field.value ?? null}
                  onChange={(v) => field.onChange(v)}
                  error={errors.comfort_rating?.message}
                  t={t}
                />
              )}
            />
          </section>

          {/* Qualitative feedback */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
            <h2 className="font-serif text-xl text-foreground">
              {t("A sua experiência", "Your experience")}
            </h2>

            <FormField label={t("O que mais gostou na sessão?", "What did you enjoy most about the session?")}>
              <Textarea
                {...register("liked_most")}
                rows={3}
                placeholder={t("Partilhe os momentos que mais apreciou…", "Share the moments you appreciated most…")}
                className="resize-none"
              />
            </FormField>

            <FormField label={t("O que poderíamos melhorar?", "What could we improve?")}>
              <Textarea
                {...register("improvement_suggestions")}
                rows={3}
                placeholder={t("A sua sugestão é um presente…", "Your suggestion is a gift…")}
                className="resize-none"
              />
            </FormField>
          </section>

          {/* Would rebook */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
            <h2 className="font-serif text-xl text-foreground">
              {t("Voltaria a agendar?", "Would you book again?")}
            </h2>

            <Controller
              control={control}
              name="would_rebook"
              render={({ field }) => (
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="grid grid-cols-3 gap-3"
                >
                  {(
                    [
                      { value: "sim", pt: "Sim", en: "Yes" },
                      { value: "talvez", pt: "Talvez", en: "Maybe" },
                      { value: "nao", pt: "Não", en: "No" },
                    ] as const
                  ).map((opt) => (
                    <label
                      key={opt.value}
                      className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-4 text-center transition-colors hover:border-primary/50 hover:bg-muted/50 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
                    >
                      <RadioGroupItem value={opt.value} id={`rebook-${opt.value}`} className="sr-only" />
                      <span className="font-sans text-sm font-medium">
                        {t(opt.pt, opt.en)}
                      </span>
                    </label>
                  ))}
                </RadioGroup>
              )}
            />
            {errors.would_rebook && (
              <p className="text-xs text-destructive">{errors.would_rebook.message}</p>
            )}
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
              : t("Enviar avaliação", "Submit review")}
          </Button>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page component
// ---------------------------------------------------------------------------

export default function SatisfactionPage() {
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

    fetch(`/api/forms/satisfaction/${token}`)
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
        return res.json() as Promise<SatisfactionMetadata>;
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

  return (
    <SatisfactionForm
      token={token!}
      clientName={apiState.meta.client_name}
      onSuccess={() => setApiState({ status: "submitted" })}
    />
  );
}
