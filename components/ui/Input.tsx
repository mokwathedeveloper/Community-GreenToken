"use client";

import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

// Spec: DESIGN_SPEC.md Section 6.12
// Rule R-A11Y-03: ALL inputs MUST have associated <label> via htmlFor + id.
// Rule R-A11Y-04: Color must NOT be the only error indicator.

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
  iconRight?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, id, error, hint, icon, iconRight, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {icon && (
            <div
              aria-hidden="true"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 w-4 h-4"
            >
              {icon}
            </div>
          )}

          <input
            ref={ref}
            id={id}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${id}-error` : hint ? `${id}-hint` : undefined
            }
            className={cn(
              "w-full py-2.5 text-sm bg-white text-gray-900 placeholder-gray-400",
              "border rounded-lg transition-colors duration-150",
              "focus:outline-none focus:ring-2 focus:ring-offset-0",
              "motion-reduce:transition-none",
              icon ? "pl-10" : "pl-4",
              iconRight ? "pr-10" : "pr-4",
              error
                ? "border-red-300 focus:border-red-400 focus:ring-red-400"
                : "border-gray-200 focus:border-primary-500 focus:ring-primary-500",
              props.disabled && "bg-gray-50 text-gray-400 cursor-not-allowed",
              className
            )}
            {...props}
          />

          {iconRight && (
            <div
              aria-hidden="true"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 w-4 h-4"
            >
              {iconRight}
            </div>
          )}
        </div>

        {error && (
          <p
            id={`${id}-error`}
            role="alert"
            className="mt-1.5 text-xs text-red-500 flex items-center gap-1"
          >
            <span aria-hidden="true">⚠</span>
            {error}
          </p>
        )}

        {hint && !error && (
          <p id={`${id}-hint`} className="mt-1.5 text-xs text-gray-400">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;

// ── Select Dropdown ───────────────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, id, error, options, className, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={id}
          aria-invalid={!!error}
          className={cn(
            "w-full pl-4 pr-10 py-2.5 text-sm bg-white border border-gray-200 rounded-lg",
            "text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500",
            "appearance-none cursor-pointer transition-colors duration-150",
            error && "border-red-300 focus:ring-red-400",
            className
          )}
          {...props}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <div aria-hidden="true" className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && <p role="alert" className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  )
);

Select.displayName = "Select";

// ── Textarea ─────────────────────────────────────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, id, error, hint, className, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={id}
        aria-invalid={!!error}
        rows={4}
        className={cn(
          "w-full px-4 py-2.5 text-sm bg-white border rounded-lg resize-y text-gray-900 placeholder-gray-400",
          "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors",
          error ? "border-red-300 focus:ring-red-400" : "border-gray-200",
          className
        )}
        {...props}
      />
      {error && <p role="alert" className="mt-1.5 text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="mt-1.5 text-xs text-gray-400">{hint}</p>}
    </div>
  )
);

Textarea.displayName = "Textarea";
