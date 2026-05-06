"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function DoctorDetailPage() {
  const pathname = usePathname();
  const router = useRouter();
  const id = pathname?.split("/").pop() || "";
  const [doc, setDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
  fetch(`${API_BASE}/doctors/${id}`)
      .then(r => r.json())
      .then(d => setDoc(d))
      .catch(() => setDoc(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--bg)" }}>
      <div style={{ color: "var(--text-secondary)" }}>Loading...</div>
    </main>
  );

  if (!doc) return (
    <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--bg)" }}>
      <div className="text-center" style={{ color: "var(--text-secondary)" }}>
        <div className="text-4xl mb-3">❌</div>
        <p>Doctor not found</p>
        <button onClick={() => router.push('/doctors')} className="mt-3 px-4 py-2 rounded-lg" style={{ backgroundColor: "var(--green)", color: "#fff" }}>Back to Doctors</button>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen p-6" style={{ backgroundColor: "var(--bg)", color: "var(--text)", fontFamily: "Roboto, sans-serif" }}>
      <div className="max-w-4xl mx-auto">
  <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800 }}>{doc.name}</h1>
            <p style={{ color: "var(--text-secondary)" }}>{doc.specialty} · {doc.hospital}</p>
          </div>
          <div className="text-right">
            <p style={{ color: "var(--green)", fontWeight: 700 }}>Rs. {doc.fee}</p>
            <Link href={`/doctors/${doc.id}/book`} className="mt-2 inline-block px-3 py-1.5 rounded-lg text-sm btn-full-sm" style={{ backgroundColor: "var(--green)", color: "#fff" }}>Book</Link>
          </div>
        </div>

        <div className="rounded-xl p-6 border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
          <h2 style={{ fontWeight: 700, marginBottom: 8 }}>About</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: 12 }}>{doc.bio || 'No bio available.'}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h3 style={{ fontWeight: 700 }}>Details</h3>
              <ul style={{ color: "var(--text-secondary)", marginTop: 6 }}>
                <li>Experience: {doc.experience_years} years</li>
                <li>Rating: {doc.rating} ({doc.total_reviews} reviews)</li>
                <li>City: {doc.city}</li>
                <li>Languages: {Array.isArray(doc.languages) ? doc.languages.join(', ') : doc.languages}</li>
              </ul>
            </div>
            <div>
              <h3 style={{ fontWeight: 700 }}>Availability</h3>
              <div style={{ color: "var(--text-secondary)", marginTop: 6 }}>{(doc.availability_slots && doc.availability_slots.length) ? doc.availability_slots.join(' · ') : 'No slots available'}</div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}