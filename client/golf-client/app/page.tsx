"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "./context/AuthContext";
import { seedSampleData } from "./context/DataStore";

const NAV_LINKS = [
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/draw", label: "Draw" },
  { href: "/charity", label: "Charity" },
  { href: "/subscription", label: "Pricing" },
];

// Left / Centre / Right clickable category modules
const CATEGORIES = [
  {
    side: "LEFT",
    href: "/leaderboard",
    emoji: "📊",
    title: "Score Table",
    sub: "Real-Time Leaderboards",
    desc: "Track live rankings across all players. Climb the board with every round.",
    color: "from-cyan-500/10 to-blue-500/10",
    border: "border-cyan-400/20 hover:border-cyan-400/80",
    glow: "hover:shadow-cyan-500/20",
    accent: "text-cyan-400",
    tag: "bg-cyan-400/10 text-cyan-300",
  },
  {
    side: "CENTER",
    href: "/draw",
    emoji: "🎯",
    title: "Draw Table",
    sub: "Monthly Prize Draw",
    desc: "Monthly number draws with 5-match, 4-match, and 3-match prize tiers.",
    color: "from-yellow-500/10 to-orange-500/10",
    border: "border-yellow-400/20 hover:border-yellow-400/80",
    glow: "hover:shadow-yellow-500/20",
    accent: "text-yellow-400",
    tag: "bg-yellow-400/10 text-yellow-300",
  },
  {
    side: "RIGHT",
    href: "/winners",
    emoji: "🏆",
    title: "Winners Table",
    sub: "Hall of Champions",
    desc: "View verified winners, prize distributions, and charity contributions.",
    color: "from-purple-500/10 to-pink-500/10",
    border: "border-purple-400/20 hover:border-purple-400/80",
    glow: "hover:shadow-purple-500/20",
    accent: "text-purple-400",
    tag: "bg-purple-400/10 text-purple-300",
  },
];

