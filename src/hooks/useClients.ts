import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchClients,
  fetchClient,
  createClient,
  updateClient,
  deleteClient,
  fetchClientTags,
  addClientTag,
  removeClientTag,
  fetchTags,
} from "@/lib/api/clients";
import type { CreateClientInput, UpdateClientInput } from "@/lib/schemas/client.schema";

export function useClients(filters?: { status?: string; search?: string }) {
  return useQuery({
    queryKey: ["clients", filters],
    queryFn: () => fetchClients(filters),
  });
}

export function useClient(id: string | undefined) {
  return useQuery({
    queryKey: ["clients", id],
    queryFn: () => fetchClient(id!),
    enabled: !!id,
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateClientInput) => createClient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateClientInput }) =>
      updateClient(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["clients", variables.id] });
    },
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteClient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}

export function useClientTags(clientId: string | undefined) {
  return useQuery({
    queryKey: ["client-tags", clientId],
    queryFn: () => fetchClientTags(clientId!),
    enabled: !!clientId,
  });
}

export function useAddClientTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ clientId, tagId }: { clientId: string; tagId: string }) =>
      addClientTag(clientId, tagId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["client-tags", variables.clientId],
      });
    },
  });
}

export function useRemoveClientTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ clientId, tagId }: { clientId: string; tagId: string }) =>
      removeClientTag(clientId, tagId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["client-tags", variables.clientId],
      });
    },
  });
}

export function useTags() {
  return useQuery({
    queryKey: ["tags"],
    queryFn: fetchTags,
  });
}
