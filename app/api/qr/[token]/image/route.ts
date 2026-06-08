/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import QRCode from "qrcode";

// GET /api/qr/[token]/image
// Returns a server-generated SVG QR code for the event's scan URL.
// The admin page embeds this via <img src="/api/qr/{token}/image" />.

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  if (!token || token.length > 64) {
    return new NextResponse("Invalid token", { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: event } = await (supabase as any)
    .from("qr_events")
    .select("id")
    .eq("token", token)
    .single();

  if (!event) {
    return new NextResponse("QR event not found", { status: 404 });
  }

  const appUrl  = process.env.NEXT_PUBLIC_APP_URL ?? `https://${process.env.NEXT_PUBLIC_APP_DOMAIN ?? "localhost:3000"}`;
  const scanUrl = `${appUrl}/qr/${token}`;

  const svg = await QRCode.toString(scanUrl, {
    type:         "svg",
    margin:       2,
    width:        300,
    color:        { dark: "#166534", light: "#ffffff" }, // primary-800 green on white
    errorCorrectionLevel: "M",
  });

  return new NextResponse(svg, {
    status: 200,
    headers: {
      "Content-Type":  "image/svg+xml",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
