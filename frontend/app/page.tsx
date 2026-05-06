"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const SPECIALTIES = [
  { name: "Cardiologist", icon: "❤️" },
  { name: "Dermatologist", icon: "✨" },
  { name: "General Physician", icon: "🩺" },
  { name: "Gynecologist", icon: "👶" },
  { name: "Orthopedic Surgeon", icon: "🦴" },
  { name: "Pediatrician", icon: "🧸" },
  { name: "Neurologist", icon: "🧠" },
  { name: "Psychiatrist", icon: "💭" },
  { name: "ENT Specialist", icon: "👂" },
  { name: "Diabetologist", icon: "💉" },
];

const QUICK_SYMPTOMS = [
  "chest pain", "skin rash", "fever & cough", "pregnancy care",
  "knee pain", "child health", "anxiety & stress", "diabetes",
];

const CITIES = ["Rawalpindi", "Islamabad"];

function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      setDark(true);
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []);

  const toggle = () => {
    const next = dark ? "light" : "dark";
    setDark(!dark);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  };

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all"
      style={{
        borderColor: "var(--border)",
        color: "var(--text-secondary)",
        backgroundColor: "var(--bg-card)",
      }}
    >
      {dark ? "☀️ Light" : "🌙 Dark"}
    </button>
  );
}

