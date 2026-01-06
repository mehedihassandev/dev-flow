import { useState } from "react";
import { Button, Card, CardContent } from "../ui";
import { Icon } from "../Icon";

type OutputType = "paragraphs" | "sentences" | "words";

const LOREM_WORDS = [
    "lorem",
    "ipsum",
    "dolor",
    "sit",
    "amet",
    "consectetur",
    "adipiscing",
    "elit",
    "sed",
    "do",
    "eiusmod",
    "tempor",
    "incididunt",
    "ut",
    "labore",
    "et",
    "dolore",
    "magna",
    "aliqua",
    "enim",
    "ad",
    "minim",
    "veniam",
    "quis",
    "nostrud",
    "exercitation",
    "ullamco",
    "laboris",
    "nisi",
    "aliquip",
    "ex",
    "ea",
    "commodo",
    "consequat",
    "duis",
    "aute",
    "irure",
    "in",
    "reprehenderit",
    "voluptate",
    "velit",
    "esse",
    "cillum",
    "fugiat",
    "nulla",
    "pariatur",
    "excepteur",
    "sint",
    "occaecat",
    "cupidatat",
    "non",
    "proident",
    "sunt",
    "culpa",
    "qui",
    "officia",
    "deserunt",
    "mollit",
    "anim",
    "id",
    "est",
    "laborum",
    "perspiciatis",
    "unde",
    "omnis",
    "iste",
    "natus",
    "error",
    "voluptatem",
    "accusantium",
    "doloremque",
    "laudantium",
    "totam",
    "rem",
    "aperiam",
    "eaque",
    "ipsa",
    "quae",
    "ab",
    "illo",
    "inventore",
    "veritatis",
    "quasi",
    "architecto",
    "beatae",
    "vitae",
    "dicta",
];

export function LoremGenerator() {
    const [type, setType] = useState<OutputType>("paragraphs");
    const [count, setCount] = useState(3);
    const [output, setOutput] = useState("");
    const [copied, setCopied] = useState(false);
    const [startWithLorem, setStartWithLorem] = useState(true);

    const getRandomWord = (): string => {
        return LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)];
    };

    const generateWords = (num: number, isStart: boolean = false): string => {
        const words: string[] = [];
        for (let i = 0; i < num; i++) {
            if (i === 0 && isStart && startWithLorem) {
                words.push("Lorem");
            } else if (i === 1 && isStart && startWithLorem) {
                words.push("ipsum");
            } else {
                words.push(getRandomWord());
            }
        }
        return words.join(" ");
    };

    const generateSentence = (isFirst: boolean = false): string => {
        const wordCount = Math.floor(Math.random() * 10) + 8; // 8-17 words
        let sentence = generateWords(wordCount, isFirst);
        sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1);
        return sentence + ".";
    };

    const generateParagraph = (isFirst: boolean = false): string => {
        const sentenceCount = Math.floor(Math.random() * 4) + 4; // 4-7 sentences
        const sentences: string[] = [];
        for (let i = 0; i < sentenceCount; i++) {
            sentences.push(generateSentence(i === 0 && isFirst));
        }
        return sentences.join(" ");
    };

    const generate = () => {
        let result = "";

        switch (type) {
            case "paragraphs": {
                const paragraphs: string[] = [];
                for (let i = 0; i < count; i++) {
                    paragraphs.push(generateParagraph(i === 0));
                }
                result = paragraphs.join("\n\n");
                break;
            }
            case "sentences": {
                const sentences: string[] = [];
                for (let i = 0; i < count; i++) {
                    sentences.push(generateSentence(i === 0));
                }
                result = sentences.join(" ");
                break;
            }
            case "words":
                result = generateWords(count, true);
                // Capitalize first letter
                result = result.charAt(0).toUpperCase() + result.slice(1);
                break;
        }

        setOutput(result);
    };

    const handleCopy = async () => {
        await navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleClear = () => {
        setOutput("");
    };

    return (
        <div className="h-full flex flex-col">
            <h2 className="text-sm font-medium text-text-primary mb-3">
                Lorem Ipsum Generator
            </h2>
            <div className="flex-1 overflow-y-auto space-y-4">
                {/* Controls */}
                <Card>
                    <CardContent className="p-4 space-y-4">
                        {/* Type Selection */}
                        <div>
                            <label className="text-[10px] uppercase tracking-wider font-semibold text-text-muted mb-2 block">
                                Generate
                            </label>
                            <div className="flex bg-bg-subtle p-1 rounded-lg border border-border-subtle">
                                {(
                                    [
                                        "paragraphs",
                                        "sentences",
                                        "words",
                                    ] as OutputType[]
                                ).map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setType(t)}
                                        className={`flex-1 py-1 px-2 rounded-md text-[11px] font-medium transition-all duration-200 ${
                                            type === t
                                                ? "bg-bg-surface text-text-primary shadow-sm"
                                                : "text-text-muted hover:text-text-secondary hover:bg-white/5"
                                        }`}
                                    >
                                        {t.charAt(0).toUpperCase() + t.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Count */}
                        <div className="flex items-center justify-between">
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
                                            Math.min(
                                                type === "words" ? 500 : 20,
                                                count + 1
                                            )
                                        )
                                    }
                                    className="w-6 h-6 rounded bg-bg-subtle border border-border-subtle text-text-primary hover:border-border-active flex items-center justify-center transition-colors"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* Options */}
                        <div>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={startWithLorem}
                                    onChange={(e) =>
                                        setStartWithLorem(e.target.checked)
                                    }
                                    className="w-3.5 h-3.5 rounded border-border-subtle bg-bg-subtle text-text-primary focus:ring-1 focus:ring-indigo-500/50"
                                />
                                <span className="text-xs text-text-secondary group-hover:text-text-primary transition-colors">
                                    Start with "Lorem ipsum"
                                </span>
                            </label>
                        </div>

                        {/* Generate Button */}
                        <Button
                            onClick={generate}
                            className="w-full"
                            leftIcon={<Icon name="refresh" size={14} />}
                            size="sm"
                        >
                            Generate{" "}
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                        </Button>
                    </CardContent>
                </Card>

                {/* Output */}
                {output && (
                    <Card>
                        <CardContent className="p-0">
                            <div className="flex items-center justify-between px-3 py-2 border-b border-border-subtle bg-bg-subtle/50">
                                <div className="text-[10px] text-text-muted font-mono">
                                    {output.split(/\s+/).length} words •{" "}
                                    {output.length} characters
                                </div>
                                <div className="flex gap-2">
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
                                    <button
                                        onClick={handleClear}
                                        className="text-[10px] text-text-muted hover:text-red-400 flex items-center gap-1 transition-colors"
                                    >
                                        <Icon name="trash" size={10} />
                                        Clear
                                    </button>
                                </div>
                            </div>
                            <div className="p-3 text-xs text-text-secondary max-h-60 overflow-y-auto whitespace-pre-wrap leading-relaxed font-mono">
                                {output}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
