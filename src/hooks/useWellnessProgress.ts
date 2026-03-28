import { useQuery } from "@tanstack/react-query";

export interface WellnessDataPoint {
  date: string;
  feeling_physically: number | null;
  feeling_psychologically: number | null;
  feeling_emotionally: number | null;
  feeling_energetically: number | null;
}

export function useWellnessProgress(clientId: string | undefined) {
  return useQuery<WellnessDataPoint[]>({
    queryKey: ["wellness-progress", clientId],
    queryFn: async () => {
      const res = await fetch(`/api/clients/${clientId}/wellness`);
      if (!res.ok) throw new Error("Failed to fetch wellness progress");
      return res.json();
    },
    enabled: !!clientId,
  });
}
