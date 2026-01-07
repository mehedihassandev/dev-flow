import { openRecorderWindow } from "../utils/window";
import { initializeCrashRecovery } from "../services/crashRecovery";

// Background service worker for MV3
// Initialize crash recovery system
initializeCrashRecovery();

chrome.runtime.onInstalled.addListener(
    (details: chrome.runtime.InstalledDetails) => {
        if (details.reason === "install") {
            console.log("DevPro Toolkit installed!");
            // Initialize default settings
            chrome.storage.local.set({
                settings: {
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
                },
                colors: [],
                palettes: [],
            });
        }

        // Open side panel on action click
        chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
    }
);

// Font Inspector State
let isInspectorEnabled = false;

// Helper to check valid URL
const isValidUrl = (url?: string) => {
    if (!url) return false;
    const restrictedProtocols = [
        "chrome://",
        "edge://",
        "about:",
        "chrome-extension://",
        "edge-extension://",
    ];
    return !restrictedProtocols.some((protocol) => url.startsWith(protocol));
};

// Helper to inject and activate inspector on a tab
const manageInspector = async (tabId: number, enable: boolean) => {
    try {
        const tab = await chrome.tabs.get(tabId);
        if (!isValidUrl(tab.url)) return;

        if (!enable) {
            // Just send deactivate message
            chrome.tabs
                .sendMessage(tabId, {
                    type: "TOGGLE_FONT_INSPECTOR",
                    enabled: false,
                })
                .catch(() => {}); // Ignore errors if script not loaded
            return;
        }

        // To enable: Check if script exists, inject if needed, then activate
        const ping = async () => {
            try {
                await chrome.tabs.sendMessage(tabId, { type: "PING" });
                return true;
            } catch {
                return false;
            }
        };

        let loaded = await ping();

        if (!loaded) {
            try {
                await chrome.scripting.executeScript({
                    target: { tabId },
                    files: ["content.js"],
                });
                // Wait for script to initialize - increased for stability
                await new Promise((r) => setTimeout(r, 300));

                // Retry loop with backoff - more aggressive
                for (let i = 0; i < 5; i++) {
                    loaded = await ping();
                    if (loaded) break;
                    await new Promise((r) => setTimeout(r, 200 * (i + 1)));
                }
            } catch (e) {
                console.warn("Injection check failed:", e);
                // Continue anyway, maybe message will work
            }
            // If still not loaded, assume it might have worked but ping failed
            if (!loaded) loaded = true;
        }

        if (loaded) {
            chrome.tabs.sendMessage(tabId, {
                type: "TOGGLE_FONT_INSPECTOR",
                enabled: true,
            });
        }
    } catch (e) {
        console.error("Error managing inspector", e);
    }
};

// Tab Switching Listener
chrome.tabs.onActivated.addListener(async ({ tabId }) => {
    if (isInspectorEnabled) {
        await manageInspector(tabId, true);
    }
});

// Tab Update Listener (Navigation/Refresh)
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (isInspectorEnabled && changeInfo.status === "complete" && tab.active) {
        await manageInspector(tabId, true);
    }
});

// Listen for messages
chrome.runtime.onMessage.addListener(
    (
        message: { type: string; data?: unknown },
        _sender: chrome.runtime.MessageSender,
        sendResponse: (response?: unknown) => void
    ) => {
        if (message.type === "GET_SETTINGS") {
            chrome.storage.local.get(
                ["settings"],
                (result: { settings?: unknown }) => {
                    sendResponse(result.settings);
                }
            );
            return true;
        }

        if (message.type === "TOGGLE_INSPECTOR") {
            const shouldEnable = message.data as boolean;
            isInspectorEnabled = shouldEnable;

            // Broadcast state change to popup/others
            chrome.runtime
                .sendMessage({
                    type: "INSPECTOR_STATE_CHANGED",
                    enabled: isInspectorEnabled,
                })
                .catch(() => {});

            // Apply to current active tab immediately
            chrome.tabs
                .query({ active: true, currentWindow: true })
                .then(([tab]) => {
                    if (tab?.id) manageInspector(tab.id, isInspectorEnabled);
                });

            sendResponse({ success: true, enabled: isInspectorEnabled });
            return true;
        }

        if (message.type === "GET_INSPECTOR_STATUS") {
            sendResponse({ enabled: isInspectorEnabled });
            return true;
        }

        if (message.type === "TIMER_NOTIFICATION") {
            // Create notification for timer
            chrome.notifications?.create({
                type: "basic",
                iconUrl: "icons/128.png",
                title: "DevPro Toolkit",
                message: "Pomodoro session completed!",
            });
        }

        // Forward FONT_DETECTED to popup if needed, or just let popup listen directly
        // The popup listens to this message directly from content script usually,
        // but we can proxy it if needed. For now, direct comms is fine.

        return false;
    }
);

// Listen for commands
chrome.commands.onCommand.addListener(async (command) => {
    if (command === "open_recorder") {
        await openRecorderWindow();
    }
});

export {};
