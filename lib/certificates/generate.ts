// Pure function — no I/O, no imports of server clients.
// Takes certificate data and returns a standalone SVG string.

export interface CertificateData {
  certNumber:     string;
  memberName:     string;
  orgName:        string;
  actionType:     string;   // raw DB value e.g. "TreePlanting"
  tokensEarned:   number;
  co2KgOffset:    number;
  proofHash:      string | null;
  stellarTxHash:  string | null;
  issuedAt:       Date;
}

const ACTION_LABELS: Record<string, string> = {
  Recycling:           "Recycling & Waste Reduction",
  TreePlanting:        "Tree Planting",
  Carpooling:          "Carpooling",
  EnergySaving:        "Energy Conservation",
  WaterSaving:         "Water Conservation",
  CommunityCleanup:    "Community Cleanup",
  CompostingOrganics:  "Composting Organics",
  PublicTransport:     "Public Transport Use",
  SolarEnergyUse:      "Solar Energy Use",
  BeachCleanup:        "Beach Cleanup",
};

export const CO2_OFFSETS_KG: Record<string, number> = {
  Recycling:           2.00,
  TreePlanting:        21.77,  // avg annual CO₂ absorbed by one tree
  Carpooling:          4.50,
  EnergySaving:        3.00,
  WaterSaving:         0.50,
  CommunityCleanup:    5.00,
  CompostingOrganics:  10.00,  // avoids methane from landfill
  PublicTransport:     4.00,
  SolarEnergyUse:      15.00,
  BeachCleanup:        5.00,
};

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function truncate(s: string, len: number): string {
  if (!s || s.length <= len) return s;
  return `${s.slice(0, Math.floor(len / 2))}…${s.slice(-Math.floor(len / 2))}`;
}

