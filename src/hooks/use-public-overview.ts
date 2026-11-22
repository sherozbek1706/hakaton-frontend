"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import { api } from "@/lib/api";
import { SOCKET_URL } from "@/lib/constants";
import type {
  Hackathon,
  HackathonParticipant,
  HackathonTask,
  ParticipantStatus,
} from "@/types/hackathon";
import type { PublicUser } from "@/store/use-user-auth-store";

export interface PublicOverviewData {
  usersCount: number;
  participantsCount: number;
  totalPeople: number;
  activeHackathonsCount: number;
  totalHackathonsCount: number;
  hackathons: Hackathon[];
}

export interface MyRegisteredHackathon extends Hackathon {
  participant_id: number;
  hackathon_id: number;
  team_name: string | null;
  direction: string | null;
  participant_status: ParticipantStatus;
  registered_at: string;
}

export interface HackathonSubmission {
  id: number;
  hackathon_id: number;
  task_id: number;
  user_id: number;
  project_name: string | null;
  project_description: string | null;
  project_link: string | null;
  project_image: string | null;
  project_zip: string | null;
  edit_count: number;
  score: number | null;
  submitted_at: string;
  updated_at: string;
}

export interface HackathonWorkspaceData {
  hackathon: Hackathon;
  isRegistered: boolean;
  participant: HackathonParticipant | null;
  tasks: HackathonTask[];
  submissions: HackathonSubmission[];
  isWithinLast10Hours: boolean;
}

export interface AuthResponsePayload {
  user: PublicUser;
  token: string;
  needsProfileCompletion: boolean;
}

export const PUBLIC_OVERVIEW_KEY = "public-overview";
export const PUBLIC_HACKATHONS_KEY = "public-hackathons";
export const MY_HACKATHONS_KEY = "my-hackathons";
export const HACKATHON_WORKSPACE_KEY = "hackathon-workspace";

export function usePublicOverviewQuery() {
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
    });

    const refresh = () => {
      queryClient.invalidateQueries({ queryKey: [PUBLIC_OVERVIEW_KEY] });
      queryClient.invalidateQueries({ queryKey: [PUBLIC_HACKATHONS_KEY] });
      queryClient.invalidateQueries({ queryKey: [MY_HACKATHONS_KEY] });
      queryClient.invalidateQueries({ queryKey: [HACKATHON_WORKSPACE_KEY] });
    };

    socket.on("user:registered", refresh);
    socket.on("user:deleted", refresh);
    socket.on("hackathon:created", refresh);
    socket.on("hackathon:updated", refresh);
    socket.on("hackathon:deleted", refresh);
    socket.on("hackathon:task_created", refresh);
    socket.on("hackathon:task_deleted", refresh);
    socket.on("hackathon:tasks_cleared", refresh);
    socket.on("hackathon:participant_updated", refresh);
    socket.on("hackathon:participant_removed", refresh);
    socket.on("hackathon:submission_updated", refresh);

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

export function usePublicHackathonsQuery(
  filters: {
    search?: string;
    status?: string;
  } = {}
) {
  return useQuery({
    queryKey: [PUBLIC_HACKATHONS_KEY, filters],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (filters.search?.trim()) params.search = filters.search.trim();
      if (filters.status && filters.status !== "all") {
        params.status = filters.status;
      }
      const { data } = await api.get<{
        success: boolean;
        count: number;
        data: Hackathon[];
      }>("/public/hackathons", { params });
      return data.data;
    },
  });
}

export function useMyHackathonsQuery(token: string | null) {
  return useQuery({
    queryKey: [MY_HACKATHONS_KEY, token],
    enabled: Boolean(token),
    queryFn: async () => {
      const { data } = await api.get<{
        success: boolean;
        count: number;
        data: MyRegisteredHackathon[];
      }>("/public/my-hackathons", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return data.data;
    },
  });
}

export function useHackathonWorkspaceQuery(
  hackathonId: number | null,
  token: string | null
) {
  return useQuery({
    queryKey: [HACKATHON_WORKSPACE_KEY, hackathonId, token],
    enabled: Boolean(hackathonId && token),
    queryFn: async () => {
      const { data } = await api.get<{
        success: boolean;
        data: HackathonWorkspaceData;
      }>(`/public/hackathons/${hackathonId}/workspace`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return data.data;
    },
  });
}

export function useJoinHackathonMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      hackathonId,
      token,
      direction,
      team_name,
    }: {
      hackathonId: number;
      token: string;
      direction?: string;
      team_name?: string;
    }) => {
      const { data } = await api.post(
        `/public/hackathons/${hackathonId}/join`,
        { direction, team_name },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PUBLIC_OVERVIEW_KEY] });
      queryClient.invalidateQueries({ queryKey: [PUBLIC_HACKATHONS_KEY] });
      queryClient.invalidateQueries({ queryKey: [MY_HACKATHONS_KEY] });
      queryClient.invalidateQueries({ queryKey: [HACKATHON_WORKSPACE_KEY] });
    },
  });
}

export function useSubmitTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      hackathonId,
      taskId,
      token,
      formData,
    }: {
      hackathonId: number;
      taskId: number;
      token: string;
      formData: FormData;
    }) => {
      const { data } = await api.post(
        `/public/hackathons/${hackathonId}/tasks/${taskId}/submit`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [HACKATHON_WORKSPACE_KEY] });
    },
  });
}

export function useEditTaskSubmissionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      hackathonId,
      taskId,
      token,
      formData,
    }: {
      hackathonId: number;
      taskId: number;
      token: string;
      formData: FormData;
    }) => {
      const { data } = await api.patch(
        `/public/hackathons/${hackathonId}/tasks/${taskId}/submit`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [HACKATHON_WORKSPACE_KEY] });
    },
  });
}

export function useUserLoginMutation() {
  return useMutation({
    mutationFn: async (payload: { phone: string; pin: string }) => {
      const { data } = await api.post<{
        success: boolean;
        data: AuthResponsePayload;
      }>("/auth/login", payload);
      return data.data;
    },
  });
}

export function useUserRegisterMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      first_name: string;
      last_name: string;
      phone: string;
      pin: string;
    }) => {
      const { data } = await api.post<{
        success: boolean;
        data: AuthResponsePayload;
      }>("/auth/register", payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PUBLIC_OVERVIEW_KEY] });
    },
  });
}

export function useGoogleAuthMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      access_token?: string;
      credential?: string;
      email?: string;
      google_id?: string;
      first_name?: string;
      last_name?: string;
    }) => {
      const { data } = await api.post<{
        success: boolean;
        data: AuthResponsePayload;
      }>("/auth/google", payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PUBLIC_OVERVIEW_KEY] });
    },
  });
}

export function useCompleteProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      token,
      payload,
    }: {
      token: string;
      payload: {
        first_name: string;
        last_name: string;
        phone: string;
        pin: string;
      };
    }) => {
      const { data } = await api.post<{
        success: boolean;
        data: AuthResponsePayload;
      }>("/auth/complete-profile", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PUBLIC_OVERVIEW_KEY] });
    },
  });
}
