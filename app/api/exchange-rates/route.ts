import { NextResponse } from "next/server";
import { getExchangeRates } from "@/lib/exchange-rates";

// GET /api/exchange-rates
// Public endpoint — returns live GTK conversion rates.
// Client components use this to show GTK → KES / USD equivalents.

export async function GET() {
  const rates = await getExchangeRates();
  return NextResponse.json(
    { data: rates },
    {
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=7200",
      },
    },
  );
}
