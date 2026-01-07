import type { SavedTab } from "../../../shared/types";
import { Icon } from "../Icon";

interface TabItemProps {
    tab: SavedTab;
    selected?: boolean;
    showCheckbox?: boolean;
    onToggleSelect?: (tabId: string) => void;
    onOpen?: (url: string) => void;
    onCopyUrl?: (url: string) => void;
}

export default function TabItem({
    tab,
    selected = false,
    showCheckbox = false,
    onToggleSelect,
    onOpen,
    onCopyUrl,
}: TabItemProps) {
    const handleOpen = () => {
        if (onOpen) {
            onOpen(tab.url);
        }
    };

    const handleCopyUrl = () => {
        if (onCopyUrl) {
            onCopyUrl(tab.url);
        }
    };

    const handleCheckboxChange = () => {
        if (onToggleSelect) {
            onToggleSelect(tab.id);
        }
    };

    // Get domain from URL
    const getDomain = (url: string) => {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname;
        } catch {
            return url;
        }
    };

    return (
        <div
            className={`group flex items-center gap-2.5 p-2 rounded-lg transition-all ${
                selected
                    ? "bg-purple-500/10"
                    : "bg-white/[0.02] hover:bg-white/5"
            }`}
        >
            {showCheckbox && (
                <input
                    type="checkbox"
                    checked={selected}
                    onChange={handleCheckboxChange}
                    className="w-3 h-3 rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500 focus:ring-offset-0 cursor-pointer"
                />
            )}

            <div className="flex-1 min-w-0">
                <div className="text-[11px] font-medium text-gray-200 truncate leading-tight">
                    {tab.title}
                </div>
                <div className="text-[10px] text-gray-500 truncate leading-tight mt-0.5">
                    {getDomain(tab.url)}
                </div>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={handleOpen}
                    className="p-1.5 rounded-md hover:bg-white/10 text-gray-500 hover:text-gray-300 transition-colors"
                    title="Open tab"
                >
                    <Icon name="external-link" className="w-3.5 h-3.5" />
                </button>
                <button
                    onClick={handleCopyUrl}
                    className="p-1.5 rounded-md hover:bg-white/10 text-gray-500 hover:text-gray-300 transition-colors"
                    title="Copy URL"
                >
                    <Icon name="copy" className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
}
