export type HackathonStatus =
  | "draft"
  | "upcoming"
  | "active"
  | "paused"
  | "finished"
  | "cancelled";

export type TaskStatus = "active" | "hidden" | "archived";

export type ParticipantStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "disqualified";

export interface HackathonTask {
  id: number;
  hackathon_id: number;
  title: string;
  description: string | null;
  max_score: number;
  deadline_at: string | null;
  order_index: number;
  status: TaskStatus;
  created_at: string;
  updated_at: string;
}

export interface HackathonParticipant {
  id: number;
  hackathon_id: number;
  full_name: string;
  username: string | null;
  phone: string | null;
  email: string | null;
  team_name: string | null;
  direction: string | null;
  status: ParticipantStatus;
  registered_at: string;
}

export interface Hackathon {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  status: HackathonStatus;
  registration_start_at: string | null;
  registration_end_at: string | null;
  start_at: string | null;
  end_at: string | null;
  max_participants: number | null;
  team_size_min: number;
  team_size_max: number;
  prize_pool: string | null;
  location: string | null;
  rules: string | null;
  banner: string | null;
  is_registration_open: boolean;
  created_by: number | null;
  created_at: string;
  updated_at: string;
  participants_count?: number;
  tasks_count?: number;
  tasks?: HackathonTask[];
  participants?: HackathonParticipant[];
}

export interface HackathonsListResponse {
  success: boolean;
  count: number;
  data: Hackathon[];
}

export interface HackathonDetailResponse {
  success: boolean;
  message?: string;
  data: Hackathon;
}

export interface CreateHackathonInput {
  title: string;
  description?: string;
  status?: HackathonStatus;
  registration_start_at?: string | null;
  registration_end_at?: string | null;
  start_at?: string | null;
  end_at?: string | null;
  max_participants?: number | null;
  team_size_min?: number;
  team_size_max?: number;
  prize_pool?: string;
  location?: string;
  rules?: string;
  is_registration_open?: boolean;
}

export interface UpdateHackathonInput extends Partial<CreateHackathonInput> {}

export interface CreateTaskInput {
  title: string;
  description?: string;
  max_score?: number;
  deadline_at?: string | null;
  order_index?: number;
}
