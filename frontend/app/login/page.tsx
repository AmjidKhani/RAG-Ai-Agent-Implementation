"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem("ai_doctor_users") || "[]");
    const user = users.find((u: any) => u.email === email && u.password === password);
    
    if (user) {
      localStorage.setItem("ai_doctor_user", JSON.stringify({
        id: user.id, email: user.email, full_name: user.full_name, phone: user.phone
      }));
      router.push("/");
    } else {
      setError("Invalid credentials. Please register first.");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800/50 rounded-2xl p-8 border border-slate-700/50">
        <h1 className="text-3xl font-bold text-white text-center mb-6">Welcome Back</h1>
        <form onSubmit={handleLogin}>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-600 rounded-xl p-3 text-white mb-4" />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-600 rounded-xl p-3 text-white mb-4" />
          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl btn-full-sm">Login</button>
        </form>
        <p className="text-center text-slate-400 mt-4">Don't have an account? <Link href="/register" className="text-blue-400">Register</Link></p>
      </div>
    </main>
  );
}