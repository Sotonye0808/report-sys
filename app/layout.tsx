import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AntdProvider } from "@/providers/AntdProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { ServiceWorkerRegistrar } from "@/components/ui/ServiceWorkerRegistrar";
import OfflineIndicator from "@/components/ui/OfflineIndicator";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  applicationName: "Harvesters Reporting System",
  title: {
    default: "Harvesters Reporting System",
    template: "%s | Harvesters Reporting System",
  },
  description:
    "The central report management platform for Harvesters International Christian Centre — campus report submission, review, and analytics.",
  authors: [{ name: "Harvesters International Christian Centre" }],
  robots: { index: false, follow: false }, // internal system — no indexing
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://reporting.harvesters.org"),
  openGraph: {
    type: "website",
    siteName: "Harvesters Reporting System",
    title: "Harvesters Reporting System",
    description:
      "The central report management platform for Harvesters International Christian Centre.",
    images: [
      {
        url: "/logo/white-bg-harvesters-Logo.svg",
        width: 512,
        height: 512,
        alt: "Harvesters International Christian Centre",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Harvesters Reporting System",
    description:
      "The central report management platform for Harvesters International Christian Centre.",
    images: ["/logo/white-bg-harvesters-Logo.svg"],
  },
  icons: {
    icon: [
      { url: "/logo/dark-bg-harvesters-Logo.ico", type: "image/x-icon", sizes: "any" },
      { url: "/icons/icon-192x192.png", type: "image/png", sizes: "192x192" },
      { url: "/icons/icon-512x512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/logo/white-bg-harvesters-Logo.svg", sizes: "180x180", type: "image/svg+xml" }],
  },
  appleWebApp: {
    title: "HRS",
    statusBarStyle: "default",
    capable: true,
  },
  formatDetection: { telephone: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AntdProvider>
            <AuthProvider>
              {/* Skip to main content — accessibility */}
              <a
                href="#main-content"
                className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-4 focus-visible:left-4 focus-visible:z-50 focus-visible:px-4 focus-visible:py-2 focus-visible:rounded-md focus-visible:bg-ds-brand-accent focus-visible:text-white"
              >
                Skip to main content
              </a>
              <main id="main-content">{children}</main>
              <OfflineIndicator />
              <ServiceWorkerRegistrar />
            </AuthProvider>
          </AntdProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
