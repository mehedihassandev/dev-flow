import { useEffect } from "react";
import { Button, Card, CardContent } from "../ui";
import { Icon } from "../Icon";
import { useTimerStore } from "../../stores";

export function PomodoroTimer() {
    const {
        isRunning,
        isBreak,
        timeRemaining,
        sessionsCompleted,
        workMinutes,
        breakMinutes,
        loadState,
        start,
        pause,
        reset,
        setWorkMinutes,
        setBreakMinutes,
    } = useTimerStore();

    useEffect(() => {
        loadState();
    }, [loadState]);

    useEffect(() => {
        return () => {
            const { pause } = useTimerStore.getState();
            pause();
        };
    }, []);

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs
            .toString()
            .padStart(2, "0")}`;
    };

    const progress = isBreak
        ? (1 - timeRemaining / (breakMinutes * 60)) * 100
        : (1 - timeRemaining / (workMinutes * 60)) * 100;
    const circumference = 2 * Math.PI * 80;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className="h-full flex flex-col">
            <h2 className="text-sm font-medium text-text-primary mb-3">
                Pomodoro Timer
            </h2>
            <div className="flex-1 overflow-y-auto space-y-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex flex-col items-center">
                            <div className="relative w-48 h-48 mb-6">
                                <svg className="w-48 h-48 transform -rotate-90">
                                    <circle
                                        cx="96"
                                        cy="96"
                                        r="80"
                                        fill="none"
                                        stroke="var(--color-bg-surface)"
                                        strokeWidth="8"
                                    />
                                    <circle
                                        cx="96"
                                        cy="96"
                                        r="80"
                                        fill="none"
                                        stroke={isBreak ? "#22c55e" : "#e4e4e7"}
                                        strokeWidth="8"
                                        strokeLinecap="round"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={strokeDashoffset}
                                        className="transition-all duration-1000"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-2xl font-bold text-text-primary tracking-tight font-mono">
                                        {formatTime(timeRemaining)}
                                    </span>
                                    <span
                                        className={`text-[10px] uppercase tracking-wider font-semibold mt-2 ${
                                            isBreak
                                                ? "text-green-500"
                                                : "text-text-muted"
                                        }`}
                                    >
                                        {isBreak ? "Break" : "Focus"}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-2 mb-4">
                                {!isRunning ? (
                                    <Button
                                        onClick={start}
                                        leftIcon={
                                            <Icon name="play" size={14} />
                                        }
                                        size="sm"
                                        className="w-24"
                                    >
                                        Start
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={pause}
                                        variant="secondary"
                                        leftIcon={
                                            <Icon name="pause" size={14} />
                                        }
                                        size="sm"
                                        className="w-24"
                                    >
                                        Pause
                                    </Button>
                                )}
                                <Button
                                    onClick={reset}
                                    variant="ghost"
                                    size="sm"
                                >
                                    <Icon name="refresh" size={14} />
                                </Button>
                            </div>
                            <div className="flex items-center gap-2 text-xs bg-bg-subtle px-3 py-1.5 rounded-full border border-border-subtle">
                                <span className="text-text-muted">
                                    Sessions:
                                </span>
                                <span className="text-text-primary font-medium font-mono">
                                    {sessionsCompleted}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <h3 className="text-[10px] uppercase tracking-wider font-semibold text-text-muted mb-3">
                            Settings
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-text-secondary">
                                    Work Duration
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() =>
                                            setWorkMinutes(
                                                Math.max(5, workMinutes - 5)
                                            )
                                        }
                                        className="w-6 h-6 rounded bg-bg-subtle border border-border-subtle text-text-primary hover:border-border-active flex items-center justify-center transition-colors"
                                    >
                                        -
                                    </button>
                                    <span className="text-xs text-text-primary w-10 text-center font-mono">
                                        {workMinutes}m
                                    </span>
                                    <button
                                        onClick={() =>
                                            setWorkMinutes(
                                                Math.min(60, workMinutes + 5)
                                            )
                                        }
                                        className="w-6 h-6 rounded bg-bg-subtle border border-border-subtle text-text-primary hover:border-border-active flex items-center justify-center transition-colors"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-text-secondary">
                                    Break Duration
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() =>
                                            setBreakMinutes(
                                                Math.max(1, breakMinutes - 1)
                                            )
                                        }
                                        className="w-6 h-6 rounded bg-bg-subtle border border-border-subtle text-text-primary hover:border-border-active flex items-center justify-center transition-colors"
                                    >
                                        -
                                    </button>
                                    <span className="text-xs text-text-primary w-10 text-center font-mono">
                                        {breakMinutes}m
                                    </span>
                                    <button
                                        onClick={() =>
                                            setBreakMinutes(
                                                Math.min(30, breakMinutes + 1)
                                            )
                                        }
                                        className="w-6 h-6 rounded bg-bg-subtle border border-border-subtle text-text-primary hover:border-border-active flex items-center justify-center transition-colors"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
