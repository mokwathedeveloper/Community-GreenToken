/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getAuthContext, unauthorized } from "@/lib/middleware/auth";
import { createAdminClient } from "@/lib/supabase/server";

// POST /api/certificates/backfill
// Issues missing carbon credit certificates for every verified action
// belonging to the current user that does not already have a certificate.
// Idempotent — safe to call multiple times.
// Returns { issued, skipped } counts.

export async function POST() {
  const auth = await getAuthContext();
  if (!auth) return unauthorized();

  const supabase = createAdminClient();

  // 1. Fetch all verified action IDs for this user
  const { data: actions, error: actErr } = await (supabase as any)
    .from("actions")
    .select("id")
    .eq("user_id", auth.userId)
    .eq("status", "verified") as {
      data: { id: string }[] | null;
      error: unknown;
    };

  if (actErr || !actions) {
    return NextResponse.json(
      { error: { code: "DB_ERROR", message: "Could not fetch verified actions." } },
      { status: 500 },
    );
  }

  if (actions.length === 0) {
    return NextResponse.json({ data: { issued: 0, skipped: 0, message: "No verified actions to process." } });
  }

  const actionIds = actions.map((a) => a.id);

  // 2. Find action IDs that already have a certificate
  const { data: existing } = await (supabase as any)
    .from("certificates")
    .select("action_id")
    .in("action_id", actionIds) as { data: { action_id: string }[] | null };

  const alreadyIssued = new Set((existing ?? []).map((c) => c.action_id));
  const missing       = actionIds.filter((id) => !alreadyIssued.has(id));

  if (missing.length === 0) {
    return NextResponse.json({
      data: { issued: 0, skipped: actions.length, message: "All certificates already issued." },
    });
  }

  // 3. Issue certificates for missing actions
  const { issueCertificate } = await import("@/lib/certificates/issue");
  let issued = 0;

  for (const actionId of missing) {
    const result = await issueCertificate(actionId, supabase);
    if (result) issued++;
  }

  return NextResponse.json({
    data: {
      issued,
      skipped: alreadyIssued.size,
      total:   actions.length,
      message: `Issued ${issued} certificate${issued !== 1 ? "s" : ""} for ${issued} verified action${issued !== 1 ? "s" : ""}.`,
    },
  });
}
