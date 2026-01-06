import { useState, useEffect } from "react";
import { Button, Input, Card, CardContent } from "../ui";
import { Icon } from "../Icon";
import {
    hexToRgb,
    hexToHsl,
    getContrastRatio,
    getWcagLevel,
    isValidHex,
    normalizeHex,
    generateRandomColor,
} from "../../utils/colorUtils";
import {
    getColors,
    saveColor,
    deleteColor,
    generateId,
} from "../../../shared/storage";
import type { SavedColor } from "../../../shared/types";

export function ColorTool() {
    const [color, setColor] = useState("#3b82f6");
    const [contrastColor, setContrastColor] = useState("#ffffff");
    const [savedColors, setSavedColors] = useState<SavedColor[]>([]);
    const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

    useEffect(() => {
        const fetchColors = async () => {
            const colors = await getColors();
            setSavedColors(colors);
        };
        fetchColors();
    }, []);

    const rgb = hexToRgb(color);
    const hsl = hexToHsl(color);
    const contrastRatio = getContrastRatio(color, contrastColor);
    const wcagLevel = getWcagLevel(contrastRatio);

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setColor(e.target.value);
    };

    const handleHexInput = (value: string) => {
        if (isValidHex(value)) {
            setColor(normalizeHex(value));
        }
    };

    const handleSaveColor = async () => {
        const newColor: SavedColor = {
            id: generateId(),
            hex: color,
            createdAt: Date.now(),
        };
        await saveColor(newColor);
        setSavedColors([newColor, ...savedColors]);
    };

    const handleDeleteColor = async (id: string) => {
        await deleteColor(id);
        setSavedColors(savedColors.filter((c) => c.id !== id));
    };

    const handleCopy = async (format: string, value: string) => {
        await navigator.clipboard.writeText(value);
        setCopiedFormat(format);
        setTimeout(() => setCopiedFormat(null), 2000);
    };

    const handleRandomColor = () => {
        setColor(generateRandomColor());
    };

    const formats = [
        { label: "HEX", value: color.toUpperCase() },
        { label: "RGB", value: rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : "" },
        {
            label: "HSL",
            value: hsl ? `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` : "",
        },
    ];

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-medium text-text-primary">
                    Color Tools
                </h2>
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleRandomColor}
                    className="h-6 px-2"
                >
                    <Icon name="refresh" size={12} />
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4">
                {/* Color Picker */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex gap-4">
                            <div className="relative group">
                                <input
                                    type="color"
                                    value={color}
                                    onChange={handleColorChange}
                                    className="w-20 h-20 rounded-xl cursor-pointer bg-transparent border-none p-0 overflow-hidden opacity-0 absolute inset-0 z-10"
                                />
                                <div
                                    className="w-20 h-20 rounded-xl border border-border-subtle shadow-sm"
                                    style={{ backgroundColor: color }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Icon
                                        name="edit"
                                        size={16}
                                        className="text-white drop-shadow-md"
                                    />
                                </div>
                            </div>
                            <div className="flex-1 space-y-2">
                                <Input
                                    placeholder="#3b82f6"
                                    value={color}
                                    onChange={(e) =>
                                        handleHexInput(e.target.value)
                                    }
                                    className="font-mono"
                                />
                                <Button
                                    size="sm"
                                    onClick={handleSaveColor}
                                    className="w-full"
                                >
                                    Save Color
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Color Formats */}
                <Card>
                    <CardContent className="p-4">
                        <h3 className="text-xs font-medium text-text-secondary mb-3">
                            Formats
                        </h3>
                        <div className="space-y-2">
                            {formats.map((format) => (
                                <div
                                    key={format.label}
                                    className="flex items-center justify-between bg-bg-subtle border border-border-subtle rounded-lg px-3 py-2"
                                >
                                    <span className="text-[10px] text-text-muted w-8 tracking-wider">
                                        {format.label}
                                    </span>
                                    <span className="text-xs text-text-primary font-mono flex-1 ml-2">
                                        {format.value}
                                    </span>
                                    <button
                                        onClick={() =>
                                            handleCopy(
                                                format.label,
                                                format.value
                                            )
                                        }
                                        className="p-1 text-text-muted hover:text-text-primary transition-colors"
                                    >
                                        <Icon
                                            name={
                                                copiedFormat === format.label
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

                {/* Contrast Checker */}
                <Card>
                    <CardContent className="p-4">
                        <h3 className="text-xs font-medium text-text-secondary mb-3">
                            Contrast Checker
                        </h3>
                        <div className="flex gap-3 mb-3">
                            <div className="flex-1">
                                <label className="text-[10px] text-text-muted mb-1 block">
                                    Foreground
                                </label>
                                <div className="flex items-center gap-2">
                                    <div className="relative w-8 h-8 flex-shrink-0">
                                        <input
                                            type="color"
                                            value={color}
                                            onChange={handleColorChange}
                                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                                        />
                                        <div
                                            className="w-full h-full rounded border border-border-subtle"
                                            style={{ backgroundColor: color }}
                                        />
                                    </div>
                                    <span className="text-xs font-mono text-text-primary">
                                        {color}
                                    </span>
                                </div>
                            </div>
                            <div className="flex-1">
                                <label className="text-[10px] text-text-muted mb-1 block">
                                    Background
                                </label>
                                <div className="flex items-center gap-2">
                                    <div className="relative w-8 h-8 flex-shrink-0">
                                        <input
                                            type="color"
                                            value={contrastColor}
                                            onChange={(e) =>
                                                setContrastColor(e.target.value)
                                            }
                                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                                        />
                                        <div
                                            className="w-full h-full rounded border border-border-subtle"
                                            style={{
                                                backgroundColor: contrastColor,
                                            }}
                                        />
                                    </div>
                                    <span className="text-xs font-mono text-text-primary">
                                        {contrastColor}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Preview */}
                        <div
                            className="rounded-lg p-4 mb-3 text-center border border-border-subtle"
                            style={{
                                backgroundColor: contrastColor,
                                color: color,
                            }}
                        >
                            <p className="text-sm font-bold">Sample Text</p>
                            <p className="text-xs opacity-90">
                                The quick brown fox
                            </p>
                        </div>

                        {/* Ratio */}
                        <div className="text-center mb-3">
                            <span className="text-2xl font-bold text-text-primary tracking-tight">
                                {contrastRatio.toFixed(2)}
                            </span>
                            <span className="text-text-muted ml-1 text-sm">
                                : 1
                            </span>
                        </div>

                        {/* WCAG Levels */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-bg-subtle rounded-lg p-2 border border-border-subtle">
                                <p className="text-[10px] text-text-muted mb-1 uppercase tracking-wider">
                                    Normal
                                </p>
                                <div className="flex items-center justify-between">
                                    <span
                                        className={
                                            wcagLevel.normalText.aa
                                                ? "text-green-500 font-medium"
                                                : "text-red-500/50"
                                        }
                                    >
                                        AA {wcagLevel.normalText.aa && "✓"}
                                    </span>
                                    <span
                                        className={
                                            wcagLevel.normalText.aaa
                                                ? "text-green-500 font-medium"
                                                : "text-red-500/50"
                                        }
                                    >
                                        AAA {wcagLevel.normalText.aaa && "✓"}
                                    </span>
                                </div>
                            </div>
                            <div className="bg-bg-subtle rounded-lg p-2 border border-border-subtle">
                                <p className="text-[10px] text-text-muted mb-1 uppercase tracking-wider">
                                    Large
                                </p>
                                <div className="flex items-center justify-between">
                                    <span
                                        className={
                                            wcagLevel.largeText.aa
                                                ? "text-green-500 font-medium"
                                                : "text-red-500/50"
                                        }
                                    >
                                        AA {wcagLevel.largeText.aa && "✓"}
                                    </span>
                                    <span
                                        className={
                                            wcagLevel.largeText.aaa
                                                ? "text-green-500 font-medium"
                                                : "text-red-500/50"
                                        }
                                    >
                                        AAA {wcagLevel.largeText.aaa && "✓"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Saved Colors */}
                {savedColors.length > 0 && (
                    <Card>
                        <CardContent className="p-4">
                            <h3 className="text-xs font-medium text-text-secondary mb-3">
                                Saved Colors
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {savedColors.map((savedColor) => (
                                    <div
                                        key={savedColor.id}
                                        className="relative group"
                                    >
                                        <button
                                            onClick={() =>
                                                setColor(savedColor.hex)
                                            }
                                            className="w-8 h-8 rounded-lg border border-border-active hover:scale-105 transition-transform"
                                            style={{
                                                backgroundColor: savedColor.hex,
                                            }}
                                            title={savedColor.hex}
                                        />
                                        <button
                                            onClick={() =>
                                                handleDeleteColor(savedColor.id)
                                            }
                                            className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-sm"
                                        >
                                            <Icon name="x" size={8} />
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
