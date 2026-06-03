import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

// Spec: DESIGN_SPEC.md Section 6.4
// Mockup: dashboard_page_mockup.png — 4 stat cards top row

interface StatCardProps {
  icon:         ReactNode;
  iconBg:       string;
  iconColor:    string;
  label:        string;
  value:        string | number;
  change?:      string;
  changeType?:  "up" | "down";
  className?:   string;
}

export default function StatCard({
  icon, iconBg, iconColor, label, value, change, changeType, className,
}: StatCardProps) {
  const positive = changeType === "up";

  return (
    <div className={cn(
      "bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow duration-200",
      className
    )}>
      <div className="flex items-start justify-between mb-3">
        {/* Icon */}
        <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0", iconBg)}>
          <span className={cn("w-6 h-6", iconColor)} aria-hidden="true">{icon}</span>
        </div>

        {/* Change badge */}
        {change && (
          <span className={cn(
            "flex items-center gap-0.5 text-xs font-medium px-2 py-0.5 rounded-full",
            positive ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
          )}>
            {positive ? "↑" : "↓"} {change}
          </span>
        )}
      </div>

      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}
