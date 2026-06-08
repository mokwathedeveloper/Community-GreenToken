"use client";

import {
  createContext,
  useContext,
  useEffect,
  type ReactNode,
} from "react";

// Spec: architecture/frontend_architecture.md SaaS section
// Rule R-FE-03: MUST use useOrg() hook inside all app pages
// Rule: Dynamic CSS variable injection for per-org branding

export interface OrgConfig {
  orgId:        string;
  orgSlug:      string;
  orgName:      string;
  tokenName:    string;
  tokenSymbol:  string;
  primaryColor: string;
  logoUrl:      string | null;
  plan:         "free" | "starter" | "pro" | "enterprise";
  memberLimit:  number;
  trialEndsAt:  string | null;
  contractAddress: string | null;
}

const OrgContext = createContext<OrgConfig | null>(null);

interface OrgProviderProps {
  config: OrgConfig;
  children: ReactNode;
}

export function OrgProvider({ config, children }: OrgProviderProps) {
  // Inject org's brand color as CSS variable for dynamic theming
  useEffect(() => {
    if (config.primaryColor) {
      document.documentElement.style.setProperty(
        "--color-primary-500",
        config.primaryColor
      );
    }
    return () => {
      // Reset to default green on unmount
      document.documentElement.style.removeProperty("--color-primary-500");
    };
  }, [config.primaryColor]);

  return (
    <OrgContext.Provider value={config}>
      {children}
    </OrgContext.Provider>
  );
}

/** Use org config inside any app component */
export function useOrg(): OrgConfig {
  const ctx = useContext(OrgContext);
  if (!ctx) throw new Error("useOrg must be used inside OrgProvider");
  return ctx;
}

export default OrgContext;
