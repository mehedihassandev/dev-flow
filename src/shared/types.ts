// Shared TypeScript types for the extension

export interface Settings {
    theme: "light" | "dark";
    enabledTools: ToolId[];
    pomodoroWorkMinutes: number;
    pomodoroBreakMinutes: number;
}

export type ToolId =
    | "colors"
    | "json"
    | "timer"
    | "base64"
    | "regex"
    | "generator"
    | "lorem"
    | "recorder"
    | "home";

export interface Tool {
    id: ToolId;
    name: string;
    description: string;
    icon: string;
    color: string;
}

// Color Tool Types
export interface SavedColor {
    id: string;
    hex: string;
    name?: string;
    createdAt: number;
}

export interface ColorPalette {
    id: string;
    name: string;
    colors: string[]; // hex values
    createdAt: number;
}

// Timer Types
export interface TimerState {
    isRunning: boolean;
    isBreak: boolean;
    timeRemaining: number; // in seconds
    sessionsCompleted: number;
}

// Storage Types
export interface StorageData {
    settings: Settings;
    colors: SavedColor[];
    palettes: ColorPalette[];
    timerState: TimerState;
}
