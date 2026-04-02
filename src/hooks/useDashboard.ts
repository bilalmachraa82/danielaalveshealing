import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api/admin-fetch";

interface DashboardStats {
  clients: { total: number; active: number };
  sessions: { this_month: number; upcoming: number };
  nps: { average: number | null; total_responses: number };
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => adminFetch<DashboardStats>("/api/dashboard/stats"),
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
    queryFn: () => adminFetch<PendingForm[]>("/api/dashboard/pending-forms"),
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
    queryFn: () => adminFetch<RecentSatisfaction[]>("/api/dashboard/recent-satisfaction"),
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
    queryFn: () => adminFetch<EmailLogEntry[]>("/api/dashboard/email-log"),
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
    queryFn: () => adminFetch<CalendarInboxEntry[]>("/api/dashboard/calendar-inbox"),
    refetchInterval: 60_000,
  });
}

export function useResolveInboxItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { inbox_id: string; action: "dismiss" | "get_for_create" }) =>
      adminFetch<CalendarInboxEntry | { success: true }>(
        "/api/dashboard/calendar-inbox-resolve",
        {
          method: "POST",
          body: JSON.stringify(params),
        }
      ),
    onSuccess: (_, variables) => {
      if (variables.action === "dismiss") {
        queryClient.invalidateQueries({ queryKey: ["calendar-inbox"] });
      }
    },
  });
}
