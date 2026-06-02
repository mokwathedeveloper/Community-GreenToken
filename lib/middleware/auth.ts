import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// Rule R-API-01: ALL API routes MUST extract org_id from JWT before querying
// Rule R-SAAS-01: org_id is extracted here — never trust client-sent org_id

export interface AuthContext {
  userId: string;
  orgId: string;
  role: "owner" | "admin" | "member" | "superadmin";
  email: string | null;
}

/**
 * Extracts and validates auth context from the current request JWT.
 * Returns null if not authenticated or JWT is missing required claims.
 *
 * Usage in API routes:
 *   const auth = await getAuthContext();
 *   if (!auth) return unauthorized();
 */
export async function getAuthContext(): Promise<AuthContext | null> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session?.user) return null;

    // Extract org_id and role from JWT custom claims
    // These are injected by the custom_jwt_claims hook in migration 014
    const jwt = session.access_token;
    let claims: Record<string, unknown> = {};

    try {
      const payload = jwt.split(".")[1];
      claims = JSON.parse(Buffer.from(payload, "base64").toString("utf-8"));
    } catch {
      return null;
    }

    const orgId = claims.org_id as string | undefined;
    const role  = claims.role  as string | undefined;

    if (!orgId || !role) return null;

    return {
      userId: session.user.id,
      orgId,
      role: role as AuthContext["role"],
      email: session.user.email ?? null,
    };
  } catch {
    return null;
  }
}

/** Standard 401 Unauthorized response */
export function unauthorized(message = "Authentication required") {
  return NextResponse.json(
    { error: { code: "UNAUTHORIZED", message } },
    { status: 401 }
  );
}

/** Standard 403 Forbidden response */
export function forbidden(message = "Insufficient permissions") {
  return NextResponse.json(
    { error: { code: "FORBIDDEN", message } },
    { status: 403 }
  );
}
