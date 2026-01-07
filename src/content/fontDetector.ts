// Font Detection Content Script
// This script runs on web pages to detect and display font information

interface FontInfo {
    family: string;
    size: string;
    weight: string;
    lineHeight: string;
    color: string;
    style: string;
}

class FontDetector {
    private isActive = false;
    private tooltip: HTMLDivElement | null = null;
    private lastElement: HTMLElement | null = null;

    constructor() {
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleMessage = this.handleMessage.bind(this);

        // Listen for messages from popup
        chrome.runtime.onMessage.addListener(this.handleMessage);
    }

    private handleMessage(
        message: { type: string; enabled?: boolean },
        _sender: chrome.runtime.MessageSender,
        sendResponse: (response?: unknown) => void
    ): boolean {
        if (message.type === "PING") {
            sendResponse({ success: true });
            return true;
        }

        if (message.type === "TOGGLE_FONT_INSPECTOR") {
            if (message.enabled) {
                this.activate();
            } else {
                this.deactivate();
            }
            sendResponse({ success: true });
            return true;
        }
        return false;
    }

    private activate(): void {
        if (this.isActive) return;

        this.isActive = true;
        document.addEventListener("mousemove", this.handleMouseMove);
        document.addEventListener("click", this.handleClick, true);

        // Add cursor style to body
        document.body.style.cursor = "crosshair";
    }

    private deactivate(): void {
        if (!this.isActive) return;

        this.isActive = false;
        document.removeEventListener("mousemove", this.handleMouseMove);
        document.removeEventListener("click", this.handleClick, true);

        // Remove tooltip if exists
        this.removeTooltip();

        // Reset cursor
        document.body.style.cursor = "";
        this.lastElement = null;
    }

    private handleMouseMove(event: MouseEvent): void {
        if (!this.isActive) return;

        const target = event.target as HTMLElement;

        // Skip if same element
        if (target === this.lastElement) return;

        this.lastElement = target;

        // Get font information
        const fontInfo = this.getFontInfo(target);

        // Update or create tooltip
        this.showTooltip(fontInfo, target, event.clientX, event.clientY);
    }

    private handleClick(event: MouseEvent): void {
        if (!this.isActive) return;

        // Prevent default click behavior when inspector is active
        event.preventDefault();
        event.stopPropagation();
    }

    private getFontInfo(element: HTMLElement): FontInfo {
        const styles = window.getComputedStyle(element);

        return {
            family: styles.fontFamily,
            size: styles.fontSize,
            weight: styles.fontWeight,
            lineHeight: styles.lineHeight,
            color: styles.color,
            style: styles.fontStyle,
        };
    }

    private showTooltip(
        fontInfo: FontInfo,
        element: HTMLElement,
        x: number,
        y: number
    ): void {
        if (!this.tooltip) {
            this.tooltip = this.createTooltip();
            document.body.appendChild(this.tooltip);
        }

        // Update tooltip content
        this.tooltip.innerHTML = `
            <div style="font-size: 13px; font-weight: 600; color: #22d3ee; margin-bottom: 8px; border-bottom: 1px solid rgba(34, 211, 238, 0.2); padding-bottom: 6px;">
                Font Information
            </div>
            <div style="display: flex; flex-direction: column; gap: 6px; font-size: 12px;">
                <div style="display: flex; justify-content: space-between; gap: 12px;">
                    <span style="color: #9ca3af;">Family:</span>
                    <span style="color: #fff; font-weight: 500; text-align: right; font-family: ${
                        fontInfo.family
                    };">${this.formatFontFamily(
            fontInfo.family,
            element
        )}</span>
                </div>
                <div style="display: flex; justify-content: space-between; gap: 12px;">
                    <span style="color: #9ca3af;">Size:</span>
                    <span style="color: #fff; font-weight: 500;">${
                        fontInfo.size
                    }</span>
                </div>
                <div style="display: flex; justify-content: space-between; gap: 12px;">
                    <span style="color: #9ca3af;">Weight:</span>
                    <span style="color: #fff; font-weight: 500;">${
                        fontInfo.weight
                    }</span>
                </div>
                <div style="display: flex; justify-content: space-between; gap: 12px;">
                    <span style="color: #9ca3af;">Line Height:</span>
                    <span style="color: #fff; font-weight: 500;">${
                        fontInfo.lineHeight
                    }</span>
                </div>
                <div style="display: flex; justify-content: space-between; gap: 12px;">
                    <span style="color: #9ca3af;">Style:</span>
                    <span style="color: #fff; font-weight: 500;">${
                        fontInfo.style
                    }</span>
                </div>
                <div style="display: flex; justify-content: space-between; gap: 12px; align-items: center;">
                    <span style="color: #9ca3af;">Color:</span>
                    <div style="display: flex; align-items: center; gap: 6px;">
                        <div style="width: 16px; height: 16px; border-radius: 3px; background-color: ${
                            fontInfo.color
                        }; border: 1px solid rgba(255,255,255,0.2);"></div>
                        <span style="color: #fff; font-weight: 500;">${this.rgbToHex(
                            fontInfo.color
                        )}</span>
                    </div>
                </div>
            </div>
        `;

        // Position tooltip
        this.positionTooltip(x, y);

        // Send font info to popup
        chrome.runtime
            .sendMessage({
                type: "FONT_DETECTED",
                fontInfo: {
                    family: this.formatFontFamily(fontInfo.family, element),
                    size: fontInfo.size,
                    weight: fontInfo.weight,
                    style: fontInfo.style,
                },
            })
            .catch(() => {
                // Popup might be closed, ignore error
            });
    }

