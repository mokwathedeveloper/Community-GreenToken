/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getAuthContext, unauthorized } from "@/lib/middleware/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { generateCertificateSvg } from "@/lib/certificates/generate";

// GET /api/certificates/[id]
// Returns the SVG certificate for a verified action.
// Members see only their own; org admins see their org's.

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const auth = await getAuthContext();
  if (!auth) return unauthorized();

  const supabase = createAdminClient();

  const { data: cert } = await (supabase as any)
    .from("certificates")
    .select(`
      id, cert_number, action_type, tokens_earned, co2_kg_offset,
      proof_hash, stellar_tx_hash, issued_at,
      user_id, org_id,
      users!certificates_user_id_fkey(display_name),
      organizations!certificates_org_id_fkey(name)
    `)
    .eq("id", id)
    .single() as {
      data: {
        id:              string;
        cert_number:     string;
        action_type:     string;
        tokens_earned:   number;
        co2_kg_offset:   number;
        proof_hash:      string | null;
        stellar_tx_hash: string | null;
        issued_at:       string;
        user_id:         string;
        org_id:          string;
        users:           { display_name: string | null } | null;
        organizations:   { name: string | null } | null;
      } | null;
    };

  if (!cert) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Certificate not found." } },
      { status: 404 },
    );
  }

  // Authorization: member must own it OR be an admin/owner of the org
  const isOwner = cert.user_id === auth.userId;
  const isAdmin = auth.orgId === cert.org_id &&
    (auth.role === "admin" || auth.role === "owner" || auth.role === "superadmin");

  if (!isOwner && !isAdmin) {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "You do not have access to this certificate." } },
      { status: 403 },
    );
  }

  const svg = generateCertificateSvg({
    certNumber:    cert.cert_number,
    memberName:    cert.users?.display_name ?? "Member",
    orgName:       cert.organizations?.name ?? "GreenToken Community",
    actionType:    cert.action_type,
    tokensEarned:  cert.tokens_earned,
    co2KgOffset:   Number(cert.co2_kg_offset),
    proofHash:     cert.proof_hash,
    stellarTxHash: cert.stellar_tx_hash,
    issuedAt:      new Date(cert.issued_at),
  });

  return new NextResponse(svg, {
    status: 200,
    headers: {
      "Content-Type":        "image/svg+xml",
      "Cache-Control":       "public, max-age=3600, stale-while-revalidate=86400",
      "Content-Disposition": `inline; filename="certificate-${cert.cert_number}.svg"`,
    },
  });
}
