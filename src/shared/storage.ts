// Chrome storage abstraction API
// Provides a unified interface for local storage

import type {
    StorageData,
    Settings,
    SavedColor,
    ColorPalette,
    TimerState,
} from "./types";
import { STORAGE_KEYS, DEFAULT_SETTINGS } from "./constants";

/**
 * Get data from chrome.storage.local
 */
export async function getStorage<K extends keyof StorageData>(
    key: K
): Promise<StorageData[K] | undefined> {
    return new Promise((resolve) => {
        const storageKey =
            STORAGE_KEYS[key.toUpperCase() as keyof typeof STORAGE_KEYS] || key;
        chrome.storage.local.get(
            [storageKey],
            (result: Record<string, unknown>) => {
                resolve(result[storageKey] as StorageData[K] | undefined);
            }
        );
    });
}

/**
 * Set data in chrome.storage.local
 */
export async function setStorage<K extends keyof StorageData>(
    key: K,
    value: StorageData[K]
): Promise<void> {
    return new Promise((resolve) => {
        const storageKey =
            STORAGE_KEYS[key.toUpperCase() as keyof typeof STORAGE_KEYS] || key;
        chrome.storage.local.set({ [storageKey]: value }, resolve);
    });
}

/**
 * Get all storage data
 */
export async function getAllStorage(): Promise<Partial<StorageData>> {
    return new Promise((resolve) => {
        chrome.storage.local.get(null, (result: Record<string, unknown>) => {
            resolve(result as Partial<StorageData>);
        });
    });
}

/**
 * Clear all storage data
 */
export async function clearStorage(): Promise<void> {
    return new Promise((resolve) => {
        chrome.storage.local.clear(resolve);
    });
}

// Settings
export async function getSettings(): Promise<Settings> {
    const settings = await getStorage("settings");
    return settings ?? DEFAULT_SETTINGS;
}

export async function updateSettings(
    updates: Partial<Settings>
): Promise<void> {
    const current = await getSettings();
    await setStorage("settings", { ...current, ...updates });
}

// Colors
export async function getColors(): Promise<SavedColor[]> {
    const colors = await getStorage("colors");
    return colors ?? [];
}

export async function saveColor(color: SavedColor): Promise<void> {
    const colors = await getColors();
    colors.unshift(color);
    await setStorage("colors", colors.slice(0, 50)); // Keep max 50 colors
}

export async function deleteColor(id: string): Promise<void> {
    const colors = await getColors();
    await setStorage(
        "colors",
        colors.filter((c) => c.id !== id)
    );
}

// Palettes
export async function getPalettes(): Promise<ColorPalette[]> {
    const palettes = await getStorage("palettes");
    return palettes ?? [];
}

export async function savePalette(palette: ColorPalette): Promise<void> {
    const palettes = await getPalettes();
    const index = palettes.findIndex((p) => p.id === palette.id);
    if (index >= 0) {
        palettes[index] = palette;
    } else {
        palettes.unshift(palette);
    }
    await setStorage("palettes", palettes);
}

export async function deletePalette(id: string): Promise<void> {
    const palettes = await getPalettes();
    await setStorage(
        "palettes",
        palettes.filter((p) => p.id !== id)
    );
}

// Timer State
export async function getTimerState(): Promise<TimerState | undefined> {
    return await getStorage("timerState");
}

export async function saveTimerState(state: TimerState): Promise<void> {
    await setStorage("timerState", state);
}

/**
 * Listen for storage changes
 */
export function onStorageChange(
    callback: (changes: { [key: string]: chrome.storage.StorageChange }) => void
): () => void {
    const listener = (changes: {
        [key: string]: chrome.storage.StorageChange;
    }) => {
        callback(changes);
    };
    chrome.storage.local.onChanged.addListener(listener);
    return () => chrome.storage.local.onChanged.removeListener(listener);
}

/**
 * Generate unique ID
 */
export function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
