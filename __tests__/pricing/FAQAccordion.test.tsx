// Unit tests — FAQAccordion
// Owner: RockieRaheem

import { render, screen } from "@testing-library/react";
import FAQAccordion from "@/components/pricing/FAQAccordion";

const MOCK_ITEMS = [
  { q: "Question one?",  a: "Answer one." },
  { q: "Question two?",  a: "Answer two." },
];

describe("FAQAccordion", () => {
  it("renders all FAQ questions", () => {
    render(<FAQAccordion items={MOCK_ITEMS} />);
    expect(screen.getByText("Question one?")).toBeInTheDocument();
    expect(screen.getByText("Question two?")).toBeInTheDocument();
  });

  it("renders all answers", () => {
    render(<FAQAccordion items={MOCK_ITEMS} />);
    expect(screen.getByText("Answer one.")).toBeInTheDocument();
    expect(screen.getByText("Answer two.")).toBeInTheDocument();
  });

  it("uses <details> elements for native keyboard support (R-A11Y-10)", () => {
    const { container } = render(<FAQAccordion items={MOCK_ITEMS} />);
    const detailsEls = container.querySelectorAll("details");
    expect(detailsEls).toHaveLength(2);
  });

  it("uses <summary> inside each details", () => {
    const { container } = render(<FAQAccordion items={MOCK_ITEMS} />);
    const summaryEls = container.querySelectorAll("summary");
    expect(summaryEls).toHaveLength(2);
    expect(summaryEls[0]).toHaveTextContent("Question one?");
  });

  it("has role=list for screen readers", () => {
    render(<FAQAccordion items={MOCK_ITEMS} />);
    expect(screen.getByRole("list")).toBeInTheDocument();
  });

  it("renders empty state without error", () => {
    const { container } = render(<FAQAccordion items={[]} />);
    expect(container.querySelectorAll("details")).toHaveLength(0);
  });
});
