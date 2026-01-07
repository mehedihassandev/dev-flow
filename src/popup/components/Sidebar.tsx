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
    | "video"
    | "folders"
    | "home";

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
            sessions: "folders",
            recorder: "video",
            home: "home",
        };
        return iconMap[toolId];
    };

    const toolsList = TOOLS.filter((t) => t.id !== "recorder");
    const recorderTool = TOOLS.find((t) => t.id === "recorder");

    return (
        <div className="w-[48px] bg-bg-subtle border-l border-border-subtle flex flex-col items-center py-3 z-20">
            <div className="flex-1 flex flex-col items-center gap-1.5 overflow-y-auto scrollbar-none w-full">
                {/* Home Button */}
                <button
                    onClick={() => onTabChange("home")}
                    className={`
                        group relative w-8 h-8 rounded-md flex items-center justify-center transition-all duration-150 mb-2 mt-2
                        ${
                            activeTab === "home"
                                ? "bg-bg-surface text-text-primary shadow-[0_0_0_1px_var(--color-border-active)]"
                                : "text-text-muted hover:text-text-secondary hover:bg-bg-surface"
                        }
                    `}
                >
                    <Icon name="home" size={16} />
                    <div className="absolute right-full mr-2 px-2 py-1 bg-bg-surface text-text-primary text-[10px] font-medium rounded border border-border-subtle opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 whitespace-nowrap z-50 pointer-events-none shadow-lg">
                        Home
                    </div>
                </button>
                <div className="w-6 h-px bg-border-subtle mb-2" />

                {toolsList.map((tool) => {
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

            {/* Separator and Pinned Recorder */}
            {recorderTool && (
                <>
                    <div className="w-6 h-[1px] bg-border-subtle my-2" />

                    <button
                        onClick={() => {
                            import("../../utils/window").then(
                                ({ openRecorderWindow }) => {
                                    openRecorderWindow();
                                    window.close();
                                }
                            );
                        }}
                        className={`
                            group relative w-8 h-8 rounded-md flex items-center justify-center transition-all duration-150
                            text-rose-400 hover:text-rose-300 hover:bg-rose-500/10
                        `}
                    >
                        <Icon name="video" size={16} />

                        {/* Minimal Tooltip */}
                        <div className="absolute right-full mr-2 px-2 py-1 bg-bg-surface text-text-primary text-[10px] font-medium rounded border border-border-subtle opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 whitespace-nowrap z-50 pointer-events-none shadow-lg">
                            {recorderTool.name}
                        </div>
                    </button>
                </>
            )}
        </div>
    );
}
