// Feature comparison table — desktop table + mobile accordion
// Spec §7: Mobile feature table collapses to accordion
// Owner: RockieRaheem

import type { ComparisonRow } from "@/lib/data/pricingData";
import { FeatureTableRow, FeatureMobileRow } from "./FeatureRow";

interface PricingTableProps {
  rows: ComparisonRow[];
}

export default function PricingTable({ rows }: PricingTableProps) {
  return (
    <>
      {/* ── Desktop table (md+) ────────────────────────────────────────── */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <caption className="sr-only">
            Feature comparison across Free, Starter, Pro, and Enterprise plans
          </caption>
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th scope="col" className="text-left py-4 text-gray-500 font-semibold w-1/3 text-sm">
                Features
              </th>
              {["Free", "Starter", "Pro", "Enterprise"].map((h) => (
                <th key={h} scope="col" className="text-center py-4 text-gray-800 font-bold text-sm">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <FeatureTableRow key={row.feature} {...row} />
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Mobile accordion (< md) ────────────────────────────────────── */}
      <div className="md:hidden bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="grid grid-cols-4 text-xs font-bold text-center py-2.5 bg-gray-50 border-b border-gray-100">
          <div className="pl-4 text-left col-span-1">Feature</div>
          {["Free", "Str.", "Pro", "Ent."].map((h) => (
            <div key={h} className="text-gray-500">{h}</div>
          ))}
        </div>
        {rows.map((row) => (
          <FeatureMobileRow key={row.feature} {...row} />
        ))}
      </div>
    </>
  );
}
