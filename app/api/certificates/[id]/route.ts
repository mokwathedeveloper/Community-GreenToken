/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { generateCertificateSvg } from "@/lib/certificates/generate";

// GET /api/certificates/[id]
// PUBLIC — anyone with the certificate URL can view/download the SVG.
// Certificates are shareable proof documents; no auth required.

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!id || !/^[0-9a-f-]{36}$/.test(id)) {
    return NextResponse.json(
      { error: { code: "INVALID_ID", message: "Invalid certificate ID." } },
      { status: 400 },
    );
  }

  const supabase = createAdminClient();

  // 1. Fetch certificate row
  const { data: cert } = await (supabase as any)
    .from("certificates")
    .select("id, cert_number, action_type, tokens_earned, co2_kg_offset, proof_hash, stellar_tx_hash, issued_at, user_id, org_id")
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
      } | null;
    };

  if (!cert) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Certificate not found." } },
      { status: 404 },
    );
  }

  // 2. Fetch member display name (no FK join — avoids PGRST200 schema-cache errors)
  const { data: user } = await (supabase as any)
    .from("users")
    .select("display_name")
    .eq("id", cert.user_id)
    .maybeSingle() as { data: { display_name: string | null } | null };

  // 3. Fetch org name
  const { data: org } = await (supabase as any)
    .from("organizations")
    .select("name")
    .eq("id", cert.org_id)
    .maybeSingle() as { data: { name: string | null } | null };

  const svg = generateCertificateSvg({
    certNumber:    cert.cert_number,
    memberName:    user?.display_name ?? "Member",
    orgName:       org?.name ?? "GreenToken Community",
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
