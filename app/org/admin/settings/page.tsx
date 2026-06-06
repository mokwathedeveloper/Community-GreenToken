"use client";

// Rules: R-FE-01, R-A11Y-01, R-A11Y-03, R-SAAS-10 (slug read-only after creation)
// Spec: ux_ui/feature_specv2/org_settings_page_md.md

import { useState, useEffect, type FormEvent } from "react";
import OrgAdminLayout from "@/components/layouts/OrgAdminLayout";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useUser } from "@/hooks/useUser";
import { cn } from "@/lib/utils";
import { MCheckCircle, MWarning } from "@/components/icons";

type Tab = "profile" | "token" | "contract" | "danger";

const ACTION_TYPES = [
  { id: "recycling",    label: "Recycling",       tokens: 10, enabled: true  },
  { id: "tree",         label: "Tree Planting",    tokens: 20, enabled: true  },
  { id: "carpool",      label: "Carpooling",       tokens: 15, enabled: true  },
  { id: "cleanup",      label: "Community Cleanup",tokens: 25, enabled: true  },
  { id: "energy",       label: "Energy Saving",    tokens: 12, enabled: false },
  { id: "water",        label: "Water Saving",     tokens: 10, enabled: false },
];

export default function OrgSettingsPage() {
  const { orgId, orgName, orgSlug } = useUser();

  const [tab,          setTab]          = useState<Tab>("profile");
  const [saving,       setSaving]       = useState(false);
  const [saved,        setSaved]        = useState(false);
  const [deleteConfirm,setDeleteConfirm]= useState("");
  const [actions,      setActions]      = useState(ACTION_TYPES);

  const [org, setOrg] = useState({
    name:         "",
    slug:         "",
    email:        "",
    tokenName:    "GreenToken",
    tokenSymbol:  "GTK",
    primaryColor: "#22c55e",
  });

  // Load real org data once available
  useEffect(() => {
    if (!orgId) return;
    fetch(`/api/orgs/${orgId}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.data) {
          setOrg({
            name:         res.data.name         ?? orgName ?? "",
            slug:         res.data.slug         ?? orgSlug ?? "",
            email:        res.data.email        ?? "",
            tokenName:    res.data.token_name   ?? "GreenToken",
            tokenSymbol:  res.data.token_symbol ?? "GTK",
            primaryColor: res.data.primary_color ?? "#22c55e",
          });
        }
      })
      .catch(console.error);
  }, [orgId, orgName, orgSlug]);

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!orgId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/orgs/${orgId}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          name:         org.name,
          tokenName:    org.tokenName,
          tokenSymbol:  org.tokenSymbol,
          primaryColor: org.primaryColor,
        }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        const err = await res.json();
        alert(err.error?.message ?? "Save failed");
      }
    } catch { alert("Network error — please try again."); }
    setSaving(false);
  }

  const TABS: { key: Tab; label: string }[] = [
    { key: "profile",  label: "Profile"   },
    { key: "token",    label: "Token"     },
    { key: "contract", label: "Contract"  },
    { key: "danger",   label: "Danger" },
  ];

  return (
    <OrgAdminLayout orgName="GreenFuture Org" plan="Pro Plan">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Organization Settings</h2>
        <p className="text-sm text-gray-500 mt-1">Configure your token, branding, and organization profile.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        {TABS.map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)}
            className={cn("px-5 py-2 rounded-lg text-sm font-medium capitalize transition-colors",
              tab === key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700",
              key === "danger" && "hover:text-red-500",
              "focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
            )}>
            {label}
          </button>
        ))}
      </div>

      {/* ── Profile ── */}
      {tab === "profile" && (
        <form onSubmit={save} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5 max-w-xl">
          <Input id="org-name" label="Organization Name" value={org.name}
            onChange={(e) => setOrg({ ...org, name: e.target.value })} required />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Subdomain <span className="text-xs text-gray-400 font-normal ml-1">(cannot be changed)</span>
            </label>
            <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50 overflow-hidden">
              <input value={org.slug} readOnly
                className="flex-1 px-4 py-2.5 text-sm text-gray-400 bg-gray-50 outline-none cursor-not-allowed" />
              <span className="px-3 py-2.5 text-sm text-gray-400 border-l">.greentoken.app</span>
            </div>
            <p className="text-xs text-amber-500 mt-1">R-SAAS-10: Subdomain is permanent after account creation.</p>
          </div>
          <Input id="org-email" label="Contact Email" type="email" value={org.email}
            onChange={(e) => setOrg({ ...org, email: e.target.value })} />
          <Button type="submit" variant="primary" size="md" loading={saving}>
            {saved ? <span className="flex items-center gap-1"><MCheckCircle className="w-4 h-4" /> Saved!</span> : "Save Profile"}
          </Button>
        </form>
      )}

      {/* ── Token ── */}
      {tab === "token" && (
        <form onSubmit={save} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5 max-w-xl">
          <div className="grid grid-cols-2 gap-4">
            <Input id="token-name" label="Token Name" value={org.tokenName}
              onChange={(e) => setOrg({ ...org, tokenName: e.target.value })} />
            <Input id="token-symbol" label="Symbol (3–5 chars)" value={org.tokenSymbol} maxLength={5}
              onChange={(e) => setOrg({ ...org, tokenSymbol: e.target.value.toUpperCase().slice(0, 5) })} />
          </div>
          <div>
            <label htmlFor="brand-color" className="block text-sm font-medium text-gray-700 mb-1.5">Brand Color</label>
            <div className="flex items-center gap-3">
              <input type="color" id="brand-color" value={org.primaryColor}
                onChange={(e) => setOrg({ ...org, primaryColor: e.target.value })}
                className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200" />
              <input value={org.primaryColor}
                onChange={(e) => setOrg({ ...org, primaryColor: e.target.value })}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-28 font-mono focus:ring-2 focus:ring-primary-500 focus:outline-none" />
              <div className="w-10 h-10 rounded-lg border border-gray-200" style={{ backgroundColor: org.primaryColor }} />
            </div>
          </div>

          {/* Action types */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Action Types &amp; Token Rewards</p>
            <div className="space-y-2">
              {actions.map((a, i) => (
                <div key={a.id} className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3">
                  <input type="checkbox" checked={a.enabled} id={`action-${a.id}`}
                    onChange={(e) => setActions((acts) => acts.map((x, j) => j === i ? { ...x, enabled: e.target.checked } : x))}
                    className="accent-primary-600" />
                  <label htmlFor={`action-${a.id}`} className="flex-1 text-sm text-gray-700">{a.label}</label>
                  <input type="number" value={a.tokens} min={1} max={100}
                    aria-label={`Token reward for ${a.label}`}
                    onChange={(e) => setActions((acts) => acts.map((x, j) => j === i ? { ...x, tokens: Number(e.target.value) } : x))}
                    className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-sm text-center focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                  <span className="text-xs text-gray-400">GTK</span>
                </div>
              ))}
            </div>
          </div>
          <Button type="submit" variant="primary" size="md" loading={saving}>
            {saved ? <span className="flex items-center gap-1"><MCheckCircle className="w-4 h-4" /> Saved!</span> : "Save Token Config"}
          </Button>
        </form>
      )}

      {/* ── Contract ── */}
      {tab === "contract" && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 max-w-xl space-y-4">
          <h3 className="font-semibold text-gray-900">Smart Contract Info</h3>
          <div className="bg-gray-50 rounded-xl p-4 font-mono text-xs text-gray-600 space-y-2">
            <p><span className="text-gray-800 font-medium">GreenToken Contract:</span> {process.env.NEXT_PUBLIC_GREEN_TOKEN_CONTRACT_ID ?? "—"}</p>
            <p><span className="text-gray-800 font-medium">ActionRegistry Contract:</span> {process.env.NEXT_PUBLIC_ACTION_REGISTRY_CONTRACT_ID ?? "—"}</p>
            <p><span className="text-gray-800 font-medium">Network:</span> Stellar Testnet</p>
            <p><span className="text-gray-800 font-medium">Token Symbol:</span> {org.tokenSymbol}</p>
            <p><span className="text-gray-800 font-medium">Decimals:</span> 7</p>
          </div>
          {process.env.NEXT_PUBLIC_GREEN_TOKEN_CONTRACT_ID && (
            <a href={`https://stellar.expert/explorer/testnet/contract/${process.env.NEXT_PUBLIC_GREEN_TOKEN_CONTRACT_ID}`}
              target="_blank" rel="noopener noreferrer"
              className="text-primary-600 text-sm hover:underline focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none rounded">
              View on Stellar Expert ↗
            </a>
          )}
        </div>
      )}

      {/* ── Danger Zone ── */}
      {tab === "danger" && (
        <div className="border-2 border-red-200 rounded-xl p-6 bg-red-50 max-w-xl space-y-4">
          <h3 className="text-red-700 font-semibold text-lg flex items-center gap-1.5"><MWarning className="w-5 h-5" aria-hidden="true" /> Danger Zone</h3>
          <p className="text-red-600 text-sm leading-relaxed">
            Deleting your organization <strong>permanently removes all members, tokens, and data</strong>.
            This action cannot be undone. All on-chain records remain on Stellar.
          </p>
          <div>
            <label htmlFor="delete-confirm" className="block text-sm font-medium text-red-700 mb-1.5">
              Type your org slug to confirm: <strong>{org.slug}</strong>
            </label>
            <input id="delete-confirm" value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder={org.slug}
              aria-describedby="delete-warning"
              className="w-full border border-red-300 rounded-lg px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-red-400 focus:outline-none" />
            <p id="delete-warning" className="text-xs text-red-500 mt-1">This action is permanent and irreversible.</p>
          </div>
          <Button
            variant="danger"
            size="md"
            disabled={deleteConfirm !== org.slug}
            onClick={() => alert("Delete org — Phase 2: calls DELETE /api/orgs/:id")}
          >
            Delete Organization
          </Button>
        </div>
      )}
    </OrgAdminLayout>
  );
}
