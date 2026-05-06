"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ full_name: "", email: "", phone: "", password: "" });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem("ai_doctor_users") || "[]");
    if (users.find((u: any) => u.email === formData.email)) {
      alert("Email already exists");
      return;
    }
    const newUser = { id: users.length + 1, ...formData };
    users.push(newUser);
    localStorage.setItem("ai_doctor_users", JSON.stringify(users));
    localStorage.setItem("ai_doctor_user", JSON.stringify({ id: newUser.id, email: newUser.email, full_name: newUser.full_name, phone: newUser.phone }));
    router.push("/");
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800/50 rounded-2xl p-8 border border-slate-700/50">
        <h1 className="text-3xl font-bold text-white text-center mb-6">Create Account</h1>
        <form onSubmit={handleRegister}>
          <input type="text" placeholder="Full Name" value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})}
            className="w-full bg-slate-900/80 border border-slate-600 rounded-xl p-3 text-white mb-4" />
          <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full bg-slate-900/80 border border-slate-600 rounded-xl p-3 text-white mb-4" />
          <input type="tel" placeholder="Phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}
            className="w-full bg-slate-900/80 border border-slate-600 rounded-xl p-3 text-white mb-4" />
          <input type="password" placeholder="Password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
            className="w-full bg-slate-900/80 border border-slate-600 rounded-xl p-3 text-white mb-4" />
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl btn-full-sm">Register</button>
        </form>
        <p className="text-center text-slate-400 mt-4">Already have an account? <Link href="/login" className="text-blue-400">Login</Link></p>
      </div>
    </main>
  );
}