export default function Home() {
  const [symptoms, setSymptoms] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [bestMatch, setBestMatch] = useState<any>(null);
  const [allMatches, setAllMatches] = useState<any[]>([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [maxFee, setMaxFee] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [favorites, setFavorites] = useState<number[]>([]);

  useEffect(() => {
    const user = localStorage.getItem("ai_doctor_user");
    if (user) setCurrentUser(JSON.parse(user));
    const favs = JSON.parse(localStorage.getItem("ai_doctor_favorites") || "[]");
    setFavorites(favs);
  }, []);

  const handleSearch = async () => {
    if (!symptoms.trim()) return;
    setLoading(true);
    setResult("");
    setBestMatch(null);
    setAllMatches([]);
    try {
      const body: any = { symptoms };
      if (selectedCity) body.city = selectedCity;
      if (maxFee) body.max_fee = parseInt(maxFee);
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
  const response = await fetch(`${API_BASE}/suggest-doctor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      setResult(data.ai_recommendation);
      setBestMatch(data.best_match);
      setAllMatches(data.all_matches?.slice(0, 6) || []);
    } catch {
      setResult("❌ Backend not running. Please start the backend server.");
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (id: number) => {
    const updated = favorites.includes(id) ? favorites.filter(f => f !== id) : [...favorites, id];
    setFavorites(updated);
    localStorage.setItem("ai_doctor_favorites", JSON.stringify(updated));
  };

  const handleLogout = () => {
    localStorage.removeItem("ai_doctor_user");
    setCurrentUser(null);
  };

  return (
    <main className="min-h-screen" style={{ backgroundColor: "var(--bg)", fontFamily: "Roboto, sans-serif" }}>

      {/* ── Navbar ── */}
      <nav style={{ backgroundColor: "var(--bg-nav)", borderBottom: "1px solid var(--border)", boxShadow: "var(--shadow)" }}
        className="sticky top-0 z-50 px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">M</div>
            <span className="font-bold text-lg" style={{ color: "var(--text)" }}>MediFind AI</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm" style={{ color: "var(--text-secondary)" }}>
            <Link href="/doctors" className="hover:text-green-600 transition font-medium">Find Doctors</Link>
            <Link href="/symptom-checker" className="hover:text-green-600 transition font-medium">Symptom Checker</Link>
            {currentUser && <Link href="/dashboard" className="hover:text-green-600 transition font-medium">My Appointments</Link>}
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {currentUser ? (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Hi, {currentUser.full_name.split(" ")[0]}</span>
                <button onClick={handleLogout} className="text-sm px-3 py-1.5 rounded-lg border transition"
                  style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>Logout</button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link href="/login" className="px-4 py-1.5 text-sm font-medium rounded-lg border transition"
                  style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>Login</Link>
                <Link href="/register" className="px-4 py-1.5 text-sm font-medium rounded-lg text-white transition"
                  style={{ backgroundColor: "var(--green)" }}>Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="py-20 text-center px-6" style={{ backgroundColor: "var(--bg-card)" }}>
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-6"
            style={{ backgroundColor: "var(--green-light)", color: "var(--green)" }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "var(--green)" }} />
            AI-Powered · RAG Technology · Rawalpindi & Islamabad
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-4 leading-tight" style={{ color: "var(--text)" }}>
            Find the Right<br />
            <span style={{ color: "var(--green)" }}>Doctor Instantly</span>
          </h1>
          <p className="text-lg mb-8 max-w-xl mx-auto" style={{ color: "var(--text-secondary)" }}>
            Describe your symptoms and our AI matches you with the ideal specialist instantly.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => document.getElementById("search")?.scrollIntoView({ behavior: "smooth" })}
              className="px-8 py-3 rounded-lg text-white font-semibold text-sm transition hover:opacity-90 btn-full-sm"
              style={{ backgroundColor: "var(--green)" }}>
              🤖 Check Symptoms
            </button>
            <Link href="/doctors" className="px-8 py-3 rounded-lg font-semibold text-sm border transition text-center btn-full-sm"
              style={{ borderColor: "var(--border)", color: "var(--text)" }}>
              Browse All Doctors
            </Link>
            <Link href="/doctors/compare" className="px-8 py-3 rounded-lg font-semibold text-sm border transition text-center btn-full-sm"
              style={{ borderColor: "var(--border)", color: "var(--text)" }}>
              ⚖️ Compare Doctors
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-10 px-6" style={{ backgroundColor: "var(--bg)" }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { v: "20+", l: "Specialists", i: "👨‍⚕️" },
            { v: "10", l: "Specialties", i: "🏥" },
            { v: "4.8★", l: "Avg Rating", i: "⭐" },
            { v: "RAG", l: "AI Matching", i: "🤖" },
          ].map((s, i) => (
            <div key={i} className="rounded-xl p-5 text-center border"
              style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", boxShadow: "var(--shadow)" }}>
              <div className="text-2xl mb-1">{s.i}</div>
              <div className="text-2xl font-black" style={{ color: "var(--text)" }}>{s.v}</div>
              <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Specialties ── */}
      <section className="py-6 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--text-muted)" }}>Browse by Specialty</p>
          <div className="flex flex-wrap gap-2">
            {SPECIALTIES.map(s => (
              <Link key={s.name} href={`/doctors?specialty=${encodeURIComponent(s.name)}`}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition hover:border-green-500"
                style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", color: "var(--text)" }}>
                {s.icon} {s.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Search ── */}
      <section id="search" className="py-12 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-2xl p-8 border"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", boxShadow: "var(--shadow-lg)" }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                style={{ backgroundColor: "var(--green-light)" }}>🤖</div>
              <div>
                <h2 className="text-lg font-bold" style={{ color: "var(--text)" }}>AI Symptom Analysis</h2>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Powered by RAG + Intelligent Scoring</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {QUICK_SYMPTOMS.map(s => (
                <button key={s} onClick={() => setSymptoms(s)}
                  className="text-xs px-3 py-1.5 rounded-full border transition"
                  style={{
                    backgroundColor: symptoms === s ? "var(--green)" : "var(--bg)",
                    borderColor: symptoms === s ? "var(--green)" : "var(--border)",
                    color: symptoms === s ? "#fff" : "var(--text-secondary)",
                  }}>
                  {s}
                </button>
              ))}
            </div>

            <textarea
              className="w-full rounded-xl p-4 text-sm resize-none border focus:outline-none focus:ring-2 focus:ring-green-500"
              rows={3}
              placeholder="Describe your symptoms... e.g. 'I have chest pain and shortness of breath for 3 days'"
              value={symptoms}
              onChange={e => setSymptoms(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) handleSearch(); }}
              style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" }}
            />

            <div className="flex gap-3 mt-3 mb-4">
              <select value={selectedCity} onChange={e => setSelectedCity(e.target.value)}
                className="select-native select-friendly flex-1 text-sm focus:outline-none"
                style={{ backgroundColor: "var(--bg-card)", color: "var(--text)" }}>
                <option value="">📍 Any City</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={maxFee} onChange={e => setMaxFee(e.target.value)}
                className="select-native select-friendly flex-1 text-sm focus:outline-none"
                style={{ backgroundColor: "var(--bg-card)", color: "var(--text)" }}>
                <option value="">💰 Any Fee</option>
                <option value="1000">Up to Rs. 1,000</option>
                <option value="2000">Up to Rs. 2,000</option>
                <option value="3000">Up to Rs. 3,000</option>
                <option value="5000">Up to Rs. 5,000</option>
              </select>
            </div>

            <button onClick={handleSearch} disabled={loading || !symptoms.trim()}
              className="w-full py-3 rounded-xl text-white font-semibold text-sm transition disabled:opacity-50"
              style={{ backgroundColor: "var(--green)" }}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing...
                </span>
              ) : "🔍 Find Best Match"}
            </button>
            <p className="text-center text-xs mt-2" style={{ color: "var(--text-muted)" }}>Ctrl+Enter to search</p>
          </div>

          {/* AI Result */}
          {result && (
            <div className="mt-4 rounded-2xl p-6 border animate-in"
              style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", boxShadow: "var(--shadow)" }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: "var(--green)" }}>AI</div>
                <span className="font-semibold text-sm" style={{ color: "var(--green)" }}>AI Recommendation</span>
              </div>
              <div className="text-sm whitespace-pre-line leading-relaxed" style={{ color: "var(--text-secondary)" }}>{result}</div>
              {bestMatch && (
                <div className="mt-4 pt-4 flex gap-3" style={{ borderTop: "1px solid var(--border)" }}>
                  <Link href={`/doctors/${bestMatch.id}`}
                    className="flex-1 text-center py-2.5 rounded-xl text-sm font-semibold text-white transition"
                    style={{ backgroundColor: "var(--green)" }}>
                    Book with {bestMatch.name.split(" ").slice(0, 2).join(" ")} →
                  </Link>
                  <Link href="/symptom-checker"
                    className="flex-1 text-center py-2.5 rounded-xl text-sm font-semibold border transition"
                    style={{ borderColor: "var(--border)", color: "var(--text)" }}>
                    Full Check
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Matched doctors */}
          {allMatches.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold" style={{ color: "var(--text)" }}>Top Matches</h3>
                <Link href="/doctors" className="text-sm" style={{ color: "var(--green)" }}>View all →</Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {allMatches.map(doc => (
                  <DoctorCard key={doc.id} doc={doc} isFav={favorites.includes(doc.id)} onFav={() => toggleFavorite(doc.id)} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-16 px-6" style={{ backgroundColor: "var(--bg-card)" }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-10" style={{ color: "var(--text)" }}>How MediFind AI Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { n: "01", t: "Describe Symptoms", d: "Type your symptoms naturally — our AI understands medical language.", i: "💬" },
              { n: "02", t: "AI Matching", d: "RAG technology scores every doctor against your symptoms and preferences.", i: "🤖" },
              { n: "03", t: "Book Instantly", d: "Review matched specialists and book an appointment in seconds.", i: "📅" },
            ].map((item, i) => (
              <div key={i} className="rounded-xl p-6 border relative"
                style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)" }}>
                <div className="text-4xl font-black absolute top-4 right-5 opacity-5" style={{ color: "var(--text)" }}>{item.n}</div>
                <div className="text-3xl mb-3">{item.i}</div>
                <h3 className="font-bold mb-2" style={{ color: "var(--text)" }}>{item.t}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{item.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 text-center text-sm" style={{ borderTop: "1px solid var(--border)", color: "var(--text-muted)" }}>
        MediFind AI — FastAPI · Next.js · RAG Technology
      </footer>
    </main>
  );
}

function DoctorCard({ doc, isFav, onFav }: any) {
  const icon = SPECIALTIES.find(s => s.name === doc.specialty)?.icon || "🏥";
  const score = doc.match_score || 0;

  return (
    <div className="rounded-xl p-4 border transition"
      style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", boxShadow: "var(--shadow)" }}>
      <div className="flex items-start justify-between mb-2">
        <div className="text-2xl">{icon}</div>
        <button onClick={onFav} className="text-lg transition"
          style={{ color: isFav ? "#f59e0b" : "var(--text-muted)" }}>
          {isFav ? "★" : "☆"}
        </button>
      </div>
      <h3 className="font-bold text-sm" style={{ color: "var(--text)" }}>{doc.name}</h3>
      <p className="text-xs mb-1" style={{ color: "var(--blue)" }}>{doc.specialty}</p>
      <p className="text-xs mb-2 truncate" style={{ color: "var(--text-muted)" }}>🏥 {doc.hospital}</p>
      {doc.match_score !== undefined && (
        <div className="mb-2">
          <div className="flex justify-between text-xs mb-1">
            <span style={{ color: "var(--text-muted)" }}>Match</span>
            <span className="font-bold" style={{ color: score >= 60 ? "var(--green)" : "var(--text-secondary)" }}>
              {Math.min(parseInt(doc.match_percentage || "0"), 100)}%
            </span>
          </div>
          <div className="w-full rounded-full h-1.5" style={{ backgroundColor: "var(--border)" }}>
            <div className="h-1.5 rounded-full transition-all" style={{ width: `${Math.min(score, 100)}%`, backgroundColor: "var(--green)" }} />
          </div>
        </div>
      )}
      <div className="flex items-center justify-between mt-2">
        <span className="text-sm font-bold" style={{ color: "var(--green)" }}>Rs. {doc.fee}</span>
        <Link href={`/doctors/${doc.id}`}
          className="text-xs px-3 py-1.5 rounded-lg text-white transition"
          style={{ backgroundColor: "var(--green)" }}>
          View →
        </Link>
      </div>
    </div>
  );
}