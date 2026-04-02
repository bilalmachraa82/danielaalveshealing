import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import {
  ArrowLeft,
  Calendar,
  CalendarClock,
  CheckCircle,
  Clock,
  Copy,
  CreditCard,
  Play,
  User,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { SOAPNotesEditor } from "@/components/admin/sessions/SOAPNotesEditor";
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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useSession, useUpdateSession } from "@/hooks/useSessions";
import { getServiceLabel } from "@/lib/config/services";
import type { SessionStatus } from "@/lib/types/database.types";

const STATUS_LABELS: Record<string, string> = {
  scheduled: "Agendada",
  confirmed: "Confirmada",
  in_progress: "Em Curso",
  completed: "Concluída",
  cancelled: "Cancelada",
  no_show: "Não Compareceu",
};

const STATUS_COLORS: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-800",
  confirmed: "bg-emerald-100 text-emerald-800",
  in_progress: "bg-amber-100 text-amber-800",
  completed: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
  no_show: "bg-orange-100 text-orange-800",
};

const REMINDER_LABELS: Record<string, string> = {
  pending: "Pendente",
  scheduled: "Agendado",
  sent: "Enviado",
  skipped: "Ignorado",
};

const CALENDAR_LABELS: Record<string, string> = {
  pending: "Pendente",
  synced: "Sincronizado",
  failed: "Falhou",
  not_configured: "Não configurado",
};

const STATUS_TRANSITIONS: Record<
  string,
  { label: string; status: SessionStatus; icon: typeof Play }[]
> = {
  scheduled: [
    { label: "Confirmar", status: "confirmed", icon: CheckCircle },
    { label: "Cancelar", status: "cancelled", icon: XCircle },
  ],
  confirmed: [
    { label: "Iniciar Sessão", status: "in_progress", icon: Play },
    { label: "Não Compareceu", status: "no_show", icon: XCircle },
    { label: "Cancelar", status: "cancelled", icon: XCircle },
  ],
  in_progress: [
    { label: "Concluir Sessão", status: "completed", icon: CheckCircle },
  ],
};

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

function formatDateTime(value?: string | null) {
  if (!value) return "—";

  return format(new Date(value), "d MMM yyyy, HH:mm", {
    locale: pt,
  });
}

