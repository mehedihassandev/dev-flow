import { create } from "zustand";
import type { TimerState } from "../../shared/types";
import { getTimerState, saveTimerState } from "../../shared/storage";

interface TimerStore extends TimerState {
    workMinutes: number;
    breakMinutes: number;
    intervalId: number | null;

    // Actions
    loadState: () => Promise<void>;
    start: () => void;
    pause: () => void;
    reset: () => void;
    tick: () => void;
    setWorkMinutes: (minutes: number) => void;
    setBreakMinutes: (minutes: number) => void;
}

const DEFAULT_WORK_MINUTES = 25;
const DEFAULT_BREAK_MINUTES = 5;

export const useTimerStore = create<TimerStore>((set, get) => ({
    isRunning: false,
    isBreak: false,
    timeRemaining: DEFAULT_WORK_MINUTES * 60,
    sessionsCompleted: 0,
    workMinutes: DEFAULT_WORK_MINUTES,
    breakMinutes: DEFAULT_BREAK_MINUTES,
    intervalId: null,

    loadState: async () => {
        const state = await getTimerState();
        if (state) {
            set({
                isBreak: state.isBreak,
                timeRemaining: state.timeRemaining,
                sessionsCompleted: state.sessionsCompleted,
                isRunning: false, // Always start paused
            });
        }
    },

    start: () => {
        const { intervalId } = get();
        if (intervalId) return;

        const id = window.setInterval(() => {
            get().tick();
        }, 1000);

        set({ isRunning: true, intervalId: id });
    },

    pause: () => {
        const { intervalId, isBreak, timeRemaining, sessionsCompleted } = get();
        if (intervalId) {
            window.clearInterval(intervalId);
        }
        set({ isRunning: false, intervalId: null });

        // Save state
        saveTimerState({
            isRunning: false,
            isBreak,
            timeRemaining,
            sessionsCompleted,
        });
    },

    reset: () => {
        const { intervalId, workMinutes, isBreak, breakMinutes } = get();
        if (intervalId) {
            window.clearInterval(intervalId);
        }
        set({
            isRunning: false,
            intervalId: null,
            timeRemaining: isBreak ? breakMinutes * 60 : workMinutes * 60,
        });
    },

    tick: () => {
        const {
            timeRemaining,
            isBreak,
            workMinutes,
            breakMinutes,
            sessionsCompleted,
        } = get();

        if (timeRemaining <= 1) {
            // Timer finished
            if (!isBreak) {
                // Work session finished, start break
                set({
                    isBreak: true,
                    timeRemaining: breakMinutes * 60,
                    sessionsCompleted: sessionsCompleted + 1,
                });
                // Play notification sound
                try {
                    new Audio(
                        "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a18markup"
                    );
                } catch {
                    // Audio not available
                }
            } else {
                // Break finished, start work
                set({
                    isBreak: false,
                    timeRemaining: workMinutes * 60,
                });
            }
        } else {
            set({ timeRemaining: timeRemaining - 1 });
        }
    },

    setWorkMinutes: (minutes) => {
        const { isBreak } = get();
        set({
            workMinutes: minutes,
            timeRemaining: !isBreak ? minutes * 60 : get().timeRemaining,
        });
    },

    setBreakMinutes: (minutes) => {
        const { isBreak } = get();
        set({
            breakMinutes: minutes,
            timeRemaining: isBreak ? minutes * 60 : get().timeRemaining,
        });
    },
}));
