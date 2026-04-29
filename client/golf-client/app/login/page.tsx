"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = isRegister
        ? await register(name.trim(), email.trim(), password)
        : await login(email.trim(), password);

      if (result.success) {
        router.push("/dashboard");
      } else {
        setError(result.error || "Authentication failed");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role: string) => {
    if (role === "admin") { setEmail("admin@golfchain.com"); setPassword("admin123"); }
    else if (role === "subscriber") { setEmail("subscriber@golfchain.com"); setPassword("user123"); }
    else { setEmail("visitor@golfchain.com"); setPassword("visitor123"); }
    setIsRegister(false);
    setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center px-4">
      {/* Glow orbs */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-cyan-500 rounded-full filter blur-3xl opacity-10 pointer-events-none" />
      <div className="absolute bottom-20 right-20 w-64 h-64 bg-purple-500 rounded-full filter blur-3xl opacity-10 pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div className="backdrop-blur-md bg-white/5 rounded-2xl border border-cyan-400/20 p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-4xl mb-2">⛳</div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              GolfChain
            </h1>
            <p className="text-gray-400 mt-1">
              {isRegister ? "Create your account" : "Welcome back"}
            </p>
          </div>

          {/* Demo credentials */}
          <div className="mb-6 p-4 bg-blue-500/10 border border-blue-400/20 rounded-xl">
            <p className="text-xs text-blue-300 mb-2 font-semibold uppercase tracking-wider">
              🔑 Quick Login Demos
            </p>
            <div className="flex gap-2 flex-wrap">
              {[
                { label: "Admin", role: "admin", color: "bg-red-500/20 text-red-300 border-red-400/30 hover:bg-red-500/40" },
                { label: "Subscriber", role: "subscriber", color: "bg-cyan-500/20 text-cyan-300 border-cyan-400/30 hover:bg-cyan-500/40" },
                { label: "Visitor", role: "visitor", color: "bg-gray-500/20 text-gray-300 border-gray-400/30 hover:bg-gray-500/40" },
              ].map((d) => (
                <button
                  key={d.role}
                  type="button"
                  onClick={() => fillDemo(d.role)}
                  className={`px-3 py-1 text-xs rounded-lg border transition ${d.color}`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-sm flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-sm text-gray-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/10 border border-cyan-400/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:bg-white/15 transition"
                  placeholder="John Doe"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm text-gray-300 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/10 border border-cyan-400/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:bg-white/15 transition"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/10 border border-cyan-400/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:bg-white/15 transition"
                placeholder="••••••••"
                required
                minLength={isRegister ? 6 : 1}
              />
              {isRegister && <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-cyan-500/40 transition transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⟳</span> Processing…
                </span>
              ) : isRegister ? "Create Account" : "Login"}
            </button>
          </form>

          <div className="mt-5 text-center">
            <button
              onClick={() => { setIsRegister(!isRegister); setError(""); }}
              className="text-cyan-400 hover:text-cyan-300 transition text-sm"
            >
              {isRegister ? "Already have an account? Login" : "Don't have an account? Register"}
            </button>
          </div>

          <div className="mt-4">
            <Link href="/">
              <button className="w-full py-2.5 border border-cyan-400/40 text-cyan-400 font-semibold rounded-xl hover:bg-cyan-400/10 transition text-sm">
                ← Back to Home
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}