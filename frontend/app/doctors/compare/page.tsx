"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const SPECIALTIES_ICONS: Record<string, string> = {
  "Cardiologist": "❤️", "Dermatologist": "✨", "General Physician": "🩺",
  "Gynecologist": "👶", "Orthopedic Surgeon": "🦴", "Pediatrician": "🧸",
  "Neurologist": "🧠", "Psychiatrist": "💭", "ENT Specialist": "👂", "Diabetologist": "💉",
};

const COMPARE_FIELDS = [
  { label: "Specialty", key: "specialty" },
  { label: "Hospital", key: "hospital" },
  { label: "City", key: "city" },
  { label: "Qualification", key: "qualification" },
  { label: "University", key: "university" },
  { label: "Experience", key: "experience_years", format: (v: number) => `${v} years` },
  { label: "Consultation Fee", key: "fee", format: (v: number) => `Rs. ${v}` },
  { label: "Rating", key: "rating", format: (v: number) => `${v} / 5 ⭐` },
  { label: "Total Reviews", key: "total_reviews", format: (v: number) => v.toLocaleString() },
  { label: "Languages", key: "languages", format: (v: string[]) => v.join(", ") },
  { label: "Sub-Specialties", key: "sub_specialties", format: (v: string[]) => v.join(", ") },
  { label: "Treats", key: "treats", format: (v: string[]) => v.slice(0, 5).join(", ") },
  { label: "Available Slots", key: "availability_slots", format: (v: string[]) => v.join(" · ") },
  { label: "Off Days", key: "off_days", format: (v: string[]) => v.join(", ") },
];

