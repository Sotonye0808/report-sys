/**
 * components/ui/Modal.tsx
 * Thin wrapper around Ant Design Modal with ds-token styling.
 */

"use client";

import { Modal as AntModal, type ModalProps } from "antd";
import { type ReactNode } from "react";

interface DsModalProps extends ModalProps {
  children?: ReactNode;
}

export function Modal({ children, ...props }: DsModalProps) {
  return (
    <AntModal centered destroyOnHidden className="ds-modal" {...props}>
      {children}
    </AntModal>
  );
}

export default Modal;
