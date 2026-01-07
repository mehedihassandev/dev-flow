import {
    autoSaveCurrentSession,
    getAutoSavedSession,
    clearAutoSavedSession,
} from "./sessionService";

const AUTO_SAVE_INTERVAL = 5 * 60 * 1000; // 5 minutes
let autoSaveTimer: number | null = null;

/**
 * Initialize crash recovery system
 */
export function initializeCrashRecovery(): void {
    // Start auto-save timer
    startAutoSave();

    // Listen for browser shutdown
    chrome.runtime.onSuspend.addListener(() => {
        handleBrowserShutdown();
    });

    // Check for crash on startup
    checkForCrash();
}

/**
 * Start the auto-save timer
 */
function startAutoSave(): void {
    if (autoSaveTimer) {
        clearInterval(autoSaveTimer);
    }

    // Auto-save immediately
    autoSaveCurrentSession();

    // Then auto-save every 5 minutes
    autoSaveTimer = setInterval(() => {
        autoSaveCurrentSession();
    }, AUTO_SAVE_INTERVAL) as unknown as number;
}

/**
 * Stop the auto-save timer
 */
export function stopAutoSave(): void {
    if (autoSaveTimer) {
        clearInterval(autoSaveTimer);
        autoSaveTimer = null;
    }
}

/**
 * Handle browser shutdown - mark as clean shutdown
 */
async function handleBrowserShutdown(): Promise<void> {
    await chrome.storage.local.set({
        lastShutdown: Date.now(),
        cleanShutdown: true,
    });
}

/**
 * Check if the browser crashed on last session
 */
async function checkForCrash(): Promise<void> {
    const result = await chrome.storage.local.get([
        "cleanShutdown",
        "lastShutdown",
    ]);

    // If cleanShutdown was not set to true, it means browser crashed
    if (result.cleanShutdown !== true) {
        // Browser crashed - we have a recovery session available
        await chrome.storage.local.set({ hasCrashRecovery: true });
    } else {
        // Clean shutdown - clear recovery flag
        await chrome.storage.local.set({ hasCrashRecovery: false });
    }

    // Reset for next session
    await chrome.storage.local.set({ cleanShutdown: false });
}

/**
 * Check if there's a crash recovery session available
 */
export async function hasCrashRecoverySession(): Promise<boolean> {
    const result = await chrome.storage.local.get("hasCrashRecovery");
    return result.hasCrashRecovery === true;
}

/**
 * Get the crash recovery session
 */
export async function getCrashRecoverySession() {
    return await getAutoSavedSession();
}

/**
 * Clear the crash recovery flag and session
 */
export async function dismissCrashRecovery(): Promise<void> {
    await chrome.storage.local.set({ hasCrashRecovery: false });
    await clearAutoSavedSession();
}