export default function ComparePage() {
  const [allDoctors, setAllDoctors] = useState<any[]>([]);
  const [compareIds, setCompareIds] = useState<number[]>([]);
  const [compareDoctors, setCompareDoctors] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectingSlot, setSelectingSlot] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
  fetch(`${API_BASE}/doctors`)
      .then(r => r.json())
      .then(d => setAllDoctors(d.doctors))
      .catch(() => {})
      .finally(() => setLoading(false));

    const saved = JSON.parse(localStorage.getItem("ai_doctor_compare") || "[]");
    setCompareIds(saved);
  }, []);

  useEffect(() => {
    const docs = compareIds
      .map(id => allDoctors.find(d => d.id === id))
      .filter(Boolean);
    setCompareDoctors(docs);
  }, [compareIds, allDoctors]);

  const addDoctor = (id: number) => {
    if (compareIds.includes(id)) return;
    if (compareIds.length >= 3) {
      alert("You can compare up to 3 doctors.");
      return;
    }
    const updated = [...compareIds, id];
    setCompareIds(updated);
    localStorage.setItem("ai_doctor_compare", JSON.stringify(updated));
    setSelectingSlot(null);
    setSearchQuery("");
  };

  const removeDoctor = (id: number) => {
    const updated = compareIds.filter(c => c !== id);
    setCompareIds(updated);
    localStorage.setItem("ai_doctor_compare", JSON.stringify(updated));
  };

  const filteredSearch = allDoctors.filter(d =>
    !compareIds.includes(d.id) &&
    (d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     d.specialty.toLowerCase().includes(searchQuery.toLowerCase()))
  ).slice(0, 5);

  const getBestValue = (key: string) => {
    if (compareDoctors.length < 2) return null;
    if (key === "fee") return Math.min(...compareDoctors.map(d => d[key]));
    if (key === "rating" || key === "experience_years" || key === "total_reviews")
      return Math.max(...compareDoctors.map(d => d[key]));
    return null;
  };

  const isHighlight = (doc: any, key: string) => {
    const best = getBestValue(key);
    if (best === null) return false;
    return doc[key] === best;
  };

  return (
    <main className="min-h-screen" style={{ fontFamily: "'DM Sans', sans-serif", backgroundColor: "var(--bg)", color: "var(--text)" }}>

      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] blur-[120px]" style={{ backgroundColor: "var(--blue)", opacity: 0.05 }} />
      </div>

      {/* Header */}
  <div className="relative z-10 border-b px-6 py-4" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-nav)" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/doctors" className="text-sm transition" style={{ color: "var(--text-secondary)" }}>← Back</Link>
            <span style={{ color: "var(--border)" }}>|</span>
            <div>
              <h1 style={{ color: "var(--text)", fontWeight: 800 }}>Compare Doctors</h1>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Select up to 3 doctors to compare side-by-side</p>
            </div>
          </div>
          {compareIds.length > 0 && (
            <button onClick={() => { setCompareIds([]); localStorage.removeItem("ai_doctor_compare"); }}
              className="text-sm transition px-3 py-1.5 rounded-lg"
              style={{ color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
              Clear All
            </button>
          )}
        </div>
      </div>

  <div className="relative z-10 px-6 py-8">
        {/* Doctor selector columns */}
          <div className={`grid gap-4 mb-8 grid-cols-1 sm:grid-cols-${Math.max(compareDoctors.length + (compareDoctors.length < 3 ? 1 : 0), 1)}`}
          style={{ gridTemplateColumns: `repeat(${Math.max(compareDoctors.length + (compareDoctors.length < 3 ? 1 : 0), 3)}, 1fr)` }}
        >
          {compareDoctors.map(doc => (
            <div key={doc.id} className="rounded-2xl p-5 text-center" style={{ background: "linear-gradient(to bottom, color-mix(in srgb, var(--blue) 6%, transparent), transparent)", border: "1px solid color-mix(in srgb, var(--blue) 12%, transparent)" }}>
              <div className="flex justify-end mb-2">
                <button onClick={() => removeDoctor(doc.id)} className="text-slate-600 hover:text-red-400 text-lg transition leading-none">×</button>
              </div>
              <div className="text-4xl mb-3">{SPECIALTIES_ICONS[doc.specialty] || "🏥"}</div>
              <h3 style={{ color: "var(--text)", fontWeight: 700 }} className="mb-1">{doc.name}</h3>
              <p className="text-xs mb-3" style={{ color: "var(--blue)" }}>{doc.specialty}</p>
              <div className="flex items-center justify-center gap-3 text-sm">
                <span className="text-yellow-400">⭐ {doc.rating}</span>
                <span className="text-green-400">Rs. {doc.fee}</span>
              </div>
              <Link href={`/doctors/${doc.id}`} className="inline-block mt-3 text-xs border px-3 py-1 rounded-lg transition btn-full-sm" style={{ color: "var(--blue)", borderColor: "color-mix(in srgb, var(--blue) 20%, transparent)" }}>
                Book →
              </Link>
            </div>
          ))}

          {compareDoctors.length < 3 && (
            <div className="border-2 border-dashed border-white/10 rounded-2xl p-5 text-center hover:border-violet-500/30 transition">
              {selectingSlot === compareDoctors.length ? (
                <div>
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search doctor..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-violet-500/50 mb-2"
                  />
                  <div className="space-y-1 text-left">
                    {filteredSearch.map(d => (
                      <button key={d.id} onClick={() => addDoctor(d.id)}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-violet-600/20 transition">
                        <p className="text-white text-xs font-medium">{d.name}</p>
                        <p className="text-slate-500 text-xs">{d.specialty} · {d.city}</p>
                      </button>
                    ))}
                    {searchQuery && filteredSearch.length === 0 && (
                      <p className="text-slate-600 text-xs text-center py-2">No doctors found</p>
                    )}
                  </div>
                  <button onClick={() => { setSelectingSlot(null); setSearchQuery(""); }} className="mt-2 text-slate-500 text-xs hover:text-white">Cancel</button>
                </div>
              ) : (
                <button onClick={() => setSelectingSlot(compareDoctors.length)} className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-violet-400 transition min-h-[140px]">
                  <div className="w-12 h-12 border-2 border-dashed border-current rounded-full flex items-center justify-center text-2xl">+</div>
                  <span className="text-sm font-medium">Add Doctor</span>
                  <span className="text-xs opacity-50">Search to add</span>
                </button>
              )}
            </div>
          )}

          {/* Fill remaining slots */}
          {compareDoctors.length === 0 && (
            <>
              <div className="border-2 border-dashed border-white/5 rounded-2xl p-5 min-h-[140px]" />
              <div className="border-2 border-dashed border-white/5 rounded-2xl p-5 min-h-[140px]" />
            </>
          )}
          {compareDoctors.length === 1 && (
            <div className="border-2 border-dashed border-white/5 rounded-2xl p-5 min-h-[140px]" />
          )}
        </div>

        {/* Comparison table */}
        {compareDoctors.length >= 2 && (
          <div className="bg-white/2 border border-white/6 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5">
              <h2 className="text-white font-bold">Detailed Comparison</h2>
              <p className="text-slate-500 text-xs mt-0.5">🟢 Highlighted cells indicate the best value</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left px-6 py-3 text-slate-500 text-xs font-medium uppercase tracking-wider w-40">Attribute</th>
                    {compareDoctors.map(doc => (
                      <th key={doc.id} className="px-6 py-3 text-center text-white text-sm font-semibold">{doc.name.split(" ").slice(0, 2).join(" ")}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARE_FIELDS.map((field, i) => (
                    <tr key={field.key} className={`border-b border-white/3 ${i % 2 === 0 ? "" : "bg-white/1"}`}>
                      <td className="px-6 py-3.5 text-slate-500 text-xs font-medium">{field.label}</td>
                      {compareDoctors.map(doc => {
                        const val = doc[field.key];
                        const display = field.format ? field.format(val) : val;
                        const highlight = isHighlight(doc, field.key);
                        return (
                          <td key={doc.id} className="px-6 py-3.5 text-center">
                            <span className={`text-sm ${highlight ? "text-green-400 font-semibold" : "text-slate-300"}`}>
                              {highlight && "✓ "}
                              {Array.isArray(display) ? display.join(", ") : display}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Winner summary */}
            <div className="px-6 py-5 border-t border-white/5">
              <h3 className="text-white font-bold mb-4">Quick Summary</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: "Best Rating", key: "rating", icon: "⭐", sort: "desc" },
                  { label: "Lowest Fee", key: "fee", icon: "💰", sort: "asc" },
                  { label: "Most Experienced", key: "experience_years", icon: "💼", sort: "desc" },
                ].map(metric => {
                  const winner = [...compareDoctors].sort((a, b) =>
                    metric.sort === "desc" ? b[metric.key] - a[metric.key] : a[metric.key] - b[metric.key]
                  )[0];
                  return (
                    <div key={metric.key} className="bg-white/3 border border-white/6 rounded-xl p-4 text-center">
                      <div className="text-xl mb-1">{metric.icon}</div>
                      <p className="text-slate-500 text-xs mb-1">{metric.label}</p>
                      <p className="text-white font-bold text-sm">{winner?.name.split(" ").slice(0, 2).join(" ")}</p>
                      <p className="text-green-400 text-xs">
                        {metric.key === "fee" ? `Rs. ${winner?.[metric.key]}` :
                         metric.key === "rating" ? `${winner?.[metric.key]}/5` :
                         `${winner?.[metric.key]} years`}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {compareDoctors.length < 2 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">⚖️</div>
            <h3 className="text-white font-bold text-xl mb-2">
              {compareDoctors.length === 0 ? "Select doctors to compare" : "Add one more doctor"}
            </h3>
            <p className="text-slate-500">
              {compareDoctors.length === 0
                ? "Click '+ Add Doctor' above to start comparing"
                : "You need at least 2 doctors to see a comparison table"}
            </p>
            <Link href="/doctors" className="inline-block mt-6 text-blue-400 hover:text-blue-300 text-sm border border-blue-500/20 px-4 py-2 rounded-lg transition">
              Browse All Doctors →
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}