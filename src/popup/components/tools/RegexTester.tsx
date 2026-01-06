import { useState, useMemo, useEffect } from "react";
import { Button, Input, TextArea, Card, CardContent } from "../ui";

interface Match {
    text: string;
    index: number;
    groups: string[];
}

const COMMON_PATTERNS = [
    {
        name: "Email",
        pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}",
    },
    {
        name: "URL",
        pattern: "https?:\\/\\/[\\w\\-._~:/?#\\[\\]@!$&'()*+,;=%]+",
    },
    {
        name: "Phone (US)",
        pattern: "\\+?1?[-.\\s]?\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}",
    },
    { name: "IP Address", pattern: "\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b" },
    { name: "Hex Color", pattern: "#(?:[0-9a-fA-F]{3}){1,2}\\b" },
    {
        name: "Date (YYYY-MM-DD)",
        pattern: "\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])",
    },
    { name: "Time (HH:MM)", pattern: "(?:[01]\\d|2[0-3]):[0-5]\\d" },
    {
        name: "UUID",
        pattern:
            "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}",
    },
];

export function RegexTester() {
    const [pattern, setPattern] = useState("");
    const [flags, setFlags] = useState("g");
    const [testText, setTestText] = useState(
        "Hello, my email is test@example.com and my phone is 123-456-7890."
    );
    const [error, setError] = useState<string | null>(null);

    const { matches, regexError } = useMemo<{
        matches: Match[];
        regexError: string | null;
    }>(() => {
        if (!pattern) return { matches: [], regexError: null };
        try {
            const regex = new RegExp(pattern, flags);
            const results: Match[] = [];
            let match;

            if (flags.includes("g")) {
                while ((match = regex.exec(testText)) !== null) {
                    results.push({
                        text: match[0],
                        index: match.index,
                        groups: match.slice(1),
                    });
                    if (!flags.includes("g")) break;
                }
            } else {
                match = regex.exec(testText);
                if (match) {
                    results.push({
                        text: match[0],
                        index: match.index,
                        groups: match.slice(1),
                    });
                }
            }
            return { matches: results, regexError: null };
        } catch (e) {
            return { matches: [], regexError: (e as Error).message };
        }
    }, [pattern, flags, testText]);

    useEffect(() => {
        setError(regexError);
    }, [regexError]);

    const highlightedText = useMemo(() => {
        if (!pattern || error || matches.length === 0) return testText;
        try {
            const regex = new RegExp(
                pattern,
                flags.includes("g") ? flags : flags + "g"
            );
            return testText.replace(
                regex,
                (match) =>
                    `<mark class="bg-amber-500/20 text-amber-200 rounded px-0.5 border border-amber-500/30">${match}</mark>`
            );
        } catch {
            return testText;
        }
    }, [pattern, flags, testText, matches, error]);

    const toggleFlag = (flag: string) => {
        if (flags.includes(flag)) {
            setFlags(flags.replace(flag, ""));
        } else {
            setFlags(flags + flag);
        }
    };

    const loadPattern = (p: string) => {
        setPattern(p);
    };

    return (
        <div className="h-full flex flex-col">
            // Header
            <h2 className="text-sm font-medium text-text-primary mb-3">
                Regex Tester
            </h2>
            <div className="flex-1 overflow-y-auto space-y-4">
                {/* Pattern Input */}
                <Card>
                    <CardContent className="p-4">
                        <div className="mb-4">
                            <label className="text-xs font-medium text-text-secondary mb-2 block">
                                Regular Expression
                            </label>
                            <div className="flex gap-2">
                                <div className="flex-1 relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted font-mono text-sm opacity-50">
                                        /
                                    </span>
                                    <Input
                                        value={pattern}
                                        onChange={(e) =>
                                            setPattern(e.target.value)
                                        }
                                        placeholder="Enter regex pattern..."
                                        className="pl-6 pr-10 font-mono text-[13px]"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted font-mono text-sm opacity-50">
                                        /{flags}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Flags */}
                        <div className="flex gap-2 mb-4">
                            {["g", "i", "m", "s"].map((flag) => (
                                <button
                                    key={flag}
                                    onClick={() => toggleFlag(flag)}
                                    className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all border ${
                                        flags.includes(flag)
                                            ? "bg-amber-500/10 border-amber-500/40 text-amber-400"
                                            : "bg-bg-subtle border-border-subtle text-text-muted hover:border-text-secondary"
                                    }`}
                                    title={
                                        flag === "g"
                                            ? "Global"
                                            : flag === "i"
                                            ? "Case insensitive"
                                            : flag === "m"
                                            ? "Multiline"
                                            : "Dotall"
                                    }
                                >
                                    {flag}
                                </button>
                            ))}
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-500/5 border border-red-500/20 rounded-lg text-red-400 text-xs flex gap-2">
                                <span className="font-bold">Error:</span>{" "}
                                {error}
                            </div>
                        )}

                        {/* Test Text */}
                        <div className="mb-4">
                            <label className="text-xs font-medium text-text-secondary mb-2 block">
                                Test String
                            </label>
                            <TextArea
                                value={testText}
                                onChange={(e) => setTestText(e.target.value)}
                                placeholder="Enter text to test..."
                                rows={4}
                                className="font-mono text-[12px]"
                            />
                        </div>

                        {/* Highlighted Result */}
                        {pattern && !error && (
                            <div className="mb-4">
                                <label className="text-xs font-medium text-text-secondary mb-2 block">
                                    Result
                                </label>
                                <div
                                    className="p-3 bg-bg-subtle border border-border-subtle rounded-lg text-xs text-text-primary font-mono whitespace-pre-wrap break-all leading-relaxed"
                                    dangerouslySetInnerHTML={{
                                        __html: highlightedText,
                                    }}
                                />
                            </div>
                        )}

                        {/* Matches Info */}
                        {matches.length > 0 && !error && (
                            <div className="p-3 bg-bg-subtle border border-border-subtle rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] uppercase font-semibold tracking-wider text-text-muted">
                                        Matches ({matches.length})
                                    </span>
                                </div>
                                <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1 scrollbar-thin">
                                    {matches.slice(0, 50).map((match, i) => (
                                        <div
                                            key={i}
                                            className="text-[11px] flex gap-2"
                                        >
                                            <span className="text-text-muted w-8 flex-shrink-0 font-mono opacity-50">
                                                [{match.index}]
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <span className="text-amber-400 font-mono break-all">
                                                    {match.text}
                                                </span>
                                                {match.groups.length > 0 && (
                                                    <span className="text-text-muted ml-2">
                                                        Groups:{" "}
                                                        {match.groups.join(
                                                            ", "
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {matches.length > 50 && (
                                        <div className="text-[10px] text-[var(--color-text-muted)] pt-1 italic">
                                            ...and {matches.length - 50} more
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Common Patterns */}
                <Card>
                    <CardContent className="p-4">
                        <h3 className="text-xs font-medium text-text-secondary mb-3">
                            Common Patterns
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                            {COMMON_PATTERNS.map((p) => (
                                <Button
                                    key={p.name}
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => loadPattern(p.pattern)}
                                    className="justify-start text-[11px] h-7 px-2"
                                >
                                    {p.name}
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
