/**
 * @maataa/ui/primitives/Portal
 * React Portal wrapper for rendering content outside DOM hierarchy
 */

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";

export interface PortalProps {
  /**
   * Content to render in portal
   */
  children: React.ReactNode;

  /**
   * Target element for portal (defaults to document.body)
   */
  target?: Element | null;

  /**
   * Optional className for portal container
   */
  className?: string;

  /**
   * Optional styles for portal container
   */
  style?: React.CSSProperties;
}

/**
 * Portal
 * Renders content outside the normal DOM hierarchy
 * Useful for modals, dropdowns, tooltips, etc.
 */
export const Portal = ({ children, target, className, style }: PortalProps) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const targetElement = target || (typeof document !== "undefined" ? document.body : null);

  if (!targetElement) return null;

  return createPortal(
    <div className={className} style={style}>
      {children}
    </div>,
    targetElement
  );
};

Portal.displayName = "Portal";
