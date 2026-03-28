import { useState } from "react";
import { Link } from "react-router-dom";
import { useSessions } from "@/hooks/useSessions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

const SERVICE_LABELS: Record<string, string> = {
  healing_wellness: "Healing & Wellness",
  pura_radiancia: "Pura Radiância",
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

export default function SessionList() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { data: sessions, isLoading } = useSessions(
    statusFilter !== "all" ? { status: statusFilter } : undefined
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-semibold">Sessões</h1>
          <p className="text-muted-foreground">
            Gerir as suas sessões e marcações
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/sessoes/nova">
            <Plus className="h-4 w-4 mr-2" />
            Nova Sessão
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os estados</SelectItem>
            <SelectItem value="scheduled">Agendadas</SelectItem>
            <SelectItem value="confirmed">Confirmadas</SelectItem>
            <SelectItem value="in_progress">Em Curso</SelectItem>
            <SelectItem value="completed">Concluídas</SelectItem>
            <SelectItem value="cancelled">Canceladas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : !sessions || sessions.length === 0 ? (
            <div className="text-center py-8">
              <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">
                Nenhuma sessão encontrada
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <Link
                  key={session.id}
                  to={`/admin/sessoes/${session.id}`}
                  className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-1">
                    <p className="font-medium">
                      {session.client.first_name}{" "}
                      {session.client.last_name}
                    </p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>
                        {SERVICE_LABELS[session.service_type] ??
                          session.service_type}
                      </span>
                      <span>·</span>
                      <span>{session.duration_minutes} min</span>
                      {session.price_cents != null && (
                        <>
                          <span>·</span>
                          <span>
                            {(session.price_cents / 100).toFixed(2)}€
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {format(
                          new Date(session.scheduled_at),
                          "d MMM yyyy",
                          { locale: pt }
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(
                          new Date(session.scheduled_at),
                          "HH:mm"
                        )}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={STATUS_COLORS[session.status] ?? ""}
                    >
                      {STATUS_LABELS[session.status] ?? session.status}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
