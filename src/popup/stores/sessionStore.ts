import { create } from "zustand";
import type { Session, SavedTab } from "../../shared/types";
import * as sessionService from "../../services/sessionService";

interface SessionStore {
    sessions: Session[];
    currentTabs: SavedTab[];
    selectedTabs: Set<string>;
    searchQuery: string;
    isLoading: boolean;

    // Actions
    loadSessions: () => Promise<void>;
    loadCurrentTabs: () => Promise<void>;
    saveCurrentSession: (name: string) => Promise<void>;
    saveSelectedTabs: (name: string) => Promise<void>;
    deleteSession: (id: string) => Promise<void>;
    restoreSession: (session: Session, inNewWindow?: boolean) => Promise<void>;
    restoreSelectedTabs: (inNewWindow?: boolean) => Promise<void>;
    toggleTabSelection: (tabId: string) => void;
    clearSelection: () => void;
    selectAll: () => void;
    setSearchQuery: (query: string) => void;
    updateSessionName: (id: string, name: string) => Promise<void>;
}

export const useSessionStore = create<SessionStore>((set, get) => ({
    sessions: [],
    currentTabs: [],
    selectedTabs: new Set(),
    searchQuery: "",
    isLoading: false,

    loadSessions: async () => {
        set({ isLoading: true });
        try {
            const sessions = await sessionService.getSessions();
            set({ sessions });
        } catch (error) {
            console.error("Failed to load sessions:", error);
        } finally {
            set({ isLoading: false });
        }
    },

    loadCurrentTabs: async () => {
        try {
            const currentTabs = await sessionService.getCurrentTabs();
            set({ currentTabs });
        } catch (error) {
            console.error("Failed to load current tabs:", error);
        }
    },

    saveCurrentSession: async (name: string) => {
        set({ isLoading: true });
        try {
            const { currentTabs } = get();
            await sessionService.saveSession(name, currentTabs);
            await get().loadSessions();
        } catch (error) {
            console.error("Failed to save session:", error);
        } finally {
            set({ isLoading: false });
        }
    },

    saveSelectedTabs: async (name: string) => {
        set({ isLoading: true });
        try {
            const { currentTabs, selectedTabs } = get();
            const tabsToSave = currentTabs.filter((tab) =>
                selectedTabs.has(tab.id)
            );
            await sessionService.saveSession(name, tabsToSave);
            await get().loadSessions();
            set({ selectedTabs: new Set() });
        } catch (error) {
            console.error("Failed to save selected tabs:", error);
        } finally {
            set({ isLoading: false });
        }
    },

    deleteSession: async (id: string) => {
        set({ isLoading: true });
        try {
            await sessionService.deleteSession(id);
            await get().loadSessions();
        } catch (error) {
            console.error("Failed to delete session:", error);
        } finally {
            set({ isLoading: false });
        }
    },

    restoreSession: async (session: Session, inNewWindow = false) => {
        try {
            await sessionService.restoreSession(session, inNewWindow);
        } catch (error) {
            console.error("Failed to restore session:", error);
        }
    },

    restoreSelectedTabs: async (inNewWindow = false) => {
        try {
            const { currentTabs, selectedTabs } = get();
            const tabsToRestore = currentTabs.filter((tab) =>
                selectedTabs.has(tab.id)
            );
            await sessionService.restoreTabs(tabsToRestore, inNewWindow);
            set({ selectedTabs: new Set() });
        } catch (error) {
            console.error("Failed to restore selected tabs:", error);
        }
    },

    toggleTabSelection: (tabId: string) => {
        set((state) => {
            const newSelection = new Set(state.selectedTabs);
            if (newSelection.has(tabId)) {
                newSelection.delete(tabId);
            } else {
                newSelection.add(tabId);
            }
            return { selectedTabs: newSelection };
        });
    },

    clearSelection: () => {
        set({ selectedTabs: new Set() });
    },

    selectAll: () => {
        const { currentTabs } = get();
        const allTabIds = new Set(currentTabs.map((tab) => tab.id));
        set({ selectedTabs: allTabIds });
    },

    setSearchQuery: (query: string) => {
        set({ searchQuery: query });
    },

    updateSessionName: async (id: string, name: string) => {
        set({ isLoading: true });
        try {
            await sessionService.updateSession(id, { name });
            await get().loadSessions();
        } catch (error) {
            console.error("Failed to update session name:", error);
        } finally {
            set({ isLoading: false });
        }
    },
}));
