import { useParams, Link } from "react-router-dom";
import { useSession, useUpdateSession } from "@/hooks/useSessions";
import { SOAPNotesEditor } from "@/components/admin/sessions/SOAPNotesEditor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Calendar,
  Clock,
  CreditCard,
  User,
  CheckCircle,
  XCircle,
  Play,
} from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { toast } from "sonner";
import type { SessionStatus } from "@/lib/types/database.types";

const SERVICE_LABELS: Record<string, string> = {
  healing_wellness: "Sessão Healing & Wellness",
  pura_radiancia: "Imersão Pura Radiância",
  pure_earth_love: "Pure Earth Love",
  other: "Outro",
};

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

const STATUS_TRANSITIONS: Record<string, { label: string; status: SessionStatus; icon: typeof Play }[]> = {
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

export default function SessionDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: session, isLoading } = useSession(id);
  const updateSession = useUpdateSession();

  async function handleStatusChange(newStatus: SessionStatus) {
    if (!id) return;
    try {
      await updateSession.mutateAsync({ id, data: { status: newStatus } });
      toast.success(`Sessão marcada como: ${STATUS_LABELS[newStatus]}`);
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao atualizar"
      );
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Sessão não encontrada</p>
        <Button asChild className="mt-4">
          <Link to="/admin/sessoes">Voltar</Link>
        </Button>
      </div>
    );
  }

  const transitions = STATUS_TRANSITIONS[session.status] ?? [];

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
              {SERVICE_LABELS[session.service_type] ?? session.service_type}
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
                className="flex items-center gap-3 hover:bg-muted/50 -mx-2 px-2 py-2 rounded-md transition-colors"
              >
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">
                    {session.client.first_name}{" "}
                    {session.client.last_name}
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
                <span>
                  {format(
                    new Date(session.scheduled_at),
                    "d MMM yyyy, HH:mm",
                    { locale: pt }
                  )}
                </span>
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

          {transitions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Ações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {transitions.map((t) => (
                  <Button
                    key={t.status}
                    variant={
                      t.status === "cancelled" || t.status === "no_show"
                        ? "outline"
                        : "default"
                    }
                    className="w-full justify-start"
                    onClick={() => handleStatusChange(t.status)}
                    disabled={updateSession.isPending}
                  >
                    <t.icon className="h-4 w-4 mr-2" />
                    {t.label}
                  </Button>
                ))}
              </CardContent>
            </Card>
          )}

          {session.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Notas Pré-Sessão
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">
                  {session.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="md:col-span-2">
          <SOAPNotesEditor
            sessionId={session.id}
            readOnly={
              session.status === "cancelled" ||
              session.status === "no_show"
            }
          />
        </div>
      </div>
    </div>
  );
}
