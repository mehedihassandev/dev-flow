import { Icon } from "./Icon";
import { TOOLS } from "../../shared/constants";
import type { ToolId } from "../../shared/types";

type IconName =
    | "palette"
    | "braces"
    | "clock"
    | "binary"
    | "regex"
    | "hash"
    | "text"
    | "video";

interface SidebarProps {
    activeTab: ToolId;
    onTabChange: (tab: ToolId) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
    const getIconName = (toolId: ToolId): IconName => {
        const iconMap: Record<ToolId, IconName> = {
            colors: "palette",
            json: "braces",
            timer: "clock",
            base64: "binary",
            regex: "regex",
            generator: "hash",
            lorem: "text",
            recorder: "video",
        };
        return iconMap[toolId];
    };

    return (
        <div className="w-[48px] bg-bg-subtle border-l border-border-subtle flex flex-col items-center py-3 z-20">
            <div className="flex-1 flex flex-col items-center gap-1.5 overflow-y-auto scrollbar-none w-full">
                {TOOLS.map((tool) => {
                    const isActive = activeTab === tool.id;

                    return (
                        <button
                            key={tool.id}
                            onClick={() => onTabChange(tool.id)}
                            className={`
                                group relative w-8 h-8 rounded-md flex items-center justify-center transition-all duration-150
                                ${
                                    isActive
                                        ? "bg-bg-surface text-text-primary shadow-[0_0_0_1px_var(--color-border-active)]"
                                        : "text-text-muted hover:text-text-secondary hover:bg-bg-surface"
                                }
                            `}
                        >
                            <Icon name={getIconName(tool.id)} size={16} />

                            {/* Minimal Tooltip */}
                            <div className="absolute right-full mr-2 px-2 py-1 bg-bg-surface text-text-primary text-[10px] font-medium rounded border border-border-subtle opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 whitespace-nowrap z-50 pointer-events-none shadow-lg">
                                {tool.name}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
