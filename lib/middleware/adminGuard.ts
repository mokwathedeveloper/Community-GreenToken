import { NextResponse } from "next/server";
import type { AuthContext } from "@/lib/middleware/auth";

// Rule R-SAAS-04: Super admin routes MUST check role === 'superadmin' server-side
// Rule: NEVER trust client-side role checks for admin operations

/**
 * Guard for super admin API routes.
 * Returns null if allowed, NextResponse error if not.
 */
export function requireSuperAdmin(auth: AuthContext | null): NextResponse | null {
  if (!auth) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Authentication required." } },
      { status: 401 }
    );
  }
  if (auth.role !== "superadmin") {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Super admin access required." } },
      { status: 403 }
    );
  }
  return null;
}

/**
 * Guard for org admin API routes (owner or admin role required).
 */
export function requireOrgAdmin(auth: AuthContext | null): NextResponse | null {
  if (!auth) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Authentication required." } },
      { status: 401 }
    );
  }
  if (!["owner", "admin", "superadmin"].includes(auth.role)) {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Admin access required." } },
      { status: 403 }
    );
  }
  return null;
}

/**
 * Guard for org owner-only routes.
 */
export function requireOrgOwner(auth: AuthContext | null): NextResponse | null {
  if (!auth) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Authentication required." } },
      { status: 401 }
    );
  }
  if (!["owner", "superadmin"].includes(auth.role)) {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Organization owner access required." } },
      { status: 403 }
    );
  }
  return null;
}
