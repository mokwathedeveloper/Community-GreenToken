"use client";

// Rules: R-FE-01, R-A11Y-01, R-A11Y-03, R-SAAS-10 (slug permanent after step 1)
// Spec: ux_ui/feature_specv2/org_onboarding_page_md.md
// Mockup: assets/image/saas/org_onboarding_wizard.png

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/useUser";
import Link from "next/link";
import Image from "next/image";
import Button from "@/components/ui/Button";
import Input, { Select } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { MWarning, MGift, MRocket, MCheckCircle, MLeaf, MContentCopy } from "@/components/icons";

const STEPS = [
  "Organization Profile",
  "Token Config",
  "Choose Plan",
  "Deploy Contract",
  "Invite Members",
];

const ACTION_TYPES = [
  "Recycling", "Tree Planting", "Carpooling", "Energy Saving",
  "Water Saving", "Community Cleanup", "Composting", "Public Transport",
];

const PLANS = [
  { key: "free",    label: "FREE",    price: "$0/mo",    desc: "50 members" },
  { key: "starter", label: "STARTER", price: "$49/mo",   desc: "500 members" },
  { key: "pro",     label: "PRO",     price: "$199/mo",  desc: "5,000 members", highlight: true },
];

interface OrgForm {
  name:         string;
  slug:         string;
  type:         string;
  tokenName:    string;
  tokenSymbol:  string;
  primaryColor: string;
  plan:         string;
  selectedActions: string[];
}

