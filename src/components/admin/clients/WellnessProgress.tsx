import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useWellnessProgress,
  type WellnessDataPoint,
} from "@/hooks/useWellnessProgress";

const LINES = [
  { key: "feeling_physically", name: "Fisico", color: "#10B981" },
  { key: "feeling_psychologically", name: "Psicologico", color: "#3B82F6" },
  { key: "feeling_emotionally", name: "Emocional", color: "#EC4899" },
  { key: "feeling_energetically", name: "Energetico", color: "#F59E0B" },
] as const;

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const dateLabel = label
    ? format(new Date(label), "d MMM yyyy", { locale: pt })
    : "";

  return (
    <div className="rounded-lg border bg-background p-3 shadow-md">
      <p className="mb-2 text-xs font-medium text-muted-foreground">
        {dateLabel}
      </p>
      <div className="space-y-1">
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center gap-2 text-sm">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatXAxisTick(value: string): string {
  try {
    return format(new Date(value), "d MMM", { locale: pt });
  } catch {
    return value;
  }
}

interface WellnessProgressProps {
  clientId: string | undefined;
}

export default function WellnessProgress({ clientId }: WellnessProgressProps) {
  const { data, isLoading } = useWellnessProgress(clientId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Progresso de Bem-Estar</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Progresso de Bem-Estar</CardTitle>
          <CardDescription>
            Evolucao das escalas ao longo das sessoes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Sem dados de progresso
          </p>
        </CardContent>
      </Card>
    );
  }

  const chartData: Array<Record<string, unknown>> = data.map(
    (d: WellnessDataPoint) => ({
      date: d.date,
      feeling_physically: d.feeling_physically,
      feeling_psychologically: d.feeling_psychologically,
      feeling_emotionally: d.feeling_emotionally,
      feeling_energetically: d.feeling_energetically,
    })
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Progresso de Bem-Estar</CardTitle>
        <CardDescription>
          Evolucao das escalas ao longo das sessoes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              tickFormatter={formatXAxisTick}
              tick={{ fontSize: 11 }}
              className="text-muted-foreground"
            />
            <YAxis
              domain={[1, 10]}
              ticks={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
              tick={{ fontSize: 11 }}
              className="text-muted-foreground"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
            />
            {LINES.map((line) => (
              <Line
                key={line.key}
                type="monotone"
                dataKey={line.key}
                name={line.name}
                stroke={line.color}
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
                activeDot={{ r: 6 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