export function generateCertificateSvg(d: CertificateData): string {
  const actionLabel  = ACTION_LABELS[d.actionType] ?? d.actionType;
  const dateStr      = d.issuedAt.toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
  const txDisplay    = d.stellarTxHash ? truncate(d.stellarTxHash, 32) : "Pending on-chain confirmation";
  const proofDisplay = d.proofHash     ? truncate(d.proofHash, 32)     : "—";
  const co2Display   = d.co2KgOffset.toFixed(2);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 640" width="900" height="640">
  <defs>
    <linearGradient id="headerGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"   stop-color="#14532d"/>
      <stop offset="100%" stop-color="#166534"/>
    </linearGradient>
    <linearGradient id="badgeGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="#f0fdf4"/>
      <stop offset="100%" stop-color="#dcfce7"/>
    </linearGradient>
  </defs>

  <!-- Card background -->
  <rect width="900" height="640" rx="18" fill="#ffffff"/>
  <rect width="900" height="640" rx="18" fill="none" stroke="#d1fae5" stroke-width="2"/>

  <!-- Left accent stripe -->
  <rect x="0" y="0" width="10" height="640" rx="4" fill="#16a34a"/>

  <!-- Header band -->
  <rect x="10" y="0" width="890" height="108" fill="url(#headerGrad)"/>
  <rect x="10" y="105" width="890" height="3" fill="#4ade80" opacity="0.5"/>

  <!-- Header: logo -->
  <text x="46" y="48"
    font-family="system-ui,-apple-system,sans-serif"
    font-size="20" font-weight="700" fill="#86efac">&#127807; GreenToken</text>

  <!-- Header: certificate title -->
  <text x="46" y="78"
    font-family="system-ui,-apple-system,sans-serif"
    font-size="13" fill="#bbf7d0" letter-spacing="3">CARBON CREDIT CERTIFICATE</text>

  <!-- Header: cert number (top right) -->
  <text x="856" y="52"
    font-family="system-ui,-apple-system,sans-serif"
    font-size="10" fill="#6ee7b7" text-anchor="end" letter-spacing="1">CERTIFICATE No.</text>
  <text x="856" y="72"
    font-family="'Courier New',monospace"
    font-size="13" font-weight="600" fill="#86efac" text-anchor="end">${esc(d.certNumber)}</text>

  <!-- Body: "This certifies that" -->
  <text x="450" y="155"
    font-family="system-ui,-apple-system,sans-serif"
    font-size="13" fill="#9ca3af" text-anchor="middle" font-style="italic">This certifies that</text>

  <!-- Member name -->
  <text x="450" y="195"
    font-family="system-ui,-apple-system,sans-serif"
    font-size="30" font-weight="700" fill="#111827" text-anchor="middle">${esc(d.memberName)}</text>

  <!-- Organisation -->
  <text x="450" y="222"
    font-family="system-ui,-apple-system,sans-serif"
    font-size="13" fill="#6b7280" text-anchor="middle">representing <tspan font-weight="600" fill="#374151">${esc(d.orgName)}</tspan></text>

  <!-- "has performed" -->
  <text x="450" y="252"
    font-family="system-ui,-apple-system,sans-serif"
    font-size="13" fill="#9ca3af" text-anchor="middle">has performed a verified eco-action contributing to carbon reduction</text>

  <!-- Divider -->
  <line x1="180" y1="270" x2="720" y2="270" stroke="#e5e7eb" stroke-width="1"/>

  <!-- Action badge -->
  <rect x="240" y="283" width="420" height="158" rx="14" fill="url(#badgeGrad)" stroke="#86efac" stroke-width="1.5"/>

  <!-- Action type label -->
  <text x="450" y="313"
    font-family="system-ui,-apple-system,sans-serif"
    font-size="12" font-weight="700" fill="#15803d" text-anchor="middle" letter-spacing="1">${esc(actionLabel.toUpperCase())}</text>

  <!-- CO2 number — large focal point -->
  <text x="450" y="368"
    font-family="system-ui,-apple-system,sans-serif"
    font-size="52" font-weight="800" fill="#15803d" text-anchor="middle">${esc(co2Display)}</text>

  <!-- CO2 unit -->
  <text x="450" y="395"
    font-family="system-ui,-apple-system,sans-serif"
    font-size="14" fill="#16a34a" text-anchor="middle">kg CO&#x2082;e offset</text>

  <!-- Tokens row -->
  <text x="450" y="424"
    font-family="system-ui,-apple-system,sans-serif"
    font-size="12" fill="#4ade80" text-anchor="middle">&#127807; ${esc(String(d.tokensEarned.toLocaleString()))} GTK tokens earned</text>

  <!-- Date -->
  <text x="450" y="472"
    font-family="system-ui,-apple-system,sans-serif"
    font-size="13" fill="#6b7280" text-anchor="middle">Issued: <tspan font-weight="600" fill="#374151">${esc(dateStr)}</tspan></text>

  <!-- Divider -->
  <line x1="36" y1="492" x2="864" y2="492" stroke="#f3f4f6" stroke-width="1"/>

  <!-- Blockchain proof section -->
  <text x="46" y="514"
    font-family="system-ui,-apple-system,sans-serif"
    font-size="9" font-weight="700" fill="#9ca3af" letter-spacing="2">BLOCKCHAIN PROOF &#183; STELLAR NETWORK TESTNET</text>

  <text x="46" y="534"
    font-family="'Courier New',monospace"
    font-size="11" fill="#6b7280">TX: ${esc(txDisplay)}</text>

  <text x="46" y="552"
    font-family="'Courier New',monospace"
    font-size="10" fill="#9ca3af">Hash: ${esc(proofDisplay)}</text>

  <!-- Verified seal (bottom right) -->
  <circle cx="820" cy="535" r="58" fill="none" stroke="#bbf7d0" stroke-width="2" stroke-dasharray="5,3"/>
  <circle cx="820" cy="535" r="48" fill="#f0fdf4"/>
  <text x="820" y="524"
    font-family="system-ui,-apple-system,sans-serif"
    font-size="11" font-weight="700" fill="#15803d" text-anchor="middle">VERIFIED</text>
  <text x="820" y="540"
    font-family="system-ui,-apple-system,sans-serif"
    font-size="9" fill="#6b7280" text-anchor="middle">ON-CHAIN</text>
  <text x="820" y="556"
    font-family="system-ui,-apple-system,sans-serif"
    font-size="9" fill="#4ade80" text-anchor="middle">&#127807; GTK</text>

  <!-- Bottom border accent -->
  <rect x="10" y="626" width="880" height="14" rx="4" fill="#f0fdf4"/>
  <rect x="0" y="632" width="900" height="8" rx="4" fill="#16a34a" opacity="0.3"/>
</svg>`;
}
