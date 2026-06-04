import { NextRequest, NextResponse } from "next/server";
import { getAuthContext, unauthorized } from "@/lib/middleware/auth";
import { requireOrgAdmin } from "@/lib/middleware/adminGuard";
import { parseBody, updateOrgSchema } from "@/lib/validation/schemas";
import { createAdminClient } from "@/lib/supabase/server";

// GET /api/orgs/[id] — fetch org config
// PUT /api/orgs/[id] — update org settings

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthContext();
  if (!auth) return unauthorized();

  const { id } = await params;

  // Users can only fetch their own org
  if (id !== auth.orgId && auth.role !== "superadmin") {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Cannot access another organization." } },
      { status: 403 }
    );
  }

  const supabase = createAdminClient();
  const { data, error } = await (supabase as any)
    .from("organizations")
    .select("id, name, slug, token_name, token_symbol, primary_color, plan, subscription_status, member_limit, trial_ends_at, contract_address, contract_network, created_at")
    .eq("id", id)
    .single() as { data: Record<string, unknown> | null; error: unknown };

  if (error || !data) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Organization not found." } },
      { status: 404 }
    );
  }

  return NextResponse.json({ data, meta: { org_id: auth.orgId } });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth  = await getAuthContext();
  const guard = requireOrgAdmin(auth);
  if (guard) return guard;

  const { id } = await params;
  if (id !== auth!.orgId) {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Cannot update another organization." } },
      { status: 403 }
    );
  }

  const parsed = await parseBody(req, updateOrgSchema);
  if ("error" in parsed) return parsed.error;

  const supabase = createAdminClient();
  const { data, error } = await (supabase as any)
    .from("organizations")
    .update({
      ...(parsed.data.name            && { name:              parsed.data.name            }),
      ...(parsed.data.tokenName       && { token_name:        parsed.data.tokenName       }),
      ...(parsed.data.tokenSymbol     && { token_symbol:      parsed.data.tokenSymbol     }),
      ...(parsed.data.primaryColor    && { primary_color:     parsed.data.primaryColor    }),
      ...(parsed.data.logoUrl         && { logo_url:          parsed.data.logoUrl         }),
      ...(parsed.data.contractAddress && { contract_address:  parsed.data.contractAddress }),
      ...(parsed.data.contractNetwork && { contract_network:  parsed.data.contractNetwork }),
    })
    .eq("id", id)
    .select("id, name, slug, token_name, token_symbol, primary_color")
    .single();

  if (error) {
    return NextResponse.json(
      { error: { code: "DB_ERROR", message: "Failed to update organization." } },
      { status: 500 }
    );
  }

  return NextResponse.json({ data, meta: { org_id: auth!.orgId } });
}
