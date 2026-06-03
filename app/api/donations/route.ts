import { NextRequest, NextResponse } from "next/server";
import { getAuthContext, unauthorized } from "@/lib/middleware/auth";
import { parseBody, createDonationSchema } from "@/lib/validation/schemas";
import { createAdminClient } from "@/lib/supabase/server";

// GET /api/donations — user's donation history
// POST /api/donations — allocate tokens to a project

export async function GET(req: NextRequest) {
  const auth = await getAuthContext();
  if (!auth) return unauthorized();

  const supabase = createAdminClient();
  const { data, error } = await (supabase as any).from("donation_records")
    .select("id, project_name, tokens_donated, tx_hash, created_at")
    .eq("org_id", auth.orgId)
    .eq("user_id", auth.userId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json(
      { error: { code: "DB_ERROR", message: "Failed to fetch donations." } },
      { status: 500 }
    );
  }

  return NextResponse.json({ data, meta: { org_id: auth.orgId } });
}

export async function POST(req: NextRequest) {
  const auth = await getAuthContext();
  if (!auth) return unauthorized();

  const parsed = await parseBody(req, createDonationSchema);
  if ("error" in parsed) return parsed.error;
  const { projectName, tokensDonated } = parsed.data;

  const supabase = createAdminClient();

  // Check balance
  const { data: bal } = await (supabase as any).from("token_balances")
    .select("id, balance, total_spent")
    .eq("org_id", auth.orgId)
    .eq("user_id", auth.userId)
    .single() as { data: { id: string; balance: number; total_spent: number } | null };

  if (!bal || bal.balance < tokensDonated) {
    return NextResponse.json(
      { error: { code: "INSUFFICIENT_BALANCE", message: "Not enough tokens to donate." } },
      { status: 409 }
    );
  }

  // Step 1: Deduct balance — check for errors before proceeding
  const { error: deductErr } = await (supabase as any)
    .from("token_balances")
    .update({ balance: bal.balance - tokensDonated, total_spent: bal.total_spent + tokensDonated })
    .eq("id", bal.id);

  if (deductErr) {
    console.error("[api/donations] balance deduction failed", deductErr);
    return NextResponse.json(
      { error: { code: "DB_ERROR", message: "Failed to deduct tokens. Donation not recorded." } },
      { status: 500 }
    );
  }

  // Step 2: Record donation — if this fails, restore the balance to prevent token loss
  const { data: donation, error: insertErr } = await (supabase as any)
    .from("donation_records")
    .insert({ org_id: auth.orgId, user_id: auth.userId, project_name: projectName, tokens_donated: tokensDonated })
    .select("id, project_name, tokens_donated, created_at")
    .single();

  if (insertErr || !donation) {
    console.error("[api/donations] donation insert failed — restoring balance", insertErr);
    // Compensating transaction: restore the deducted tokens
    await (supabase as any)
      .from("token_balances")
      .update({ balance: bal.balance, total_spent: bal.total_spent })
      .eq("id", bal.id);

    return NextResponse.json(
      { error: { code: "DB_ERROR", message: "Failed to record donation. Tokens have been restored." } },
      { status: 500 }
    );
  }
  // TODO Phase 2: replace with supabase.rpc("process_donation", { p_org_id, p_user_id, p_project, p_amount })
  //              for a true single-transaction atomic operation once the stored proc is deployed.

  return NextResponse.json({ data: donation, meta: { org_id: auth.orgId } }, { status: 201 });
}
