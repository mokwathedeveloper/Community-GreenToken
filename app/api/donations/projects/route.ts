/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getAuthContext, unauthorized } from "@/lib/middleware/auth";
import { requireOrgAdmin } from "@/lib/middleware/adminGuard";
import { createAdminClient } from "@/lib/supabase/server";
import { z } from "zod";
import { parseBody } from "@/lib/validation/schemas";

// GET  /api/donations/projects  — list active donation projects for org (all members)
// POST /api/donations/projects  — admin creates a new donation project
// Spec: saas/saas_api_endpoints.md — Donations section

const createProjectSchema = z.object({
  name:        z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  goal_tokens: z.number().int().positive(),
  image_url:   z.string().url().optional(),
});

export async function GET(req: NextRequest) {
  const auth = await getAuthContext();
  if (!auth) return unauthorized();

  const supabase  = createAdminClient();
  const onlyActive = req.nextUrl.searchParams.get("status") !== "all";

  let query = (supabase as any)
    .from("donation_projects")
    .select("id, name, description, goal_tokens, raised_tokens, donor_count, image_url, is_active, created_at")
    .eq("org_id", auth.orgId)
    .order("created_at", { ascending: false });

  if (onlyActive) query = query.eq("is_active", true);

  const { data, error } = await query as { data: Record<string, unknown>[] | null; error: unknown };

  if (error) {
    // Table may not exist yet — return empty rather than 500
    return NextResponse.json({ data: [], meta: { org_id: auth.orgId } });
  }

  return NextResponse.json({ data: data ?? [], meta: { org_id: auth.orgId } });
}

export async function POST(req: NextRequest) {
  const auth  = await getAuthContext();
  const guard = requireOrgAdmin(auth);
  if (guard) return guard;

  const parsed = await parseBody(req, createProjectSchema);
  if ("error" in parsed) return parsed.error;
  const { name, description, goal_tokens, image_url } = parsed.data;

  const supabase = createAdminClient();

  const { data, error } = await (supabase as any)
    .from("donation_projects")
    .insert({
      org_id:        auth!.orgId,
      name,
      description,
      goal_tokens,
      raised_tokens: 0,
      donor_count:   0,
      image_url:     image_url ?? null,
      is_active:     true,
      created_by:    auth!.userId,
    })
    .select("id, name, goal_tokens, raised_tokens, is_active, created_at")
    .single() as { data: Record<string, unknown> | null; error: unknown };

  if (error) {
    return NextResponse.json(
      { error: { code: "DB_ERROR", message: "Failed to create donation project." } },
      { status: 500 }
    );
  }

  return NextResponse.json({ data }, { status: 201 });
}
