import { Button, Card, CardContent } from "../ui";
import { Icon } from "../Icon";
import { openRecorderWindow } from "../../../utils/window";

export function ScreenRecorder() {
    const handleLaunchRecorder = async () => {
        await openRecorderWindow();
        window.close(); // Optional: Close the side panel if desired, but user might want to keep it open.
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
                            <div className="w-16 h-16 rounded-full bg-bg-surface flex items-center justify-center mb-4">
                                <Icon
                                    name="video"
                                    size={32}
                                    className="text-text-muted"
                                />
                            </div>

                            <div className="text-center">
                                <p className="text-sm font-medium text-text-primary mb-1">
                                    Launch Recorder
                                </p>
                                <p className="text-xs text-text-muted">
                                    Open the standalone recorder window
                                </p>
                            </div>
                        </div>

                        <Button
                            onClick={handleLaunchRecorder}
                            className="w-full"
                            leftIcon={<Icon name="external-link" size={16} />}
                        >
                            Open Recorder
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
