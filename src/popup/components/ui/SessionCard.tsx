import { useState } from "react";
import type { Session, SavedTab } from "../../../shared/types";
import { Icon } from "../Icon";
import TabItem from "./TabItem";

interface SessionCardProps {
    session: Session;
    onRestore: (session: Session, inNewWindow?: boolean) => void;
    onDelete: (id: string) => void;
    onRename: (id: string, name: string) => void;
}

export default function SessionCard({
    session,
    onRestore,
    onDelete,
    onRename,
}: SessionCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isRenaming, setIsRenaming] = useState(false);
    const [newName, setNewName] = useState(session.name);

    const handleRestore = () => {
        onRestore(session, false);
    };

    const handleRestoreNewWindow = () => {
        onRestore(session, true);
    };

    const handleDelete = () => {
        if (confirm(`Delete session "${session.name}"?`)) {
            onDelete(session.id);
        }
    };

    const handleRename = () => {
        if (newName.trim() && newName !== session.name) {
            onRename(session.id, newName.trim());
        }
        setIsRenaming(false);
    };

    const handleOpenTab = (url: string) => {
        chrome.tabs.create({ url, active: false });
    };

    const handleCopyUrl = (url: string) => {
        navigator.clipboard.writeText(url);
    };

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString();
    };

    return (
        <div className="group bg-white/[0.02] hover:bg-white/[0.04] rounded-xl overflow-hidden transition-all duration-200">
            <div className="p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                        {isRenaming ? (
                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                onBlur={handleRename}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleRename();
                                    if (e.key === "Escape") {
                                        setNewName(session.name);
                                        setIsRenaming(false);
                                    }
                                }}
                                autoFocus
                                className="w-full bg-white/5 border-0 rounded-lg px-2.5 py-1 text-sm font-semibold text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                            />
                        ) : (
                            <h3
                                className="text-[13px] font-semibold text-white truncate cursor-pointer hover:text-purple-400 transition-colors"
                                onClick={() => setIsRenaming(true)}
                                title="Click to rename"
                            >
                                {session.name}
                            </h3>
                        )}
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-500">
                            <span>{session.tabs.length} tabs</span>
                            <span>•</span>
                            <span>{formatDate(session.createdAt)}</span>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-gray-300 transition-colors opacity-0 group-hover:opacity-100 flex items-center justify-center"
                    >
                        <Icon
                            name={isExpanded ? "chevron-up" : "chevron-down"}
                            className="w-3.5 h-3.5"
                        />
                    </button>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleRestore}
                        className="flex-1 px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/15 rounded-lg text-xs font-medium text-purple-400 hover:text-purple-300 transition-all flex items-center justify-center gap-1.5"
                    >
                        <span>Restore</span>
                    </button>
                    <button
                        onClick={handleRestoreNewWindow}
                        className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-gray-300 transition-colors flex items-center justify-center"
                        title="Restore in new window"
                    >
                        <Icon name="window" className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={handleDelete}
                        className="p-1.5 bg-white/5 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400 transition-colors flex items-center justify-center"
                        title="Delete session"
                    >
                        <Icon name="trash" className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {isExpanded && (
                <div className="border-t border-white/10 bg-black/20 p-4">
                    <div className="space-y-2">
                        {session.tabs.map((tab: SavedTab) => (
                            <TabItem
                                key={tab.id}
                                tab={tab}
                                onOpen={handleOpenTab}
                                onCopyUrl={handleCopyUrl}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
