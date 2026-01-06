import { create } from "zustand";
import type { ToolId } from "../../shared/types";

interface AppState {
    activeTab: ToolId;
    setActiveTab: (tab: ToolId) => void;
    theme: "light" | "dark";
    setTheme: (theme: "light" | "dark") => void;
    toggleTheme: () => void;
}

export const useAppStore = create<AppState>((set) => ({
    activeTab: "home",
    setActiveTab: (tab) => set({ activeTab: tab }),
    theme: "dark",
    setTheme: (theme) => set({ theme }),
    toggleTheme: () =>
        set((state) => ({ theme: state.theme === "dark" ? "light" : "dark" })),
}));
