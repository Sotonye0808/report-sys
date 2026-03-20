import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = process.env.APP_URL ?? "http://localhost:3000";

    return [
        { url: `${baseUrl}/`, lastModified: new Date() },
        { url: `${baseUrl}/login`, lastModified: new Date() },
        { url: `${baseUrl}/reports`, lastModified: new Date() },
        { url: `${baseUrl}/templates`, lastModified: new Date() },
        { url: `${baseUrl}/goals`, lastModified: new Date() },
        { url: `${baseUrl}/analytics`, lastModified: new Date() },
        { url: `${baseUrl}/settings`, lastModified: new Date() },
        { url: `${baseUrl}/bug-reports`, lastModified: new Date() },
        { url: `${baseUrl}/offline`, lastModified: new Date() },
    ];
}
