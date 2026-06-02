"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

// Spec: DESIGN_SPEC.md Section 6.13
// Rule R-A11Y-06: Modals MUST trap focus when open. MUST return focus on close.
// Rule R-COMP-06: MUST respect prefers-reduced-motion.

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  icon?: ReactNode;
  iconColor?: string;
  size?: "sm" | "md" | "lg";
  children: ReactNode;
  className?: string;
}

const SIZES = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
};

export default function Modal({
  open,
  onClose,
  title,
  description,
  icon,
  iconColor = "text-primary-500",
  size = "md",
  children,
  className,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Save + restore focus (Rule R-A11Y-06)
  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      // Focus first focusable element inside modal
      const timer = setTimeout(() => {
        const focusable = dialogRef.current?.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        focusable?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      previousFocusRef.current?.focus();
    }
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Focus trap inside modal
  useEffect(() => {
    if (!open) return;
    const el = dialogRef.current;
    if (!el) return;

    const focusable = el.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    };

    el.addEventListener("keydown", trap);
    return () => el.removeEventListener("keydown", trap);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
      aria-describedby={description ? "modal-description" : undefined}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm motion-reduce:backdrop-blur-none"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Card */}
      <div
        ref={dialogRef}
        className={cn(
          "relative bg-white rounded-2xl shadow-modal w-full p-6",
          "animate-in fade-in zoom-in-95 duration-200 motion-reduce:animate-none",
          SIZES[size],
          className
        )}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-150"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Optional icon */}
        {icon && (
          <div className={cn("w-14 h-14 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-4", iconColor)}>
            <span className="w-8 h-8">{icon}</span>
          </div>
        )}

        {/* Title */}
        {title && (
          <h3 id="modal-title" className="text-lg font-bold text-gray-900 text-center mb-1">
            {title}
          </h3>
        )}

        {/* Description */}
        {description && (
          <p id="modal-description" className="text-sm text-gray-500 text-center mb-5">
            {description}
          </p>
        )}

        {children}
      </div>
    </div>
  );
}
