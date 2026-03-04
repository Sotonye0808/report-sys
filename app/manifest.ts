import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "Harvesters Reporting System",
        short_name: "HRS",
        description: "Central reporting system for Harvesters International Christian Centre",
        start_url: "/",
        display: "standalone",
        background_color: "#0A0A0B",
        theme_color: "#10b981",
        icons: [
            {
                src: "/logo/icon-192.png",
                sizes: "192x192",
                type: "image/png",
            },
            {
                src: "/logo/icon-512.png",
                sizes: "512x512",
                type: "image/png",
            },
        ],
    };
}