export default function SessionDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: session, isLoading } = useSession(id);
  const updateSession = useUpdateSession();
  const [rescheduleAt, setRescheduleAt] = useState("");
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [cancellationReason, setCancellationReason] = useState("");

  useEffect(() => {
    if (session?.scheduled_at) {
      setRescheduleAt(toDateTimeLocalValue(session.scheduled_at));
    }
  }, [session?.scheduled_at]);

  useEffect(() => {
    setRescheduleReason(session?.reschedule_reason ?? "");
  }, [session?.reschedule_reason]);

  useEffect(() => {
    setCancellationReason(session?.cancellation_reason ?? "");
  }, [session?.cancellation_reason]);

  async function handleStatusChange(newStatus: SessionStatus) {
    if (!id) return;

    try {
      await updateSession.mutateAsync({
        id,
        data: {
          status: newStatus,
          actor: "admin",
          cancellation_reason:
            newStatus === "cancelled"
              ? cancellationReason.trim() || undefined
              : undefined,
        },
      });
      toast.success(`Sessão marcada como: ${STATUS_LABELS[newStatus]}`);
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao atualizar"
      );
    }
  }

  async function handleReschedule() {
    if (!id || !rescheduleAt) return;

    try {
      await updateSession.mutateAsync({
        id,
        data: {
          scheduled_at: new Date(rescheduleAt).toISOString(),
          status: "scheduled",
          reschedule_reason: rescheduleReason.trim() || undefined,
          actor: "admin",
        },
      });
      toast.success("Sessão remarcada.");
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao remarcar"
      );
    }
  }

  async function copyManageLink() {
    if (!session?.manage_token) {
      toast.error("Link de gestão indisponível.");
      return;
    }

    const manageUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/marcacao/${session.manage_token}`
        : "";

    try {
      await navigator.clipboard.writeText(manageUrl);
      toast.success("Link de gestão copiado.");
    } catch {
      toast.error("Não foi possível copiar o link.");
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">Sessão não encontrada</p>
        <Button asChild className="mt-4">
          <Link to="/admin/sessoes">Voltar</Link>
        </Button>
      </div>
    );
  }

  const transitions = STATUS_TRANSITIONS[session.status] ?? [];
  const manageUrl =
    typeof window !== "undefined" && session.manage_token
      ? `${window.location.origin}/marcacao/${session.manage_token}`
      : "";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/admin/sessoes">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-serif font-semibold">
              {getServiceLabel(session.service_type)}
            </h1>
            <p className="text-muted-foreground">
              {format(
                new Date(session.scheduled_at),
                "EEEE, d 'de' MMMM yyyy 'às' HH:mm",
                { locale: pt }
              )}
            </p>
          </div>
        </div>
        <Badge
          variant="secondary"
          className={`text-sm ${STATUS_COLORS[session.status] ?? ""}`}
        >
          {STATUS_LABELS[session.status] ?? session.status}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              <Link
                to={`/admin/clientes/${session.client.id}`}
                className="-mx-2 flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-muted/50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">
                    {session.client.first_name} {session.client.last_name}
                  </p>
                  {session.client.email && (
                    <p className="text-xs text-muted-foreground">
                      {session.client.email}
                    </p>
                  )}
                </div>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Detalhes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{formatDateTime(session.scheduled_at)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{session.duration_minutes} minutos</span>
              </div>
              {session.price_cents != null && (
                <div className="flex items-center gap-2 text-sm">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {(session.price_cents / 100).toFixed(2)}€
                    <Badge variant="outline" className="ml-2 text-xs">
                      {session.payment_status === "paid"
                        ? "Pago"
                        : session.payment_status === "refunded"
                          ? "Reembolsado"
                          : "Pendente"}
                    </Badge>
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Gestão da Marcação</CardTitle>
              <CardDescription>
                Link público, estado de reminders e sincronização do calendário.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Input value={manageUrl} readOnly placeholder="Link de gestão" />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start"
                  onClick={copyManageLink}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copiar link de gestão
                </Button>
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Calendário</span>
                  <Badge variant="outline">
                    {CALENDAR_LABELS[session.calendar_sync_status ?? "pending"] ??
                      session.calendar_sync_status ??
                      "Pendente"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Última sync</span>
                  <span>{formatDateTime(session.calendar_last_synced_at)}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Reminder</span>
                  <Badge variant="outline">
                    {REMINDER_LABELS[session.reminder_status ?? "pending"] ??
                      session.reminder_status ??
                      "Pendente"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Próximo reminder</span>
                  <span>{formatDateTime(session.next_reminder_due_at)}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Último reminder</span>
                  <span>{formatDateTime(session.last_reminder_sent_at)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {transitions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Ações rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {transitions.map((transition) => (
                  <Button
                    key={transition.status}
                    variant={
                      transition.status === "cancelled" ||
                      transition.status === "no_show"
                        ? "outline"
                        : "default"
                    }
                    className="w-full justify-start"
                    onClick={() => handleStatusChange(transition.status)}
                    disabled={updateSession.isPending}
                  >
                    <transition.icon className="mr-2 h-4 w-4" />
                    {transition.label}
                  </Button>
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Remarcação / Cancelamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nova data e hora</label>
                <Input
                  type="datetime-local"
                  value={rescheduleAt}
                  onChange={(event) => setRescheduleAt(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Motivo da remarcação</label>
                <Textarea
                  value={rescheduleReason}
                  onChange={(event) => setRescheduleReason(event.target.value)}
                  placeholder="Opcional"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                disabled={updateSession.isPending || !rescheduleAt}
                onClick={handleReschedule}
              >
                <CalendarClock className="mr-2 h-4 w-4" />
                Remarcar sessão
              </Button>

              <Separator />

              <div className="space-y-2">
                <label className="text-sm font-medium">Motivo do cancelamento</label>
                <Textarea
                  value={cancellationReason}
                  onChange={(event) => setCancellationReason(event.target.value)}
                  placeholder="Opcional"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start border-destructive/25 text-destructive hover:bg-destructive/5"
                disabled={updateSession.isPending}
                onClick={() => handleStatusChange("cancelled")}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Cancelar sessão
              </Button>
            </CardContent>
          </Card>

          {(session.reschedule_reason || session.cancellation_reason) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Histórico de motivo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {session.reschedule_reason && (
                  <div>
                    <p className="font-medium">Última remarcação</p>
                    <p className="text-muted-foreground">
                      {session.reschedule_reason}
                    </p>
                  </div>
                )}
                {session.cancellation_reason && (
                  <div>
                    <p className="font-medium">Último cancelamento</p>
                    <p className="text-muted-foreground">
                      {session.cancellation_reason}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {session.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notas Pré-Sessão</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm">{session.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="md:col-span-2">
          <SOAPNotesEditor
            sessionId={session.id}
            readOnly={
              session.status === "cancelled" || session.status === "no_show"
            }
          />
        </div>
      </div>
    </div>
  );
}
