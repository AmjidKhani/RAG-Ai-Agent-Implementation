"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

type Step = "intro" | "symptoms" | "details" | "filters" | "results";
type Message = { role: "user" | "ai"; text: string; };

const COMMON_SYMPTOMS = [
  "Chest pain", "Fever", "Cough", "Headache", "Back pain",
  "Skin rash", "Anxiety", "Joint pain", "Fatigue", "Nausea",
  "Breathing difficulty", "Dizziness", "Ear pain", "Sore throat", "Diabetes",
];

const DURATION_OPTIONS = ["Less than a day", "1–3 days", "4–7 days", "1–2 weeks", "More than 2 weeks"];
const SEVERITY_OPTIONS = [
  { label: "Mild", desc: "Uncomfortable but manageable", color: "text-green-400 border-green-500/30 hover:bg-green-500/10" },
  { label: "Moderate", desc: "Affecting daily activities", color: "text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/10" },
  { label: "Severe", desc: "Significantly limiting", color: "text-orange-400 border-orange-500/30 hover:bg-orange-500/10" },
  { label: "Critical", desc: "Urgent attention needed", color: "text-red-400 border-red-500/30 hover:bg-red-500/10" },
];

export default function SymptomCheckerPage() {
  const [step, setStep] = useState<Step>("intro");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [customSymptom, setCustomSymptom] = useState("");
  const [duration, setDuration] = useState("");
  const [severity, setSeverity] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [maxFee, setMaxFee] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const router = useRef<any>(null);

  const steps: Step[] = ["intro", "symptoms", "details", "filters", "results"];
  const stepIndex = steps.indexOf(step);

  useEffect(() => {
    setProgress((stepIndex / (steps.length - 1)) * 100);
  }, [step, stepIndex]);

  const toggleSymptom = (s: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );
  };

  const addCustom = () => {
    if (customSymptom.trim() && !selectedSymptoms.includes(customSymptom.trim())) {
      setSelectedSymptoms(prev => [...prev, customSymptom.trim()]);
      setCustomSymptom("");
    }
  };

  const buildSymptomText = () => {
    let text = selectedSymptoms.join(", ");
    if (additionalNotes) text += `. Additional info: ${additionalNotes}`;
    if (duration) text += `. Duration: ${duration}`;
    if (severity) text += `. Severity: ${severity}`;
    return text;
  };

  const handleGetResults = async () => {
    if (selectedSymptoms.length === 0) return;
    setStep("results");
    setLoading(true);
    setResult(null);

    try {
      const body: any = { symptoms: buildSymptomText() };
      if (selectedCity) body.city = selectedCity;
      if (maxFee) body.max_fee = parseInt(maxFee);

    const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
    const res = await fetch(`${API_BASE}/suggest-doctor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ error: true });
    } finally {
      setLoading(false);
    }
  };

  const restart = () => {
    setStep("intro");
    setSelectedSymptoms([]);
    setCustomSymptom("");
    setDuration("");
    setSeverity("");
    setAdditionalNotes("");
    setSelectedCity("");
    setMaxFee("");
    setResult(null);
    setLoading(false);
  };

  const SPECIALTIES_ICONS: Record<string, string> = {
    "Cardiologist": "❤️", "Dermatologist": "✨", "General Physician": "🩺",
    "Gynecologist": "👶", "Orthopedic Surgeon": "🦴", "Pediatrician": "🧸",
    "Neurologist": "🧠", "Psychiatrist": "💭", "ENT Specialist": "👂", "Diabetologist": "💉",
  };

  return (
    <main className="min-h-screen flex flex-col" style={{ fontFamily: "Roboto, sans-serif", backgroundColor: "var(--bg)", color: "var(--text)" }}>

      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/6 blur-[100px]" />
      </div>

      {/* Header */}
      <div className="relative z-10 border-b border-white/5 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-slate-400 hover:text-white text-sm transition flex items-center gap-1">
            ← Back
          </Link>
          <div className="text-center">
            <h1 className="text-white font-bold text-sm">AI Symptom Checker</h1>
            <p className="text-slate-600 text-xs">Step {Math.min(stepIndex + 1, steps.length)} of {steps.length}</p>
          </div>
          <button onClick={restart} className="text-slate-500 hover:text-white text-xs transition">Restart</button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative z-10 h-0.5 bg-white/5">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="relative z-10 flex-1 flex items-start justify-center px-6 py-10">
        <div className="w-full max-w-2xl">

          {/* Step: Intro */}
          {step === "intro" && (
            <div className="text-center">
              <div className="text-6xl mb-6">🩺</div>
              <h2 className="text-4xl font-extrabold text-white mb-4">
                AI Symptom Checker
              </h2>
              <p className="text-slate-400 text-lg mb-2">
                Describe your symptoms and get matched with the right specialist in seconds.
              </p>
              <p className="text-slate-600 text-sm mb-8">
                ⚠️ This tool provides guidance only. Always consult a qualified doctor for medical advice.
              </p>
              <div className="grid grid-cols-3 gap-4 mb-8 text-center">
                {[
                  { i: "✅", t: "Select symptoms" },
                  { i: "🤖", t: "AI analysis" },
                  { i: "📅", t: "Book appointment" },
                ].map((item, i) => (
                  <div key={i} className="bg-white/3 border border-white/6 rounded-2xl p-4">
                    <div className="text-2xl mb-2">{item.i}</div>
                    <p className="text-slate-400 text-xs">{item.t}</p>
                  </div>
                ))}
              </div>
              <button onClick={() => setStep("symptoms")} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-4 rounded-2xl transition-all hover:shadow-lg hover:shadow-blue-500/20">
                Start Symptom Check →
              </button>
            </div>
          )}

          {/* Step: Symptoms */}
          {step === "symptoms" && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">
                  What symptoms are you experiencing?
                </h2>
                <p className="text-slate-500 text-sm">Select all that apply. You can also type custom symptoms below.</p>
              </div>

              <div className="flex flex-wrap gap-2 mb-5">
                {COMMON_SYMPTOMS.map(s => (
                  <button
                    key={s}
                    onClick={() => toggleSymptom(s)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedSymptoms.includes(s) ? 'bg-blue-600 text-white border border-blue-500' : 'bg-transparent text-slate-700 border border-transparent hover:border-blue-200 hover:text-blue-700'}`}
                    style={{ boxShadow: 'none' }}
                  >
                    {selectedSymptoms.includes(s) ? '✓ ' : ''}{s}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={customSymptom}
                  onChange={e => setCustomSymptom(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") addCustom(); }}
                  placeholder="Type a custom symptom..."
                  className="flex-1 bg-white/3 border border-white/8 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                />
                <button onClick={addCustom} disabled={!customSymptom.trim()} className="bg-blue-600 disabled:opacity-40 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition">Add</button>
              </div>

              {selectedSymptoms.length > 0 && (
                <div className="bg-white/3 border rounded-xl p-4 mb-5" style={{ borderColor: 'var(--border)' }}>
                  <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Selected symptoms ({selectedSymptoms.length}):</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedSymptoms.map(s => (
                      <span key={s} className="flex items-center gap-2 text-xs px-2.5 py-1 rounded-full" style={{ border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)' }}>
                        <span style={{ color: 'var(--blue)', fontWeight: 600 }}>{s}</span>
                        <button onClick={() => toggleSymptom(s)} className="text-sm" style={{ color: 'var(--text-secondary)' }}>×</button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep("intro")} className="flex-1 border border-white/10 text-slate-400 hover:text-white py-3 rounded-2xl text-sm transition">
                  ← Back
                </button>
                <button
                  onClick={() => setStep("details")}
                  disabled={selectedSymptoms.length === 0}
                  className="flex-1 disabled:opacity-40 disabled:cursor-not-allowed font-semibold py-3 rounded-2xl transition"
                  style={{ backgroundColor: 'var(--blue)', color: '#fff' }}
                >
                  Next: Add Details →
                </button>
              </div>
            </div>
          )}

          {/* Step: Details */}
          {step === "details" && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Tell us more about your symptoms
                </h2>
                <p className="text-slate-500 text-sm">This helps our AI make better recommendations.</p>
              </div>

              <div className="mb-5">
                <label className="text-slate-400 text-sm font-medium mb-3 block">How long have you had these symptoms?</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {DURATION_OPTIONS.map(d => (
                    <button key={d} onClick={() => setDuration(d)}
                      className={`py-2.5 px-3 rounded-xl border text-sm transition ${duration === d ? "bg-blue-600 border-blue-500 text-white" : "border-white/10 text-slate-400 hover:border-blue-500/30"}`}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-5">
                <label className="text-slate-400 text-sm font-medium mb-3 block">How severe are your symptoms?</label>
                <div className="grid grid-cols-2 gap-3">
                  {SEVERITY_OPTIONS.map(s => (
                    <button key={s.label} onClick={() => setSeverity(s.label)}
                      className={`py-3 px-4 rounded-xl border text-left transition ${severity === s.label ? s.color.replace("hover:bg", "bg") + " opacity-100" : `border-white/10 hover:border-white/20 ${s.color}`}`}>
                      <p className="font-semibold text-sm">{s.label}</p>
                      <p className="text-xs opacity-70">{s.desc}</p>
                    </button>
                  ))}
                </div>
                {severity === "Critical" && (
                  <div className="mt-3 bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
                    ⚠️ For critical symptoms, please visit an emergency room or call emergency services immediately.
                  </div>
                )}
              </div>

              <div className="mb-5">
                <label className="text-slate-400 text-sm font-medium mb-2 block">Any additional notes? (optional)</label>
                <textarea
                  value={additionalNotes}
                  onChange={e => setAdditionalNotes(e.target.value)}
                  placeholder="e.g. I also have a history of diabetes, currently taking X medication..."
                  rows={3}
                  className="w-full bg-white/3 border border-white/8 rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep("symptoms")} className="flex-1 border border-white/10 text-slate-400 hover:text-white py-3 rounded-2xl text-sm transition">
                  ← Back
                </button>
                <button onClick={() => setStep("filters")} className="flex-1 font-semibold py-3 rounded-2xl transition" style={{ backgroundColor: 'var(--blue)', color: '#fff' }}>
                  Next: Preferences →
                </button>
              </div>
            </div>
          )}

          {/* Step: Filters */}
          {step === "filters" && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Your preferences
                </h2>
                <p className="text-slate-500 text-sm">Optional filters to narrow down your recommendations.</p>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-slate-400 text-sm font-medium mb-2 block">Preferred City</label>
                  <div className="flex gap-3">
                    {["", "Rawalpindi", "Islamabad"].map(city => (
                      <button key={city} onClick={() => setSelectedCity(city)}
                        className={`flex-1 py-2.5 rounded-xl border text-sm transition ${selectedCity === city ? "bg-blue-600 border-blue-500 text-white" : "border-white/10 text-slate-400 hover:border-blue-500/30"}`}>
                        {city || "Any City"}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 text-sm font-medium mb-2 block">Maximum Consultation Fee</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {["", "1000", "2000", "3000"].map(fee => (
                      <button key={fee} onClick={() => setMaxFee(fee)}
                        className={`py-2.5 rounded-xl border text-sm transition ${maxFee === fee ? "bg-blue-600 border-blue-500 text-white" : "border-white/10 text-slate-400 hover:border-blue-500/30"}`}>
                        {fee ? `Up to Rs. ${parseInt(fee).toLocaleString()}` : "Any"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-white/3 border border-white/6 rounded-2xl p-5 mb-5">
                <h4 className="text-white font-semibold text-sm mb-3">📋 Summary</h4>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Symptoms:</span>
                    <span className="text-slate-300 text-right max-w-xs truncate">{selectedSymptoms.slice(0, 3).join(", ")}{selectedSymptoms.length > 3 ? ` +${selectedSymptoms.length - 3} more` : ""}</span>
                  </div>
                  {duration && <div className="flex justify-between"><span className="text-slate-500">Duration:</span><span className="text-slate-300">{duration}</span></div>}
                  {severity && <div className="flex justify-between"><span className="text-slate-500">Severity:</span><span className="text-slate-300">{severity}</span></div>}
                  {selectedCity && <div className="flex justify-between"><span className="text-slate-500">City:</span><span className="text-slate-300">{selectedCity}</span></div>}
                  {maxFee && <div className="flex justify-between"><span className="text-slate-500">Max Fee:</span><span className="text-slate-300">Rs. {parseInt(maxFee).toLocaleString()}</span></div>}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="w-full sm:flex-1">
                  <button onClick={() => setStep("details")} className="w-full sm:w-auto border border-white/10 text-slate-400 hover:text-white py-3 rounded-2xl text-sm transition">
                    ← Back
                  </button>
                </div>
                <button onClick={handleGetResults} className="w-full sm:flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold py-3 rounded-2xl transition-all hover:shadow-lg hover:shadow-blue-500/20">
                  🤖 Get AI Recommendations →
                </button>
              </div>
            </div>
          )}

          {/* Step: Results */}
          {step === "results" && (
            <div>
              {loading ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 border-4 rounded-full animate-spin mx-auto mb-6" style={{ borderColor: 'color-mix(in srgb, var(--blue) 20%, transparent)', borderTopColor: 'var(--blue)' }} />
                  <h3 style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--text)', marginBottom: 8 }}>Analyzing your symptoms...</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Our AI is matching you with the best specialists</p>
                  <div className="mt-6 space-y-2">
                    {["Parsing symptom patterns", "Running RAG matching algorithm", "Scoring against 20+ doctors", "Preparing recommendations"].map((t, i) => (
                      <div key={i} className="flex items-center justify-center gap-2 text-slate-600 text-xs">
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
                        {t}
                      </div>
                    ))}
                  </div>
                </div>
              ) : result?.error ? (
                <div className="text-center py-16">
                  <div className="text-5xl mb-4">❌</div>
                  <h3 style={{ fontWeight: 700, color: 'var(--text)' }}>Connection Error</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 12 }}>Could not reach the backend. Make sure the server is running.</p>
                  <button onClick={restart} className="px-5 py-2 rounded-xl text-sm btn-full-sm" style={{ backgroundColor: 'var(--blue)', color: '#fff' }}>Try Again</button>
                </div>
              ) : result ? (
                <div>
                  <div className="mb-6">
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)', marginBottom: 6 }}>Your Results</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Based on: <span style={{ color: 'var(--text-muted)' }}>{selectedSymptoms.slice(0, 3).join(", ")}</span></p>
                  </div>

                  {/* AI Recommendation */}
                  <div className="rounded-2xl p-5 mb-5" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: 'var(--blue)', color: '#fff' }}>AI</div>
                      <span style={{ color: 'var(--blue)', fontWeight: 600, fontSize: '0.875rem' }}>AI Analysis</span>
                    </div>
                    <div className="text-sm whitespace-pre-line leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{result.ai_recommendation}</div>
                  </div>

                  {/* Top matches */}
                  {result.all_matches && (
                    <div>
                      <h3 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 12, fontFamily: "'Syne', sans-serif" }}>Top Matches</h3>
                      <div className="space-y-3">
                        {result.all_matches.slice(0, 5).map((doc: any, i: number) => (
                          <div key={doc.id} className={`bg-white/3 border rounded-2xl p-4 flex items-center gap-4 transition hover:bg-white/5 ${i === 0 ? "border-blue-500/30" : "border-white/6"}`}>
                            {i === 0 && <div className="absolute -translate-y-8 text-xs text-blue-400 font-medium">Best Match</div>}
                            <div className="text-2xl">{SPECIALTIES_ICONS[doc.specialty] || "🏥"}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <h4 className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{doc.name}</h4>
                                {i === 0 && <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">Best Match</span>}
                              </div>
                              <p className="text-blue-400 text-xs">{doc.specialty}</p>
                              <p className="text-slate-600 text-xs truncate">{doc.hospital} · {doc.city}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="text-sm font-bold mb-1" style={{ color: doc.match_score >= 60 ? "#4ade80" : doc.match_score >= 40 ? "#facc15" : "#94a3b8" }}>
                                {Math.min(parseInt(doc.match_percentage || "0"), 100)}%
                              </div>
                              <div className="text-xs text-green-400 mb-1">Rs. {doc.fee}</div>
                              <Link href={`/doctors/${doc.id}`} className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded-lg transition btn-full-sm">
                                Book →
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 mt-6">
                    <button onClick={restart} className="flex-1 border border-white/10 text-slate-400 hover:text-white py-3 rounded-2xl text-sm transition">
                      Check Again
                    </button>
                    <Link href="/doctors" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-2xl text-center transition btn-full-sm">
                      Browse All Doctors →
                    </Link>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}