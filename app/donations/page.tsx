"use client";

// Rules: R-FE-01, R-COMP-01 (ProgressBar, Button, Badge), R-A11Y-01, R-FE-05
// Spec: ux_ui/feature_specv2/donation_tracking_page_md.md
// Mockup: mockup/donation_tracking_page_mockup.png

import { useState } from "react";
import AppLayout from "@/components/layouts/AppLayout";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import ProgressBar from "@/components/ui/ProgressBar";
import { cn } from "@/lib/utils";

type StatusFilter = "All Projects" | "Ongoing" | "Completed" | "My Donations";

const FILTERS: StatusFilter[] = ["All Projects", "Ongoing", "Completed", "My Donations"];

const PROJECTS = [
  { id: 1, name: "Tree Planting Initiative",    status: "Ongoing"   as const, raised: 80,  goal: 120, donors: 45,  desc: "Plant native trees in deforested areas across a 2km stretch. Every 10 GTK donations cover 1 tree.", image: "🌳" },
  { id: 2, name: "Recycling Drive",             status: "Ongoing"   as const, raised: 62,  goal: 100, donors: 31,  desc: "Distribute recycling bins in schools and communities. Promoting recycling initiatives and reducing waste.", image: "♻️" },
  { id: 3, name: "Solar for Schools Initiative",status: "Ongoing"   as const, raised: 45,  goal: 150, donors: 22,  desc: "Install solar panels on local schools, reducing energy bills and carbon footprint.", image: "☀️" },
  { id: 4, name: "Clean Water Access",          status: "Completed" as const, raised: 120, goal: 120, donors: 68,  desc: "Provide clean drinking water access to rural communities through sustainable filtration systems.", image: "💧" },
];

const MY_TOTAL = 3450;

export default function DonationsPage() {
  const [filter,       setFilter]       = useState<StatusFilter>("All Projects");
  const [donateModal,  setDonateModal]  = useState<number | null>(null);
  const [donateAmount, setDonateAmount] = useState(10);
  const [donating,     setDonating]     = useState(false);

  const filtered = filter === "All Projects" ? PROJECTS :
                   filter === "My Donations"  ? PROJECTS.slice(0, 2) :
                   PROJECTS.filter((p) => p.status === filter);

  async function handleDonate() {
    setDonating(true);
    try {
      // Phase 2: POST /api/donations { projectName, tokensDonated }
      await new Promise((r) => setTimeout(r, 900));
      setDonateModal(null);
    } finally {
      setDonating(false);
    }
  }

  const donatingProject = PROJECTS.find((p) => p.id === donateModal);

  return (
    <AppLayout title="Donation Tracking">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">❤️ Donation Tracking</h2>
        <p className="text-sm text-gray-500 mt-1">Track the impact of your donations and support meaningful green projects.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Donations",     value: "3,450",  icon: "💰" },
          { label: "Total Tokens Donated",value: "3,450 GTK", icon: "🪙" },
          { label: "Communities Impacted",value: "8",      icon: "👥" },
          { label: "CO₂ Offset",          value: "2.45 t", icon: "🌿" },
        ].map(({ label, value, icon }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <span className="text-xl" aria-hidden="true">{icon}</span>
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
            className={cn("px-4 py-1.5 rounded-full text-xs font-medium transition-colors",
              filter === f ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200",
              "focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
            )}>
            {f}
          </button>
        ))}
        <div className="ml-auto flex gap-2">
          <select className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500" aria-label="Category filter">
            <option>All Categories</option>
          </select>
          <select className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500" aria-label="Sort by">
            <option>Sort by Recent</option>
          </select>
        </div>
      </div>

      {/* Project list */}
      <div className="space-y-4">
        {filtered.map((p) => (
          <div key={p.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex gap-4 hover:shadow-md transition-shadow">
            <div className="w-20 h-20 rounded-xl bg-primary-50 flex items-center justify-center text-4xl flex-shrink-0" aria-hidden="true">
              {p.image}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 mb-1">
                <h3 className="text-sm font-semibold text-gray-900">{p.name}</h3>
                <Badge color={p.status === "Ongoing" ? "blue" : "green"} dot>{p.status}</Badge>
              </div>
              <p className="text-xs text-gray-500 mb-3 leading-relaxed">{p.desc}</p>
              <ProgressBar value={p.raised} max={p.goal} size="sm" showLabel label={`${p.raised} / ${p.goal} GTK`} />
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-400">{p.donors} donors</p>
                <div className="flex gap-2">
                  <button className="text-xs text-primary-600 hover:underline focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none rounded">
                    Share Project
                  </button>
                  {p.status === "Ongoing" && (
                    <Button variant="primary" size="xs" onClick={() => setDonateModal(p.id)}>
                      Donate More
                    </Button>
                  )}
                  {p.status === "Completed" && (
                    <Button variant="outline" size="xs">View Impact</Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-primary-600 mt-6">🌿 Every donation matters. Thank you for your support!</p>

      {/* Donate modal */}
      {donatingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Donate to {donatingProject.name}</h3>
            <p className="text-sm text-gray-500 mb-4">Allocate your GTK tokens to this project.</p>
            <label htmlFor="donate-amount" className="text-sm font-medium text-gray-700 mb-1.5 block">Amount (GTK)</label>
            <input id="donate-amount" type="number" min={1} max={1250} value={donateAmount}
              onChange={(e) => setDonateAmount(Number(e.target.value))}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-primary-500" />
            <div className="flex gap-2">
              <button onClick={() => setDonateModal(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none">Cancel</button>
              <Button variant="primary" size="md" fullWidth loading={donating} onClick={handleDonate} icon={<span>❤️</span>}>
                Confirm Donation
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
