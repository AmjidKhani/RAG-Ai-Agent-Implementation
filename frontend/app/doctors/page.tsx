"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function DoctorsIndexPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
  fetch(`${API_BASE}/doctors`)
      .then(r => r.json())
      .then(d => setDoctors(d.doctors || []))
      .catch(() => setDoctors([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen" style={{ backgroundColor: "var(--bg)", color: "var(--text)", fontFamily: "Roboto, sans-serif" }}>
      <div className="px-6 py-6 border-b" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-nav)" }}>
        <div className="flex items-center justify-between">
          <h1 style={{ color: "var(--text)", fontWeight: 800 }}>Find Doctors</h1>
          <Link href="/" style={{ color: "var(--text-secondary)" }}>← Home</Link>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div style={{ color: "var(--text-secondary)" }}>Loading doctors...</div>
        ) : doctors.length === 0 ? (
          <div style={{ color: "var(--text-secondary)" }}>No doctors found. Ensure backend is running.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {doctors.map(doc => (
              <div key={doc.id} className="rounded-xl p-4 border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-2xl">🏥</div>
                  <div style={{ color: "#f59e0b" }}>⭐ {doc.rating}</div>
                </div>
                <h3 style={{ color: "var(--text)", fontWeight: 700 }}>{doc.name}</h3>
                <p style={{ color: "var(--blue)" }} className="text-xs mb-1">{doc.specialty}</p>
                <p style={{ color: "var(--text-muted)" }} className="text-xs mb-3">{doc.hospital} · {doc.city}</p>
                <div className="flex items-center justify-between">
                  <div style={{ color: "var(--green)", fontWeight: 700 }}>Rs. {doc.fee}</div>
                  <Link href={`/doctors/${doc.id}`} style={{ backgroundColor: "var(--green)", color: "#fff" }} className="px-3 py-1.5 rounded-lg text-xs btn-full-sm">View</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
