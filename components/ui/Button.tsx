/**
 * components/ui/Button.tsx
 * Wrapper around Ant Design Button providing consistent ds-token styling.
 */

import { Button as AntButton, type ButtonProps } from "antd";
import { type ReactNode } from "react";

interface DsButtonProps extends ButtonProps {
  children?: ReactNode;
}

export function Button({ className = "", ...props }: DsButtonProps) {
  return <AntButton className={className} {...props} />;
}

export default Button;
