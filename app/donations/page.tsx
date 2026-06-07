"use client";

import { useState, useEffect } from "react";
import AppLayout from "@/components/layouts/AppLayout";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import ProgressBar from "@/components/ui/ProgressBar";
import { cn } from "@/lib/utils";
import { MHeart, MCoin, MPeople, MLeaf, MTree, MRecycle, MWbSunny, MWaterDrop, MAttachMoney, MWarning } from "@/components/icons";

type StatusFilter = "All Projects" | "Ongoing" | "Completed";
const FILTERS: StatusFilter[] = ["All Projects", "Ongoing", "Completed"];

// Icon mapping by project name keywords
function projectIcon(name: string): {
  Icon: typeof MTree;
  iconColor: string;
} {
  const n = name.toLowerCase();
  if (n.includes("tree") || n.includes("plant") || n.includes("forest"))
    return { Icon: MTree,      iconColor: "text-green-700"  };
  if (n.includes("solar") || n.includes("energy") || n.includes("sun"))
    return { Icon: MWbSunny,   iconColor: "text-amber-500"  };
  if (n.includes("water") || n.includes("clean water"))
    return { Icon: MWaterDrop, iconColor: "text-sky-500"    };
  if (n.includes("recycl") || n.includes("waste"))
    return { Icon: MRecycle,   iconColor: "text-blue-600"   };
  return { Icon: MLeaf, iconColor: "text-primary-600" };
}

type Project = {
  id:            string;
  name:          string;
  description:   string | null;
  goal_tokens:   number;
  raised_tokens: number;
  donor_count:   number;
  is_active:     boolean;
};

