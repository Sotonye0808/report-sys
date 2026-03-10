"use client";

import { useEffect, useState } from "react";
import { VerticalAlignTopOutlined } from "@ant-design/icons";

/**
 * ScrollToTop — a floating "back to top" button that appears once the user
 * has scrolled past a threshold. Styled to match the ThemeToggle glassy pill.
 *
 * Pass the scrollable container ref so the component can read its scrollTop.
 * Clicking the button scrolls it back to the top with smooth behaviour.
 */
interface ScrollToTopProps {
  /** The scrollable container to monitor. Defaults to window if omitted. */
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
  /** Scroll distance (px) before the button appears. Default: 300 */
  threshold?: number;
}

export function ScrollToTop({ scrollContainerRef, threshold = 300 }: ScrollToTopProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = scrollContainerRef?.current ?? window;

    function onScroll() {
      const scrollY =
        el instanceof Window ? el.scrollY : (el as HTMLElement).scrollTop;
      setVisible(scrollY > threshold);
    }

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [scrollContainerRef, threshold]);

  function handleClick() {
    const el = scrollContainerRef?.current;
    if (el) {
      el.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Scroll to top"
      className={[
        // Positioning — fixed inside the scrollable main, bottom-right
        "fixed bottom-6 right-6 z-50",
        // Shape — circular, same 36px as ThemeToggle
        "flex items-center justify-center h-9 w-9 rounded-full",
        // Glassy surface — matches ThemeToggle exactly
        "bg-ds-surface-elevated/80 backdrop-blur-md",
        "border border-ds-border-base shadow-ds-md",
        // Hover / glow
        "hover:shadow-ds-lg ds-hover-glow",
        // Smooth appear / disappear
        "transition-all duration-300",
        visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-3 pointer-events-none",
      ].join(" ")}
    >
      <VerticalAlignTopOutlined className="text-sm text-ds-text-secondary" />
    </button>
  );
}
