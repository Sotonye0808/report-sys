import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-ds-surface-sunken flex items-center justify-center p-4">
      {/* Subtle brand gradient backdrop */}
      <div className="fixed inset-0 bg-gradient-to-br from-ds-brand-accent-subtle/30 via-transparent to-transparent pointer-events-none" />
      <div className="fixed top-4 right-4 z-10">
        <ThemeToggle />
      </div>
      <div className="relative w-full max-w-md">{children}</div>
    </div>
  );
}