export default function OrgSetupPage() {
  const router  = useRouter();
  const { orgId: existingOrgId, isLoading: userLoading } = useUser();

  const [step,  setStep]   = useState(1);
  const [saving, setSaving] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [slugStatus, setSlugStatus] = useState<"idle" | "checking" | "ok" | "taken">("idle");
  const [contractDeploying, setContractDeploying] = useState(false);
  const [contractDeployed,  setContractDeployed]  = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [orgId, setOrgId] = useState<string | null>(null);

  // Redirect to org admin if user already has an org — no need to re-setup
  useEffect(() => {
    if (!userLoading && existingOrgId) {
      router.replace("/org/admin");
    }
  }, [userLoading, existingOrgId, router]);

  const [form, setForm] = useState<OrgForm>({
    name: "", slug: "", type: "school", tokenName: "", tokenSymbol: "",
    primaryColor: "#22c55e", plan: "free", selectedActions: ["Recycling", "Tree Planting", "Carpooling"],
  });

  function update<K extends keyof OrgForm>(key: K, value: OrgForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function checkSlug(slug: string) {
    if (!slug || slug.length < 3) return;
    setSlugStatus("checking");
    try {
      const res  = await fetch(`/api/orgs/check-slug?slug=${slug}`);
      const json = await res.json();
      setSlugStatus(json.data?.available ? "ok" : "taken");
    } catch {
      setSlugStatus("idle");
    }
  }

  async function handleNext(e: FormEvent) {
    e.preventDefault();
    setSetupError(null);

    if (step === 1) {
      // Client-side validation before hitting the API
      if (!form.name.trim() || form.name.trim().length < 2) {
        setSetupError("Organization name must be at least 2 characters.");
        return;
      }
      if (!form.slug || form.slug.length < 3) {
        setSetupError("Subdomain must be at least 3 characters. It auto-fills from the org name.");
        return;
      }
      if (slugStatus === "taken") {
        setSetupError("That subdomain is already taken. Please choose another.");
        return;
      }

      setSaving(true);
      try {
        const res  = await fetch("/api/orgs/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name:        form.name.trim(),
            slug:        form.slug,
            type:        form.type || "other",
            tokenName:   form.tokenName.trim()   || "GreenToken",
            tokenSymbol: form.tokenSymbol.trim().toUpperCase() || "GTK",
          }),
        });
        const json = await res.json();

        if (!res.ok) {
          // API validation failed — show error and STOP (do not advance)
          setSetupError(json.error?.message ?? "Failed to create organization. Please check your inputs.");
          setSaving(false);
          return;
        }

        if (json.data?.id) {
          setOrgId(json.data.id);
          // Refresh JWT so useUser() picks up the new org_id + owner role immediately
          const supabase = createClient();
          await supabase.auth.refreshSession();
        }
      } catch {
        setSetupError("Network error. Please check your connection and try again.");
        setSaving(false);
        return;
      }
      setSaving(false);
    }

    // Only advance if step 1 succeeded (orgId set) or it's not step 1
    setStep((s) => Math.min(s + 1, STEPS.length));
  }

  async function deployContract() {
    if (!orgId) { setContractDeployed(true); return; }
    setContractDeploying(true);
    try {
      // Contracts are pre-deployed on testnet — register the shared addresses in the org record
      await fetch(`/api/orgs/${orgId}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          contractAddress: process.env.NEXT_PUBLIC_GREEN_TOKEN_CONTRACT_ID ?? "",
          contractNetwork: "testnet",
        }),
      });
      setContractDeployed(true);
    } catch {
      setContractDeployed(true); // non-blocking — UI can proceed
    } finally {
      setContractDeploying(false);
    }
  }

  async function generateInvite() {
    try {
      // Ensure JWT is fresh before calling invite API (orgId must be present)
      const supabase = createClient();
      await supabase.auth.refreshSession();

      const res  = await fetch("/api/invites/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "member", expiresInDays: 7 }),
      });
      const json = await res.json();
      if (json.data?.inviteUrl) setInviteLink(json.data.inviteUrl);
      else if (json.data?.token) {
        const base = typeof window !== "undefined" ? window.location.origin : "";
        setInviteLink(`${base}/join/${json.data.token}`);
      }
    } catch {
      setInviteLink(`${typeof window !== "undefined" ? window.location.origin : ""}/join/pending`);
    }
  }

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-bg-page flex flex-col items-center py-12 px-4">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 mb-8">
        <Image src="/branding/community-greentoken-logo.png" alt="" width={36} height={36} />
        <span className="font-bold text-gray-900">Community <span className="text-primary-600">GreenToken</span></span>
      </Link>

      {/* Progress */}
      <div className="w-full max-w-2xl mb-8">
        <div className="flex justify-between mb-3">
          {STEPS.map((label, i) => (
            <div key={label} className="flex flex-col items-center" style={{ width: `${100 / STEPS.length}%` }}>
              <div className={cn("w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors",
                i + 1 < step  ? "bg-primary-600 text-white" :
                i + 1 === step ? "bg-primary-600 text-white ring-4 ring-primary-100" :
                                  "bg-gray-100 text-gray-400")}>
                {i + 1 < step ? "✓" : i + 1}
              </div>
              <span className="text-xs text-gray-400 mt-1 text-center hidden sm:block leading-tight">{label}</span>
            </div>
          ))}
        </div>
        <div className="w-full bg-gray-100 h-2 rounded-full">
          <div className="bg-primary-600 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-2xl">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Step {step} of {STEPS.length} — {STEPS[step - 1]}
        </h2>

        {/* ── Step 1: Org Profile ── */}
        {step === 1 && (
          <form onSubmit={handleNext} noValidate className="space-y-5">
            {/* Inline error — shown when API returns 400 or validation fails */}
            {setupError && (
              <div role="alert" className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                <MWarning className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span>{setupError}</span>
              </div>
            )}
            <Input id="org-name" label="Organization Name *" placeholder="e.g. Cape Town City Council"
              value={form.name}
              onChange={(e) => {
                const name = e.target.value;
                update("name", name);
                // Auto-generate slug from name if slug is still empty or matches previous auto-slug
                const autoSlug = name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 30);
                if (!form.slug || form.slug === form.name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 30)) {
                  update("slug", autoSlug);
                }
              }}
              required />
            <div>
              <label htmlFor="org-slug" className="block text-sm font-medium text-gray-700 mb-1.5">
                Subdomain *
              </label>
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary-500">
                <input id="org-slug" value={form.slug} required
                  onChange={(e) => { const v = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,""); update("slug",v); checkSlug(v); }}
                  className="flex-1 px-4 py-2.5 text-sm outline-none" placeholder="capetown" />
                <span className="px-3 py-2.5 text-sm text-gray-400 bg-gray-50 border-l">.greentoken.app</span>
              </div>
              {slugStatus === "ok"   && <p className="text-xs text-primary-600 mt-1">✓ Available</p>}
              {slugStatus === "taken" && <p className="text-xs text-red-500 mt-1">✗ Already taken</p>}
              {slugStatus === "checking" && <p className="text-xs text-gray-400 mt-1">Checking…</p>}
            </div>
            <Select id="org-type" label="Organization Type"
              value={form.type} onChange={(e) => update("type", e.target.value)}
              options={["school","municipality","ngo","corporate","other"].map(t => ({ value: t, label: t.charAt(0).toUpperCase()+t.slice(1) }))} />
            <Button type="submit" variant="primary" size="lg" fullWidth loading={saving} disabled={slugStatus === "taken"}>
              Continue →
            </Button>
          </form>
        )}

        {/* ── Step 2: Token Config ── */}
        {step === 2 && (
          <form onSubmit={handleNext} noValidate className="space-y-5">
            <Input id="token-name" label="Token Name *" placeholder="CapeTownGreen"
              value={form.tokenName} onChange={(e) => update("tokenName", e.target.value)} required />
            <Input id="token-symbol" label="Token Symbol * (3–5 uppercase)" placeholder="CTG"
              value={form.tokenSymbol}
              onChange={(e) => update("tokenSymbol", e.target.value.toUpperCase().slice(0,5))} required maxLength={5} />
            <div>
              <label htmlFor="brand-color" className="block text-sm font-medium text-gray-700 mb-1.5">Brand Color</label>
              <div className="flex items-center gap-3">
                <input type="color" id="brand-color" value={form.primaryColor}
                  onChange={(e) => update("primaryColor", e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200" />
                <span className="text-sm font-mono text-gray-700">{form.primaryColor}</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Action Types</p>
              <div className="grid grid-cols-2 gap-2">
                {ACTION_TYPES.map((a) => (
                  <label key={a} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.selectedActions.includes(a)}
                      onChange={(e) => update("selectedActions",
                        e.target.checked ? [...form.selectedActions, a] : form.selectedActions.filter(x => x !== a))}
                      className="accent-primary-600" />
                    <span className="text-sm text-gray-700">{a}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" size="lg" onClick={() => setStep(1)}>← Back</Button>
              <Button type="submit" variant="primary" size="lg" fullWidth>Continue →</Button>
            </div>
          </form>
        )}

        {/* ── Step 3: Plan Selection ── */}
        {step === 3 && (
          <div className="space-y-5">
            <p className="text-xs text-gray-400 flex items-center gap-1"><MGift className="w-3.5 h-3.5" /> All plans include a 14-day Pro trial — no credit card required</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PLANS.map((p) => (
                <button key={p.key} type="button" onClick={() => update("plan", p.key)}
                  className={cn("border-2 rounded-xl p-5 text-left transition-all",
                    form.plan === p.key ? "border-primary-500 bg-primary-50" : "border-gray-100 hover:border-gray-200",
                    "focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none")}>
                  <p className="text-xs font-bold text-gray-500 mb-1">{p.label}</p>
                  <p className="text-xl font-extrabold text-gray-900">{p.price}</p>
                  <p className="text-xs text-gray-400 mt-1">{p.desc}</p>
                  {p.highlight && <span className="text-xs bg-primary-100 text-primary-700 font-bold px-2 py-0.5 rounded-full mt-2 inline-block">Most Popular</span>}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" size="lg" onClick={() => setStep(2)}>← Back</Button>
              <Button type="button" variant="primary" size="lg" fullWidth onClick={() => setStep(4)}>
                Continue →
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 4: Deploy Contract ── */}
        {step === 4 && (
          <div className="space-y-5 text-center">
            <p className="text-sm text-gray-500">Assign your organization&apos;s GreenToken smart contract on the Stellar Testnet.</p>
            {!contractDeployed ? (
              <Button variant="primary" size="lg" loading={contractDeploying} onClick={deployContract} icon={<MRocket className="w-4 h-4" />}>
                {contractDeploying ? "Deploying…" : "Deploy Contract"}
              </Button>
            ) : (
              <div className="bg-primary-50 rounded-xl p-5 space-y-2">
                <p className="text-primary-700 font-semibold text-sm flex items-center gap-1"><MCheckCircle className="w-4 h-4" /> Contract assigned!</p>
                <p className="text-xs font-mono text-gray-500">Network: Stellar Testnet</p>
                <p className="text-xs font-mono text-gray-500 break-all">
                  {process.env.NEXT_PUBLIC_GREEN_TOKEN_CONTRACT_ID ?? "—"}
                </p>
                {process.env.NEXT_PUBLIC_GREEN_TOKEN_CONTRACT_ID && (
                  <a href={`https://stellar.expert/explorer/testnet/contract/${process.env.NEXT_PUBLIC_GREEN_TOKEN_CONTRACT_ID}`}
                    target="_blank" rel="noopener noreferrer" className="text-xs text-primary-600 hover:underline">
                    View on Stellar Expert ↗
                  </a>
                )}
              </div>
            )}
            <div className="flex gap-2">
              <Button type="button" variant="ghost" size="lg" onClick={() => setStep(3)}>← Back</Button>
              <Button type="button" variant="primary" size="lg" fullWidth disabled={!contractDeployed} onClick={() => { generateInvite(); setStep(5); }}>
                Continue →
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 5: Invite Members ── */}
        {step === 5 && (
          <div className="space-y-5 text-center">
            <div className="flex justify-center mb-2"><MGift className="w-10 h-10 text-primary-600" /></div>
            <h3 className="text-lg font-bold text-gray-900">Your program is ready!</h3>
            <p className="text-sm text-gray-500">Share this invite link with your members:</p>
            <div className="bg-primary-50 border border-primary-200 rounded-xl px-4 py-3 flex items-center gap-2 justify-between">
              <span className="text-xs font-mono text-gray-700 truncate">
                {inviteLink ?? `${form.slug}.greentoken.app/join/...`}
              </span>
              <button
                onClick={() => inviteLink && navigator.clipboard?.writeText(inviteLink)}
                className="text-primary-600 text-xs font-medium flex-shrink-0 hover:underline focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none rounded"
                aria-label="Copy invite link">
                <MContentCopy className="w-4 h-4 inline-block mr-1" />Copy
              </button>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <Button variant="primary" size="lg" fullWidth onClick={() => router.push("/org/admin")} icon={<MLeaf className="w-4 h-4" />}>
                Go Live — Open Admin Dashboard
              </Button>
              <Button variant="ghost" size="sm" onClick={() => router.push("/org/admin")}>Skip for now</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
