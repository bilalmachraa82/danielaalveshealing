import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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

export interface CalendarInboxEntry {
  id: string;
  google_event_id: string;
  summary: string;
  start_at: string;
  end_at: string;
  attendee_email: string | null;
  status: string;
  synced_at: string;
}

export function useCalendarInbox() {
  return useQuery({
    queryKey: ["calendar-inbox"],
    queryFn: async (): Promise<CalendarInboxEntry[]> => {
      const res = await fetch("/api/dashboard/calendar-inbox");
      if (!res.ok) throw new Error("Failed to fetch calendar inbox");
      return res.json();
    },
    refetchInterval: 60_000,
  });
}

export function useResolveInboxItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { inbox_id: string; action: "dismiss" | "get_for_create" }) => {
      const res = await fetch("/api/dashboard/calendar-inbox-resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      if (!res.ok) throw new Error("Failed to resolve inbox item");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-inbox"] });
    },
  });
}
