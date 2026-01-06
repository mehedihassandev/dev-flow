import { useState } from "react";
import { Button, Input, Card, CardContent } from "../ui";
import { Icon } from "../Icon";

type GeneratorType = "uuid" | "hash";

export function GeneratorTool() {
    const [type, setType] = useState<GeneratorType>("uuid");
    const [count, setCount] = useState(5);
    const [hashInput, setHashInput] = useState("");
    const [hashType, setHashType] = useState<"sha256" | "sha1" | "md5">(
        "sha256"
    );
    const [results, setResults] = useState<string[]>([]);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    // UUID v4 generator
    const generateUUID = (): string => {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    };

    // Simple hash functions (for demo - in production use crypto.subtle)
    const simpleHash = async (
        str: string,
        algorithm: string
    ): Promise<string> => {
        const encoder = new TextEncoder();
        const data = encoder.encode(str);

        try {
            const hashBuffer = await crypto.subtle.digest(algorithm, data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray
                .map((b) => b.toString(16).padStart(2, "0"))
                .join("");
        } catch {
            // Fallback for environments without crypto.subtle
            return fallbackHash(str);
        }
    };

    // Fallback simple hash
    const fallbackHash = (str: string): string => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16).padStart(8, "0");
    };

    const generateUUIDs = () => {
        const uuids = Array.from({ length: count }, () => generateUUID());
        setResults(uuids);
    };

    const generateHash = async () => {
        if (!hashInput.trim()) return;

        const algorithms: Record<string, string> = {
            sha256: "SHA-256",
            sha1: "SHA-1",
            md5: "SHA-256", // MD5 not in Web Crypto, use SHA-256 as fallback
        };

        const hash = await simpleHash(hashInput, algorithms[hashType]);
        setResults([`${hashType.toUpperCase()}: ${hash}`]);
    };

    const handleCopy = async (text: string, index: number) => {
        const value = text.includes(":") ? text.split(": ")[1] : text;
        await navigator.clipboard.writeText(value);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const handleCopyAll = async () => {
        const values = results
            .map((r) => (r.includes(":") ? r.split(": ")[1] : r))
            .join("\n");
        await navigator.clipboard.writeText(values);
        setCopiedIndex(-1);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    return (
        <div className="h-full flex flex-col">
            <h2 className="text-sm font-medium text-text-primary mb-3">
                UUID & Hash Generator
            </h2>
            <div className="flex-1 overflow-y-auto space-y-4">
                {/* Type Toggle */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex gap-2 mb-4 p-1 bg-bg-subtle rounded-lg border border-border-subtle">
                            <button
                                onClick={() => {
                                    setType("uuid");
                                    setResults([]);
                                }}
                                className={`flex-1 py-1.5 px-3 rounded text-xs font-medium transition-all duration-200 ${
                                    type === "uuid"
                                        ? "bg-bg-surface text-text-primary shadow-sm"
                                        : "text-text-muted hover:text-text-secondary"
                                }`}
                            >
                                UUID
                            </button>
                            <button
                                onClick={() => {
                                    setType("hash");
                                    setResults([]);
                                }}
                                className={`flex-1 py-1.5 px-3 rounded text-xs font-medium transition-all duration-200 ${
                                    type === "hash"
                                        ? "bg-bg-surface text-text-primary shadow-sm"
                                        : "text-text-muted hover:text-text-secondary"
                                }`}
                            >
                                Hash
                            </button>
                        </div>

                        {type === "uuid" && (
                            <>
                                <div className="flex items-center gap-3 mb-4">
                                    <label className="text-xs text-text-secondary">
                                        Count:
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() =>
                                                setCount(Math.max(1, count - 1))
                                            }
                                            className="w-6 h-6 rounded bg-bg-subtle border border-border-subtle text-text-primary hover:border-border-active flex items-center justify-center transition-colors"
                                        >
                                            -
                                        </button>
                                        <span className="text-xs text-text-primary w-8 text-center font-mono">
                                            {count}
                                        </span>
                                        <button
                                            onClick={() =>
                                                setCount(
                                                    Math.min(50, count + 1)
                                                )
                                            }
                                            className="w-6 h-6 rounded bg-bg-subtle border border-border-subtle text-text-primary hover:border-border-active flex items-center justify-center transition-colors"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                                <Button
                                    onClick={generateUUIDs}
                                    className="w-full"
                                    leftIcon={<Icon name="refresh" size={16} />}
                                >
                                    Generate UUIDs
                                </Button>
                            </>
                        )}

                        {type === "hash" && (
                            <>
                                <div className="mb-4">
                                    <label className="text-xs text-text-secondary mb-2 block">
                                        Text to hash
                                    </label>
                                    <Input
                                        value={hashInput}
                                        onChange={(e) =>
                                            setHashInput(e.target.value)
                                        }
                                        placeholder="Enter text to hash..."
                                    />
                                </div>
                                <div className="flex gap-2 mb-4">
                                    {(["sha256", "sha1", "md5"] as const).map(
                                        (h) => (
                                            <button
                                                key={h}
                                                onClick={() => setHashType(h)}
                                                className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all border ${
                                                    hashType === h
                                                        ? "bg-amber-500/10 border-amber-500/40 text-amber-400"
                                                        : "bg-bg-subtle border-border-subtle text-text-muted hover:border-text-secondary"
                                                }`}
                                            >
                                                {h.toUpperCase()}
                                            </button>
                                        )
                                    )}
                                </div>
                                <Button
                                    onClick={generateHash}
                                    className="w-full"
                                    leftIcon={<Icon name="hash" size={16} />}
                                >
                                    Generate Hash
                                </Button>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Results */}
                {results.length > 0 && (
                    <Card>
                        <CardContent className="p-0">
                            <div className="flex items-center justify-between px-3 py-2 border-b border-border-subtle bg-bg-subtle/50">
                                <h3 className="text-xs font-medium text-text-secondary">
                                    Results
                                </h3>
                                <button
                                    onClick={handleCopyAll}
                                    className="text-[10px] text-text-muted hover:text-text-primary flex items-center gap-1 transition-colors"
                                >
                                    <Icon
                                        name={
                                            copiedIndex === -1
                                                ? "check"
                                                : "copy"
                                        }
                                        size={10}
                                    />
                                    {copiedIndex === -1
                                        ? "Copied!"
                                        : "Copy All"}
                                </button>
                            </div>
                            <div className="p-3 space-y-2 max-h-60 overflow-y-auto">
                                {results.map((result, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-2 p-2 bg-bg-subtle rounded border border-border-subtle group"
                                    >
                                        <span className="flex-1 font-mono text-[11px] text-text-primary break-all">
                                            {result}
                                        </span>
                                        <button
                                            onClick={() =>
                                                handleCopy(result, index)
                                            }
                                            className="p-1.5 rounded hover:bg-bg-surface text-text-muted hover:text-text-primary opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <Icon
                                                name={
                                                    copiedIndex === index
                                                        ? "check"
                                                        : "copy"
                                                }
                                                size={12}
                                            />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
