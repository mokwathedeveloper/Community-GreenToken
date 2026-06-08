/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

// POST /api/payments/mpesa/callback
// Safaricom Daraja calls this URL asynchronously after a B2C payment completes.
// Set MPESA_B2C_RESULT_URL=https://community-greentoken.vercel.app/api/payments/mpesa/callback
//
// This endpoint must return 200 quickly — Daraja retries on failure.
// No auth header — Safaricom sends a standard callback payload.

type DarajaResult = {
  Result: {
    ResultType:    number;
    ResultCode:    number;
    ResultDesc:    string;
    OriginatorConversationID: string;
    ConversationID:           string;
    TransactionID:            string;
    ResultParameters?: {
      ResultParameter: Array<{ Key: string; Value: unknown }>;
    };
    ReferenceData?: {
      ReferenceItem: { Key: string; Value: string };
    };
  };
};

export async function POST(req: NextRequest) {
  let body: DarajaResult;
  try {
    body = await req.json() as DarajaResult;
  } catch {
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }

  const result         = body.Result;
  const conversationId = result.ConversationID;
  const success        = result.ResultCode === 0;

  const supabase = createAdminClient();

  // Find the withdrawal by M-Pesa conversation ID (stored as payment_reference)
  const { data: wr } = await (supabase as any)
    .from("withdrawal_requests")
    .select("id, status")
    .eq("payment_reference", conversationId)
    .maybeSingle() as { data: { id: string; status: string } | null };

  if (!wr) {
    console.warn("[mpesa/callback] No withdrawal found for ConversationID:", conversationId);
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }

  if (wr.status !== "processing") {
    // Already handled (e.g. duplicate callback)
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }

  const mpesaTransactionId =
    result.ResultParameters?.ResultParameter?.find(p => p.Key === "TransactionID")?.Value as string | undefined;

  await (supabase as any)
    .from("withdrawal_requests")
    .update({
      status:         success ? "completed" : "failed",
      failure_reason: success ? null : result.ResultDesc,
      payment_reference: mpesaTransactionId ?? conversationId,
      processed_at:   new Date().toISOString(),
    })
    .eq("id", wr.id);

  console.log(
    `[mpesa/callback] Withdrawal ${wr.id}: ${success ? "completed" : "failed"} — ${result.ResultDesc}`
  );

  // Daraja requires this exact response body
  return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
}
