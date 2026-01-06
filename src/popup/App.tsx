import { useAppStore } from "./stores";
import { EXTENSION_NAME } from "../shared/constants";
import { Sidebar } from "./components/Sidebar";
import { Icon } from "./components/Icon";
import {
    ColorTool,
    JSONFormatter,
    PomodoroTimer,
    Base64Tool,
    RegexTester,
    GeneratorTool,
    LoremGenerator,
    ScreenRecorder,
} from "./components/tools";

export default function App() {
    const { activeTab, setActiveTab } = useAppStore();

    const renderTool = () => {
        switch (activeTab) {
            case "colors":
                return <ColorTool />;
            case "json":
                return <JSONFormatter />;
            case "timer":
                return <PomodoroTimer />;
            case "base64":
                return <Base64Tool />;
            case "regex":
                return <RegexTester />;
            case "generator":
                return <GeneratorTool />;
            case "lorem":
                return <LoremGenerator />;
            case "recorder":
                return <ScreenRecorder />;
            default:
                return <ColorTool />;
        }
    };

    return (
        <div className="w-full h-screen bg-bg-dark text-text-primary flex overflow-hidden font-sans">
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-bg-dark relative">
                {/* Minimal Header */}
                <header className="h-12 px-4 flex items-center justify-between border-b border-border-subtle bg-bg-dark/50 backdrop-blur-sm z-10">
                    <button className="flex items-center gap-2 hover:bg-bg-subtle p-1.5 -ml-1.5 pr-2.5 rounded-lg transition-colors group border border-transparent hover:border-border-subtle">
                        <div className="w-6 h-6 rounded bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shadow-sm">
                            <span className="text-[10px] font-bold text-indigo-400">
                                D
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <h1 className="text-xs font-medium text-text-primary tracking-wide group-hover:text-white transition-colors">
                                {EXTENSION_NAME}
                            </h1>
                            <Icon
                                name="chevron-down"
                                size={12}
                                className="text-text-muted group-hover:text-text-primary transition-colors"
                            />
                        </div>
                    </button>
                    {/* Add window controls or extra actions here if needed */}
                </header>

                {/* Tool Render Area */}
                <main className="flex-1 overflow-hidden p-0 relative">
                    <div className="absolute inset-0 overflow-y-auto scrollbar-thin p-5 animate-fadeIn">
                        <div className="max-w-3xl mx-auto">{renderTool()}</div>
                    </div>
                </main>
            </div>

            {/* Sidebar (Right) */}
            <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
    );
}
