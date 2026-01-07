import { useState, useEffect, useCallback } from "react";
import { Icon } from "../Icon";
import {
    getFonts,
    saveFont,
    deleteFont,
    generateId,
} from "../../../shared/storage";
import type { SavedFont } from "../../../shared/types";

export function WhatFont() {
    const [isActive, setIsActive] = useState(false);
    const [savedFonts, setSavedFonts] = useState<SavedFont[]>([]);
    const [currentFont, setCurrentFont] = useState<SavedFont | null>(null);

    const loadSavedFonts = useCallback(async () => {
        const fonts = await getFonts();
        setSavedFonts(fonts);
    }, []);

    useEffect(() => {
        const init = async () => {
            await loadSavedFonts();
        };
        init();

        // Initialize state from background
        chrome.runtime.sendMessage(
            { type: "GET_INSPECTOR_STATUS" },
            (response) => {
                if (response) setIsActive(response.enabled);
            }
        );

        const handleMessage = (message: {
            type: string;
            enabled?: boolean;
            fontInfo?: Omit<SavedFont, "id" | "createdAt">;
        }) => {
            if (message.type === "INSPECTOR_STATE_CHANGED") {
                setIsActive(message.enabled ?? false);
            }
            if (message.type === "FONT_DETECTED" && message.fontInfo) {
                setCurrentFont({
                    id: "",
                    createdAt: 0,
                    ...message.fontInfo,
                });
            }
        };

        chrome.runtime.onMessage.addListener(handleMessage);
        return () => chrome.runtime.onMessage.removeListener(handleMessage);
    }, [loadSavedFonts]);

    const handleSaveFont = async () => {
        if (!currentFont) return;

        await saveFont({
            ...currentFont,
            id: generateId(),
            createdAt: Date.now(),
        });
        await loadSavedFonts();
    };

    const handleDeleteFont = async (id: string) => {
        await deleteFont(id);
        await loadSavedFonts();
    };

    const toggleFontInspector = async () => {
        const newState = !isActive;
        setIsActive(newState); // Optimistic update

        try {
            chrome.runtime.sendMessage(
                {
                    type: "TOGGLE_INSPECTOR",
                    data: newState,
                },
                (response) => {
                    if (response && typeof response.enabled === "boolean") {
                        setIsActive(response.enabled);
                    }
                }
            );
        } catch (error) {
            console.error("Error toggling font inspector:", error);
            setIsActive(!newState); // Revert on error
        }
    };

    return (
        <div className="h-full flex flex-col">
            <h2 className="text-sm font-medium text-text-primary mb-3">
                Font Inspector
            </h2>

            <div className="flex-1 overflow-y-auto space-y-3">
                {/* Toggle Section */}
                <div className="bg-bg-subtle border border-border-subtle rounded-lg p-3">
                    <button
                        onClick={toggleFontInspector}
                        className={`
                            w-full px-3 py-2 rounded-md text-xs font-medium
                            transition-all duration-200 flex items-center justify-center gap-2
                            ${
                                isActive
                                    ? "bg-cyan-500 text-white hover:bg-cyan-600"
                                    : "bg-bg-surface text-text-primary hover:bg-bg-subtle border border-border-subtle"
                            }
                        `}
                    >
                        <Icon name="type" size={14} />
                        {isActive ? "Deactivate" : "Activate"} Inspector
                    </button>

                    {isActive && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-cyan-400">
                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                            Hover over text to detect fonts
                        </div>
                    )}
                </div>

                {/* Current Font */}
                {currentFont && (
                    <div className="bg-bg-subtle border border-border-subtle rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xs font-medium text-text-secondary">
                                Current Font
                            </h3>
                            <button
                                onClick={handleSaveFont}
                                className="text-xs px-2 py-1 bg-bg-surface hover:bg-bg-subtle border border-border-subtle rounded text-text-primary transition-colors"
                            >
                                Save
                            </button>
                        </div>
                        <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                                <span className="text-text-muted">Family:</span>
                                <span className="text-text-primary font-medium">
                                    {currentFont.family}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-muted">Size:</span>
                                <span className="text-text-primary">
                                    {currentFont.size}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-muted">Weight:</span>
                                <span className="text-text-primary">
                                    {currentFont.weight}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-muted">Style:</span>
                                <span className="text-text-primary">
                                    {currentFont.style}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Saved Fonts */}
                {savedFonts.length > 0 && (
                    <div className="bg-bg-subtle border border-border-subtle rounded-lg p-3">
                        <h3 className="text-xs font-medium text-text-secondary mb-2">
                            Saved Fonts
                        </h3>
                        <div className="space-y-2">
                            {savedFonts.map((font) => (
                                <div
                                    key={font.id}
                                    className="group bg-bg-surface border border-border-subtle rounded-md p-2 hover:border-border-active transition-colors"
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-medium text-text-primary">
                                            {font.family}
                                        </span>
                                        <button
                                            onClick={() =>
                                                handleDeleteFont(font.id)
                                            }
                                            className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-500/10 rounded transition-all"
                                        >
                                            <Icon
                                                name="x"
                                                size={10}
                                                className="text-red-500"
                                            />
                                        </button>
                                    </div>
                                    <div className="flex gap-2 text-[10px] text-text-muted">
                                        <span>{font.size}</span>
                                        <span>•</span>
                                        <span>{font.weight}</span>
                                        <span>•</span>
                                        <span>{font.style}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
