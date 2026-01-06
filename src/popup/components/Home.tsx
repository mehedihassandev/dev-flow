import { Button, Card, CardContent } from "./ui";
import { Icon } from "./Icon";
import { openRecorderWindow } from "../../utils/window";
import { useAppStore, useTimerStore } from "../stores";

export function Home() {
    const { setActiveTab } = useAppStore();
    const { isRunning, timeRemaining, sessionsCompleted, start, pause } =
        useTimerStore();

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs
            .toString()
            .padStart(2, "0")}`;
    };

    return (
        <div className="h-full flex flex-col space-y-4">
            {/* 1. Primary Feature: Screen Recorder */}
            <Card className="bg-linear-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20 shadow-lg shadow-emerald-900/10 hover:border-emerald-500/30 transition-all duration-300">
                <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                <Icon
                                    name="video"
                                    size={18}
                                    className="text-emerald-400"
                                />
                            </div>
                            <div>
                                <h3 className="font-medium text-emerald-100">
                                    Screen Recorder
                                </h3>
                                <p className="text-[10px] text-emerald-200/60">
                                    Ready to capture
                                </p>
                            </div>
                        </div>
                    </div>
                    <Button
                        onClick={() => {
                            openRecorderWindow();
                            window.close();
                        }}
                        className="w-full h-10 bg-emerald-500 hover:bg-emerald-600 text-black shadow-lg shadow-emerald-500/20 border-transparent"
                    >
                        Start Recording
                    </Button>
                </CardContent>
            </Card>

            {/* 2. Focus Timer Quick Action */}
            <Card className="bg-bg-surface/50 border-border-subtle hover:border-border-active transition-all duration-200">
                <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                isRunning
                                    ? "bg-red-500/10 text-red-400"
                                    : "bg-bg-subtle text-text-muted"
                            }`}
                        >
                            <Icon name="clock" size={20} />
                        </div>
                        <div>
                            <p className="text-xl font-mono font-medium text-text-primary tracking-wider">
                                {formatTime(timeRemaining)}
                            </p>
                            <p className="text-[10px] text-text-muted">
                                {sessionsCompleted} sessions completed
                            </p>
                        </div>
                    </div>
                    <Button
                        size="sm"
                        onClick={isRunning ? pause : start}
                        className={
                            isRunning
                                ? "bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20"
                                : "bg-white text-black hover:bg-gray-200 border-transparent"
                        }
                    >
                        {isRunning ? "Pause" : "Focus"}
                    </Button>
                </CardContent>
            </Card>

            {/* 3. Essential Utilities Shortcuts */}
            <div className="grid grid-cols-3 gap-3">
                <button
                    onClick={() => setActiveTab("colors")}
                    className="p-3 rounded-xl bg-bg-surface border border-border-subtle hover:border-pink-500/50 hover:bg-pink-500/5 transition-all group flex flex-col items-center gap-2"
                >
                    <Icon
                        name="palette"
                        size={20}
                        className="text-text-muted group-hover:text-pink-400 transition-colors"
                    />
                    <span className="text-[10px] font-medium text-text-muted group-hover:text-pink-300">
                        Colors
                    </span>
                </button>

                <button
                    onClick={() => setActiveTab("json")}
                    className="p-3 rounded-xl bg-bg-surface border border-border-subtle hover:border-orange-500/50 hover:bg-orange-500/5 transition-all group flex flex-col items-center gap-2"
                >
                    <Icon
                        name="braces"
                        size={20}
                        className="text-text-muted group-hover:text-orange-400 transition-colors"
                    />
                    <span className="text-[10px] font-medium text-text-muted group-hover:text-orange-300">
                        JSON
                    </span>
                </button>

                <button
                    onClick={() => setActiveTab("generator")}
                    className="p-3 rounded-xl bg-bg-surface border border-border-subtle hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all group flex flex-col items-center gap-2"
                >
                    <Icon
                        name="hash"
                        size={20}
                        className="text-text-muted group-hover:text-indigo-400 transition-colors"
                    />
                    <span className="text-[10px] font-medium text-text-muted group-hover:text-indigo-300">
                        Generator
                    </span>
                </button>
            </div>
        </div>
    );
}
