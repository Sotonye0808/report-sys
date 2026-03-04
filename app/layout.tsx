import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AntdProvider } from "@/providers/AntdProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";

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
  title: {
    default: "Harvesters Reporting System",
    template: "%s | Harvesters Reporting System",
  },
  description:
    "The central reporting system for Harvesters International Christian Centre — campus report submission, review, and analytics.",
  authors: [{ name: "Harvesters International Christian Centre" }],
  robots: { index: false, follow: false }, // internal system — no indexing
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
            </AuthProvider>
          </AntdProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
