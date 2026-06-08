"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import Spinner from "@/components/ui/Spinner";

// Rule R-COMP-02: MUST NOT create raw <button> in pages. MUST use this component.
// Rule R-COLOR-02: primary variant uses primary-600 for WCAG AA on white text.
// Spec: DESIGN_SPEC.md Section 6.10

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "dark";

export type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white shadow-sm hover:shadow-md",
  secondary: "bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700",
  outline:
    "border-2 border-primary-500 text-primary-600 hover:bg-primary-50 active:bg-primary-100",
  ghost: "text-gray-600 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200",
  danger:
    "bg-red-500 hover:bg-red-600 active:bg-red-700 text-white shadow-sm",
  dark: "bg-primary-800 hover:bg-primary-900 active:bg-primary-950 text-white shadow-sm",
};

const SIZES: Record<ButtonSize, string> = {
  xs: "px-3 py-1.5 text-xs rounded-md",
  sm: "px-4 py-2 text-sm rounded-lg",
  md: "px-5 py-2.5 text-sm rounded-lg",
  lg: "px-6 py-3 text-base rounded-xl",
  xl: "px-8 py-3.5 text-base rounded-xl",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      icon,
      iconRight,
      fullWidth = false,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-busy={loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150",
          "focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:outline-none",
          "motion-reduce:transition-none",
          VARIANTS[variant],
          SIZES[size],
          fullWidth && "w-full",
          isDisabled && "opacity-50 cursor-not-allowed pointer-events-none",
          className
        )}
        {...props}
      >
        {loading && <Spinner size="sm" color="white" decorative />}
        {!loading && icon && (
          <span aria-hidden="true" className="w-4 h-4 flex-shrink-0">
            {icon}
          </span>
        )}
        {children}
        {iconRight && !loading && (
          <span aria-hidden="true" className="w-4 h-4 flex-shrink-0">
            {iconRight}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
