import { useQuery } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api/admin-fetch";
import { useDashboardStats } from "@/hooks/useDashboard";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MessageSquare, Star, ThumbsUp, Heart } from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

// ── Types ──────────────────────────────────────────────────────────────

interface SatisfactionResponse {
  id: string;
  client_name: string;
  service_type: string;
  nps_score: number | null;
  comfort_rating: number | null;
  would_rebook: boolean | null;
  completed_at: string;
}

interface SatisfactionStats {
  total_responses: number;
  avg_nps: number | null;
  avg_comfort: number | null;
  rebook_rate: number | null;
}

interface SatisfactionData {
  stats: SatisfactionStats;
  responses: SatisfactionResponse[];
}

// ── Data hook ──────────────────────────────────────────────────────────

function useSatisfactionData() {
  return useQuery({
    queryKey: ["satisfaction-full"],
    queryFn: () => adminFetch<SatisfactionData>("/api/dashboard/satisfaction"),
  });
}

// ── Helpers ────────────────────────────────────────────────────────────

function getNpsBadgeClass(score: number | null): string {
  if (score === null) return "bg-gray-100 text-gray-600";
  if (score >= 9) return "bg-green-100 text-green-800";
  if (score >= 7) return "bg-yellow-100 text-yellow-800";
  return "bg-red-100 text-red-800";
}

function getNpsColor(value: number | null): string {
  if (value === null) return "text-gray-400";
  if (value >= 9) return "text-green-600";
  if (value >= 7) return "text-yellow-600";
  return "text-red-600";
}

function formatPercent(value: number | null): string {
  if (value === null) return "--";
  return `${Math.round(value)}%`;
}

// ── Skeleton components ────────────────────────────────────────────────

function KpiCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-4 rounded" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-1" />
        <Skeleton className="h-3 w-24" />
      </CardContent>
    </Card>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((n) => (
        <div key={n} className="flex items-center justify-between rounded-lg border p-3">
          <div className="space-y-1 flex-1">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-24" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-12" />
            <Skeleton className="h-6 w-12" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────

export default function SatisfactionList() {
  const { data, isLoading, error } = useSatisfactionData();

  const stats = data?.stats;
  const responses = data?.responses ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-serif font-semibold">Satisfação</h1>
        <p className="text-muted-foreground">
          Respostas de satisfação dos clientes
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <KpiCardSkeleton />
            <KpiCardSkeleton />
            <KpiCardSkeleton />
            <KpiCardSkeleton />
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Respostas</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.total_responses ?? 0}
                </div>
                <p className="text-xs text-muted-foreground">inquéritos completos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">NPS Médio</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getNpsColor(stats?.avg_nps ?? null)}`}>
                  {stats?.avg_nps ?? "--"}
                </div>
                <p className="text-xs text-muted-foreground">Net Promoter Score</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Rebooking</CardTitle>
                <ThumbsUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatPercent(stats?.rebook_rate ?? null)}
                </div>
                <p className="text-xs text-muted-foreground">voltariam a marcar</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conforto Médio</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.avg_comfort ?? "--"}
                </div>
                <p className="text-xs text-muted-foreground">classificação de conforto</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Responses table */}
      <Card>
        <CardHeader>
          <CardTitle>Respostas</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton />
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-sm text-destructive">
                Erro ao carregar respostas de satisfação.
              </p>
            </div>
          ) : responses.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Nenhuma resposta ainda
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="text-center">NPS</TableHead>
                  <TableHead className="text-center">Conforto</TableHead>
                  <TableHead className="text-center">Voltaria a marcar</TableHead>
                  <TableHead className="text-right">Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {responses.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">
                      {entry.client_name.trim()}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="secondary"
                        className={getNpsBadgeClass(entry.nps_score)}
                      >
                        {entry.nps_score ?? "--"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {entry.comfort_rating ?? "--"}
                    </TableCell>
                    <TableCell className="text-center">
                      {entry.would_rebook === null ? (
                        <span className="text-muted-foreground">--</span>
                      ) : entry.would_rebook ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Sim
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-red-100 text-red-800">
                          Não
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {format(new Date(entry.completed_at), "d MMM yyyy", { locale: pt })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