export default function DonationsPage() {
  const [filter,        setFilter]        = useState<StatusFilter>("All Projects");
  const [projects,      setProjects]      = useState<Project[]>([]);
  const [myDonations,   setMyDonations]   = useState<{ project_name: string }[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [loadErr,       setLoadErr]       = useState<string | null>(null);
  const [donateTarget,  setDonateTarget]  = useState<Project | null>(null);
  const [donateAmount,  setDonateAmount]  = useState(10);
  const [donating,      setDonating]      = useState(false);
  const [donateError,   setDonateError]   = useState<string | null>(null);

  function loadData() {
    setLoading(true);
    Promise.all([
      fetch("/api/donations/projects?status=all").then(r => r.json()),
      fetch("/api/donations").then(r => r.json()),
    ]).then(([projRes, myRes]) => {
      setProjects(projRes.data ?? []);
      setMyDonations(myRes.data ?? []);
    }).catch((err: unknown) => setLoadErr(err instanceof Error ? err.message : "Failed to load donation projects.")).finally(() => setLoading(false));
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadData(); }, []);

  const myProjectNames = new Set(myDonations.map(d => d.project_name));

  const filtered = projects.filter(p => {
    if (filter === "Ongoing")   return p.is_active;
    if (filter === "Completed") return !p.is_active;
    return true;
  });

  // Derived stats from real project data
  const totalGTKRaised  = projects.reduce((s, p) => s + p.raised_tokens, 0);
  const totalDonors     = projects.reduce((s, p) => s + p.donor_count, 0);
  const activeCount     = projects.filter(p => p.is_active).length;

  async function handleDonate() {
    if (!donateTarget) return;
    if (donateAmount < 1) { setDonateError("Minimum donation is 1 GTK."); return; }
    setDonating(true); setDonateError(null);
    try {
      const res  = await fetch("/api/donations", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ projectName: donateTarget.name, tokensDonated: donateAmount }),
      });
      const json = await res.json();
      if (!res.ok) {
        setDonateError(json.error?.message ?? "Donation failed. Please try again.");
        return;
      }
      setDonateTarget(null);
      setDonateAmount(10);
      loadData(); // Refresh project raised amounts + my donations
    } catch {
      setDonateError("Network error — please try again.");
    } finally {
      setDonating(false);
    }
  }

  return (
    <AppLayout title="Donation Tracking">
      {loadErr && (
        <div role="alert" className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-5">
          <MWarning className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <span className="flex-1">{loadErr}</span>
          <button onClick={() => setLoadErr(null)} aria-label="Dismiss error" className="text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <MHeart className="w-6 h-6 text-primary-600" /> Donation Tracking
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Track the impact of your donations and support meaningful green projects.
        </p>
      </div>

      {/* Stats — from real project data */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {([
          { label: "Active Projects",     value: loading ? "—" : String(activeCount),                Icon: MLeaf,        color: "text-primary-600" },
          { label: "Total GTK Donated",   value: loading ? "—" : `${totalGTKRaised.toLocaleString()} GTK`, Icon: MCoin, color: "text-amber-500"   },
          { label: "Total Donors",        value: loading ? "—" : totalDonors.toLocaleString(),       Icon: MPeople,      color: "text-blue-500"    },
          { label: "My Contributions",    value: loading ? "—" : `${myDonations.length} donations`,  Icon: MAttachMoney, color: "text-green-600"   },
        ] as const).map(({ label, value, Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <Icon className={`w-6 h-6 ${color} flex-shrink-0`} aria-hidden="true" />
            <div>
              <p className="text-base font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-400">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-medium transition-colors",
              filter === f ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200",
              "focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
            )}>
            {f}
          </button>
        ))}
      </div>

      {/* Project list */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 h-28" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <MLeaf className="w-10 h-10 text-gray-200 mx-auto mb-3" aria-hidden />
          <p className="text-sm font-semibold text-gray-600">No projects found</p>
          <p className="text-xs text-gray-400 mt-1">
            {filter === "Completed" ? "No completed projects yet." : "Your admin hasn't created any donation projects yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((p) => {
            const { Icon, iconColor } = projectIcon(p.name);
            const isMine = myProjectNames.has(p.name);
            return (
              <div key={p.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex gap-4 hover:shadow-md transition-shadow">
                <div className="w-20 h-20 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0" aria-hidden="true">
                  <Icon className={`w-10 h-10 ${iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-1 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-gray-900">{p.name}</h3>
                      {isMine && (
                        <span className="text-[10px] font-semibold text-primary-600 bg-primary-50 border border-primary-100 px-2 py-0.5 rounded-full">
                          Your contribution
                        </span>
                      )}
                    </div>
                    <Badge color={p.is_active ? "blue" : "green"} dot>
                      {p.is_active ? "Ongoing" : "Completed"}
                    </Badge>
                  </div>
                  {p.description && (
                    <p className="text-xs text-gray-500 mb-3 leading-relaxed line-clamp-2">{p.description}</p>
                  )}
                  <ProgressBar
                    value={Math.min(p.raised_tokens, p.goal_tokens)}
                    max={p.goal_tokens}
                    size="sm"
                    showLabel
                    label={`${p.raised_tokens.toLocaleString()} / ${p.goal_tokens.toLocaleString()} GTK`}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-gray-400">{p.donor_count} donor{p.donor_count !== 1 ? "s" : ""}</p>
                    <div className="flex gap-2">
                      {p.is_active && (
                        <Button variant="primary" size="xs" onClick={() => { setDonateTarget(p); setDonateError(null); }}>
                          Donate
                        </Button>
                      )}
                      {!p.is_active && (
                        <span className="text-xs text-primary-600 font-medium">Goal reached!</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-center text-xs text-primary-600 mt-6 flex items-center justify-center gap-1">
        <MLeaf className="w-3.5 h-3.5" aria-hidden /> Every donation matters. Thank you for your support!
      </p>

      {/* Donate modal */}
      {donateTarget && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="donate-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 id="donate-modal-title" className="text-lg font-bold text-gray-900 mb-1">
              Donate to {donateTarget.name}
            </h3>
            <p className="text-sm text-gray-500 mb-1">Allocate your GTK tokens to this project.</p>
            <p className="text-xs text-gray-400 mb-4">
              Project needs: {(donateTarget.goal_tokens - donateTarget.raised_tokens).toLocaleString()} GTK more to reach goal.
            </p>

            {donateError && (
              <div role="alert" className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-3">
                {donateError}
              </div>
            )}

            <label htmlFor="donate-amount" className="text-sm font-medium text-gray-700 mb-1.5 block">
              Amount (GTK)
            </label>
            <input
              id="donate-amount"
              type="number"
              min={1}
              value={donateAmount}
              onChange={(e) => setDonateAmount(Math.max(1, Number(e.target.value)))}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <div className="flex gap-2">
              <button
                onClick={() => { setDonateTarget(null); setDonateError(null); }}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
              >
                Cancel
              </button>
              <Button
                variant="primary" size="md" fullWidth
                loading={donating}
                onClick={handleDonate}
                icon={<MHeart className="w-4 h-4" />}
              >
                Confirm Donation
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
