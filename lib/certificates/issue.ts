/* eslint-disable @typescript-eslint/no-explicit-any */
import { CO2_OFFSETS_KG } from "./generate";

export interface IssuedCertificate {
  id:         string;
  certNumber: string;
}

/**
 * Issues a carbon credit certificate for a verified action.
 * Idempotent — returns existing cert if already issued for this action.
 * Never throws; on any failure returns null (certificate is non-critical).
 */
export async function issueCertificate(
  actionId: string,
  supabase:  any,
): Promise<IssuedCertificate | null> {
  try {
    // 1. Check idempotency — one certificate per action
    const { data: existing } = await supabase
      .from("certificates")
      .select("id, cert_number")
      .eq("action_id", actionId)
      .maybeSingle() as { data: { id: string; cert_number: string } | null };

    if (existing) return { id: existing.id, certNumber: existing.cert_number };

    // 2. Fetch action with joined user display_name and org name
    const { data: action } = await supabase
      .from("actions")
      .select(`
        id, org_id, user_id, action_type, tokens_awarded, proof_hash, stellar_tx_hash,
        users!actions_user_id_fkey(display_name),
        organizations!actions_org_id_fkey(name)
      `)
      .eq("id", actionId)
      .single() as {
        data: {
          id:               string;
          org_id:           string;
          user_id:          string;
          action_type:      string;
          tokens_awarded:   number;
          proof_hash:       string | null;
          stellar_tx_hash:  string | null;
          users:            { display_name: string | null } | null;
          organizations:    { name: string | null } | null;
        } | null;
      };

    if (!action) return null;

    // 3. Build cert number: GTC-YYYY-XXXXXXXX (first 8 chars of action UUID, uppercase)
    const year       = new Date().getFullYear();
    const suffix     = action.id.replace(/-/g, "").slice(0, 8).toUpperCase();
    const certNumber = `GTC-${year}-${suffix}`;

    const co2KgOffset = CO2_OFFSETS_KG[action.action_type] ?? 3.00;

    // 4. Insert certificate row
    const { data: cert, error } = await supabase
      .from("certificates")
      .insert({
        action_id:       action.id,
        org_id:          action.org_id,
        user_id:         action.user_id,
        cert_number:     certNumber,
        action_type:     action.action_type,
        tokens_earned:   action.tokens_awarded ?? 0,
        co2_kg_offset:   co2KgOffset,
        proof_hash:      action.proof_hash ?? null,
        stellar_tx_hash: action.stellar_tx_hash ?? null,
      })
      .select("id, cert_number")
      .single() as { data: { id: string; cert_number: string } | null; error: unknown };

    if (error || !cert) return null;
    return { id: cert.id, certNumber: cert.cert_number };
  } catch {
    return null;
  }
}
