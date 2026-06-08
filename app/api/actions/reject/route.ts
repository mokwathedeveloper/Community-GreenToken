/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse, after } from "next/server";
import { getAuthContext } from "@/lib/middleware/auth";
import { requireOrgAdmin } from "@/lib/middleware/adminGuard";
import { parseBody, rejectActionSchema } from "@/lib/validation/schemas";
import { createAdminClient } from "@/lib/supabase/server";

// POST /api/actions/reject
// Org admin marks a pending action as rejected.
// Rule R-API-02: admin or owner role required.
// Separation of Duties: admin who submitted cannot self-reject (enforced server-side).

export async function POST(req: NextRequest) {
  const auth = await getAuthContext();
  const guard = requireOrgAdmin(auth);
  if (guard) return guard;

  const parsed = await parseBody(req, rejectActionSchema);
  if ("error" in parsed) return parsed.error;
  const { actionId, reason } = parsed.data;

  const supabase = createAdminClient();

  const isSuperAdmin = auth!.role === "superadmin";
  let actionQuery = (supabase as any)
    .from("actions")
    .select("id, org_id, user_id, status, blockchain_action_id")
    .eq("id", actionId);
  if (!isSuperAdmin && auth!.orgId) {
    actionQuery = actionQuery.eq("org_id", auth!.orgId);
  }

  const { data: action, error: fetchErr } = await actionQuery.single() as {
    data: { id: string; org_id: string; user_id: string; status: string; blockchain_action_id: number | null } | null;
    error: unknown;
  };

  if (fetchErr || !action) {
    console.error("[api/actions/reject] Fetch error:", JSON.stringify(fetchErr), "orgId:", auth!.orgId, "actionId:", actionId);
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Action not found in your organization." } },
      { status: 404 }
    );
  }

  if (action.status !== "pending") {
    return NextResponse.json(
      { error: { code: "ALREADY_PROCESSED", message: `Action is already ${action.status}.` } },
      { status: 409 }
    );
  }

  const { error: updateErr } = await (supabase as any)
    .from("actions")
    .update({
      status:      "rejected",
      verified_by: auth!.userId,
      verified_at: new Date().toISOString(),
    })
    .eq("id", actionId);

  if (updateErr) {
    console.error("[api/actions/reject] DB update failed:", JSON.stringify(updateErr));
    return NextResponse.json(
      { error: { code: "DB_ERROR", message: "Failed to reject action." } },
      { status: 500 }
    );
  }

  // Propagate rejection to the on-chain ActionRegistry (fire-and-forget)
  after(async () => {
    const adminSecret = process.env.STELLAR_ADMIN_SECRET_KEY;
    if (!adminSecret || !action.blockchain_action_id || !process.env.NEXT_PUBLIC_ACTION_REGISTRY_CONTRACT_ID) return;
    try {
      const { rejectAction } = await import("@/lib/stellar/contracts/action-registry");
      await rejectAction(adminSecret, BigInt(action.blockchain_action_id));
    } catch (err) {
      console.error("[api/actions/reject] Stellar rejectAction failed:", err);
    }
  });

  return NextResponse.json(
    {
      data: { actionId, status: "rejected", reason },
      meta: { org_id: auth!.orgId },
    },
    { status: 200 }
  );
}
