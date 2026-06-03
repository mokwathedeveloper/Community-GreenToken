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
  const { data, error } = await supabase
    .from("donation_records")
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
  const { data: bal } = await supabase
    .from("token_balances")
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

  // Deduct balance
  await supabase
    .from("token_balances")
    .update({ balance: bal.balance - tokensDonated, total_spent: bal.total_spent + tokensDonated })
    .eq("id", bal.id);

  // Record donation
  const { data: donation, error } = await supabase
    .from("donation_records")
    .insert({ org_id: auth.orgId, user_id: auth.userId, project_name: projectName, tokens_donated: tokensDonated })
    .select("id, project_name, tokens_donated, created_at")
    .single();

  if (error || !donation) {
    return NextResponse.json(
      { error: { code: "DB_ERROR", message: "Failed to record donation." } },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: donation, meta: { org_id: auth.orgId } }, { status: 201 });
}
