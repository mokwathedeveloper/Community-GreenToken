"use client";

// OrgBrand — displays the organization's logo and applies dynamic color theming.
// Used in AppTopBar and OrgAdminLayout to show per-org branding.
// Owner: RockieRaheem
// Spec: saas/saas_folder_structure.md — /components/org/OrgBrand.tsx

import Image from "next/image";
import { useOrg } from "@/hooks/useOrg";
import { cn } from "@/lib/utils";

interface OrgBrandProps {
  /** Show the org name text next to the logo */
  showName?: boolean;
  /** Override size (default: md) */
  size?:     "sm" | "md" | "lg";
  /** Additional className */
  className?: string;
}

const SIZE_MAP = {
  sm: { img: 24, text: "text-xs" },
  md: { img: 32, text: "text-sm" },
  lg: { img: 48, text: "text-base" },
};

export default function OrgBrand({ showName = true, size = "md", className }: OrgBrandProps) {
  const orgConfig = useOrg();
  const s = SIZE_MAP[size];

  // useOrg() may return null if not inside OrgProvider (e.g. public pages)
  if (!orgConfig) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="rounded-full bg-primary-100" style={{ width: s.img, height: s.img }} />
      </div>
    );
  }

  // Apply the org's primary_color as a CSS variable for theme overrides
  const orgColor = orgConfig.primaryColor ?? "#22c55e";

  return (
    <div
      className={cn("flex items-center gap-2", className)}
      style={{ "--org-color": orgColor } as React.CSSProperties}
    >
      {/* Logo: use org logo if available, fall back to initials avatar */}
      {orgConfig.logoUrl ? (
        <Image
          src={orgConfig.logoUrl}
          alt={`${orgConfig.orgName} logo`}
          width={s.img}
          height={s.img}
          className="rounded-full object-cover"
          sizes={`${s.img}px`}
        />
      ) : (
        <div
          className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
          style={{
            width:           s.img,
            height:          s.img,
            backgroundColor: orgColor,
            fontSize:        s.img * 0.4,
          }}
          aria-hidden="true"
        >
          {(orgConfig.orgName ?? "G").charAt(0).toUpperCase()}
        </div>
      )}

      {showName && (
        <div className="min-w-0">
          <p className={cn("font-semibold text-gray-900 truncate leading-tight", s.text)}>
            {orgConfig.orgName}
          </p>
          {orgConfig.tokenSymbol && (
            <p className="text-xs text-gray-400 leading-tight truncate">
              {orgConfig.tokenSymbol} · {orgConfig.plan ?? "free"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
