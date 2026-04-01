import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchSessions,
  fetchSession,
  createSession,
  updateSession,
  fetchManagedSession,
  fetchSessionNotes,
  upsertSessionNote,
  fetchTodaySessions,
  fetchUpcomingSessions,
  submitManagedSessionAction,
} from "@/lib/api/sessions";
import type {
  CreateSessionInput,
  UpdateSessionInput,
  SessionNoteInput,
  ManageSessionActionInput,
} from "@/lib/schemas/session.schema";

export function useSessions(filters?: {
  client_id?: string;
  status?: string;
  from?: string;
  to?: string;
}) {
  return useQuery({
    queryKey: ["sessions", filters],
    queryFn: () => fetchSessions(filters),
  });
}

export function useSession(id: string | undefined) {
  return useQuery({
    queryKey: ["sessions", id],
    queryFn: () => fetchSession(id!),
    enabled: !!id,
  });
}

export function useManagedSession(token: string | undefined) {
  return useQuery({
    queryKey: ["managed-session", token],
    queryFn: () => fetchManagedSession(token!),
    enabled: !!token,
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSessionInput) => createSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["today-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["upcoming-sessions"] });
    },
  });
}

export function useUpdateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSessionInput }) =>
      updateSession(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["sessions", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["today-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["upcoming-sessions"] });
    },
  });
}

export function useManagedSessionAction(token: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ManageSessionActionInput) =>
      submitManagedSessionAction(token!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["managed-session", token] });
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["today-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["upcoming-sessions"] });
    },
  });
}

export function useSessionNotes(sessionId: string | undefined) {
  return useQuery({
    queryKey: ["session-notes", sessionId],
    queryFn: () => fetchSessionNotes(sessionId!),
    enabled: !!sessionId,
  });
}

export function useUpsertSessionNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      data,
    }: {
      sessionId: string;
      data: SessionNoteInput;
    }) => upsertSessionNote(sessionId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["session-notes", variables.sessionId],
      });
    },
  });
}

export function useTodaySessions() {
  return useQuery({
    queryKey: ["today-sessions"],
    queryFn: fetchTodaySessions,
  });
}

export function useUpcomingSessions(limit = 5) {
  return useQuery({
    queryKey: ["upcoming-sessions", limit],
    queryFn: () => fetchUpcomingSessions(limit),
  });
}
