import { useEffect, useState } from "react";
import { useSessionStore } from "../../stores/sessionStore";
import { Icon } from "../Icon";
import SessionCard from "../ui/SessionCard";
import TabItem from "../ui/TabItem";
import {
    hasCrashRecoverySession,
    getCrashRecoverySession,
    dismissCrashRecovery,
} from "../../../services/crashRecovery";
import type { Session } from "../../../shared/types";

export default function SessionManager() {
    const {
        sessions,
        currentTabs,
        selectedTabs,
        searchQuery,
        isLoading,
        loadSessions,
        loadCurrentTabs,
        saveCurrentSession,
        saveSelectedTabs,
        deleteSession,
        restoreSession,
        toggleTabSelection,
        clearSelection,
        selectAll,
        setSearchQuery,
        updateSessionName,
    } = useSessionStore();

    const [view, setView] = useState<"current" | "saved">("saved");
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [sessionName, setSessionName] = useState("");
    const [showCrashRecovery, setShowCrashRecovery] = useState(false);
    const [crashRecoverySession, setCrashRecoverySession] =
        useState<Session | null>(null);

    const checkCrashRecovery = async () => {
        const hasCrash = await hasCrashRecoverySession();
        if (hasCrash) {
            const session = await getCrashRecoverySession();
            if (session && session.tabs.length > 0) {
                setCrashRecoverySession(session);
                setShowCrashRecovery(true);
            }
        }
    };

    useEffect(() => {
        loadSessions();
        loadCurrentTabs();
        checkCrashRecovery();

        // Refresh current tabs periodically
        const interval = setInterval(loadCurrentTabs, 2000);
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleRestoreCrashRecovery = async () => {
        if (crashRecoverySession) {
            await restoreSession(crashRecoverySession, true);
            await dismissCrashRecovery();
            setShowCrashRecovery(false);
        }
    };

    const handleDismissCrashRecovery = async () => {
        await dismissCrashRecovery();
        setShowCrashRecovery(false);
    };

    const handleSaveSession = async () => {
        if (!sessionName.trim()) return;

        if (selectedTabs.size > 0) {
            await saveSelectedTabs(sessionName.trim());
        } else {
            await saveCurrentSession(sessionName.trim());
        }

        setSessionName("");
        setShowSaveDialog(false);
        clearSelection();
    };

    const handleOpenTab = (url: string) => {
        chrome.tabs.create({ url, active: false });
    };

    const handleCopyUrl = (url: string) => {
        navigator.clipboard.writeText(url);
    };

    const filteredSessions = sessions.filter((session) => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return (
            session.name.toLowerCase().includes(query) ||
            session.tabs.some(
                (tab) =>
                    tab.title.toLowerCase().includes(query) ||
                    tab.url.toLowerCase().includes(query)
            )
        );
    });

    const selectedCount = selectedTabs.size;
    const allSelected =
        currentTabs.length > 0 && selectedCount === currentTabs.length;

    return (
        <div className="flex flex-col h-full">
            {/* Crash Recovery Banner */}
            {showCrashRecovery && crashRecoverySession && (
                <div className="bg-amber-500/10 rounded-xl p-4 mb-4">
                    <div className="flex items-start gap-3">
                        <Icon
                            name="alert-triangle"
                            className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-amber-400 mb-1">
                                Session Recovery Available
                            </h3>
                            <p className="text-xs text-amber-300/80 mb-3">
                                It looks like Chrome closed unexpectedly.
                                Restore your previous session with{" "}
                                {crashRecoverySession.tabs.length} tabs?
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleRestoreCrashRecovery}
                                    className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/25 rounded-lg text-xs font-medium text-amber-400 transition-colors"
                                >
                                    Restore Session
                                </button>
                                <button
                                    onClick={handleDismissCrashRecovery}
                                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-gray-400 transition-colors"
                                >
                                    Dismiss
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="mb-4">
                <h1 className="text-lg font-bold text-white mb-0.5">
                    Session Manager
                </h1>
                <p className="text-xs text-gray-600">
                    Save and restore collections of tabs
                </p>
            </div>

            {/* View Toggle */}
            <div className="flex gap-2 mb-4">
                <button
                    onClick={() => setView("saved")}
                    className={`flex-1 px-3 py-2 rounded-lg font-medium text-xs transition-all flex items-center justify-center gap-1.5 ${
                        view === "saved"
                            ? "bg-purple-500/10 text-purple-400"
                            : "bg-white/[0.02] text-gray-500 hover:bg-white/5 hover:text-gray-400"
                    }`}
                >
                    Saved Sessions
                </button>
                <button
                    onClick={() => setView("current")}
                    className={`flex-1 px-3 py-2 rounded-lg font-medium text-xs transition-all flex items-center justify-center gap-1.5 ${
                        view === "current"
                            ? "bg-purple-500/10 text-purple-400"
                            : "bg-white/[0.02] text-gray-500 hover:bg-white/5 hover:text-gray-400"
                    }`}
                >
                    <span>
                        Current Tabs
                        {currentTabs.length > 0 && (
                            <span className="ml-1.5 text-xs opacity-60">
                                ({currentTabs.length})
                            </span>
                        )}
                    </span>
                </button>
            </div>

            {/* Saved Sessions View */}
            {view === "saved" && (
                <>
                    {/* Search Bar */}
                    <div className="mb-4">
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search sessions..."
                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Sessions List */}
                    <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="text-gray-400">
                                    Loading sessions...
                                </div>
                            </div>
                        ) : filteredSessions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Icon
                                    name="folders"
                                    className="w-12 h-12 text-gray-600 mb-3"
                                />
                                <p className="text-gray-400 mb-2">
                                    {searchQuery
                                        ? "No sessions found"
                                        : "No saved sessions yet"}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {searchQuery
                                        ? "Try a different search term"
                                        : "Switch to Current Tabs to save your first session"}
                                </p>
                            </div>
                        ) : (
                            filteredSessions.map((session) => (
                                <SessionCard
                                    key={session.id}
                                    session={session}
                                    onRestore={restoreSession}
                                    onDelete={deleteSession}
                                    onRename={updateSessionName}
                                />
                            ))
                        )}
                    </div>
                </>
            )}

            {/* Current Tabs View */}
            {view === "current" && (
                <>
                    {/* Actions Bar */}
                    <div className="flex items-center gap-2 mb-4">
                        <button
                            onClick={() => {
                                if (allSelected) {
                                    clearSelection();
                                } else {
                                    selectAll();
                                }
                            }}
                            className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-gray-300 transition-colors"
                        >
                            {allSelected ? "Deselect All" : "Select All"}
                        </button>

                        <div className="flex-1" />

                        {selectedCount > 0 && (
                            <span className="text-xs text-gray-400">
                                {selectedCount} selected
                            </span>
                        )}

                        <button
                            onClick={() => setShowSaveDialog(true)}
                            className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg font-medium text-xs text-purple-400 transition-colors"
                        >
                            Save {selectedCount > 0 ? "Selected" : "All"}
                        </button>
                    </div>

                    {/* Current Tabs List */}
                    <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                        {currentTabs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Icon
                                    name="tabs"
                                    className="w-12 h-12 text-gray-600 mb-3"
                                />
                                <p className="text-gray-400">No open tabs</p>
                            </div>
                        ) : (
                            currentTabs.map((tab) => (
                                <TabItem
                                    key={tab.id}
                                    tab={tab}
                                    selected={selectedTabs.has(tab.id)}
                                    showCheckbox={true}
                                    onToggleSelect={toggleTabSelection}
                                    onOpen={handleOpenTab}
                                    onCopyUrl={handleCopyUrl}
                                />
                            ))
                        )}
                    </div>
                </>
            )}

            {/* Save Dialog */}
            {showSaveDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-6 w-full max-w-md mx-4">
                        <h2 className="text-lg font-semibold text-white mb-4">
                            Save Session
                        </h2>
                        <input
                            type="text"
                            value={sessionName}
                            onChange={(e) => setSessionName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleSaveSession();
                                if (e.key === "Escape")
                                    setShowSaveDialog(false);
                            }}
                            placeholder="Enter session name..."
                            autoFocus
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-4"
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={handleSaveSession}
                                disabled={!sessionName.trim()}
                                className="flex-1 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg font-medium text-sm text-purple-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Save
                            </button>
                            <button
                                onClick={() => {
                                    setShowSaveDialog(false);
                                    setSessionName("");
                                }}
                                className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-300 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
