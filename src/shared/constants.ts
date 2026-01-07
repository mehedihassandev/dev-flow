// Extension constants
import type { Tool, ToolId, Settings } from "./types";

export const EXTENSION_NAME = "DevFlow";
export const EXTENSION_VERSION = "1.0.0";

export const DEFAULT_SETTINGS: Settings = {
    theme: "dark",
    enabledTools: [
        "colors",
        "json",
        "timer",
        "base64",
        "regex",
        "generator",
        "lorem",
        "sessions",
    ],
    pomodoroWorkMinutes: 25,
    pomodoroBreakMinutes: 5,
};

export const STORAGE_KEYS = {
    SETTINGS: "settings",
    COLORS: "colors",
    PALETTES: "palettes",
    TIMER_STATE: "timerState",
    SESSIONS: "sessions",
} as const;

export const TOOLS: Tool[] = [
    {
        id: "colors",
        name: "Colors",
        description: "Color picker & contrast checker",
        icon: "palette",
        color: "pink",
    },
    {
        id: "json",
        name: "JSON",
        description: "JSON formatter & validator",
        icon: "braces",
        color: "orange",
    },
    {
        id: "timer",
        name: "Timer",
        description: "Pomodoro timer",
        icon: "clock",
        color: "red",
    },
    {
        id: "base64",
        name: "Base64",
        description: "Encode/Decode Base64",
        icon: "binary",
        color: "teal",
    },
    {
        id: "regex",
        name: "Regex",
        description: "Regex tester",
        icon: "regex",
        color: "amber",
    },
    {
        id: "generator",
        name: "Generator",
        description: "UUID & Hash generator",
        icon: "hash",
        color: "indigo",
    },
    {
        id: "lorem",
        name: "Lorem",
        description: "Lorem ipsum generator",
        icon: "text",
        color: "slate",
    },
    {
        id: "recorder",
        name: "Recorder",
        description: "Screen recorder",
        icon: "video",
        color: "rose",
    },
    {
        id: "sessions",
        name: "Sessions",
        description: "Tab & session manager",
        icon: "folders",
        color: "purple",
    },
];

export const TOOL_COLORS: Record<
    ToolId,
    { bg: string; text: string; border: string }
> = {
    colors: {
        bg: "bg-pink-500/20",
        text: "text-pink-400",
        border: "border-pink-500/30",
    },
    json: {
        bg: "bg-orange-500/20",
        text: "text-orange-400",
        border: "border-orange-500/30",
    },
    timer: {
        bg: "bg-red-500/20",
        text: "text-red-400",
        border: "border-red-500/30",
    },
    base64: {
        bg: "bg-teal-500/20",
        text: "text-teal-400",
        border: "border-teal-500/30",
    },
    regex: {
        bg: "bg-amber-500/20",
        text: "text-amber-400",
        border: "border-amber-500/30",
    },
    generator: {
        bg: "bg-indigo-500/20",
        text: "text-indigo-400",
        border: "border-indigo-500/30",
    },
    lorem: {
        bg: "bg-slate-500/20",
        text: "text-slate-400",
        border: "border-slate-500/30",
    },
    recorder: {
        bg: "bg-rose-500/20",
        text: "text-rose-400",
        border: "border-rose-500/30",
    },
    sessions: {
        bg: "bg-purple-500/20",
        text: "text-purple-400",
        border: "border-purple-500/30",
    },
    home: {
        bg: "bg-indigo-500/20",
        text: "text-indigo-400",
        border: "border-indigo-500/30",
    },
};
