import { useState } from "react";
import { useDashboardStats, usePendingForms, useRecentSatisfaction, useCalendarInbox, useResolveInboxItem } from "@/hooks/useDashboard";
import { useTodaySessions, useUpcomingSessions } from "@/hooks/useSessions";
import { useQuickBooking } from "@/contexts/QuickBookingContext";
import { useTherapist } from "@/lib/config/therapist-context";
import { buildQuickBookingInitialData } from "@/lib/dashboard/calendar-inbox";
import { getServiceLabel } from "@/lib/config/services";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Calendar, Star, TrendingUp, ClipboardList, CheckCircle, CalendarPlus, Inbox } from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { Link } from "react-router-dom";

const SESSION_STATUS_COLORS: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-800",
  confirmed: "bg-green-100 text-green-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  completed: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
  no_show: "bg-orange-100 text-orange-800",
};

const SESSION_STATUS_LABELS: Record<string, string> = {
  scheduled: "Agendada",
  confirmed: "Confirmada",
  in_progress: "Em curso",
  completed: "Concluída",
  cancelled: "Cancelada",
  no_show: "Não compareceu",
};

const FORM_TYPE_LABELS: Record<string, string> = {
  anamnese: "Anamnese",
  healing_touch: "Healing Touch",
  pura_radiancia: "Pura Radiância",
};

const EMAIL_TYPE_LABELS: Record<string, string> = {
  anamnesis: "Anamnese",
  intake_healing: "Intake Healing",
  intake_immersion: "Intake Imersão",
  satisfaction: "Satisfação",
  review_request: "Pedido de Review",
  reminder: "Lembrete",
  rebooking: "Reagendamento",
  reactivation: "Reativação",
};

function getNpsColor(score: number | null): string {
  if (score === null) return "text-gray-400";
  if (score >= 9) return "text-green-600";
  if (score >= 7) return "text-yellow-600";
  return "text-red-600";
}

