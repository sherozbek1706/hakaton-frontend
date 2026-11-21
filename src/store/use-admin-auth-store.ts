import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Admin } from "@/types/admin";

interface AdminAuthState {
  admin: Admin | null;
  token: string | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  setAuth: (admin: Admin, token: string) => void;
  updateCurrentAdmin: (admin: Partial<Admin>) => void;
  logout: () => void;
  setHasHydrated: (state: boolean) => void;
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set) => ({
      admin: null,
      token: null,
      isAuthenticated: false,
      hasHydrated: false,

      setAuth: (admin, token) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("access_token", token);
        }
        set({ admin, token, isAuthenticated: true });
      },

      updateCurrentAdmin: (updated) =>
        set((state) => ({
          admin: state.admin ? { ...state.admin, ...updated } : null,
        })),

      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("access_token");
        }
        set({ admin: null, token: null, isAuthenticated: false });
      },

      setHasHydrated: (state) => set({ hasHydrated: state }),
    }),
    {
      name: "admin-vault-auth",
      onRehydrateStorage: () => (state) => {
        if (state?.token && typeof window !== "undefined") {
          localStorage.setItem("access_token", state.token);
        }
        state?.setHasHydrated(true);
      },
    }
  )
);
