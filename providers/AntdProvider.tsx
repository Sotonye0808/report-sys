"use client";

import { App, ConfigProvider, theme } from "antd";
import { useTheme } from "next-themes";
import { type ReactNode, useEffect, useState } from "react";
import { getAntdTheme } from "@/lib/design-system/antd-theme";

interface AntdProviderProps {
  children: ReactNode;
}

export function AntdProvider({ children }: AntdProviderProps) {
  const { theme: currentTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && currentTheme === "dark";
  const dsTheme = getAntdTheme(isDark);

  return (
    <ConfigProvider
      theme={{
        ...dsTheme,
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <App>{children}</App>
    </ConfigProvider>
  );
}
