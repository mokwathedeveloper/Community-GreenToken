import { NextResponse } from "next/server";
import { createServerSupabaseClient, createAdminClient } from "@/lib/supabase/server";

// Rule R-API-01: ALL API routes MUST extract org_id from JWT before querying
// Rule R-SAAS-01: org_id is derived server-side — never trust client-sent org_id

export interface AuthContext {
  userId: string;
  orgId:  string;          // empty string for new users / superadmins with no org
  role:   "owner" | "admin" | "member" | "superadmin";
  email:  string | null;
}

/**
 * Extracts auth context from the current request cookies.
 *
 * For new users (no org yet): returns { orgId: "", role: "member" }
 * For superadmin: returns { orgId: "", role: "superadmin" }
 * For org members: returns { orgId: uuid, role: "owner"|"admin"|"member" }
 * For unauthenticated: returns null
 *
 * Usage in API routes:
 *   const auth = await getAuthContext();
 *   if (!auth) return unauthorized();
 */
export async function getAuthContext(): Promise<AuthContext | null> {
  try {
    // createServerSupabaseClient uses createRouteHandlerClient,
    // which reads session cookies from the incoming Next.js request.
    const supabase = await createServerSupabaseClient();
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session?.user) return null;

    const user = session.user;

    // ── Super Admin check ──────────────────────────────────────────
    // Superadmin role is set in app_metadata by the service role,
    // never by the user. It's returned in the session user object.
    const isSuperAdmin = user.app_metadata?.role === "superadmin";
    if (isSuperAdmin) {
      return {
        userId: user.id,
        orgId:  "",
        role:   "superadmin",
        email:  user.email ?? null,
      };
    }

    // ── Org membership lookup ──────────────────────────────────────
    // Use admin client to bypass RLS for this internal lookup.
    // This is safe because we're only reading the calling user's own row.
    const adminClient = createAdminClient();
    const { data: member } = await adminClient
      .from("org_members")
      .select("org_id, role")
      .eq("user_id", user.id)
      .order("joined_at", { ascending: false })
      .limit(1)
      .maybeSingle() as {
        data: { org_id: string; role: string } | null;
      };

    // New users (no org created yet) get empty orgId and member role.
    // They can still call /api/orgs/create — the endpoint doesn't require orgId.
    return {
      userId: user.id,
      orgId:  member?.org_id ?? "",
      role:   (member?.role as AuthContext["role"]) ?? "member",
      email:  user.email ?? null,
    };
  } catch {
    return null;
  }
}

/** Standard 401 Unauthorized response */
export function unauthorized(message = "Authentication required.") {
  return NextResponse.json(
    { error: { code: "UNAUTHORIZED", message } },
    { status: 401 }
  );
}

/** Standard 403 Forbidden response */
export function forbidden(message = "Insufficient permissions.") {
  return NextResponse.json(
    { error: { code: "FORBIDDEN", message } },
    { status: 403 }
  );
}
