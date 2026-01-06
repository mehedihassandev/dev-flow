import { useState, useRef, useEffect } from "react";
import { Icon } from "../popup/components/Icon";
// Importing Button/Card directly to reuse styles, but we will override some for specific look if needed.
import { Button } from "../popup/components/ui/Button";

export default function App() {
    const [isRecording, setIsRecording] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const timerIntervalRef = useRef<number | null>(null);

    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach((track) => track.stop());
            }
            if (timerIntervalRef.current) {
                window.clearInterval(timerIntervalRef.current);
            }
        };
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs
            .toString()
            .padStart(2, "0")}`;
    };

    const startRecording = async () => {
        try {
            const displayStream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    displaySurface: "browser",
                },
                audio: {
                    autoGainControl: false,
                    echoCancellation: false,
                    noiseSuppression: false,
                },
            });

            displayStream.getVideoTracks()[0].onended = () => {
                stopRecording();
            };

            setStream(displayStream);

            const mediaRecorder = new MediaRecorder(displayStream, {
                mimeType: "video/webm;codecs=vp9",
            });

            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    setRecordedChunks((prev) => [...prev, event.data]);
                }
            };

            mediaRecorder.onstop = () => {
                setIsRecording(false);
                if (timerIntervalRef.current) {
                    window.clearInterval(timerIntervalRef.current);
                    timerIntervalRef.current = null;
                }
                displayStream.getTracks().forEach((track) => track.stop());
                setStream(null);
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordedChunks([]);
            setElapsedTime(0);

            timerIntervalRef.current = window.setInterval(() => {
                setElapsedTime((prev) => prev + 1);
            }, 1000);
        } catch (err) {
            console.error("Error starting recording:", err);
        }
    };

    const stopRecording = () => {
        if (
            mediaRecorderRef.current &&
            mediaRecorderRef.current.state !== "inactive"
        ) {
            mediaRecorderRef.current.stop();
        }
    };

    const downloadRecording = (format: "webm" | "mp4") => {
        if (recordedChunks.length === 0) return;

        const blob = new Blob(recordedChunks, {
            type: "video/webm",
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        document.body.appendChild(a);
        a.style.display = "none";
        a.href = url;
        a.download = `recording-${new Date().toISOString()}.${format}`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-[#09090b] text-[#e4e4e7] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-white/10 selection:text-white">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* Main Card */}
            <div className="relative w-full max-w-sm bg-[#18181b]/80 backdrop-blur-xl border border-[#27272a] rounded-2xl shadow-2xl p-8 flex flex-col items-center transition-all duration-300">
                {/* Header Status */}
                <div className="flex flex-col items-center gap-6 mb-8 w-full">
                    <div className="relative group">
                        {!isRecording ? (
                            <div className="w-24 h-24 rounded-full bg-[#27272a] flex items-center justify-center border border-[#3f3f46] shadow-inner transition-transform group-hover:scale-105 duration-300">
                                <Icon
                                    name="video"
                                    size={40}
                                    className="text-[#71717a] group-hover:text-white transition-colors duration-300"
                                />
                            </div>
                        ) : (
                            <div className="relative">
                                <span className="absolute inset-0 rounded-full animate-ping bg-red-500/20" />
                                <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.15)] animate-pulse">
                                    <Icon
                                        name="video" // Or a square if stopped? No, video icon is fine, or maybe a pause/stop indicator.
                                        size={40}
                                        className="text-red-500"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="text-center space-y-2">
                        <h1 className="text-2xl font-semibold tracking-tight text-white">
                            {isRecording ? "Recording..." : "Screen Recorder"}
                        </h1>
                        <p className="text-sm text-[#a1a1aa] font-medium">
                            {isRecording ? (
                                <span className="font-mono text-red-400 bg-red-500/5 px-2 py-0.5 rounded border border-red-500/10">
                                    {formatTime(elapsedTime)}
                                </span>
                            ) : (
                                "Capture screen, window, or tab"
                            )}
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="w-full space-y-3">
                    {!isRecording && recordedChunks.length === 0 && (
                        <Button
                            onClick={startRecording}
                            className="w-full h-12 text-sm font-medium bg-white text-black hover:bg-gray-100 border-transparent shadow hover:shadow-lg transition-all active:scale-[0.98]"
                            leftIcon={<Icon name="play" size={18} />}
                        >
                            Start Recording
                        </Button>
                    )}

                    {isRecording && (
                        <Button
                            onClick={stopRecording}
                            className="w-full h-12 text-sm font-medium bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20 hover:border-red-500/30 transition-all active:scale-[0.98]"
                            leftIcon={<Icon name="square" size={16} />}
                        >
                            Stop Recording
                        </Button>
                    )}

                    {!isRecording && recordedChunks.length > 0 && (
                        <div className="space-y-4 w-full animate-fadeIn">
                            <div className="p-4 rounded-xl bg-[#27272a]/50 border border-[#3f3f46]/50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                                        <Icon
                                            name="check"
                                            size={14}
                                            className="text-green-500"
                                        />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-xs font-medium text-white">
                                            Captured
                                        </p>
                                        <p className="text-[10px] text-[#71717a] font-mono">
                                            {formatTime(
                                                recordedChunks.length * 1
                                            )}{" "}
                                            •{" "}
                                            {(
                                                new Blob(recordedChunks).size /
                                                1024 /
                                                1024
                                            ).toFixed(2)}{" "}
                                            MB
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    onClick={() => downloadRecording("webm")}
                                    className="w-full h-10 text-xs bg-[#27272a] hover:bg-[#3f3f46] text-white border-[#3f3f46]"
                                    leftIcon={
                                        <Icon name="download" size={14} />
                                    }
                                >
                                    WebM
                                </Button>
                                <Button
                                    onClick={() => {
                                        setRecordedChunks([]);
                                        startRecording();
                                    }}
                                    className="w-full h-10 text-xs bg-transparent hover:bg-[#27272a] text-[#a1a1aa] border-transparent"
                                    leftIcon={<Icon name="refresh" size={14} />}
                                >
                                    New
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer / Info */}
                {!isRecording && recordedChunks.length === 0 && (
                    <p className="mt-8 text-[10px] text-[#52525b] text-center max-w-[200px] leading-relaxed">
                        Your recordings are processed locally and never leave
                        your device.
                    </p>
                )}
            </div>
        </div>
    );
}
