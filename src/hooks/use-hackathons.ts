"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type {
  CreateHackathonInput,
  CreateTaskInput,
  HackathonDetailResponse,
  HackathonStatus,
  HackathonsListResponse,
  ParticipantStatus,
  UpdateHackathonInput,
} from "@/types/hackathon";

export const HACKATHONS_QUERY_KEY = "hackathons";

export function useHackathonsQuery(filters: {
  search?: string;
  status?: string;
} = {}) {
  return useQuery({
    queryKey: [HACKATHONS_QUERY_KEY, filters],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (filters.search?.trim()) params.search = filters.search.trim();
      if (filters.status && filters.status !== "all") {
        params.status = filters.status;
      }
      const { data } = await api.get<HackathonsListResponse>("/hackathons", {
        params,
      });
      return data;
    },
  });
}

export function useHackathonDetailQuery(id: number | null) {
  return useQuery({
    queryKey: [HACKATHONS_QUERY_KEY, "detail", id],
    enabled: Boolean(id),
    queryFn: async () => {
      const { data } = await api.get<HackathonDetailResponse>(
        `/hackathons/${id}`
      );
      return data.data;
    },
  });
}

export function useCreateHackathonMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateHackathonInput) => {
      const { data } = await api.post<HackathonDetailResponse>(
        "/hackathons",
        payload
      );
      return data;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Hakaton muvaffaqiyatli yaratildi");
      queryClient.invalidateQueries({ queryKey: [HACKATHONS_QUERY_KEY] });
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message || "Hakaton yaratishda xatolik yuz berdi"
      );
    },
  });
}

export function useUpdateHackathonMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateHackathonInput;
    }) => {
      const { data } = await api.patch<HackathonDetailResponse>(
        `/hackathons/${id}`,
        payload
      );
      return data;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Hakaton yangilandi");
      queryClient.invalidateQueries({ queryKey: [HACKATHONS_QUERY_KEY] });
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message || "Hakatonni yangilashda xatolik"
      );
    },
  });
}

export function useUpdateHackathonStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      is_registration_open,
    }: {
      id: number;
      status?: HackathonStatus;
      is_registration_open?: boolean;
    }) => {
      const { data } = await api.patch<HackathonDetailResponse>(
        `/hackathons/${id}/status`,
        { status, is_registration_open }
      );
      return data;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Hakaton holati o'zgartirildi");
      queryClient.invalidateQueries({ queryKey: [HACKATHONS_QUERY_KEY] });
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message || "Holatni o'zgartirishda xatolik"
      );
    },
  });
}

export function useDeleteHackathonMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.delete(`/hackathons/${id}`);
      return data;
    },
    onSuccess: (res) => {
      toast.success(res?.message || "Hakaton o'chirildi");
      queryClient.invalidateQueries({ queryKey: [HACKATHONS_QUERY_KEY] });
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message || "Hakatonni o'chirishda xatolik"
      );
    },
  });
}

export function useCreateTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      hackathonId,
      payload,
    }: {
      hackathonId: number;
      payload: CreateTaskInput;
    }) => {
      const { data } = await api.post(
        `/hackathons/${hackathonId}/tasks`,
        payload
      );
      return data;
    },
    onSuccess: (res) => {
      toast.success(res?.message || "Vazifa qo'shildi");
      queryClient.invalidateQueries({ queryKey: [HACKATHONS_QUERY_KEY] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Vazifa qo'shishda xatolik");
    },
  });
}

export function useDeleteTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      hackathonId,
      taskId,
    }: {
      hackathonId: number;
      taskId: number;
    }) => {
      const { data } = await api.delete(
        `/hackathons/${hackathonId}/tasks/${taskId}`
      );
      return data;
    },
    onSuccess: (res) => {
      toast.success(res?.message || "Vazifa o'chirildi");
      queryClient.invalidateQueries({ queryKey: [HACKATHONS_QUERY_KEY] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Vazifani o'chirishda xatolik");
    },
  });
}

export function useClearAllTasksMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (hackathonId: number) => {
      const { data } = await api.delete(`/hackathons/${hackathonId}/tasks`);
      return data;
    },
    onSuccess: (res) => {
      toast.success(
        res?.message || "Hakatondagi barcha vazifalar o'chirildi"
      );
      queryClient.invalidateQueries({ queryKey: [HACKATHONS_QUERY_KEY] });
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message || "Vazifalarni o'chirishda xatolik"
      );
    },
  });
}

export function useUpdateParticipantStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      hackathonId,
      participantId,
      status,
    }: {
      hackathonId: number;
      participantId: number;
      status: ParticipantStatus;
    }) => {
      const { data } = await api.patch(
        `/hackathons/${hackathonId}/participants/${participantId}`,
        { status }
      );
      return data;
    },
    onSuccess: (res) => {
      toast.success(res?.message || "Ishtirokchi holati yangilandi");
      queryClient.invalidateQueries({ queryKey: [HACKATHONS_QUERY_KEY] });
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message || "Ishtirokchini yangilashda xatolik"
      );
    },
  });
}

export function useRemoveParticipantMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      hackathonId,
      participantId,
    }: {
      hackathonId: number;
      participantId: number;
    }) => {
      const { data } = await api.delete(
        `/hackathons/${hackathonId}/participants/${participantId}`
      );
      return data;
    },
    onSuccess: (res) => {
      toast.success(res?.message || "Ishtirokchi o'chirildi");
      queryClient.invalidateQueries({ queryKey: [HACKATHONS_QUERY_KEY] });
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message || "Ishtirokchini o'chirishda xatolik"
      );
    },
  });
}
