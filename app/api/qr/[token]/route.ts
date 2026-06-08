/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

// GET /api/qr/[token]
// Public endpoint — returns event metadata for the QR landing page.
// Deliberately omits lat/lng (privacy) and internal fields.

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  if (!token || token.length > 64) {
    return NextResponse.json(
      { error: { code: "INVALID_TOKEN", message: "Invalid QR token." } },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  const { data: event, error } = await (supabase as any)
    .from("qr_events")
    .select(`
      label,
      description,
      action_type,
      tokens_award,
      valid_from,
      valid_until,
      is_active,
      radius_m,
      organizations ( name )
    `)
    .eq("token", token)
    .single() as {
      data: {
        label:         string;
        description:   string | null;
        action_type:   string;
        tokens_award:  number;
        valid_from:    string;
        valid_until:   string;
        is_active:     boolean;
        radius_m:      number;
        organizations: { name: string } | null;
      } | null;
      error: unknown;
    };

  if (error || !event) {
    return NextResponse.json(
      { error: { code: "EVENT_NOT_FOUND", message: "QR event not found." } },
      { status: 404 }
    );
  }

  // Compute status server-side — client never needs Date.now() in render
  const serverNow = Date.now();
  let status: "active" | "upcoming" | "expired" | "inactive";
  if (!event.is_active)                                              status = "inactive";
  else if (serverNow < new Date(event.valid_from).getTime())        status = "upcoming";
  else if (serverNow > new Date(event.valid_until).getTime())       status = "expired";
  else                                                               status = "active";

  return NextResponse.json({
    data: {
      label:        event.label,
      description:  event.description,
      action_type:  event.action_type,
      tokens_award: event.tokens_award,
      valid_from:   event.valid_from,
      valid_until:  event.valid_until,
      is_active:    event.is_active,
      has_location: true,  // always true — lat/lng are NOT NULL since migration 030
      radius_m:     event.radius_m,
      org_name:     event.organizations?.name ?? null,
      status,
    },
  });
}
