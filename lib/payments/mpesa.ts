// M-Pesa Daraja B2C (Business to Customer) payment integration
// Docs: https://developer.safaricom.co.ke/APIs/BusinessToCustomer
//
// Required env vars (add to Vercel → Settings → Environment Variables):
//   MPESA_CONSUMER_KEY       — from Safaricom Developer Portal app
//   MPESA_CONSUMER_SECRET    — from Safaricom Developer Portal app
//   MPESA_SHORTCODE          — your M-Pesa business short code
//   MPESA_INITIATOR_NAME     — API operator username
//   MPESA_INITIATOR_PASSWORD — base64(OpenSSL_encrypt(password, Safaricom public cert))
//   MPESA_ENVIRONMENT        — "sandbox" | "production"  (default: sandbox)
//   NEXT_PUBLIC_APP_URL      — e.g. https://community-greentoken.vercel.app

const BASE_URL =
  process.env.MPESA_ENVIRONMENT === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";

export function isMpesaConfigured(): boolean {
  return !!(
    process.env.MPESA_CONSUMER_KEY &&
    process.env.MPESA_CONSUMER_SECRET &&
    process.env.MPESA_SHORTCODE &&
    process.env.MPESA_INITIATOR_NAME &&
    process.env.MPESA_INITIATOR_PASSWORD
  );
}

async function getAccessToken(): Promise<string> {
  const key    = process.env.MPESA_CONSUMER_KEY!;
  const secret = process.env.MPESA_CONSUMER_SECRET!;
  const creds  = Buffer.from(`${key}:${secret}`).toString("base64");

  const res = await fetch(
    `${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
    { headers: { Authorization: `Basic ${creds}` } }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`M-Pesa OAuth failed (${res.status}): ${body}`);
  }

  const json = await res.json() as { access_token: string };
  return json.access_token;
}

// Format phone: 0712345678 → 254712345678
export function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("254")) return digits;
  if (digits.startsWith("0"))   return `254${digits.slice(1)}`;
  return `254${digits}`;
}

export type B2CResult = {
  conversationId: string;
  originatorId:   string;
};

export async function b2cPayment(params: {
  amountKes:    number;   // KES, whole number
  phoneNumber:  string;   // raw format — will be normalized
  withdrawalId: string;   // used as Occasion (idempotency key)
  remarks:      string;   // description shown on M-Pesa statement
}): Promise<B2CResult> {
  const token = await getAccessToken();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://community-greentoken.vercel.app";

  // MPESA_B2C_COMMAND_ID defaults to "BusinessPayment".
  // If Safaricom rejects with "Credit Party customer type" error (ResultCode 17),
  // try "PromotionPayment" — it is more permissive in sandbox and for some shortcode types.
  const commandId = process.env.MPESA_B2C_COMMAND_ID ?? "BusinessPayment";

  const payload = {
    OriginatorConversationID: `gtk-${params.withdrawalId.slice(0, 16)}-${Date.now()}`,
    InitiatorName:            process.env.MPESA_INITIATOR_NAME,
    SecurityCredential:       process.env.MPESA_INITIATOR_PASSWORD,
    CommandID:                commandId,
    Amount:                   Math.round(params.amountKes),
    PartyA:                   process.env.MPESA_SHORTCODE,
    PartyB:                   formatPhone(params.phoneNumber),
    Remarks:                  params.remarks.slice(0, 100),
    QueueTimeOutURL:          `${appUrl}/api/payments/mpesa/callback`,
    ResultURL:                `${appUrl}/api/payments/mpesa/callback`,
    Occasion:                 params.withdrawalId,
  };

  const res = await fetch(`${BASE_URL}/mpesa/b2c/v3/paymentrequest`, {
    method:  "POST",
    headers: {
      Authorization:  `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`M-Pesa B2C request failed (${res.status}): ${body}`);
  }

  const json = await res.json() as {
    ResponseCode: string;
    ResponseDescription: string;
    ConversationID: string;
    OriginatorConversationID: string;
  };

  if (json.ResponseCode !== "0") {
    throw new Error(`M-Pesa B2C rejected: ${json.ResponseDescription}`);
  }

  return {
    conversationId: json.ConversationID,
    originatorId:   json.OriginatorConversationID,
  };
}
