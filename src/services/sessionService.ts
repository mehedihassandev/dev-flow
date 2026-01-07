import type { Session, SavedTab } from "../shared/types";
import { STORAGE_KEYS } from "../shared/constants";

/**
 * Get all currently open tabs across all windows
 */
export async function getCurrentTabs(): Promise<SavedTab[]> {
    const windows = await chrome.tabs.query({});

    return windows.map((tab) => ({
        id: tab.id!.toString(),
        url: tab.url || "",
        title: tab.title || "Untitled",
        favIconUrl: tab.favIconUrl,
        windowId: tab.windowId,
        index: tab.index,
    }));
}

/**
 * Save a new session to storage
 */
export async function saveSession(
    name: string,
    tabs: SavedTab[]
): Promise<Session> {
    const sessions = await getSessions();

    const newSession: Session = {
        id: crypto.randomUUID(),
        name,
        tabs,
        createdAt: Date.now(),
        updatedAt: Date.now(),
    };

    sessions.push(newSession);
    await chrome.storage.local.set({ [STORAGE_KEYS.SESSIONS]: sessions });

    return newSession;
}

/**
 * Get all saved sessions from storage
 */
export async function getSessions(): Promise<Session[]> {
    const result = await chrome.storage.local.get(STORAGE_KEYS.SESSIONS);
    return (result[STORAGE_KEYS.SESSIONS] as Session[]) || [];
}

/**
 * Delete a session by ID
 */
export async function deleteSession(id: string): Promise<void> {
    const sessions = await getSessions();
    const filtered = sessions.filter((s) => s.id !== id);
    await chrome.storage.local.set({ [STORAGE_KEYS.SESSIONS]: filtered });
}

/**
 * Update an existing session
 */
export async function updateSession(
    id: string,
    updates: Partial<Session>
): Promise<void> {
    const sessions = await getSessions();
    const index = sessions.findIndex((s) => s.id === id);

    if (index !== -1) {
        sessions[index] = {
            ...sessions[index],
            ...updates,
            updatedAt: Date.now(),
        };
        await chrome.storage.local.set({ [STORAGE_KEYS.SESSIONS]: sessions });
    }
}

/**
 * Restore a session by opening all tabs
 */
export async function restoreSession(
    session: Session,
    inNewWindow = false
): Promise<void> {
    if (inNewWindow) {
        // Create new window with first tab
        const firstTab = session.tabs[0];
        if (firstTab) {
            const newWindow = await chrome.windows.create({
                url: firstTab.url,
                focused: true,
            });

            // Open remaining tabs in the new window
            if (newWindow?.id) {
                for (let i = 1; i < session.tabs.length; i++) {
                    await chrome.tabs.create({
                        url: session.tabs[i].url,
                        windowId: newWindow.id,
                        active: false,
                    });
                }
            }
        }
    } else {
        // Open tabs in current window
        for (const tab of session.tabs) {
            await chrome.tabs.create({
                url: tab.url,
                active: false,
            });
        }
    }
}

/**
 * Restore specific tabs from a session
 */
export async function restoreTabs(
    tabs: SavedTab[],
    inNewWindow = false
): Promise<void> {
    if (inNewWindow && tabs.length > 0) {
        const firstTab = tabs[0];
        const newWindow = await chrome.windows.create({
            url: firstTab.url,
            focused: true,
        });

        if (newWindow?.id) {
            for (let i = 1; i < tabs.length; i++) {
                await chrome.tabs.create({
                    url: tabs[i].url,
                    windowId: newWindow.id,
                    active: false,
                });
            }
        }
    } else {
        for (const tab of tabs) {
            await chrome.tabs.create({
                url: tab.url,
                active: false,
            });
        }
    }
}

/**
 * Search sessions by name or URL content
 */
export async function searchSessions(query: string): Promise<Session[]> {
    const sessions = await getSessions();
    const lowercaseQuery = query.toLowerCase().trim();

    if (!lowercaseQuery) {
        return sessions;
    }

    return sessions.filter((session) => {
        // Search in session name
        if (session.name.toLowerCase().includes(lowercaseQuery)) {
            return true;
        }

        // Search in tab URLs and titles
        return session.tabs.some(
            (tab) =>
                tab.url.toLowerCase().includes(lowercaseQuery) ||
                tab.title.toLowerCase().includes(lowercaseQuery)
        );
    });
}

/**
 * Auto-save current session for crash recovery
 */
export async function autoSaveCurrentSession(): Promise<void> {
    const tabs = await getCurrentTabs();

    if (tabs.length === 0) {
        return;
    }

    const autoSaveSession: Session = {
        id: "auto-save",
        name: "Auto-saved Session",
        tabs,
        createdAt: Date.now(),
        updatedAt: Date.now(),
    };

    await chrome.storage.local.set({ autoSaveSession });
}

/**
 * Get the auto-saved session for crash recovery
 */
export async function getAutoSavedSession(): Promise<Session | null> {
    const result = await chrome.storage.local.get("autoSaveSession");
    return (result.autoSaveSession as Session) || null;
}

/**
 * Clear the auto-saved session
 */
export async function clearAutoSavedSession(): Promise<void> {
    await chrome.storage.local.remove("autoSaveSession");
}
