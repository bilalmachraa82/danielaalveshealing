import { useState, useCallback } from "react";
import Model from "react-body-highlighter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RotateCcw } from "lucide-react";
import type { BodyMapMarker } from "@/lib/types/database.types";

const MUSCLE_LABELS: Record<string, string> = {
  head: "Cabeça",
  neck: "Pescoço",
  chest: "Peito",
  abs: "Abdominais",
  obliques: "Oblíquos",
  biceps: "Bíceps",
  triceps: "Tríceps",
  forearm: "Antebraço",
  front_deltoids: "Ombros (frente)",
  back_deltoids: "Ombros (costas)",
  trapezius: "Trapézio",
  upper_back: "Costas (superior)",
  lower_back: "Lombar",
  gluteal: "Glúteos",
  quadriceps: "Quadríceps",
  hamstring: "Isquiotibiais",
  abductors: "Adutores",
  abductor: "Abdutores",
  knees: "Joelhos",
  calves: "Gémeos",
  left_soleus: "Sóleo esq.",
  right_soleus: "Sóleo dir.",
};

const INTENSITY_COLORS: Record<number, string> = {
  1: "#86EFAC",
  2: "#FDE047",
  3: "#FDBA74",
  4: "#FB923C",
  5: "#EF4444",
};

const INTENSITY_LABELS: Record<number, string> = {
  1: "Leve",
  2: "Moderado",
  3: "Médio",
  4: "Forte",
  5: "Muito Forte",
};

interface BodyMapProps {
  value: BodyMapMarker[];
  onChange: (markers: BodyMapMarker[]) => void;
  readOnly?: boolean;
}

export function BodyMap({ value, onChange, readOnly = false }: BodyMapProps) {
  const [currentIntensity, setCurrentIntensity] = useState<1 | 2 | 3 | 4 | 5>(3);

  const handleMuscleClick = useCallback(
    (muscle: { muscle: string; data?: { exercises?: string[] } }) => {
      if (readOnly) return;

      const muscleName = muscle.muscle;
      const existing = value.find((m) => m.muscle === muscleName);

      if (existing) {
        // Remove if clicked again
        onChange(value.filter((m) => m.muscle !== muscleName));
      } else {
        onChange([...value, { muscle: muscleName, intensity: currentIntensity }]);
      }
    },
    [value, onChange, currentIntensity, readOnly]
  );

  const modelData = value.map((marker) => ({
    name: `Intensidade ${marker.intensity}`,
    muscles: [marker.muscle] as any[],
    frequency: marker.intensity,
  })) as any[];

  const colorFunction = ((_fillObj: unknown, frequency: number) => {
    return INTENSITY_COLORS[frequency] ?? INTENSITY_COLORS[3];
  }) as any;

  return (
    <div className="space-y-4">
      {!readOnly && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground mr-1">
            Intensidade:
          </span>
          {([1, 2, 3, 4, 5] as const).map((level) => (
            <Button
              key={level}
              type="button"
              size="sm"
              variant={currentIntensity === level ? "default" : "outline"}
              onClick={() => setCurrentIntensity(level)}
              style={
                currentIntensity === level
                  ? { backgroundColor: INTENSITY_COLORS[level], color: level >= 4 ? "white" : "black" }
                  : {}
              }
              className="h-7 text-xs"
            >
              {level} - {INTENSITY_LABELS[level]}
            </Button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-2">Frente</p>
          <div className="flex justify-center">
            <Model
              data={modelData}
              style={{ width: "14rem" }}
              onClick={handleMuscleClick}
              highlightedColors={[colorFunction]}
              type="anterior"
            />
          </div>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-2">Costas</p>
          <div className="flex justify-center">
            <Model
              data={modelData}
              style={{ width: "14rem" }}
              onClick={handleMuscleClick}
              highlightedColors={[colorFunction]}
              type="posterior"
            />
          </div>
        </div>
      </div>

      {value.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              Zonas marcadas ({value.length})
            </p>
            {!readOnly && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onChange([])}
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Limpar
              </Button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {value.map((marker) => (
              <Badge
                key={marker.muscle}
                variant="outline"
                className="cursor-pointer"
                style={{
                  borderColor: INTENSITY_COLORS[marker.intensity],
                  backgroundColor: `${INTENSITY_COLORS[marker.intensity]}15`,
                }}
                onClick={() => {
                  if (!readOnly) {
                    onChange(
                      value.filter((m) => m.muscle !== marker.muscle)
                    );
                  }
                }}
              >
                {MUSCLE_LABELS[marker.muscle] ?? marker.muscle} (
                {marker.intensity})
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
