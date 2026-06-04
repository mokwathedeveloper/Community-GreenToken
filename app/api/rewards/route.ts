import { NextRequest, NextResponse } from "next/server";
import { getAuthContext, unauthorized } from "@/lib/middleware/auth";
import { requireOrgAdmin } from "@/lib/middleware/adminGuard";
import { parseBody, createRewardSchema } from "@/lib/validation/schemas";
import { createAdminClient } from "@/lib/supabase/server";

// GET /api/rewards — org reward catalog
// POST /api/rewards — admin: add new reward

export async function GET(_req: NextRequest) {
  const auth = await getAuthContext();
  if (!auth) return unauthorized();
  if (!auth.orgId) return NextResponse.json({ data: [], meta: { org_id: "" } });

  const supabase = createAdminClient();
  const { data, error } = await (supabase as any)
    .from("rewards")
    .select("id, title, description, token_cost, stock, is_active, created_at")
    .eq("org_id", auth.orgId)
    .eq("is_active", true)
    .order("token_cost", { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: { code: "DB_ERROR", message: "Failed to fetch rewards." } },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: data ?? [], meta: { org_id: auth.orgId } });
}

export async function POST(req: NextRequest) {
  const auth  = await getAuthContext();
  const guard = requireOrgAdmin(auth);
  if (guard) return guard;

  const parsed = await parseBody(req, createRewardSchema);
  if ("error" in parsed) return parsed.error;

  const supabase = createAdminClient();
  const { data: reward, error } = await (supabase as any)
    .from("rewards")
    .insert({
      org_id:      auth!.orgId,
      title:       parsed.data.title,
      description: parsed.data.description,
      token_cost:  parsed.data.tokenCost,
      stock:       parsed.data.totalSupply ?? null,
      image_url:   parsed.data.imageUrl ?? null,
      is_active:   true,
    })
    .select("id, title, token_cost, is_active")
    .single();

  if (error || !reward) {
    return NextResponse.json(
      { error: { code: "DB_ERROR", message: "Failed to create reward." } },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: reward, meta: { org_id: auth!.orgId } }, { status: 201 });
}
