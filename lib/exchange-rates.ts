// Server-side only — do NOT import from client components.
// Fetches live KES/USD rate with a 1-hour in-process cache.

const GTK_TO_KES_BASE = parseFloat(process.env.GTK_RATE_KES ?? "0.50");
const CACHE_TTL_MS    = 60 * 60 * 1000; // 1 hour

let _usdPerKes: number | null = null;
let _cacheTime                = 0;

async function fetchUsdPerKes(): Promise<number> {
  const now = Date.now();
  if (_usdPerKes !== null && now - _cacheTime < CACHE_TTL_MS) return _usdPerKes;
  try {
    // open.er-api.com — free, no API key required, updated daily
    const res  = await fetch("https://open.er-api.com/v6/latest/KES", {
      next: { revalidate: 3600 },
    });
    const json = await res.json() as { rates?: Record<string, number> };
    const rate = json?.rates?.USD;
    if (typeof rate === "number" && rate > 0) {
      _usdPerKes = rate;
      _cacheTime  = now;
      return rate;
    }
  } catch { /* fall through to fallback */ }
  // Historical reference fallback — ~0.00777 USD per KES
  return 0.00777;
}

export interface ExchangeRates {
  gtkToKes:  number;  // GTK → KES  (platform business rate, env-configurable)
  gtkToUsd:  number;  // GTK → USD  (derived from live KES/USD rate)
  usdPerKes: number;  // live KES → USD rate
}

export async function getExchangeRates(): Promise<ExchangeRates> {
  const usdPerKes = await fetchUsdPerKes();
  return {
    gtkToKes:  GTK_TO_KES_BASE,
    gtkToUsd:  parseFloat((GTK_TO_KES_BASE * usdPerKes).toFixed(6)),
    usdPerKes,
  };
}

export function gtkToKes(gtk: number, rates?: ExchangeRates): number {
  return parseFloat((gtk * (rates?.gtkToKes ?? GTK_TO_KES_BASE)).toFixed(2));
}

export function gtkToUsd(gtk: number, rates: ExchangeRates): number {
  return parseFloat((gtk * rates.gtkToUsd).toFixed(4));
}