    private createTooltip(): HTMLDivElement {
        const tooltip = document.createElement("div");
        tooltip.style.cssText = `
            position: fixed;
            z-index: 2147483647;
            background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
            border: 1px solid rgba(34, 211, 238, 0.3);
            border-radius: 8px;
            padding: 12px 14px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(34, 211, 238, 0.1);
            pointer-events: none;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            min-width: 280px;
            backdrop-filter: blur(10px);
        `;
        return tooltip;
    }

    private positionTooltip(x: number, y: number): void {
        if (!this.tooltip) return;

        const offset = 15;
        const tooltipRect = this.tooltip.getBoundingClientRect();

        let left = x + offset;
        let top = y + offset;

        // Check right edge
        if (left + tooltipRect.width > window.innerWidth) {
            left = x - tooltipRect.width - offset;
        }

        // Check bottom edge
        if (top + tooltipRect.height > window.innerHeight) {
            top = y - tooltipRect.height - offset;
        }

        this.tooltip.style.left = `${left}px`;
        this.tooltip.style.top = `${top}px`;
    }

    private removeTooltip(): void {
        if (this.tooltip && this.tooltip.parentNode) {
            this.tooltip.parentNode.removeChild(this.tooltip);
            this.tooltip = null;
        }
    }

    private formatFontFamily(family: string, element: HTMLElement): string {
        const actualFont = this.detectActualFont(element, family);
        // Clean up the font name
        return actualFont.replace(/['"`]/g, "");
    }

    private detectActualFont(element: HTMLElement, fontFamily: string): string {
        // List of system font keywords that should be resolved
        const systemKeywords = [
            "-apple-system",
            "BlinkMacSystemFont",
            "system-ui",
        ];

        // List of common real font names to try
        const commonFonts = [
            "Segoe UI",
            "Roboto",
            "Helvetica Neue",
            "Helvetica",
            "Arial",
            "sans-serif",
            "serif",
        ];

        // Parse font family list
        const fonts = fontFamily
            .split(",")
            .map((f) => f.trim().replace(/['"`]/g, ""));

        // If any system keyword is present, try canvas detection
        const hasSystemKeyword = fonts.some((f) => systemKeywords.includes(f));

        if (hasSystemKeyword) {
            // Try canvas detection on the full font list
            const detected = this.detectFontUsingCanvas(element, [
                ...fonts,
                ...commonFonts,
            ]);
            if (detected && !systemKeywords.includes(detected)) {
                return detected;
            }
        }

        // Return first non-system, non-generic font
        const genericFonts = [
            "sans-serif",
            "serif",
            "monospace",
            "cursive",
            "fantasy",
        ];

        const allKeywordsToSkip = [...systemKeywords, ...genericFonts];
        const firstGoodFont = fonts.find(
            (f) =>
                !allKeywordsToSkip.includes(f.toLowerCase()) &&
                !allKeywordsToSkip.includes(f)
        );

        return firstGoodFont || fonts[0];
    }

    private detectFontUsingCanvas(
        element: HTMLElement,
        fonts: string[]
    ): string | null {
        try {
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            if (!context) return null;

            const testText = "mmmmmmmmmmlli";
            const styles = window.getComputedStyle(element);
            const size = styles.fontSize;
            const weight = styles.fontWeight;

            // Measure with fallback font
            context.font = `${weight} ${size} monospace`;
            const fallbackWidth = context.measureText(testText).width;

            // Test each font
            for (const font of fonts) {
                if (!font || font === "monospace") continue;

                context.font = `${weight} ${size} "${font}", monospace`;
                const width = context.measureText(testText).width;

                // If width differs significantly, this font is being used
                if (Math.abs(width - fallbackWidth) > 0.1) {
                    return font;
                }
            }

            return null;
        } catch (error) {
            console.error("Font detection error:", error);
            return null;
        }
    }

    private rgbToHex(rgb: string): string {
        // Handle rgb() format
        const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        if (match) {
            const r = parseInt(match[1]);
            const g = parseInt(match[2]);
            const b = parseInt(match[3]);
            return `#${((1 << 24) + (r << 16) + (g << 8) + b)
                .toString(16)
                .slice(1)
                .toUpperCase()}`;
        }

        // Handle rgba() format
        const matchAlpha = rgb.match(
            /^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)$/
        );
        if (matchAlpha) {
            const r = parseInt(matchAlpha[1]);
            const g = parseInt(matchAlpha[2]);
            const b = parseInt(matchAlpha[3]);
            return `#${((1 << 24) + (r << 16) + (g << 8) + b)
                .toString(16)
                .slice(1)
                .toUpperCase()}`;
        }

        return rgb;
    }
}

// Initialize font detector when content script loads
const fontDetector = new FontDetector();

// Export for potential use in other modules
export default fontDetector;
