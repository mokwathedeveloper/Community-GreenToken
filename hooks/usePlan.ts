"use client";

import { useOrg } from "@/hooks/useOrg";

// Spec: TEAM_TASK_ASSIGNMENT.md — Tumusando Phase 1.6
// Rule R-FE-04: MUST use usePlan() to gate plan-restricted features

type PlanFeature =
  | "analytics"
  | "customToken"
  | "whiteLabel"
  | "apiAccess";

const FEATURE_PLAN_MAP: Record<PlanFeature, string[]> = {
  analytics:   ["starter", "pro", "enterprise"],
  customToken: ["starter", "pro", "enterprise"],
  whiteLabel:  ["pro", "enterprise"],
  apiAccess:   ["pro", "enterprise"],
};

interface PlanGateResult {
  canAccess:    boolean;
  currentPlan:  string;
  requiredPlan: string | null;
  isTrialing:   boolean;
}

/**
 * Check if the current org can access a plan-gated feature.
 *
 * @example
 * const { canAccess, requiredPlan } = usePlan('analytics');
 * if (!canAccess) return <UpgradeModal feature="Analytics" requiredPlan={requiredPlan} />;
 */
export function usePlan(feature: PlanFeature): PlanGateResult {
  const { plan, trialEndsAt } = useOrg();
  const allowedPlans = FEATURE_PLAN_MAP[feature];
  const canAccess = allowedPlans.includes(plan);
  const isTrialing = !!(trialEndsAt && new Date(trialEndsAt) > new Date());

  // During Pro trial, treat as Pro
  const effectivePlan = isTrialing ? "pro" : plan;
  const canAccessWithTrial = allowedPlans.includes(effectivePlan);

  const requiredPlan = canAccessWithTrial
    ? null
    : allowedPlans[0] ?? null;

  return {
    canAccess: canAccessWithTrial,
    currentPlan: plan,
    requiredPlan,
    isTrialing,
  };
}
