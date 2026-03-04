import type { Viewport } from "next";

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#f8f9fb" },
        { media: "(prefers-color-scheme: dark)", color: "#0A0A0B" },
    ],
};
