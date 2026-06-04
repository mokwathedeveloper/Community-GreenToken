import { NextRequest, NextResponse } from "next/server";
import { getAuthContext, unauthorized } from "@/lib/middleware/auth";
import { parseBody, createDonationSchema } from "@/lib/validation/schemas";
import { createAdminClient } from "@/lib/supabase/server";

// GET /api/donations — user's donation history
// POST /api/donations — allocate tokens to a project

export async function GET(req: NextRequest) {
  const auth = await getAuthContext();
  if (!auth) return unauthorized();
  if (!auth.orgId) return NextResponse.json({ data: [], meta: { org_id: "" } });

  const supabase = createAdminClient();
  const { data, error } = await (supabase as any).from("donation_records")
    .select("id, project_name, tokens_donated, tx_hash, created_at")
    .eq("org_id", auth.orgId)
    .eq("user_id", auth.userId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    // Table may not exist yet or RLS blocking — return safe empty response
    // instead of 500 so the dashboard doesn't break
    console.error("[api/donations] query error:", error);
    return NextResponse.json({ data: [], meta: { org_id: auth.orgId } });
  }

  return NextResponse.json({ data: data ?? [], meta: { org_id: auth.orgId } });
}

export async function POST(req: NextRequest) {
  const auth = await getAuthContext();
  if (!auth) return unauthorized();
  if (!auth.orgId) return NextResponse.json({ error: { code: "NO_ORGANIZATION", message: "Complete org setup first." } }, { status: 422 });

  const parsed = await parseBody(req, createDonationSchema);
  if ("error" in parsed) return parsed.error;
  const { projectName, tokensDonated } = parsed.data;

  const supabase = createAdminClient();

  // Atomic deduct-and-insert in a single Postgres transaction (migration 021 process_donation RPC).
  // Eliminates the previous two-step compensating pattern — no window where tokens can be lost.
  const { data: result, error: rpcErr } = await (supabase as any)
    .rpc("process_donation", {
      p_org_id:  auth.orgId,
      p_user_id: auth.userId,
      p_project: projectName,
      p_tokens:  tokensDonated,
    }) as { data: { error?: string; id?: string; project_name?: string; tokens_donated?: number; created_at?: string } | null; error: unknown };

  if (rpcErr || !result) {
    console.error("[api/donations] process_donation rpc error", rpcErr);
    return NextResponse.json(
      { error: { code: "DB_ERROR", message: "Donation failed." } },
      { status: 500 }
    );
  }

  if (result.error === "INSUFFICIENT_BALANCE") {
    return NextResponse.json(
      { error: { code: "INSUFFICIENT_BALANCE", message: "Not enough tokens to donate." } },
      { status: 409 }
    );
  }

  if (result.error === "NO_BALANCE") {
    return NextResponse.json(
      { error: { code: "INSUFFICIENT_BALANCE", message: "Not enough tokens to donate." } },
      { status: 409 }
    );
  }

  return NextResponse.json({ data: result, meta: { org_id: auth.orgId } }, { status: 201 });
}
