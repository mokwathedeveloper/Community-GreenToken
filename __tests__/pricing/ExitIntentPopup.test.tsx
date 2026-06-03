// Unit tests — ExitIntentPopup
// Owner: RockieRaheem

import { render, screen, fireEvent, act } from "@testing-library/react";
import ExitIntentPopup from "@/components/pricing/ExitIntentPopup";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem:   (k: string) => store[k] ?? null,
    setItem:   (k: string, v: string) => { store[k] = v; },
    removeItem:(k: string) => { delete store[k]; },
    clear:     () => { store = {}; },
  };
})();
Object.defineProperty(window, "localStorage", { value: localStorageMock });

describe("ExitIntentPopup", () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("does not render on mount (waiting for trigger)", () => {
    render(<ExitIntentPopup />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows popup after 30 seconds (mobile fallback)", () => {
    render(<ExitIntentPopup />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    act(() => { jest.advanceTimersByTime(30_001); });
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("shows 'Before you go...' heading when open", () => {
    render(<ExitIntentPopup />);
    act(() => { jest.advanceTimersByTime(30_001); });
    expect(screen.getByText(/Before you go/i)).toBeInTheDocument();
  });

  it("closes when dismiss button is clicked", () => {
    render(<ExitIntentPopup />);
    act(() => { jest.advanceTimersByTime(30_001); });
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    fireEvent.click(screen.getByText(/No thanks/i));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes on Escape key", () => {
    render(<ExitIntentPopup />);
    act(() => { jest.advanceTimersByTime(30_001); });
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("stores dismissal timestamp in localStorage", () => {
    render(<ExitIntentPopup />);
    act(() => { jest.advanceTimersByTime(30_001); });
    fireEvent.click(screen.getByText(/No thanks/i));
    expect(localStorageMock.getItem("gt_exit_popup_dismissed")).not.toBeNull();
  });

  it("does not show again within cooldown period", () => {
    localStorageMock.setItem("gt_exit_popup_dismissed", String(Date.now() - 1000));
    render(<ExitIntentPopup cooldownMs={86_400_000} />);
    act(() => { jest.advanceTimersByTime(30_001); });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("has trial CTA link pointing to /org/setup", () => {
    render(<ExitIntentPopup />);
    act(() => { jest.advanceTimersByTime(30_001); });
    const link = screen.getByText(/Start Free 14-Day Trial/i).closest("a");
    expect(link).toHaveAttribute("href", "/org/setup");
  });

  it("has aria-modal='true' for focus trap", () => {
    render(<ExitIntentPopup />);
    act(() => { jest.advanceTimersByTime(30_001); });
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
  });
});
