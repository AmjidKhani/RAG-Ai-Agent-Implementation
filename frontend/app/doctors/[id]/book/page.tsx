"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function BookPage() {
  const pathname = usePathname();
  const router = useRouter();
  const id = pathname?.split("/").slice(-3, -2)[0] || pathname?.split("/").pop() || "";
  const [doc, setDoc] = useState<any>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    if (!id) return;
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
  fetch(`${API_BASE}/doctors/${id}`)
      .then(r => r.json())
      .then(d => setDoc(d))
      .catch(() => setDoc(null));
  }, [id]);

  const makeBooking = () => {
    if (!date || !time || !name) return alert('Please enter name, date and time');
    const booking = {
      booking_id: Math.random().toString(36).slice(2, 9).toUpperCase(),
      doctor_id: doc?.id || id,
      doctor_name: doc?.name || 'Doctor',
      doctor_specialty: doc?.specialty,
      appointment_date: date,
      appointment_time: time,
      fee: doc?.fee || 0,
    };
    const existing = JSON.parse(localStorage.getItem('ai_doctor_bookings') || '[]');
    existing.push(booking);
    localStorage.setItem('ai_doctor_bookings', JSON.stringify(existing));
    alert('Booking confirmed');
    router.push('/dashboard');
  };

  return (
    <main className="min-h-screen p-6" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)', fontFamily: 'Roboto, sans-serif' }}>
      <div className="max-w-2xl mx-auto">
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>{doc?.name || 'Book Appointment'}</h2>
        <p style={{ color: 'var(--text-secondary)' }}>{doc?.specialty} · {doc?.hospital}</p>

        <div className="mt-6 bg-white/3 border rounded-xl p-4" style={{ borderColor: 'var(--border)' }}>
          <label className="block text-sm text-slate-500 mb-2">Your name</label>
          <input value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 rounded-md border" style={{ borderColor: 'var(--border)' }} />

          <label className="block text-sm text-slate-500 mt-4 mb-2">Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-3 py-2 rounded-md border" style={{ borderColor: 'var(--border)' }} />

          <label className="block text-sm text-slate-500 mt-4 mb-2">Time</label>
          <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full px-3 py-2 rounded-md border" style={{ borderColor: 'var(--border)' }} />

          <div className="mt-4 flex gap-3">
            <button onClick={() => router.back()} className="px-4 py-2 rounded-md border" style={{ borderColor: 'var(--border)', background: 'transparent' }}>Back</button>
            <button onClick={makeBooking} className="px-4 py-2 rounded-md" style={{ backgroundColor: 'var(--green)', color: '#fff' }}>Confirm Booking</button>
          </div>
        </div>
      </div>
    </main>
  );
}
