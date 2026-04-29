"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, AppUser } from "../context/AuthContext";
import {
  ScoreStore, Score,
  DrawStore, DrawEntry, generateDrawNumbers,
  WinnerStore, Winner,
  CharityStore, Charity,
  SubscriptionStore,
  seedSampleData,
} from "../context/DataStore";

function Stat({ emoji, label, value, color = "text-cyan-400" }: any) {
  return (
    <div className="p-5 bg-white/5 rounded-xl border border-white/10 hover:border-cyan-400/30 transition">
      <p className="text-2xl mb-1">{emoji}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-gray-400 text-xs mt-1">{label}</p>
    </div>
  );
}

export default function AdminPanel() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [scores, setScores] = useState<Score[]>([]);
  const [draws, setDraws] = useState<DrawEntry[]>([]);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [charities, setCharities] = useState<Charity[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [subs, setSubs] = useState<any[]>([]);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const refresh = () => {
    setScores(ScoreStore.getAll());
    setDraws(DrawStore.getAll());
    setWinners(WinnerStore.getAll());
    setCharities(CharityStore.getAll());
    setSubs(SubscriptionStore.getAll());
    try {
      const raw = localStorage.getItem("gc_users");
      setAllUsers(raw ? JSON.parse(raw).map((u: any) => { const { passwordHash: _, ...rest } = u; return rest; }) : []);
    } catch { setAllUsers([]); }
  };

  useEffect(() => {
    if (!loading && !user) { router.push("/login"); return; }
    if (!loading && user && user.role !== "admin") { router.push("/dashboard"); return; }
    if (user) { seedSampleData(); refresh(); }
  }, [user, loading]);

  if (loading || !user || user.role !== "admin") return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-cyan-400 text-xl animate-pulse">Verifying admin access…</div>
    </div>
  );

  const runDraw = () => {
    const drawNumbers = generateDrawNumbers();
    const draw = DrawStore.add({
      month: new Date().toLocaleString("default", { month: "long", year: "numeric" }) + " (New)",
      drawNumbers,
      participants: subs.filter((s) => s.status === "active").length || 5,
      runAt: new Date().toISOString(),
      status: "completed",
    });

    // Calculate winners based on actual matches
    const allEligibleUsers = allUsers.filter(u => u.role !== 'admin');
    const results = allEligibleUsers.map(u => {
      const userScores = scores.filter(s => s.userId === u.id).map(s => s.score);
      const matchCount = calculateMatches(userScores, drawNumbers);
      return { user: u, matchCount };
    }).filter(r => r.matchCount >= 3)
      .sort((a, b) => b.matchCount - a.matchCount);

    const prizeTiers = [
      { pos: 1, minMatches: 5, prize: "$2,000", pct: 40 },
      { pos: 2, minMatches: 4, prize: "$1,750", pct: 35 },
      { pos: 3, minMatches: 3, prize: "$1,250", pct: 25 },
    ];

    results.slice(0, 3).forEach((r, idx) => {
      const tier = prizeTiers[idx] || prizeTiers[2];
      WinnerStore.add({
        drawId: draw.id,
        month: draw.month,
        userId: r.user.id,
        userName: r.user.name,
        matchCount: r.matchCount,
        prize: tier.prize,
        prizePercent: tier.pct,
        position: idx + 1,
        verified: false,
        paidOut: false,
        charityContribution: `$${(tier.pct * 0.2).toFixed(2)}`
      });
    });

    refresh();
    showToast("✅ Draw run successfully!");
  };

  const TABS = [
    { id: "overview", label: "Overview", emoji: "📊" },
    { id: "users", label: "Manage Users", emoji: "👥" },
    { id: "scores", label: "Manage Scores", emoji: "⛳" },
    { id: "draws", label: "Run Draw", emoji: "🎯" },
    { id: "charities", label: "Manage Charities", emoji: "❤️" },
    { id: "winners", label: "Verify Winners", emoji: "🏆" },
    { id: "reports", label: "Reports", emoji: "📋" },
  ];

  const totalRevenue = subs.filter((s) => s.status === "active").reduce((a: number, s: any) => a + (s.amount || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950/10 to-slate-900">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-6 py-3 bg-green-500/20 border border-green-400/50 text-green-300 rounded-xl shadow-xl animate-fade-in">
          {toast}
        </div>
      )}

      {/* Nav */}
      <nav className="border-b border-white/5 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl">⛳</span>
              <span className="font-bold text-white">GolfChain</span>
            </Link>
            <span className="text-gray-600">/</span>
            <span className="text-red-400 font-semibold text-sm">⚙️ Admin Panel</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-gray-400 text-sm hover:text-white transition">User Dashboard</Link>
            <button onClick={() => { logout(); router.push("/"); }} className="px-3 py-1.5 border border-red-400/40 text-red-400 rounded-lg text-sm hover:bg-red-400/10 transition">Logout</button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
          <p className="text-gray-400 mt-1">Manage GolfChain platform — users, scores, draws, charities & winners</p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === tab.id ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"}`}
            >
              {tab.emoji} {tab.label}
            </button>
          ))}
        </div>

        {/* ─── OVERVIEW ─── */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Stat emoji="👥" label="Total Users" value={allUsers.length} color="text-blue-400" />
              <Stat emoji="💎" label="Active Subs" value={subs.filter((s) => s.status === "active").length} color="text-cyan-400" />
              <Stat emoji="⛳" label="Total Scores" value={scores.length} color="text-emerald-400" />
              <Stat emoji="💰" label="Monthly Revenue" value={`$${totalRevenue.toFixed(2)}`} color="text-yellow-400" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Stat emoji="🎯" label="Draws Run" value={draws.length} color="text-orange-400" />
              <Stat emoji="🏆" label="Winners" value={winners.length} color="text-yellow-400" />
              <Stat emoji="❤️" label="Charities" value={charities.length} color="text-pink-400" />
              <Stat emoji="✅" label="Verified Winners" value={winners.filter((w) => w.verified).length} color="text-green-400" />
            </div>

            <div className="p-6 bg-red-500/5 border border-red-400/20 rounded-xl">
              <h3 className="text-red-400 font-bold mb-4">⚡ Quick Admin Actions</h3>
              <div className="flex flex-wrap gap-3">
                <button onClick={runDraw} className="px-5 py-2.5 bg-yellow-500/20 border border-yellow-400/30 text-yellow-400 rounded-xl hover:bg-yellow-500/30 transition font-semibold">🎯 Run Monthly Draw</button>
                <button onClick={() => setActiveTab("winners")} className="px-5 py-2.5 bg-green-500/20 border border-green-400/30 text-green-400 rounded-xl hover:bg-green-500/30 transition font-semibold">✅ Verify Winners</button>
                <button onClick={() => setActiveTab("reports")} className="px-5 py-2.5 bg-blue-500/20 border border-blue-400/30 text-blue-400 rounded-xl hover:bg-blue-500/30 transition font-semibold">📋 View Reports</button>
              </div>
            </div>
          </div>
        )}

        {/* ─── USERS TABLE ─── */}
        {activeTab === "users" && (
          <div>
            <h2 className="text-xl font-bold text-white mb-6">Users Table ({allUsers.length})</h2>
            <div className="bg-white/5 rounded-xl border border-white/10 overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead><tr className="border-b border-white/10 text-xs text-gray-400">
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Role</th>
                  <th className="px-4 py-3 text-left">Joined</th>
                  <th className="px-4 py-3 text-left">Subscription</th>
                </tr></thead>
                <tbody>
                  {allUsers.map((u: any) => {
                    const sub = subs.find((s) => s.userId === u.id && s.status === "active");
                    return (
                      <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition">
                        <td className="px-4 py-3 text-white text-sm font-medium">{u.name}</td>
                        <td className="px-4 py-3 text-gray-400 text-sm">{u.email}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 text-xs rounded-full font-semibold ${u.role === "admin" ? "bg-red-400/10 text-red-300" : u.role === "subscriber" ? "bg-cyan-400/10 text-cyan-300" : "bg-gray-400/10 text-gray-300"}`}>{u.role}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-xs">{sub ? <span className="text-green-400">✅ {sub.plan}</span> : <span className="text-gray-500">—</span>}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── MANAGE SCORES ─── */}
        {activeTab === "scores" && (
          <div>
            <h2 className="text-xl font-bold text-white mb-6">Scores Table ({scores.length})</h2>
            <div className="bg-white/5 rounded-xl border border-white/10 overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead><tr className="border-b border-white/10 text-xs text-gray-400">
                  <th className="px-4 py-3 text-left">Player</th>
                  <th className="px-4 py-3 text-left">Course</th>
                  <th className="px-4 py-3 text-right">Score</th>
                  <th className="px-4 py-3 text-right">Date</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr></thead>
                <tbody>
                  {scores.map((sc) => (
                    <tr key={sc.id} className="border-b border-white/5 hover:bg-white/5 transition">
                      <td className="px-4 py-3 text-white text-sm">{sc.userName}</td>
                      <td className="px-4 py-3 text-gray-400 text-sm">{sc.course}</td>
                      <td className="px-4 py-3 text-right text-cyan-400 font-bold">{sc.score}</td>
                      <td className="px-4 py-3 text-right text-gray-400 text-xs">{new Date(sc.date).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => { ScoreStore.delete(sc.id); setScores(ScoreStore.getAll()); showToast("Score deleted"); }}
                          className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs hover:bg-red-500/30 transition"
                        >Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── RUN DRAW ─── */}
        {activeTab === "draws" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Draw Table ({draws.length})</h2>
              <button onClick={runDraw} className="px-5 py-2.5 bg-yellow-500/20 border border-yellow-400/30 text-yellow-400 rounded-xl hover:bg-yellow-500/30 transition font-semibold">🎯 Run New Draw</button>
            </div>
            <div className="space-y-3">
              {[...draws].reverse().map((d) => (
                <div key={d.id} className="p-5 bg-yellow-500/5 border border-yellow-400/20 rounded-xl">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-yellow-400 font-bold">{d.month}</h3>
                      <p className="text-gray-400 text-xs mt-0.5">Run: {new Date(d.runAt).toLocaleString()} · {d.participants} participants</p>
                    </div>
                    <span className="px-2 py-0.5 bg-green-400/10 text-green-300 rounded text-xs">✓ Completed</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {d.drawNumbers.map((n) => (
                      <span key={n} className="w-9 h-9 flex items-center justify-center bg-yellow-400/20 border border-yellow-400/40 rounded-full text-yellow-300 font-bold text-sm">{n}</span>
                    ))}
                  </div>
                </div>
              ))}
              {draws.length === 0 && <p className="text-gray-400">No draws run yet.</p>}
            </div>

            {/* Simulate */}
            <div className="mt-8 p-6 bg-blue-500/5 border border-blue-400/20 rounded-xl">
              <h3 className="text-blue-400 font-bold mb-2">🔮 Simulate Results</h3>
              <p className="text-gray-400 text-sm mb-4">Preview what a draw result would look like.</p>
              <div className="flex flex-wrap gap-2">
                {generateDrawNumbers().map((n) => (
                  <span key={n} className="w-9 h-9 flex items-center justify-center bg-blue-400/20 border border-blue-400/40 rounded-full text-blue-300 font-bold text-sm">{n}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── CHARITIES ─── */}
        {activeTab === "charities" && (
          <div>
            <h2 className="text-xl font-bold text-white mb-6">Charities Table</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {charities.map((c) => (
                <div key={c.id} className="p-5 bg-pink-500/5 border border-pink-400/20 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{c.logoEmoji}</span>
                    <div>
                      <h3 className="text-white font-bold text-sm">{c.name}</h3>
                      <span className="text-xs text-pink-400">{c.category}</span>
                    </div>
                  </div>
                  <p className="text-gray-400 text-xs mb-3">{c.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-green-400 text-sm font-bold">${c.totalReceived.toLocaleString()} received</span>
                    <button
                      onClick={() => { CharityStore.addContribution(c.id, 100); setCharities(CharityStore.getAll()); showToast(`+$100 added to ${c.name}`); }}
                      className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs hover:bg-green-500/30 transition"
                    >+$100</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── WINNERS ─── */}
        {activeTab === "winners" && (
          <div>
            <h2 className="text-xl font-bold text-white mb-6">Winners Table ({winners.length})</h2>
            <div className="space-y-3">
              {winners.map((w) => (
                <div key={w.id} className="p-5 bg-yellow-500/5 border border-yellow-400/20 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{w.position === 1 ? "🥇" : w.position === 2 ? "🥈" : "🥉"}</span>
                      <p className="text-white font-bold">{w.userName}</p>
                    </div>
                    <p className="text-gray-400 text-sm">{w.month} · {w.matchCount} matches</p>
                    <p className="text-pink-400 text-xs mt-0.5">Charity: {w.charityContribution}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-yellow-400 font-bold text-xl">{w.prize}</p>
                    <div className="flex gap-2">
                      {!w.verified && (
                        <button
                          onClick={() => { WinnerStore.verify(w.id); setWinners(WinnerStore.getAll()); showToast("Winner verified!"); }}
                          className="px-3 py-1.5 bg-green-500/20 border border-green-400/30 text-green-400 rounded-lg text-xs hover:bg-green-500/30 transition"
                        >✓ Verify</button>
                      )}
                      {w.verified && !w.paidOut && (
                        <button
                          onClick={() => { WinnerStore.markPaid(w.id); setWinners(WinnerStore.getAll()); showToast("Marked as paid!"); }}
                          className="px-3 py-1.5 bg-blue-500/20 border border-blue-400/30 text-blue-400 rounded-lg text-xs hover:bg-blue-500/30 transition"
                        >💰 Mark Paid</button>
                      )}
                      {w.verified && <span className="px-2 py-1 bg-green-400/10 text-green-300 rounded text-xs">✓ Verified</span>}
                      {w.paidOut && <span className="px-2 py-1 bg-blue-400/10 text-blue-300 rounded text-xs">💰 Paid</span>}
                    </div>
                  </div>
                </div>
              ))}
              {winners.length === 0 && <p className="text-gray-400">No winners yet. Run a draw first.</p>}
            </div>
          </div>
        )}

        {/* ─── REPORTS ─── */}
        {activeTab === "reports" && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white mb-6">Analytics & Reports</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
                <h3 className="text-cyan-400 font-bold mb-4">💰 Revenue Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-400">Active Subscriptions</span><span className="text-white font-semibold">{subs.filter((s) => s.status === "active").length}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Monthly Revenue</span><span className="text-green-400 font-semibold">${totalRevenue.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Charity Contributions</span><span className="text-pink-400 font-semibold">${(totalRevenue * 0.1).toFixed(2)}</span></div>
                </div>
              </div>
              <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
                <h3 className="text-yellow-400 font-bold mb-4">🏆 Prize Distribution</h3>
                <div className="space-y-2 text-sm">
                  {[["5 Match", "40%", "Rollover if no winner"],["4 Match", "35%", "Second prize tier"],["3 Match", "25%", "Third prize tier"]].map(([t, p, note]) => (
                    <div key={t} className="flex justify-between items-center">
                      <span className="text-gray-400">{t}</span>
                      <span className="text-yellow-400 font-bold">{p}</span>
                      <span className="text-gray-500 text-xs">{note}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
                <h3 className="text-pink-400 font-bold mb-4">❤️ Charity Impact</h3>
                <div className="space-y-2 text-sm">
                  {charities.slice(0, 4).map((c) => (
                    <div key={c.id} className="flex justify-between items-center">
                      <span className="text-gray-300">{c.logoEmoji} {c.name.split(" ").slice(0, 2).join(" ")}</span>
                      <span className="text-green-400 font-semibold">${c.totalReceived.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
                <h3 className="text-emerald-400 font-bold mb-4">⛳ Score Activity</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-400">Total Rounds Submitted</span><span className="text-white font-semibold">{scores.length}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Avg Score</span><span className="text-emerald-400 font-semibold">{scores.length ? (scores.reduce((a, s) => a + s.score, 0) / scores.length).toFixed(1) : "—"}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Draws Completed</span><span className="text-white font-semibold">{draws.filter((d) => d.status === "completed").length}</span></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
