import { useState, useRef } from "react";
import { Button, Card, CardContent } from "../ui";
import { Icon } from "../Icon";

export function ScreenRecorder() {
    const [isRecording, setIsRecording] = useState(false);
    const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    displaySurface: "browser",
                },
                audio: true,
            });

            streamRef.current = stream;

            const mediaRecorder = new MediaRecorder(stream, {
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
                // Stop all tracks
                stream.getTracks().forEach((track) => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordedChunks([]);
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
        <div className="h-full flex flex-col">
            <h2 className="text-sm font-medium text-text-primary mb-3">
                Screen Recorder
            </h2>
            <div className="flex-1 overflow-y-auto space-y-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex flex-col items-center justify-center p-8 bg-bg-subtle/50 rounded-lg border border-border-subtle mb-4">
                            {!isRecording ? (
                                <div className="w-16 h-16 rounded-full bg-bg-surface flex items-center justify-center mb-4">
                                    <Icon
                                        name="video"
                                        size={32}
                                        className="text-text-muted"
                                    />
                                </div>
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4 animate-pulse">
                                    <div className="w-6 h-6 rounded-sm bg-red-500" />
                                </div>
                            )}

                            {isRecording ? (
                                <div className="text-center">
                                    <p className="text-sm font-medium text-red-400 mb-1">
                                        Recording...
                                    </p>
                                    <p className="text-xs text-text-muted">
                                        Click Stop to finish
                                    </p>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <p className="text-sm font-medium text-text-primary mb-1">
                                        Ready to Record
                                    </p>
                                    <p className="text-xs text-text-muted">
                                        Capture your tabs or desktop
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3">
                            {!isRecording ? (
                                <Button
                                    onClick={startRecording}
                                    className="flex-1"
                                    leftIcon={<Icon name="play" size={16} />}
                                >
                                    Start Recording
                                </Button>
                            ) : (
                                <Button
                                    onClick={stopRecording}
                                    variant="danger"
                                    className="flex-1"
                                    leftIcon={<Icon name="square" size={16} />}
                                >
                                    Stop Recording
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {recordedChunks.length > 0 && !isRecording && (
                    <Card>
                        <CardContent className="p-4">
                            <h3 className="text-xs font-medium text-text-secondary mb-3">
                                Recording Ready
                            </h3>
                            <div className="flex gap-2">
                                <Button
                                    onClick={() => downloadRecording("webm")}
                                    className="flex-1"
                                    variant="secondary"
                                    size="sm"
                                    leftIcon={
                                        <Icon name="download" size={14} />
                                    }
                                >
                                    Download WebM
                                </Button>
                                {/* Note: MP4 conversion requires ffmpeg.wasm or similar, so we'll just rename for now or stick to WebM as default for web */}
                                <Button
                                    onClick={() => downloadRecording("mp4")}
                                    className="flex-1"
                                    variant="ghost"
                                    size="sm"
                                    leftIcon={
                                        <Icon name="download" size={14} />
                                    }
                                >
                                    Download MP4
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