function getNpsBadgeClass(score: number | null): string {
  if (score === null) return "bg-gray-100 text-gray-600";
  if (score >= 9) return "bg-green-100 text-green-800";
  if (score >= 7) return "bg-yellow-100 text-yellow-800";
  return "bg-red-100 text-red-800";
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4 rounded" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-12 mb-1" />
        <Skeleton className="h-3 w-20" />
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const config = useTherapist();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: todaySessions, isLoading: todayLoading } = useTodaySessions();
  const { data: upcomingSessions } = useUpcomingSessions(5);
  const { data: pendingForms, isLoading: formsLoading } = usePendingForms();
  const { data: recentSatisfaction, isLoading: satLoading } = useRecentSatisfaction();
  const { openQuickBooking } = useQuickBooking();
  const { data: calendarInbox, isLoading: calendarInboxLoading, error: calendarInboxError } = useCalendarInbox();
  const resolveInboxItem = useResolveInboxItem();
  const [calendarActionId, setCalendarActionId] = useState<string | null>(null);

  async function handleCreateFromInbox(inboxId: string) {
    setCalendarActionId(inboxId);
    try {
      const payload = await resolveInboxItem.mutateAsync({
        inbox_id: inboxId,
        action: "get_for_create",
      });

      if ("summary" in payload) {
        openQuickBooking(buildQuickBookingInitialData(payload as { summary: string; attendee_email: string | null; start_at: string; end_at: string }));
      }
    } finally {
      setCalendarActionId(null);
    }
  }

  const totalClients = stats?.clients.total ?? 0;
  const activeClients = stats?.clients.active ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-semibold">Dashboard</h1>
          <p className="text-muted-foreground">
            Bem-vinda, Daniela. Aqui esta o resumo do seu dia.
          </p>
        </div>
        <Button
          onClick={openQuickBooking}
          className="text-white shrink-0"
          style={{ backgroundColor: config.colors.primary }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = config.colors.primaryHover; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = config.colors.primary; }}
        >
          <CalendarPlus className="h-4 w-4" />
          <span className="hidden sm:inline">Nova Marcacao</span>
          <span className="sm:hidden">Marcar</span>
        </Button>
      </div>

      {/* Metric cards — 1 col mobile / 2 tablet / 4 desktop */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Clientes
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalClients}</div>
                <p className="text-xs text-muted-foreground">
                  {activeClients} ativos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Próximas Sessões
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.sessions.upcoming ?? 0}
                </div>
                <p className="text-xs text-muted-foreground">agendadas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">NPS Médio</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getNpsColor(stats?.nps.average ?? null)}`}>
                  {stats?.nps.average ?? "--"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats?.nps.total_responses
                    ? `${stats.nps.total_responses} respostas`
                    : "sem dados ainda"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Este Mês</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.sessions.this_month ?? 0}
                </div>
                <p className="text-xs text-muted-foreground">sessões</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Main content — 1 col mobile / 2 cols tablet+ */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        {/* Sessões de Hoje */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4" style={{ color: config.colors.primary }} />
              Sessões de Hoje
            </CardTitle>
            <CardDescription>
              {todaySessions && todaySessions.length > 0
                ? `${todaySessions.length} sessão(ões) hoje`
                : "Agenda do dia"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {todayLoading ? (
              <div className="space-y-3">
                {[1, 2].map((n) => (
                  <div key={n} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
            ) : !todaySessions || todaySessions.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Nenhuma sessão hoje
              </p>
            ) : (
              <div className="space-y-2">
                {todaySessions.map((session) => (
                  <Link
                    key={session.id}
                    to={`/admin/sessoes/${session.id}`}
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {session.client.first_name} {session.client.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {getServiceLabel(session.service_type)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(session.scheduled_at), "HH:mm", { locale: pt })}
                      </span>
                      <Badge
                        variant="secondary"
                        className={SESSION_STATUS_COLORS[session.status] ?? ""}
                      >
                        {SESSION_STATUS_LABELS[session.status] ?? session.status}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Formulários Pendentes */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" style={{ color: config.colors.primary }} />
              Formulários Pendentes
            </CardTitle>
            <CardDescription>
              {pendingForms && pendingForms.length > 0
                ? `${pendingForms.length} formulário(s) por preencher`
                : "Formulários enviados aguardando resposta"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {formsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-5 w-16" />
                  </div>
                ))}
              </div>
            ) : !pendingForms || pendingForms.length === 0 ? (
              <div className="flex flex-col items-center py-4 gap-2 text-muted-foreground">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <p className="text-sm">Todos os formulários respondidos</p>
              </div>
            ) : (
              <div className="space-y-2">
                {pendingForms.map((form) => (
                  <div
                    key={`${form.type}-${form.id}`}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <p className="text-sm font-medium truncate">{form.client_name.trim()}</p>
                      <p className="text-xs text-muted-foreground">
                        {FORM_TYPE_LABELS[form.form_type] ?? form.form_type}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(form.sent_at), "d MMM", { locale: pt })}
                      </span>
                      <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                        Pendente
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Satisfação Recente */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-4 w-4" style={{ color: config.colors.primary }} />
              Satisfação Recente
            </CardTitle>
            <CardDescription>Últimas 5 respostas com NPS</CardDescription>
          </CardHeader>
          <CardContent>
            {satLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="flex items-center justify-between rounded-lg border p-3">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-6 w-8" />
                  </div>
                ))}
              </div>
            ) : !recentSatisfaction || recentSatisfaction.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Nenhuma resposta ainda
              </p>
            ) : (
              <div className="space-y-2">
                {recentSatisfaction.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <p className="text-sm font-medium truncate">{entry.client_name.trim()}</p>
                      <p className="text-xs text-muted-foreground">
                        {getServiceLabel(entry.service_type)}
                        {" · "}
                        {format(new Date(entry.completed_at), "d MMM", { locale: pt })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                      {entry.comfort_rating !== null && (
                        <span className="text-xs text-muted-foreground">
                          Conforto: {entry.comfort_rating}
                        </span>
                      )}
                      <Badge
                        variant="secondary"
                        className={getNpsBadgeClass(entry.nps_score)}
                      >
                        NPS {entry.nps_score ?? "—"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Próximas Sessões */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Próximas Sessões</CardTitle>
            <CardDescription>As sessões agendadas mais próximas</CardDescription>
          </CardHeader>
          <CardContent>
            {!upcomingSessions || upcomingSessions.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Nenhuma sessão agendada
              </p>
            ) : (
              <div className="space-y-2">
                {upcomingSessions.map((session) => (
                  <Link
                    key={session.id}
                    to={`/admin/sessoes/${session.id}`}
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {session.client.first_name} {session.client.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {getServiceLabel(session.service_type)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(session.scheduled_at), "d MMM, HH:mm", { locale: pt })}
                      </span>
                      <Badge
                        variant="secondary"
                        className={SESSION_STATUS_COLORS[session.status] ?? ""}
                      >
                        {SESSION_STATUS_LABELS[session.status] ?? session.status}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Calendário — Por Rever */}
        {calendarInboxLoading ? (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Inbox className="h-4 w-4" style={{ color: config.colors.primary }} />
                Calendário — Por Rever
              </CardTitle>
              <CardDescription>A carregar eventos do Google Calendar…</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[1, 2].map((item) => (
                <div key={item} className="flex items-center justify-between rounded-lg border p-3">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-9 w-28" />
                </div>
              ))}
            </CardContent>
          </Card>
        ) : calendarInboxError ? (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Inbox className="h-4 w-4" style={{ color: config.colors.primary }} />
                Calendário — Por Rever
              </CardTitle>
              <CardDescription>Não foi possível carregar a inbox do calendário.</CardDescription>
            </CardHeader>
          </Card>
        ) : calendarInbox && calendarInbox.length > 0 ? (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Inbox className="h-4 w-4" style={{ color: config.colors.primary }} />
                Calendário — Por Rever
                <Badge variant="secondary" className="bg-amber-100 text-amber-800 ml-1">
                  {calendarInbox.length}
                </Badge>
              </CardTitle>
              <CardDescription>
                Eventos do Google Calendar que não foram criados pelo CRM
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {calendarInbox.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <p className="text-sm font-medium truncate">{item.summary}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(item.start_at), "d MMM, HH:mm", { locale: pt })}
                        {item.attendee_email ? ` · ${item.attendee_email}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={resolveInboxItem.isPending}
                        onClick={() => resolveInboxItem.mutate({ inbox_id: item.id, action: "dismiss" })}
                      >
                        Dispensar
                      </Button>
                      <Button
                        size="sm"
                        className="text-white"
                        style={{ backgroundColor: config.colors.primary }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = config.colors.primaryHover; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = config.colors.primary; }}
                        disabled={resolveInboxItem.isPending || calendarActionId === item.id}
                        onClick={() => handleCreateFromInbox(item.id)}
                      >
                        {calendarActionId === item.id ? "A carregar…" : "Criar Sessão"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
