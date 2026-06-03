// Unit tests — PricingCTAButton
// Owner: RockieRaheem

import { render, screen, fireEvent } from "@testing-library/react";
import PricingCTAButton from "@/components/pricing/PricingCTAButton";

describe("PricingCTAButton", () => {
  const defaultProps = {
    planName:  "PRO",
    label:     "Get Started",
    highlight: true,
    loading:   false,
    onClick:   jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it("renders the label", () => {
    render(<PricingCTAButton {...defaultProps} />);
    expect(screen.getByRole("button")).toHaveTextContent("Get Started");
  });

  it("includes plan name in aria-label (accessibility requirement)", () => {
    render(<PricingCTAButton {...defaultProps} />);
    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("aria-label", "Get Started — PRO plan");
  });

  it("calls onClick when clicked", () => {
    render(<PricingCTAButton {...defaultProps} />);
    fireEvent.click(screen.getByRole("button"));
    expect(defaultProps.onClick).toHaveBeenCalledTimes(1);
  });

  it("shows loading spinner when loading=true", () => {
    render(<PricingCTAButton {...defaultProps} loading={true} />);
    expect(screen.getByRole("button")).toHaveTextContent("Redirecting…");
  });

  it("is disabled when loading=true", () => {
    render(<PricingCTAButton {...defaultProps} loading={true} />);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("does not call onClick when disabled", () => {
    render(<PricingCTAButton {...defaultProps} loading={true} />);
    fireEvent.click(screen.getByRole("button"));
    expect(defaultProps.onClick).not.toHaveBeenCalled();
  });

  it("applies highlight styles for PRO plan", () => {
    render(<PricingCTAButton {...defaultProps} highlight={true} />);
    expect(screen.getByRole("button")).toHaveClass("bg-primary-600");
  });

  it("applies outline styles for non-highlight plans", () => {
    render(<PricingCTAButton {...defaultProps} highlight={false} />);
    expect(screen.getByRole("button")).toHaveClass("border-primary-500");
  });
});
