import { useState } from "react";
import { Button, TextArea, Card, CardContent } from "../ui";
import { Icon } from "../Icon";

export function Base64Tool() {
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [mode, setMode] = useState<"encode" | "decode">("encode");
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const handleEncode = () => {
        try {
            setError(null);
            const encoded = btoa(unescape(encodeURIComponent(input)));
            setOutput(encoded);
        } catch {
            setError("Failed to encode. Please check your input.");
        }
    };

    const handleDecode = () => {
        try {
            setError(null);
            const decoded = decodeURIComponent(escape(atob(input)));
            setOutput(decoded);
        } catch {
            setError("Invalid Base64 string. Please check your input.");
        }
    };

    const handleProcess = () => {
        if (mode === "encode") {
            handleEncode();
        } else {
            handleDecode();
        }
    };

    const handleCopy = async () => {
        await navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSwap = () => {
        setInput(output);
        setOutput("");
        setMode(mode === "encode" ? "decode" : "encode");
    };

    const handleClear = () => {
        setInput("");
        setOutput("");
        setError(null);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            // Remove data URL prefix if present
            const base64 = result.includes(",") ? result.split(",")[1] : result;
            if (mode === "encode") {
                setOutput(base64);
            } else {
                setInput(base64);
            }
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="h-full flex flex-col">
            <h2 className="text-sm font-medium text-text-primary mb-3">
                Base64 Encoder/Decoder
            </h2>
            <div className="flex-1 overflow-y-auto space-y-4">
                {/* Mode Toggle */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex gap-2 mb-4 p-1 bg-bg-subtle rounded-lg border border-border-subtle">
                            <button
                                onClick={() => setMode("encode")}
                                className={`flex-1 py-1.5 px-3 rounded text-xs font-medium transition-all duration-200 ${
                                    mode === "encode"
                                        ? "bg-bg-surface text-text-primary shadow-sm"
                                        : "text-text-muted hover:text-text-secondary"
                                }`}
                            >
                                Encode
                            </button>
                            <button
                                onClick={() => setMode("decode")}
                                className={`flex-1 py-1.5 px-3 rounded text-xs font-medium transition-all duration-200 ${
                                    mode === "decode"
                                        ? "bg-bg-surface text-text-primary shadow-sm"
                                        : "text-text-muted hover:text-text-secondary"
                                }`}
                            >
                                Decode
                            </button>
                        </div>

                        {/* File Upload */}
                        <div className="mb-4">
                            <label className="flex items-center justify-center gap-2 p-3 border border-dashed border-border-active rounded-lg text-text-muted text-xs cursor-pointer hover:bg-bg-subtle hover:border-text-secondary transition-all">
                                <Icon name="upload" size={14} />
                                {mode === "encode"
                                    ? "Upload file to encode"
                                    : "Upload Base64 file"}
                                <input
                                    type="file"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />
                            </label>
                        </div>

                        {/* Input */}
                        <div className="mb-4">
                            <label className="text-xs font-medium text-text-secondary mb-2 block">
                                {mode === "encode"
                                    ? "Text to encode"
                                    : "Base64 to decode"}
                            </label>
                            <TextArea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={
                                    mode === "encode"
                                        ? "Enter text to encode..."
                                        : "Enter Base64 string..."
                                }
                                rows={4}
                                className="font-mono text-[11px]"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 mb-4">
                            <Button
                                onClick={handleProcess}
                                className="flex-1"
                                size="sm"
                            >
                                {mode === "encode" ? "Encode" : "Decode"}
                            </Button>
                            <Button
                                onClick={handleSwap}
                                variant="secondary"
                                title="Swap input/output"
                                size="sm"
                            >
                                <Icon name="refresh" size={14} />
                            </Button>
                            <Button
                                onClick={handleClear}
                                variant="ghost"
                                title="Clear"
                                size="sm"
                            >
                                <Icon name="trash" size={14} />
                            </Button>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-500/5 border border-red-500/20 rounded-lg flex gap-2 items-start">
                                <Icon
                                    name="x"
                                    size={14}
                                    className="text-red-500 mt-0.5"
                                />
                                <span className="text-red-400/90 text-[10px] font-medium leading-tight">
                                    {error}
                                </span>
                            </div>
                        )}

                        {/* Output */}
                        {output && (
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs font-medium text-text-secondary">
                                        Result
                                    </label>
                                    <button
                                        onClick={handleCopy}
                                        className="text-[10px] text-text-muted hover:text-text-primary flex items-center gap-1 transition-colors"
                                    >
                                        <Icon
                                            name={copied ? "check" : "copy"}
                                            size={10}
                                        />
                                        {copied ? "Copied!" : "Copy"}
                                    </button>
                                </div>
                                <div className="p-3 bg-bg-subtle border border-border-subtle rounded-lg font-mono text-[11px] text-text-primary break-all max-h-40 overflow-y-auto">
                                    {output}
                                </div>
                                <div className="mt-2 text-[10px] text-text-muted font-mono">
                                    {output.length} characters
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
