/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getAuthContext, unauthorized, forbidden } from "@/lib/middleware/auth";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * PUT /api/orgs/[id]/members/[userId]/role
 * Org owner/admin: change a member's role within the organization.
 *
 * Rules:
 * - Only owner or admin can change roles
 * - Only owner can promote/demote another admin
 * - Cannot change your own role
 * - Cannot demote the owner role (would leave org without owner)
 *
 * Body: { role: "admin" | "member" }
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  const auth = await getAuthContext();
  if (!auth) return unauthorized();

  const { id: orgId, userId: targetUserId } = await params;

  // Must be in this org with admin or owner role
  if (auth.orgId !== orgId && auth.role !== "superadmin") {
    return forbidden("You are not a member of this organization.");
  }
  if (!["owner", "admin", "superadmin"].includes(auth.role)) {
    return forbidden("Admin or owner role required to change member roles.");
  }

  // Cannot change your own role
  if (auth.userId === targetUserId) {
    return NextResponse.json(
      { error: { code: "SELF_ROLE_CHANGE", message: "You cannot change your own role." } },
      { status: 400 }
    );
  }

  let newRole: string;
  try {
    const body = await req.json();
    newRole = body.role;
    if (!["admin", "member"].includes(newRole)) {
      return NextResponse.json(
        { error: { code: "INVALID_ROLE", message: "Role must be 'admin' or 'member'." } },
        { status: 400 }
      );
    }
  } catch {
    return NextResponse.json({ error: { code: "BAD_REQUEST", message: "Invalid request body." } }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Check the target member's current role
  const { data: target } = await (supabase as any)
    .from("org_members")
    .select("role")
    .eq("org_id", orgId)
    .eq("user_id", targetUserId)
    .maybeSingle() as { data: { role: string } | null };

  if (!target) {
    return NextResponse.json(
      { error: { code: "NOT_MEMBER", message: "User is not a member of this organization." } },
      { status: 404 }
    );
  }

  // Protect the owner role — only superadmin can change owner-level
  if (target.role === "owner" && auth.role !== "superadmin") {
    return forbidden("Only a super admin can change the org owner's role.");
  }

  const { error } = await (supabase as any)
    .from("org_members")
    .update({ role: newRole })
    .eq("org_id", orgId)
    .eq("user_id", targetUserId);

  if (error) {
    return NextResponse.json(
      { error: { code: "DB_ERROR", message: "Failed to update role." } },
      { status: 500 }
    );
  }

  return NextResponse.json({
    data: { userId: targetUserId, orgId, role: newRole },
    meta: { org_id: orgId },
  });
}

/**
 * DELETE /api/orgs/[id]/members/[userId]/role
 * Remove a member from the org (admin/owner only).
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  const auth = await getAuthContext();
  if (!auth) return unauthorized();

  const { id: orgId, userId: targetUserId } = await params;

  if (auth.orgId !== orgId && auth.role !== "superadmin") {
    return forbidden("You are not a member of this organization.");
  }
  if (!["owner", "admin", "superadmin"].includes(auth.role)) {
    return forbidden("Admin or owner role required.");
  }
  if (auth.userId === targetUserId) {
    return NextResponse.json(
      { error: { code: "SELF_REMOVE", message: "You cannot remove yourself. Transfer ownership first." } },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  const { error } = await (supabase as any)
    .from("org_members")
    .delete()
    .eq("org_id", orgId)
    .eq("user_id", targetUserId);

  if (error) {
    return NextResponse.json({ error: { code: "DB_ERROR", message: "Failed to remove member." } }, { status: 500 });
  }

  return NextResponse.json({ data: { removed: true, userId: targetUserId }, meta: { org_id: orgId } });
}
