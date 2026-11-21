import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface PublicUser {
  id: number;
  full_name: string;
  username: string;
  role: string;
  avatar?: string | null;
  created_at?: string;
}

interface UserAuthState {
  user: PublicUser | null;
  token: string | null;
  isAuthenticated: boolean;
  setUserAuth: (user: PublicUser, token: string) => void;
  logoutUser: () => void;
}

export const useUserAuthStore = create<UserAuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setUserAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      logoutUser: () =>
        set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: "student-user-auth",
    }
  )
);
