import { NextRequest, NextResponse } from "next/server";
import { getAuthContext, unauthorized } from "@/lib/middleware/auth";
import { requireOrgAdmin } from "@/lib/middleware/adminGuard";
import { parseBody, createInviteSchema } from "@/lib/validation/schemas";
import { createAdminClient } from "@/lib/supabase/server";

// POST /api/invites/create
// Rule R-SAAS-08: invite tokens MUST expire (default 7 days)
// Rule R-API-04: 201 Created

export async function POST(req: NextRequest) {
  const auth  = await getAuthContext();
  const guard = requireOrgAdmin(auth);
  if (guard) return guard;

  const parsed = await parseBody(req, createInviteSchema);
  if ("error" in parsed) return parsed.error;
  const { role, usesLeft, expiresInDays } = parsed.data;

  const supabase = createAdminClient();
  const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString();

  const { data: invite, error } = await (supabase as any)
    .from("invites")
    .insert({
      org_id:     auth!.orgId,
      created_by: auth!.userId,
      role,
      uses_left:  usesLeft ?? null,
      expires_at: expiresAt,
    })
    .select("id, token, role, expires_at, uses_left")
    .single();

  if (error || !invite) {
    return NextResponse.json(
      { error: { code: "DB_ERROR", message: "Failed to create invite." } },
      { status: 500 }
    );
  }

  const appUrl    = process.env.NEXT_PUBLIC_APP_URL ?? `https://${process.env.NEXT_PUBLIC_APP_DOMAIN ?? "localhost:3000"}`;
  const inviteUrl = `${appUrl}/join/${invite.token}`;

  return NextResponse.json(
    { data: { ...invite, inviteUrl }, meta: { org_id: auth!.orgId } },
    { status: 201 }
  );
}
