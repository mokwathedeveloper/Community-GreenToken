// Single row in the feature comparison table
// Owner: RockieRaheem

import type { ComparisonRow } from "@/lib/data/pricingData";

function Cell({ val }: { val: boolean | string }) {
  if (typeof val === "boolean") {
    return val
      ? <span className="text-primary-500 font-bold" aria-label="Included">✓</span>
      : <span className="text-gray-300"          aria-label="Not included">–</span>;
  }
  return <span className="text-gray-700 font-medium">{val}</span>;
}

export function FeatureTableRow({ feature, free, starter, pro, enterprise }: ComparisonRow) {
  return (
    <tr className="hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
      <td className="py-3.5 text-sm text-gray-700 font-medium">{feature}</td>
      {[free, starter, pro, enterprise].map((val, i) => (
        <td key={i} className="py-3.5 text-center text-sm">
          <Cell val={val} />
        </td>
      ))}
    </tr>
  );
}

// Mobile: each feature becomes an accordion item
export function FeatureMobileRow({ feature, free, starter, pro, enterprise }: ComparisonRow) {
  return (
    <details className="border-b border-gray-100 last:border-0">
      <summary className="flex items-center justify-between py-3 px-4 text-sm font-medium text-gray-800 cursor-pointer list-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none rounded">
        {feature}
        <span className="text-gray-400 text-xs ml-2" aria-hidden="true">▼</span>
      </summary>
      <div className="grid grid-cols-4 gap-2 px-4 pb-3 text-xs text-center text-gray-500">
        {["Free", "Starter", "Pro", "Ent."].map((h, i) => (
          <div key={h}>
            <p className="font-semibold text-gray-400 mb-1">{h}</p>
            <Cell val={[free, starter, pro, enterprise][i]} />
          </div>
        ))}
      </div>
    </details>
  );
}
