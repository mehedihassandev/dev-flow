import { openRecorderWindow } from "../utils/window";

// Background service worker for MV3

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

// Listen for messages
chrome.runtime.onMessage.addListener(
    (
        message: { type: string; data?: unknown },
        _sender: chrome.runtime.MessageSender,
        sendResponse: (response?: unknown) => void
    ) => {
        console.log("Message received:", message);

        if (message.type === "GET_SETTINGS") {
            chrome.storage.local.get(
                ["settings"],
                (result: { settings?: unknown }) => {
                    sendResponse(result.settings);
                }
            );
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
