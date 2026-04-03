import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
import { enGB, pt } from "date-fns/locale";
import {
  Calendar,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Loader2,
  Sparkles,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { useManagedSession, useManagedSessionAction } from "@/hooks/useSessions";
import { getLocalizedServiceLabel } from "@/lib/communications/templates";
import type { ManageSessionActionInput } from "@/lib/schemas/session.schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

function toDateTimeLocalValue(iso: string) {
  const date = new Date(iso);
  const pad = (value: number) => String(value).padStart(2, "0");

  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join("-") +
    "T" +
    [pad(date.getHours()), pad(date.getMinutes())].join(":");
}

function formatDetailedDate(iso: string, language: "pt" | "en") {
  return format(
    new Date(iso),
    language === "en"
      ? "EEEE, d MMMM yyyy 'at' HH:mm"
      : "EEEE, d 'de' MMMM yyyy 'às' HH:mm",
    { locale: language === "en" ? enGB : pt }
  );
}

export default function ManageSessionPage() {
  const { token } = useParams<{ token: string }>();
  const sessionQuery = useManagedSession(token);
  const manageAction = useManagedSessionAction(token);
  const current = manageAction.data ?? sessionQuery.data;
  const [activeAction, setActiveAction] = useState<"reschedule" | "cancel" | null>(null);
  const [rescheduleAt, setRescheduleAt] = useState("");
  const [reason, setReason] = useState("");

  const language = current?.client.preferred_language ?? "pt";
  const t = useMemo(
    () => (ptText: string, enText: string) =>
      language === "en" ? enText : ptText,
    [language]
  );

  useEffect(() => {
    if (current?.session.scheduled_at) {
      setRescheduleAt(toDateTimeLocalValue(current.session.scheduled_at));
    }
  }, [current?.session.scheduled_at]);

  if (sessionQuery.isLoading && !current) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(185,156,142,0.18),_transparent_55%),linear-gradient(180deg,_hsl(var(--background)),_hsl(var(--muted)))]">
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-primary/15 bg-background/80 shadow-sm">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">
            {t("A carregar a sua marcação…", "Loading your appointment…")}
          </p>
        </div>
      </div>
    );
  }

  if (sessionQuery.error || !current) {
    const message =
      sessionQuery.error instanceof Error
        ? sessionQuery.error.message
        : t(
            "Não foi possível encontrar esta marcação.",
            "We could not find this appointment."
          );

    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,_rgba(0,0,0,0),_rgba(152,95,151,0.04)),hsl(var(--background))] px-4">
        <Card className="w-full max-w-lg border-border/60 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="font-serif text-2xl">
              {t("Link indisponível", "Link unavailable")}
            </CardTitle>
            <CardDescription>{message}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const { session, client, manage_state, manage_url } = current;
  const serviceLabel = getLocalizedServiceLabel(session.service_type, language);
  const blockingMessage =
    manage_state.blockingReason === "notice_period"
      ? t(
          "As alterações online estão disponíveis até 24 horas antes da sessão. Se precisar, fale diretamente com a Daniela.",
          "Online changes are available until 24 hours before the session. If you need support, please contact Daniela directly."
        )
      : manage_state.blockingReason === "session_started"
        ? t(
            "A sessão já começou ou já decorreu, por isso este link está agora em modo informativo.",
            "The session has already started or already took place, so this link is now informational only."
          )
        : manage_state.blockingReason === "status_closed"
          ? t(
              "Esta marcação já não está disponível para gestão online.",
              "This booking is no longer available for online management."
            )
          : null;

  async function submitAction(data: ManageSessionActionInput) {
    try {
      await manageAction.mutateAsync(data);
      setActiveAction(null);
      setReason("");
      toast.success(
        data.action === "confirm"
          ? t("Sessão confirmada.", "Session confirmed.")
          : data.action === "cancel"
            ? t("Sessão cancelada.", "Session cancelled.")
            : t("Sessão remarcada.", "Session rescheduled.")
      );
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("Ocorreu um erro.", "Something went wrong.")
      );
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(152,95,151,0.1),_transparent_48%),radial-gradient(circle_at_bottom,_rgba(184,154,183,0.12),_transparent_42%),linear-gradient(180deg,_hsl(var(--background)),hsl(var(--muted)))] px-4 py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="space-y-3 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.38em] text-primary/75">
            Daniela Alves Healing & Harmony
          </p>
          <h1 className="font-serif text-4xl font-semibold text-foreground">
            {t("Gerir Marcação", "Manage Your Session")}
          </h1>
          <p className="mx-auto max-w-2xl text-sm leading-6 text-muted-foreground">
            {t(
              "Aqui pode confirmar, remarcar ou cancelar a sua sessão de forma simples.",
              "Here you can confirm, reschedule or cancel your session in a simple way."
            )}
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
          <Card className="border-border/60 bg-background/90 shadow-xl backdrop-blur">
            <CardHeader className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle className="font-serif text-2xl">
                    {serviceLabel}
                  </CardTitle>
                  <CardDescription className="mt-2 text-sm">
                    {t(
                      `Olá ${client.first_name}, aqui está a sua marcação.`,
                      `Hello ${client.first_name}, here is your appointment.`
                    )}
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="px-3 py-1 text-xs uppercase tracking-wide">
                  {session.status === "confirmed"
                    ? t("Confirmada", "Confirmed")
                    : session.status === "cancelled"
                      ? t("Cancelada", "Cancelled")
                      : session.status === "completed"
                        ? t("Concluída", "Completed")
                        : session.status === "no_show"
                          ? t("Não compareceu", "No-show")
                          : t("Agendada", "Scheduled")}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 rounded-2xl border border-primary/10 bg-primary/5 p-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-primary/80">
                    <Calendar className="h-4 w-4" />
                    {t("Data", "Date")}
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    {formatDetailedDate(session.scheduled_at, language)}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-primary/80">
                    <Clock3 className="h-4 w-4" />
                    {t("Duração", "Duration")}
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    {t(
                      `${session.duration_minutes} minutos`,
                      `${session.duration_minutes} minutes`
                    )}
                  </p>
                </div>
              </div>

              {session.client_confirmed_at && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  <div className="flex items-center gap-2 font-medium">
                    <CheckCircle2 className="h-4 w-4" />
                    {t("Sessão já confirmada", "Session already confirmed")}
                  </div>
                </div>
              )}

              {blockingMessage && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  <div className="flex items-start gap-2">
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
                    <p>{blockingMessage}</p>
                  </div>
                </div>
              )}

              {manage_url && (
                <div className="rounded-2xl border border-border/60 bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
                  {t(
                    "Pode guardar este link para voltar a esta página mais tarde.",
                    "You can save this link to return to this page later."
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-background/95 shadow-xl">
            <CardHeader>
              <CardTitle className="font-serif text-2xl">
                {t("Ações disponíveis", "Available actions")}
              </CardTitle>
              <CardDescription>
                {t(
                  "Escolha o que pretende fazer com esta marcação.",
                  "Choose what you would like to do with this booking."
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                className="w-full justify-start"
                disabled={
                  manageAction.isPending ||
                  !manage_state.canConfirm ||
                  session.status === "confirmed"
                }
                onClick={() => submitAction({ action: "confirm" })}
              >
                {manageAction.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                )}
                {t("Confirmar sessão", "Confirm session")}
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                disabled={manageAction.isPending || !manage_state.canReschedule}
                onClick={() =>
                  setActiveAction(activeAction === "reschedule" ? null : "reschedule")
                }
              >
                <CalendarClock className="mr-2 h-4 w-4" />
                {t("Remarcar sessão", "Reschedule session")}
              </Button>

              {activeAction === "reschedule" && (
                <div className="space-y-3 rounded-2xl border border-border/60 bg-muted/30 p-4">
                  <div className="space-y-2">
                    <Label htmlFor="rescheduleAt">
                      {t("Nova data e hora", "New date and time")}
                    </Label>
                    <Input
                      id="rescheduleAt"
                      type="datetime-local"
                      value={rescheduleAt}
                      min={toDateTimeLocalValue(new Date().toISOString())}
                      onChange={(event) => setRescheduleAt(event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rescheduleReason">
                      {t("Motivo da alteração (opcional)", "Reason for the change (optional)")}
                    </Label>
                    <Textarea
                      id="rescheduleReason"
                      value={reason}
                      onChange={(event) => setReason(event.target.value)}
                      placeholder={t(
                        "Se quiser, diga-nos o que motivou esta alteração.",
                        "If you wish, let us know what prompted this change."
                      )}
                    />
                  </div>
                  <Button
                    className="w-full"
                    disabled={manageAction.isPending || !rescheduleAt}
                    onClick={() =>
                      submitAction({
                        action: "reschedule",
                        scheduled_at: new Date(rescheduleAt).toISOString(),
                        reason,
                      })
                    }
                  >
                    {manageAction.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CalendarClock className="mr-2 h-4 w-4" />
                    )}
                    {t("Confirmar nova data", "Confirm new time")}
                  </Button>
                </div>
              )}

              <Button
                variant="outline"
                className="w-full justify-start border-destructive/30 text-destructive hover:bg-destructive/5"
                disabled={manageAction.isPending || !manage_state.canCancel}
                onClick={() =>
                  setActiveAction(activeAction === "cancel" ? null : "cancel")
                }
              >
                <XCircle className="mr-2 h-4 w-4" />
                {t("Cancelar sessão", "Cancel session")}
              </Button>

              {activeAction === "cancel" && (
                <div className="space-y-3 rounded-2xl border border-destructive/20 bg-destructive/5 p-4">
                  <div className="space-y-2">
                    <Label htmlFor="cancelReason">
                      {t("Motivo do cancelamento (opcional)", "Cancellation reason (optional)")}
                    </Label>
                    <Textarea
                      id="cancelReason"
                      value={reason}
                      onChange={(event) => setReason(event.target.value)}
                      placeholder={t(
                        "Se quiser, deixe-nos uma nota curta.",
                        "If you wish, leave us a short note."
                      )}
                    />
                  </div>
                  <Button
                    variant="destructive"
                    className="w-full"
                    disabled={manageAction.isPending}
                    onClick={() =>
                      submitAction({
                        action: "cancel",
                        reason,
                      })
                    }
                  >
                    {manageAction.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <XCircle className="mr-2 h-4 w-4" />
                    )}
                    {t("Confirmar cancelamento", "Confirm cancellation")}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
