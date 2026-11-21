"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { SOCKET_URL } from "@/lib/constants";
import type {
  Admin,
  AdminFilters,
  AdminLoginInput,
  AdminLoginResponse,
  AdminSingleResponse,
  AdminsListResponse,
  CreateAdminInput,
  UpdateAdminInput,
} from "@/types/admin";

export const ADMINS_QUERY_KEY = "admins";

export function useAdminLoginMutation() {
  return useMutation({
    mutationFn: async (payload: AdminLoginInput) => {
      const { data } = await api.post<AdminLoginResponse>(
        "/admins/login",
        payload
      );
      return data;
    },
  });
}

export function useAdminsQuery(filters: AdminFilters = {}) {
  return useQuery({
    queryKey: [ADMINS_QUERY_KEY, filters],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (filters.search?.trim()) params.search = filters.search.trim();
      if (filters.role && filters.role !== "all") params.role = filters.role;
      if (filters.is_active && filters.is_active !== "all") {
        params.is_active = filters.is_active;
      }
      const { data } = await api.get<AdminsListResponse>("/admins", { params });
      return data;
    },
  });
}

export function useAdminDetailQuery(id: number | null) {
  return useQuery({
    queryKey: [ADMINS_QUERY_KEY, "detail", id],
    enabled: Boolean(id),
    queryFn: async () => {
      const { data } = await api.get<AdminSingleResponse>(`/admins/${id}`);
      return data.data;
    },
  });
}

export function useCreateAdminMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateAdminInput) => {
      const { data } = await api.post<AdminSingleResponse>("/admins", payload);
      return data;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Yangi admin muvaffaqiyatli qo'shildi");
      queryClient.invalidateQueries({ queryKey: [ADMINS_QUERY_KEY] });
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message || "Admin qo'shishda xatolik yuz berdi";
      toast.error(msg);
    },
  });
}

export function useUpdateAdminMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateAdminInput;
    }) => {
      const { data } = await api.patch<AdminSingleResponse>(
        `/admins/${id}`,
        payload
      );
      return data;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Admin ma'lumotlari yangilandi");
      queryClient.invalidateQueries({ queryKey: [ADMINS_QUERY_KEY] });
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message || "Adminni yangilashda xatolik yuz berdi";
      toast.error(msg);
    },
  });
}

export function useDeleteAdminMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.delete(`/admins/${id}`);
      return data;
    },
    onSuccess: (res) => {
      toast.success(res?.message || "Admin tizimdan o'chirildi");
      queryClient.invalidateQueries({ queryKey: [ADMINS_QUERY_KEY] });
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message || "Adminni o'chirishda xatolik yuz berdi";
      toast.error(msg);
    },
  });
}

export function useAdminSocket(token: string | null) {
  const queryClient = useQueryClient();
  const [connected, setConnected] = React.useState(false);
  const [lastEvent, setLastEvent] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!token) return;

    const socket: Socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      setConnected(true);
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    socket.on("admin:created", (admin: Admin) => {
      setLastEvent(`Yangi admin qo'shildi: @${admin.username}`);
      queryClient.invalidateQueries({ queryKey: [ADMINS_QUERY_KEY] });
    });

    socket.on("admin:updated", (admin: Admin) => {
      setLastEvent(`Admin yangilandi: @${admin.username}`);
      queryClient.invalidateQueries({ queryKey: [ADMINS_QUERY_KEY] });
    });

    socket.on("admin:deleted", (payload: { id: number; username?: string }) => {
      setLastEvent(`Admin o'chirildi: #${payload.id}`);
      queryClient.invalidateQueries({ queryKey: [ADMINS_QUERY_KEY] });
    });

    return () => {
      socket.disconnect();
    };
  }, [token, queryClient]);

  return { connected, lastEvent };
}
