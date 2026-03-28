import { useQuery } from "@tanstack/react-query";

interface DashboardStats {
  clients: { total: number; active: number };
  sessions: { this_month: number; upcoming: number };
  nps: { average: number | null; total_responses: number };
}

async function fetchDashboardStats(): Promise<DashboardStats> {
  const response = await fetch("/api/dashboard/stats");
  if (!response.ok) throw new Error("Failed to fetch stats");
  return response.json();
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: fetchDashboardStats,
  });
}

export interface PendingForm {
  id: string;
  type: "anamnesis" | "intake";
  client_name: string;
  form_type: string;
  sent_at: string;
}

export function usePendingForms() {
  return useQuery({
    queryKey: ["pending-forms"],
    queryFn: async (): Promise<PendingForm[]> => {
      const res = await fetch("/api/dashboard/pending-forms");
      if (!res.ok) throw new Error("Failed to fetch pending forms");
      return res.json();
    },
  });
}

export interface RecentSatisfaction {
  id: string;
  client_name: string;
  service_type: string;
  nps_score: number | null;
  comfort_rating: number | null;
  completed_at: string;
}

export function useRecentSatisfaction() {
  return useQuery({
    queryKey: ["recent-satisfaction"],
    queryFn: async (): Promise<RecentSatisfaction[]> => {
      const res = await fetch("/api/dashboard/recent-satisfaction");
      if (!res.ok) throw new Error("Failed to fetch satisfaction data");
      return res.json();
    },
  });
}

export interface EmailLogEntry {
  id: string;
  client_name: string;
  email_type: string;
  status: string;
  sent_at: string;
}

export function useEmailLog() {
  return useQuery({
    queryKey: ["email-log"],
    queryFn: async (): Promise<EmailLogEntry[]> => {
      const res = await fetch("/api/dashboard/email-log");
      if (!res.ok) throw new Error("Failed to fetch email log");
      return res.json();
    },
  });
}
