import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface PublicUser {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  phone: string | null;
  email?: string | null;
  google_id?: string | null;
  auth_provider?: "local" | "google";
  is_profile_completed?: boolean;
  role: string;
  avatar?: string | null;
  created_at?: string;
}

interface UserAuthState {
  user: PublicUser | null;
  token: string | null;
  isAuthenticated: boolean;
  needsProfileCompletion: boolean;
  setUserAuth: (
    user: PublicUser,
    token: string,
    needsProfileCompletion?: boolean
  ) => void;
  logoutUser: () => void;
}

export const useUserAuthStore = create<UserAuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      needsProfileCompletion: false,
      setUserAuth: (user, token, needsProfileCompletion = false) =>
        set({
          user,
          token,
          isAuthenticated: true,
          needsProfileCompletion,
        }),
      logoutUser: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          needsProfileCompletion: false,
        }),
    }),
    {
      name: "student-user-auth-v2",
    }
  )
);