// All Categories row
const ALL_CATEGORIES = [
  { href: "/admin", emoji: "⚙️", title: "Admin Panel", desc: "Manage users, run draws, verify winners", color: "border-red-400/20 hover:border-red-400/60", accent: "text-red-400" },
  { href: "/dashboard", emoji: "👤", title: "User Dashboard", desc: "Profile, scores, subscription, winnings", color: "border-green-400/20 hover:border-green-400/60", accent: "text-green-400" },
  { href: "/charity", emoji: "❤️", title: "Charities Table", desc: "Browse charities and track donations", color: "border-pink-400/20 hover:border-pink-400/60", accent: "text-pink-400" },
  { href: "/subscription", emoji: "💎", title: "Subscription", desc: "Monthly & yearly premium plans", color: "border-cyan-400/20 hover:border-cyan-400/60", accent: "text-cyan-400" },
  { href: "/scores", emoji: "⛳", title: "Score Entry", desc: "Submit your golf rounds", color: "border-emerald-400/20 hover:border-emerald-400/60", accent: "text-emerald-400" },
  { href: "/users", emoji: "👥", title: "Users Table", desc: "Browse all registered members", color: "border-blue-400/20 hover:border-blue-400/60", accent: "text-blue-400" },
];

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { user } = useAuth();
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    if (!seeded) { seedSampleData(); setSeeded(true); }
  }, [seeded]);

  // Animated canvas background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let animId: number;
    let t = 0;

    const draw = () => {
      ctx.fillStyle = "rgba(10,25,50,0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      t += 0.005;
      // Draw animated network nodes
      for (let i = 0; i < 6; i++) {
        const x = canvas.width * (0.15 + 0.7 * ((i * 0.17 + t * 0.3) % 1));
        const y = canvas.height * (0.3 + 0.4 * Math.sin(t + i));
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,212,255,${0.3 + 0.2 * Math.sin(t + i)})`;
        ctx.fill();
        if (i > 0) {
          const px = canvas.width * (0.15 + 0.7 * (((i - 1) * 0.17 + t * 0.3) % 1));
          const py = canvas.height * (0.3 + 0.4 * Math.sin(t + i - 1));
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(x, y);
          ctx.strokeStyle = `rgba(0,212,255,0.06)`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    const onResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", onResize); };
  }, []);

  return (
    <div className="min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      <canvas ref={canvasRef} className="absolute inset-0 opacity-40 pointer-events-none" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full filter blur-3xl opacity-15 pointer-events-none" />
      <div className="absolute top-40 right-10 w-72 h-72 bg-purple-500 rounded-full filter blur-3xl opacity-15 pointer-events-none" />
      <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-cyan-500 rounded-full filter blur-3xl opacity-15 pointer-events-none" />

      {/* NAV */}
      <nav className="relative z-50 flex justify-between items-center px-8 py-5 border-b border-white/5 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <span className="text-3xl">⛳</span>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">GolfChain</h1>
        </div>
        <div className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-gray-300 hover:text-cyan-400 transition text-sm font-medium">{l.label}</Link>
          ))}
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-gray-300 text-sm hidden md:inline">
                {user.role === "admin" ? "⚙️" : user.role === "subscriber" ? "💎" : "👤"} {user.name}
              </span>
              <Link href="/dashboard">
                <button className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg text-sm hover:shadow-lg hover:shadow-cyan-500/40 transition">Dashboard</button>
              </Link>
            </>
          ) : (
            <Link href="/login">
              <button className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg text-sm hover:shadow-lg hover:shadow-cyan-500/40 transition">Login / Register</button>
            </Link>
          )}
        </div>
      </nav>

      {/* HERO */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[85vh] px-4 text-center">
        <div className="max-w-5xl animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-cyan-300 text-sm mb-6">
            <span className="animate-pulse">●</span> Live Monthly Draw — Join Now
          </div>
          <h2 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent leading-tight">
            Play Golf.<br />Win Prizes.<br />Change Lives.
          </h2>
          <p className="text-xl md:text-2xl text-gray-300 mb-10 leading-relaxed max-w-3xl mx-auto">
            Subscribe, submit your scores, and enter the monthly number draw. Every entry supports the charities you care about.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link href={user ? "/dashboard" : "/login"}>
              <button className="px-10 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-xl hover:shadow-2xl hover:shadow-cyan-500/40 transition transform hover:scale-105 text-lg">
                {user ? "Go to Dashboard" : "Get Started Free"}
              </button>
            </Link>
            <Link href="/draw">
              <button className="px-10 py-4 border-2 border-cyan-400 text-cyan-400 font-bold rounded-xl hover:bg-cyan-400 hover:text-slate-950 transition transform hover:scale-105 text-lg">
                View Draw Results
              </button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-16 max-w-2xl mx-auto">
            {[["1,000+","Active Players"],["$50K","Prize Pool"],["20+","Charities"]].map(([val, lbl]) => (
              <div key={lbl} className="p-5 backdrop-blur-md bg-white/5 rounded-xl border border-cyan-400/20 hover:border-cyan-400/50 transition">
                <p className="text-3xl font-bold text-cyan-400">{val}</p>
                <p className="text-gray-400 mt-1 text-sm">{lbl}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── THREE MAIN CATEGORY MODULES ── */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-3">Core Modules</h3>
            <p className="text-gray-400">Click any module to explore — Left · Center · Right</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
            {CATEGORIES.map((cat) => (
              <Link key={cat.href} href={cat.href}>
                <div className={`relative p-8 backdrop-blur-md bg-gradient-to-br ${cat.color} rounded-2xl border-2 ${cat.border} transition-all duration-300 transform hover:-translate-y-3 hover:shadow-2xl ${cat.glow} cursor-pointer group h-full`}>
                  <div className={`absolute top-4 right-4 px-2 py-0.5 text-xs rounded-full ${cat.tag} font-semibold`}>{cat.side}</div>
                  <p className="text-6xl mb-4 transform group-hover:scale-110 transition duration-300">{cat.emoji}</p>
                  <h4 className={`text-2xl font-bold ${cat.accent} mb-1 group-hover:brightness-125 transition`}>{cat.title}</h4>
                  <p className="text-gray-400 text-sm mb-3 font-medium">{cat.sub}</p>
                  <p className="text-gray-300 group-hover:text-gray-200 transition leading-relaxed">{cat.desc}</p>
                  <div className={`mt-5 text-sm font-semibold ${cat.accent} opacity-0 group-hover:opacity-100 transition flex items-center gap-1`}>
                    Open Module →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── ALL CATEGORIES GRID ── */}
      <section className="relative z-10 py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h3 className="text-3xl font-bold text-white mb-2">All Categories</h3>
            <p className="text-gray-400 text-sm">Every module is fully clickable</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {ALL_CATEGORIES.map((cat) => (
              <Link key={cat.href} href={cat.href}>
                <div className={`p-5 backdrop-blur-md bg-white/5 rounded-xl border ${cat.color} hover:bg-white/10 transition-all duration-300 cursor-pointer group text-center transform hover:-translate-y-1 hover:shadow-lg`}>
                  <p className="text-3xl mb-2 transform group-hover:scale-110 transition">{cat.emoji}</p>
                  <p className={`text-sm font-bold ${cat.accent} mb-1`}>{cat.title}</p>
                  <p className="text-gray-400 text-xs leading-snug">{cat.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── USER ROLES SECTION ── */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-white mb-2">User Roles</h3>
            <p className="text-gray-400">Click to login as any role</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { role: "Public Visitor", emoji: "👁️", color: "border-gray-400/30 hover:border-gray-400", accent: "text-gray-300", desc: "Browse public pages, view leaderboards and draw results without an account.", perms: ["View Leaderboard","View Draw Results","Browse Charities","Check Subscription Plans"], href: "/login" },
              { role: "Subscriber", emoji: "💎", color: "border-cyan-400/30 hover:border-cyan-400", accent: "text-cyan-400", desc: "Full member access — submit scores, enter draws, select charity, track winnings.", perms: ["Submit Scores","Enter Monthly Draw","Select Charity","View Winnings","Manage Subscription"], href: "/login" },
              { role: "Admin", emoji: "⚙️", color: "border-red-400/30 hover:border-red-400", accent: "text-red-400", desc: "Full platform control — manage users, run draws, verify winners, view analytics.", perms: ["Manage All Users","Run Monthly Draw","Verify Winners","Manage Charities","View Reports","Approve Payouts"], href: "/admin" },
            ].map((r) => (
              <Link key={r.role} href={r.href}>
                <div className={`p-7 backdrop-blur-md bg-white/5 rounded-2xl border-2 ${r.color} transition-all duration-300 cursor-pointer group hover:-translate-y-2 hover:shadow-xl h-full`}>
                  <p className="text-4xl mb-3">{r.emoji}</p>
                  <h4 className={`text-xl font-bold ${r.accent} mb-2`}>{r.role}</h4>
                  <p className="text-gray-400 text-sm mb-4 leading-relaxed">{r.desc}</p>
                  <ul className="space-y-1.5">
                    {r.perms.map((p) => (
                      <li key={p} className="flex items-center gap-2 text-xs text-gray-300">
                        <span className="text-green-400">✓</span> {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="relative z-10 py-20 px-4 border-t border-white/5">
        <div className="max-w-5xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-white mb-12">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: "01", emoji: "📝", title: "Subscribe", desc: "Choose monthly or yearly plan" },
              { step: "02", emoji: "⛳", title: "Submit Scores", desc: "Enter your top 5 Stableford scores" },
              { step: "03", emoji: "🎯", title: "Enter Draw", desc: "Scores become your draw numbers (1–45)" },
              { step: "04", emoji: "🏆", title: "Win & Give", desc: "Match numbers to win. Charity gets a cut." },
            ].map((s) => (
              <div key={s.step} className="p-6 bg-white/5 rounded-xl border border-white/10 hover:border-cyan-400/40 transition">
                <div className="text-4xl font-black text-cyan-400/20 mb-2">{s.step}</div>
                <p className="text-3xl mb-2">{s.emoji}</p>
                <h4 className="text-white font-bold mb-1">{s.title}</h4>
                <p className="text-gray-400 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/5 py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-gray-400 text-sm">
          <div className="flex items-center gap-2">
            <span>⛳</span>
            <span className="font-semibold text-white">GolfChain</span>
            <span>— Play. Win. Change Lives.</span>
          </div>
          <div className="flex gap-6">
            {NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-cyan-400 transition">{l.label}</Link>
            ))}
          </div>
          <p>© 2026 GolfChain. Supporting charities worldwide 🌍</p>
        </div>
      </footer>
    </div>
  );
}