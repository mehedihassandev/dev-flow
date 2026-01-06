import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

export default defineConfig({
    plugins: [react(), tailwindcss()],
    build: {
        outDir: "dist",
        rollupOptions: {
            input: {
                popup: resolve(__dirname, "popup.html"),
                recorder: resolve(__dirname, "recorder.html"),
                background: resolve(__dirname, "src/background/index.ts"),
                content: resolve(__dirname, "src/content/index.ts"),
            },
            output: {
                entryFileNames: (chunkInfo) => {
                    if (chunkInfo.name === "background") return "background.js";
                    if (chunkInfo.name === "content") return "content.js";
                    return "assets/[name]-[hash].js";
                },
                chunkFileNames: "assets/[name]-[hash].js",
                assetFileNames: "assets/[name]-[hash].[ext]",
            },
        },
        emptyOutDir: true,
    },
});
