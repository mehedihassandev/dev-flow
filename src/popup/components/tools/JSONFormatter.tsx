import { useState } from "react";
import { Button, TextArea, Card, CardContent } from "../ui";
import { Icon } from "../Icon";

export function JSONFormatter() {
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const handleFormat = () => {
        try {
            const parsed = JSON.parse(input);
            setOutput(JSON.stringify(parsed, null, 2));
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Invalid JSON");
            setOutput("");
        }
    };

    const handleMinify = () => {
        try {
            const parsed = JSON.parse(input);
            setOutput(JSON.stringify(parsed));
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Invalid JSON");
            setOutput("");
        }
    };

    const handleCopy = async () => {
        if (output) {
            await navigator.clipboard.writeText(output);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleClear = () => {
        setInput("");
        setOutput("");
        setError(null);
    };

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            setInput(text);
        } catch {
            // Clipboard not available
        }
    };

    const handleSwap = () => {
        if (output) {
            setInput(output);
            setOutput("");
        }
    };

    // Syntax highlighting for JSON
    const highlightJSON = (json: string) => {
        if (!json) return null;

        return json.split("\n").map((line, i) => {
            const highlighted = line
                // Keys
                .replace(
                    /"([^"]+)":/g,
                    '<span class="text-purple-400">"$1"</span>:'
                )
                // String values
                .replace(
                    /: "([^"]*)"/g,
                    ': <span class="text-emerald-400">"$1"</span>'
                )
                // Numbers
                .replace(
                    /: (\d+\.?\d*)/g,
                    ': <span class="text-orange-400">$1</span>'
                )
                // Booleans and null
                .replace(
                    /: (true|false|null)/g,
                    ': <span class="text-blue-400">$1</span>'
                );

            return (
                <div key={i} className="flex">
                    <span className="text-[var(--color-text-muted)] w-8 text-right mr-3 select-none opacity-50">
                        {i + 1}
                    </span>
                    <span dangerouslySetInnerHTML={{ __html: highlighted }} />
                </div>
            );
        });
    };

    return (
        <div className="h-full flex flex-col">
            <h2 className="text-sm font-medium text-[var(--color-text-primary)] mb-3">
                JSON Formatter
            </h2>
            <div className="flex-1 overflow-y-auto space-y-4">
                {/* Input */}
                <Card>
                    <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-medium text-[var(--color-text-secondary)]">
                                Input JSON
                            </label>
                            <div className="flex gap-1">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={handlePaste}
                                    title="Paste"
                                    className="h-6 px-2"
                                >
                                    <Icon name="copy" size={12} />
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={handleClear}
                                    title="Clear"
                                    className="h-6 px-2"
                                >
                                    <Icon name="trash" size={12} />
                                </Button>
                            </div>
                        </div>
                        <TextArea
                            placeholder='Paste your JSON here...\n{"key": "value"}'
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            rows={6}
                            className="font-mono text-[11px]"
                        />

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-1">
                            <Button
                                onClick={handleFormat}
                                className="flex-1"
                                size="sm"
                            >
                                Format
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={handleMinify}
                                className="flex-1"
                                size="sm"
                            >
                                Minify
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Error */}
                {error && (
                    <Card className="border-red-500/20 bg-red-500/5">
                        <CardContent className="p-3">
                            <div className="flex items-start gap-2 text-red-500">
                                <Icon
                                    name="x"
                                    size={14}
                                    className="mt-0.5 flex-shrink-0"
                                />
                                <div>
                                    <p className="text-xs font-medium">
                                        Invalid JSON
                                    </p>
                                    <p className="text-[10px] opacity-80 mt-0.5">
                                        {error}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Output */}
                {output && (
                    <Card>
                        <CardContent className="p-0">
                            <div className="flex items-center justify-between px-3 py-2 border-b border-border-subtle bg-bg-subtle/50">
                                <label className="text-xs font-medium text-text-secondary">
                                    Output
                                </label>
                                <div className="flex gap-1">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={handleSwap}
                                        title="Use as input"
                                        className="h-6 px-2 text-[10px]"
                                    >
                                        <Icon name="refresh" size={10} />
                                        <span className="ml-1">Swap</span>
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={handleCopy}
                                        className="h-6 px-2 text-[10px]"
                                    >
                                        <Icon
                                            name={copied ? "check" : "copy"}
                                            size={10}
                                        />
                                        <span className="ml-1">
                                            {copied ? "Copied!" : "Copy"}
                                        </span>
                                    </Button>
                                </div>
                            </div>
                            <pre className="text-[11px] p-3 overflow-auto max-h-60 font-mono text-text-primary">
                                {highlightJSON(output)}
                            </pre>

                            {/* Stats */}
                            <div className="px-3 py-2 border-t border-border-subtle bg-bg-subtle/30 flex gap-4 text-[10px] text-text-muted font-mono">
                                <span>Lines: {output.split("\n").length}</span>
                                <span>Chars: {output.length}</span>
                                <span>Size: {new Blob([output]).size} B</span>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
