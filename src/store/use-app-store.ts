import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AppLang = "ru" | "uz";

interface AppState {
  sidebarOpen: boolean;
  lang: AppLang;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setLang: (lang: AppLang) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      lang: "ru",
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setLang: (lang) => set({ lang }),
    }),
    {
      name: "app-storage-v2",
    }
  )
);
