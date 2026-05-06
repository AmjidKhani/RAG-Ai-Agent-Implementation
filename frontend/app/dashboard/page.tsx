"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const SPECIALTIES_ICONS: Record<string, string> = {
  "Cardiologist": "❤️", "Dermatologist": "✨", "General Physician": "🩺",
  "Gynecologist": "👶", "Orthopedic Surgeon": "🦴", "Pediatrician": "🧸",
  "Neurologist": "🧠", "Psychiatrist": "💭", "ENT Specialist": "👂", "Diabetologist": "💉",
};

export default function DashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [favDoctors, setFavDoctors] = useState<any[]>([]);
  const [allDoctors, setAllDoctors] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"appointments" | "favorites" | "profile">("appointments");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem("ai_doctor_user");
    if (!user) { router.push("/login"); return; }
    setCurrentUser(JSON.parse(user));

    const savedBookings = JSON.parse(localStorage.getItem("ai_doctor_bookings") || "[]");
    setBookings(savedBookings);

    const savedFavs = JSON.parse(localStorage.getItem("ai_doctor_favorites") || "[]");
    setFavorites(savedFavs);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
  fetch(`${API_BASE}/doctors`)
      .then(r => r.json())
      .then(d => {
        setAllDoctors(d.doctors);
        setFavDoctors(d.doctors.filter((doc: any) => savedFavs.includes(doc.id)));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const removeFavorite = (id: number) => {
    const updated = favorites.filter(f => f !== id);
    setFavorites(updated);
    setFavDoctors(prev => prev.filter(d => d.id !== id));
    localStorage.setItem("ai_doctor_favorites", JSON.stringify(updated));
  };

  const cancelBooking = (bookingId: string) => {
    const updated = bookings.filter(b => b.booking_id !== bookingId);
    setBookings(updated);
    localStorage.setItem("ai_doctor_bookings", JSON.stringify(updated));
  };

  const isUpcoming = (dateStr: string) => {
    const d = new Date(dateStr);
    return d >= new Date();
  };

  if (!currentUser) return null;

  const upcomingBookings = bookings.filter(b => b.appointment_date && isUpcoming(b.appointment_date));
  const pastBookings = bookings.filter(b => b.appointment_date && !isUpcoming(b.appointment_date));

  return (
    <main className="min-h-screen" style={{ fontFamily: "Roboto, sans-serif", backgroundColor: "var(--bg)", color: "var(--text)" }}>
      <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap" rel="stylesheet" />

      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] blur-[100px]" style={{ backgroundColor: "var(--blue)", opacity: 0.05 }} />
      </div>

      {/* Header */}
      <div className="relative z-10 border-b px-6 py-4" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-nav)" }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{ backgroundColor: "var(--blue)", color: "#fff" }}>🏥</div>
            <span style={{ color: "var(--text)", fontWeight: 700, fontFamily: 'Roboto, sans-serif' }}>MediFind AI</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/doctors" className="text-sm transition" style={{ color: "var(--text-secondary)" }}>Find Doctors</Link>
            <Link href="/symptom-checker" className="text-sm transition" style={{ color: "var(--text-secondary)" }}>Symptom Check</Link>
            <button
              onClick={() => { localStorage.removeItem("ai_doctor_user"); router.push("/"); }}
              className="text-sm transition px-3 py-1.5 rounded-lg"
              style={{ color: "var(--text-secondary)", border: "1px solid var(--border)" }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-8">
        {/* Profile header */}
        <div className="bg-gradient-to-r from-blue-600/10 to-violet-600/10 border rounded-3xl p-6 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-5" style={{ borderColor: 'var(--border)', background: 'linear-gradient(to right, color-mix(in srgb, var(--blue) 6%, transparent), color-mix(in srgb, var(--green) 6%, transparent))' }}>
          <div className="w-14 h-14 rounded-lg flex items-center justify-center text-lg font-medium" style={{ background: 'linear-gradient(135deg, var(--blue), #8b5cf6)', color: '#fff' }}>
            {currentUser.full_name?.split(" ")[0]?.charAt(0) || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-semibold truncate" style={{ color: 'var(--text)', fontFamily: 'Roboto, sans-serif' }}>{(currentUser.full_name || '').split(' ').slice(0,2).join(' ')}</h1>
            <p className="text-sm truncate" style={{ color: 'var(--text-secondary)' }}>{currentUser.email}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{currentUser.phone}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center w-full sm:w-auto mt-4 sm:mt-0">
            {[
              { v: bookings.length, l: "Appointments" },
              { v: upcomingBookings.length, l: "Upcoming" },
              { v: favDoctors.length, l: "Favorites" },
            ].map((s, i) => (
              <div key={i} className="rounded-2xl px-4 py-3" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)' }}>{s.v}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 rounded-2xl p-1 mb-6 w-fit" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          {(["appointments", "favorites", "profile"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all`}
              style={activeTab === tab ? { backgroundColor: 'var(--blue)', color: '#fff' } : { color: 'var(--text-secondary)' }}
            >
              {tab === "appointments" ? "📅 Appointments" : tab === "favorites" ? "★ Favorites" : "👤 Profile"}
            </button>
          ))}
        </div>

        {/* Appointments Tab */}
        {activeTab === "appointments" && (
          <div>
            {bookings.length === 0 ? (
              <div className="text-center py-16 bg-white/2 border border-white/5 rounded-2xl">
                <div className="text-5xl mb-4">📅</div>
                <h3 className="text-white font-bold mb-2">No appointments yet</h3>
                <p className="text-slate-500 text-sm mb-5">Find a doctor and book your first appointment</p>
                <Link href="/symptom-checker" className="px-6 py-2.5 rounded-xl text-sm font-semibold transition btn-full-sm" style={{ backgroundColor: 'var(--blue)', color: '#fff' }}>
                  Check Symptoms →
                </Link>
              </div>
            ) : (
              <div className="space-y-5">
                {upcomingBookings.length > 0 && (
                  <div>
                    <h3 className="text-white font-bold mb-3 text-sm uppercase tracking-wider opacity-60">Upcoming</h3>
                    <div className="space-y-3">
                      {upcomingBookings.map(b => (
                        <AppointmentCard key={b.booking_id} booking={b} upcoming onCancel={cancelBooking} />
                      ))}
                    </div>
                  </div>
                )}
                {pastBookings.length > 0 && (
                  <div>
                    <h3 className="text-white font-bold mb-3 text-sm uppercase tracking-wider opacity-40">Past Appointments</h3>
                    <div className="space-y-3 opacity-60">
                      {pastBookings.map(b => (
                        <AppointmentCard key={b.booking_id} booking={b} upcoming={false} onCancel={cancelBooking} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Favorites Tab */}
        {activeTab === "favorites" && (
          <div>
            {favDoctors.length === 0 ? (
              <div className="text-center py-16 bg-white/2 border border-white/5 rounded-2xl">
                <div className="text-5xl mb-4">★</div>
                <h3 className="text-white font-bold mb-2">No favorites yet</h3>
                <p className="text-slate-500 text-sm mb-5">Star doctors to save them here</p>
                <Link href="/doctors" className="px-6 py-2.5 rounded-xl text-sm font-semibold transition btn-full-sm" style={{ backgroundColor: 'var(--blue)', color: '#fff' }}>
                  Browse Doctors →
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {favDoctors.map(doc => (
                  <div key={doc.id} className="bg-white/3 border border-white/6 rounded-2xl p-5 hover:bg-white/5 transition">
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-3xl">{SPECIALTIES_ICONS[doc.specialty] || "🏥"}</div>
                      <button onClick={() => removeFavorite(doc.id)} className="text-yellow-400 hover:text-slate-500 transition text-lg">★</button>
                    </div>
                    <h3 className="text-white font-bold">{doc.name}</h3>
                    <p className="text-blue-400 text-xs mb-1">{doc.specialty}</p>
                    <p className="text-slate-600 text-xs mb-3 truncate">{doc.hospital}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-yellow-400">⭐ {doc.rating}</span>
                      <span className="text-green-400">Rs. {doc.fee}</span>
                    </div>
                    <Link href={`/doctors/${doc.id}`} className="w-full mt-3 block text-center py-2 rounded-lg text-xs transition btn-full-sm" style={{ backgroundColor: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                      <span className="inline-block w-full py-2" style={{ backgroundColor: 'var(--blue)', color: '#fff', borderRadius: 8 }}>Book Appointment →</span>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="max-w-md">
            <div className="bg-white/3 border border-white/6 rounded-2xl p-6">
              <h3 className="text-white font-bold mb-5">Personal Information</h3>
              <div className="space-y-4">
                {[
                  { label: "Full Name", value: currentUser.full_name, icon: "👤" },
                  { label: "Email Address", value: currentUser.email, icon: "📧" },
                  { label: "Phone Number", value: currentUser.phone, icon: "📱" },
                ].map(field => (
                  <div key={field.label} className="bg-white/3 border border-white/6 rounded-xl p-4">
                    <label className="text-slate-500 text-xs font-medium uppercase tracking-wider block mb-1">
                      {field.icon} {field.label}
                    </label>
                    <p className="text-white">{field.value || "—"}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-4 border-t border-white/5 space-y-2">
                <Link href="/symptom-checker" className="w-full block text-center py-3 rounded-xl text-sm font-semibold transition btn-full-sm" style={{ backgroundColor: 'var(--blue)', color: '#fff' }}>
                  🤖 Start New Symptom Check
                </Link>
                <button
                  onClick={() => { localStorage.removeItem("ai_doctor_user"); router.push("/"); }}
                  className="w-full border border-red-500/20 text-red-400 hover:bg-red-500/10 py-3 rounded-xl text-sm font-semibold transition btn-full-sm"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function AppointmentCard({ booking, upcoming, onCancel }: any) {
  const SPECIALTIES_ICONS: Record<string, string> = {
    "Cardiologist": "❤️", "Dermatologist": "✨", "General Physician": "🩺",
    "Gynecologist": "👶", "Orthopedic Surgeon": "🦴", "Pediatrician": "🧸",
    "Neurologist": "🧠", "Psychiatrist": "💭", "ENT Specialist": "👂", "Diabetologist": "💉",
  };

  return (
    <div className={`bg-white/3 border rounded-2xl p-5 flex items-center gap-4 transition ${upcoming ? "border-white/8 hover:border-blue-500/30" : "border-white/5"}`}>
      <div className="text-3xl">{SPECIALTIES_ICONS[booking.doctor_specialty] || "🏥"}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h4 className="text-white font-semibold">{booking.doctor_name}</h4>
          {upcoming && <span className="text-xs bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full">Upcoming</span>}
        </div>
        <p className="text-blue-400 text-xs">{booking.doctor_specialty}</p>
        <p className="text-slate-600 text-xs">{booking.hospital}</p>
        <div className="flex gap-3 mt-1.5 text-xs text-slate-500">
          <span>📅 {booking.appointment_date}</span>
          <span>⏰ {booking.appointment_time}</span>
          <span>💰 Rs. {booking.fee}</span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <span className="text-slate-600 text-xs font-mono"># {booking.booking_id}</span>
        {upcoming && (
          <button onClick={() => onCancel(booking.booking_id)} className="text-xs text-red-400 hover:text-red-300 border border-red-400/20 hover:border-red-400/40 px-2 py-1 rounded-lg transition">
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}