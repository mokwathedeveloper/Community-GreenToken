// Spec §8 + R-A11Y-10: uses <details>/<summary> for native keyboard + screen reader support
// Owner: RockieRaheem

import type { FaqItem } from "@/lib/data/pricingData";

interface FAQAccordionProps {
  items: FaqItem[];
}

export default function FAQAccordion({ items }: FAQAccordionProps) {
  return (
    <div className="space-y-3" role="list" aria-label="Frequently asked questions">
      {items.map(({ q, a }) => (
        <details
          key={q}
          role="listitem"
          className="bg-white border border-gray-100 rounded-xl shadow-sm group"
        >
          <summary
            className={[
              "flex justify-between items-center px-6 py-4 cursor-pointer",
              "text-sm font-medium text-gray-900 list-none rounded-xl",
              "focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none",
            ].join(" ")}
          >
            <span>{q}</span>
            <span
              className="text-primary-500 text-xl ml-4 flex-shrink-0 group-open:rotate-45 transition-transform duration-200"
              aria-hidden="true"
            >
              +
            </span>
          </summary>
          <p className="px-6 pb-5 text-sm text-gray-500 leading-relaxed border-t border-gray-50 pt-3">
            {a}
          </p>
        </details>
      ))}
    </div>
  );
}
