import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { z } from "zod";

// GET /api/orgs/check-slug?slug=capetown
// Public endpoint — no auth required (used in onboarding form)

const slugSchema = z.string().regex(/^[a-z0-9-]{3,30}$/);

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug") ?? "";

  if (!slugSchema.safeParse(slug).success) {
    return NextResponse.json(
      { error: { code: "INVALID_SLUG", message: "Slug must be 3–30 lowercase letters, numbers, or hyphens." } },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();
  const { data } = await (supabase as any)
    .from("organizations")
    .select("id")
    .eq("slug", slug)
    .maybeSingle() as { data: { id: string } | null };

  return NextResponse.json({ data: { slug, available: !data } });
}
