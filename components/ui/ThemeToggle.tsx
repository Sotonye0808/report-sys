"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { MoonOutlined, SunOutlined } from "@ant-design/icons";
import { CONTENT } from "@/config/content";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const isDark = mounted && theme === "dark";

  const icon = isDark ? (
    <SunOutlined className="text-base text-yellow-500" />
  ) : (
    <MoonOutlined className="text-base text-ds-chart-1" />
  );

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="flex items-center justify-center h-9 w-9 rounded-full bg-ds-surface-elevated border border-ds-border-base shadow-ds-sm hover:shadow-ds-md ds-hover-glow transition-all duration-300 overflow-hidden"
      aria-label={`${CONTENT.common.switchTo} ${isDark ? CONTENT.common.lightMode : CONTENT.common.darkMode}`}
    >
      {icon}
    </button>
  );
}
