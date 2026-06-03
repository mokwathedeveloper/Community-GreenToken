"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

const ICONS: Record<ToastType, string> = {
  success: "✅",
  error:   "❌",
  info:    "ℹ️",
};

const STYLES: Record<ToastType, string> = {
  success: "bg-white border-l-4 border-primary-500 text-gray-800",
  error:   "bg-white border-l-4 border-red-500   text-gray-800",
  info:    "bg-white border-l-4 border-blue-500   text-gray-800",
};

export default function Toast({ message, type, onClose, duration = 4000 }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Animate in
    const show = setTimeout(() => setVisible(true), 10);
    // Auto-dismiss
    const hide = setTimeout(() => { setVisible(false); setTimeout(onClose, 300); }, duration);
    return () => { clearTimeout(show); clearTimeout(hide); };
  }, [duration, onClose]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        "fixed top-5 right-5 z-[9999] flex items-start gap-3 px-5 py-4 rounded-xl shadow-xl max-w-sm w-full",
        "transition-all duration-300",
        STYLES[type],
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3"
      )}
    >
      <span className="text-lg flex-shrink-0" aria-hidden="true">{ICONS[type]}</span>
      <p className="text-sm font-medium flex-1 leading-snug">{message}</p>
      <button
        onClick={() => { setVisible(false); setTimeout(onClose, 300); }}
        aria-label="Dismiss notification"
        className="text-gray-400 hover:text-gray-600 ml-1 flex-shrink-0 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none rounded"
      >
        ✕
      </button>
    </div>
  );
}

// Hook for easy usage
export function useToast() {
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  function show(message: string, type: ToastType = "success") {
    setToast({ message, type });
  }

  function clear() {
    setToast(null);
  }

  const node = toast ? (
    <Toast message={toast.message} type={toast.type} onClose={clear} />
  ) : null;

  return { show, node };
}
