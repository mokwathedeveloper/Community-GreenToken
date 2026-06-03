import Link from "next/link";
import Image from "next/image";
import ProgressBar from "@/components/ui/ProgressBar";

// Mockup: bottom section — 2 donation project cards with progress bars

interface Project {
  id:          string;
  name:        string;
  status:      "Ongoing" | "Completed";
  raised:      number;
  goal:        number;
  imageUrl?:   string;
}

interface DonationProgressProps {
  projects: Project[];
}

const STATUS_STYLES = {
  Ongoing:   "bg-blue-100 text-blue-700",
  Completed: "bg-green-100 text-green-700",
};

export default function DonationProgress({ projects }: DonationProgressProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">❤️ Donation Progress</h3>
        <Link href="/donations" className="text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors">
          View All Projects →
        </Link>
      </div>

      <div className="space-y-4">
        {projects.map((p) => {
          const pct = Math.min(100, Math.round((p.raised / p.goal) * 100));
          return (
            <div key={p.id} className="flex gap-3">
              {/* Project image */}
              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                {p.imageUrl ? (
                  <Image src={p.imageUrl} alt={p.name} fill className="object-cover" sizes="64px" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">🌳</div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${STATUS_STYLES[p.status]}`}>
                    {p.status}
                  </span>
                </div>
                <ProgressBar value={p.raised} max={p.goal} size="sm" />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>{p.raised} / {p.goal} Tokens</span>
                  <span>{pct}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Link
        href="/donations"
        className="mt-4 flex items-center justify-center w-full py-2 text-xs font-medium text-primary-600 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors"
      >
        Explore All Projects
      </Link>
    </div>
  );
}
