"use client";

import React from "react";

interface ScrollAreaProps {
  children: React.ReactNode;
  className?: string;
}

export default function ScrollArea({ children, className = "" }: ScrollAreaProps) {
  return <div className={`form-scroll-container ${className}`.trim()}>{children}</div>;
}
