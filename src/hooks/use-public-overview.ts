"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import { api } from "@/lib/api";
import { SOCKET_URL } from "@/lib/constants";
import type { Hackathon } from "@/types/hackathon";
import type { PublicUser } from "@/store/use-user-auth-store";

export interface PublicOverviewData {
  usersCount: number;
  participantsCount: number;
  totalPeople: number;
  activeHackathonsCount: number;
  totalHackathonsCount: number;
  hackathons: Hackathon[];
}

export const PUBLIC_OVERVIEW_KEY = "public-overview";

export function usePublicOverviewQuery() {
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
    });

    const refresh = () => {
      queryClient.invalidateQueries({ queryKey: [PUBLIC_OVERVIEW_KEY] });
    };

    socket.on("user:registered", refresh);
    socket.on("hackathon:created", refresh);
    socket.on("hackathon:updated", refresh);
    socket.on("hackathon:deleted", refresh);
    socket.on("hackathon:task_created", refresh);
    socket.on("hackathon:task_deleted", refresh);
    socket.on("hackathon:tasks_cleared", refresh);
    socket.on("hackathon:participant_updated", refresh);
    socket.on("hackathon:participant_removed", refresh);

    return () => {
      socket.disconnect();
    };
  }, [queryClient]);

  return useQuery({
    queryKey: [PUBLIC_OVERVIEW_KEY],
    queryFn: async () => {
      const { data } = await api.get<{
        success: boolean;
        data: PublicOverviewData;
      }>("/public/overview");
      return data.data;
    },
  });
}

export function useUserLoginMutation() {
  return useMutation({
    mutationFn: async (payload: { username: string; password: string }) => {
      const { data } = await api.post<{
        success: boolean;
        data: { user: PublicUser; token: string };
      }>("/auth/login", payload);
      return data.data;
    },
  });
}

export function useUserRegisterMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      full_name: string;
      username: string;
      password: string;
    }) => {
      const { data } = await api.post<{
        success: boolean;
        data: { user: PublicUser; token: string };
      }>("/auth/register", payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PUBLIC_OVERVIEW_KEY] });
    },
  });
}
