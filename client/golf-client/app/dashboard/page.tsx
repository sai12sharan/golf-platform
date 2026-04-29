"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { ScoreStore, SubscriptionStore, WinnerStore, DrawStore, seedSampleData } from "../context/DataStore";

function NavBar({ user, logout }: { user: any; logout: () => void }) {
  return (
    <nav className="border-b border-white/5 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">⛳</span>
          <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">GolfChain</span>
        </Link>
        <div className="flex items-center gap-4">
          {user?.role === "admin" && (
            <Link href="/admin" className="text-red-400 text-sm hover:text-red-300 transition">⚙️ Admin Panel</Link>
          )}
          <span className="text-gray-400 text-sm">{user?.name}</span>
          <button onClick={logout} className="px-3 py-1.5 border border-red-400/40 text-red-400 rounded-lg text-sm hover:bg-red-400/10 transition">Logout</button>
        </div>
      </div>
    </nav>
  );
}

export default function Dashboard() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [scores, setScores] = useState<any[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [winnings, setWinnings] = useState<any[]>([]);
  const [latestDraw, setLatestDraw] = useState<any>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      seedSampleData();
      setScores(ScoreStore.getByUser(user.id));
      setSubscription(SubscriptionStore.getByUser(user.id));
      setWinnings(WinnerStore.getAll().filter((w) => w.userId === user.id));
      setLatestDraw(DrawStore.getLatest());
    }
  }, [user]);

  if (loading || !user) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-cyan-400 text-xl animate-pulse">Loading…</div>
    </div>
  );

  const TABS = [
    { id: "overview", label: "Overview", emoji: "📊" },
    { id: "profile", label: "Profile", emoji: "👤" },
    { id: "subscription", label: "Subscription", emoji: "💎" },
    { id: "scores", label: "My Scores", emoji: "⛳" },
    { id: "draw", label: "Draw", emoji: "🎯" },
    { id: "winnings", label: "Winnings", emoji: "🏆" },
    { id: "charity", label: "Charity", emoji: "❤️" },
  ];

  const totalPoints = scores.reduce((s, sc) => s + sc.score, 0);
  const roleColor = user.role === "admin" ? "text-red-400" : user.role === "subscriber" ? "text-cyan-400" : "text-gray-400";
  const roleBadge = user.role === "admin" ? "bg-red-400/10 text-red-300 border-red-400/30" : user.role === "subscriber" ? "bg-cyan-400/10 text-cyan-300 border-cyan-400/30" : "bg-gray-400/10 text-gray-300 border-gray-400/30";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/30 to-slate-900">
      <NavBar user={user} logout={() => { logout(); router.push("/"); }} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Welcome, {user.name.split(" ")[0]} 👋</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className={`px-3 py-0.5 text-xs rounded-full border ${roleBadge} font-semibold`}>{user.role}</span>
              <span className="text-gray-400 text-sm">{user.email}</span>
            </div>
          </div>
          {user.role === "admin" && (
            <Link href="/admin">
              <button className="px-6 py-2.5 bg-red-500/20 border border-red-400/40 text-red-300 rounded-xl hover:bg-red-500/30 transition font-semibold">⚙️ Go to Admin Panel</button>
            </Link>
          )}
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-white/5 pb-4">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === tab.id ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20" : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"}`}
            >
              {tab.emoji} {tab.label}
            </button>
          ))}
        </div>

        {/* ─── OVERVIEW ─── */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Scores Submitted", value: scores.length, max: 5, emoji: "⛳", color: "text-cyan-400" },
                { label: "Total Points", value: totalPoints, emoji: "📈", color: "text-blue-400" },
                { label: "Subscription", value: subscription ? subscription.plan : "None", emoji: "💎", color: "text-purple-400" },
                { label: "Winnings", value: winnings.length, emoji: "🏆", color: "text-yellow-400" },
              ].map((stat) => (
                <div key={stat.label} className="p-5 bg-white/5 rounded-xl border border-white/10 hover:border-cyan-400/30 transition">
                  <p className="text-2xl mb-1">{stat.emoji}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-gray-400 text-xs mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Quick actions */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Submit Score", href: "/scores", emoji: "⛳", color: "bg-emerald-500/10 border-emerald-400/20 text-emerald-400 hover:bg-emerald-500/20" },
                  { label: "View Leaderboard", href: "/leaderboard", emoji: "📊", color: "bg-cyan-500/10 border-cyan-400/20 text-cyan-400 hover:bg-cyan-500/20" },
                  { label: "Draw Results", href: "/draw", emoji: "🎯", color: "bg-yellow-500/10 border-yellow-400/20 text-yellow-400 hover:bg-yellow-500/20" },
                  { label: "Choose Charity", href: "/charity", emoji: "❤️", color: "bg-pink-500/10 border-pink-400/20 text-pink-400 hover:bg-pink-500/20" },
                ].map((a) => (
                  <Link key={a.href} href={a.href}>
                    <div className={`p-4 rounded-xl border ${a.color} transition cursor-pointer text-center`}>
                      <p className="text-2xl mb-1">{a.emoji}</p>
                      <p className="text-sm font-semibold">{a.label}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {latestDraw && (
              <div className="p-6 bg-yellow-500/5 border border-yellow-400/20 rounded-xl">
                <h3 className="text-yellow-400 font-bold mb-3">🎯 Last Draw — {latestDraw.month}</h3>
                <div className="flex flex-wrap gap-2">
                  {latestDraw.drawNumbers.map((n: number) => (
                    <span key={n} className="w-10 h-10 flex items-center justify-center bg-yellow-400/20 border border-yellow-400/40 rounded-full text-yellow-300 font-bold text-sm">{n}</span>
                  ))}
                </div>
                <Link href="/draw" className="mt-3 inline-block text-yellow-400 text-sm hover:text-yellow-300">View full results →</Link>
              </div>
            )}
          </div>
        )}

        {/* ─── PROFILE ─── */}
        {activeTab === "profile" && (
          <div className="max-w-xl">
            <h2 className="text-xl font-bold text-white mb-6">Your Profile</h2>
            <div className="bg-white/5 rounded-xl border border-white/10 p-6 space-y-4">
              {[
                { label: "Full Name", value: user.name },
                { label: "Email", value: user.email },
                { label: "Role", value: user.role },
                { label: "Member Since", value: new Date(user.createdAt).toLocaleDateString() },
              ].map((f) => (
                <div key={f.label} className="flex justify-between items-center border-b border-white/5 pb-3">
                  <span className="text-gray-400 text-sm">{f.label}</span>
                  <span className={`font-semibold text-sm ${f.label === "Role" ? roleColor : "text-white"}`}>{f.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── SUBSCRIPTION STATUS ─── */}
        {activeTab === "subscription" && (
          <div className="max-w-xl">
            <h2 className="text-xl font-bold text-white mb-6">Subscription Status</h2>
            {subscription ? (
              <div className="bg-cyan-500/5 border border-cyan-400/20 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-cyan-400 font-bold text-lg capitalize">{subscription.plan} Plan</h3>
                  <span className="px-3 py-1 bg-green-400/10 border border-green-400/30 text-green-300 rounded-full text-xs font-semibold">✓ Active</span>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-gray-400">Amount</span><span className="text-white font-semibold">${subscription.amount}/mo</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Charity %</span><span className="text-pink-400 font-semibold">{subscription.charityPercent}%</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Renews</span><span className="text-white">{new Date(subscription.renewDate).toLocaleDateString()}</span></div>
                </div>
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
                <p className="text-gray-400 mb-4">You don't have an active subscription.</p>
                <Link href="/subscription">
                  <button className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-xl hover:shadow-lg transition">View Plans</button>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* ─── MY SCORES ─── */}
        {activeTab === "scores" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">My Scores <span className="text-gray-500 text-sm font-normal">({scores.length}/5 slots)</span></h2>
              <Link href="/scores">
                <button className="px-4 py-2 bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 rounded-lg text-sm hover:bg-emerald-500/30 transition">+ Submit New</button>
              </Link>
            </div>
            {scores.length > 0 ? (
              <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                <table className="w-full">
                  <thead><tr className="border-b border-white/10 text-xs text-gray-400">
                    <th className="px-4 py-3 text-left">#</th>
                    <th className="px-4 py-3 text-left">Course</th>
                    <th className="px-4 py-3 text-right">Score</th>
                    <th className="px-4 py-3 text-right">Date</th>
                  </tr></thead>
                  <tbody>
                    {scores.map((sc, i) => (
                      <tr key={sc.id} className="border-b border-white/5 hover:bg-white/5 transition">
                        <td className="px-4 py-3 text-gray-400 text-sm">{i + 1}</td>
                        <td className="px-4 py-3 text-white text-sm">{sc.course}</td>
                        <td className="px-4 py-3 text-right text-cyan-400 font-bold">{sc.score}</td>
                        <td className="px-4 py-3 text-right text-gray-400 text-xs">{new Date(sc.date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-400">No scores yet. <Link href="/scores" className="text-cyan-400 hover:underline">Submit your first score →</Link></p>
            )}
          </div>
        )}

        {/* ─── DRAW PARTICIPATION ─── */}
        {activeTab === "draw" && (
          <div>
            <h2 className="text-xl font-bold text-white mb-6">Draw Participation</h2>
            {latestDraw ? (
              <div className="space-y-4">
                <div className="p-6 bg-yellow-500/5 border border-yellow-400/20 rounded-xl">
                  <h3 className="text-yellow-400 font-bold text-lg mb-2">{latestDraw.month} Draw</h3>
                  <p className="text-gray-400 text-sm mb-4">Drawn on {new Date(latestDraw.runAt).toLocaleDateString()}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {latestDraw.drawNumbers.map((n: number) => {
                      const userNums = scores.map((s: any) => s.score);
                      const matched = userNums.includes(n);
                      return (
                        <span key={n} className={`w-12 h-12 flex items-center justify-center rounded-full font-bold text-sm border-2 ${matched ? "bg-green-400/20 border-green-400 text-green-300" : "bg-white/5 border-white/20 text-gray-400"}`}>{n}</span>
                      );
                    })}
                  </div>
                  <p className="text-sm text-gray-400">Your scores: {scores.map((s: any) => s.score).join(", ") || "None submitted"}</p>
                </div>
                <Link href="/draw">
                  <button className="px-6 py-2.5 bg-yellow-500/20 border border-yellow-400/30 text-yellow-400 rounded-xl hover:bg-yellow-500/30 transition">Full Draw Results →</button>
                </Link>
              </div>
            ) : (
              <p className="text-gray-400">No draw results yet.</p>
            )}
          </div>
        )}

        {/* ─── WINNINGS ─── */}
        {activeTab === "winnings" && (
          <div>
            <h2 className="text-xl font-bold text-white mb-6">Winnings Overview</h2>
            {winnings.length > 0 ? (
              <div className="space-y-3">
                {winnings.map((w) => (
                  <div key={w.id} className="p-5 bg-yellow-500/5 border border-yellow-400/20 rounded-xl flex justify-between items-center">
                    <div>
                      <p className="text-white font-semibold">{w.month}</p>
                      <p className="text-gray-400 text-sm">Position #{w.position} · {w.matchCount} matches</p>
                    </div>
                    <div className="text-right">
                      <p className="text-yellow-400 font-bold text-xl">{w.prize}</p>
                      <p className="text-xs text-gray-400">{w.paidOut ? "✅ Paid" : "⏳ Pending"}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No winnings yet. Enter the draw to participate!</p>
            )}
          </div>
        )}

        {/* ─── CHARITY ─── */}
        {activeTab === "charity" && (
          <div>
            <h2 className="text-xl font-bold text-white mb-6">Charity Selection</h2>
            <p className="text-gray-400 mb-4">Choose which charity receives your subscription contribution.</p>
            <Link href="/charity">
              <button className="px-6 py-2.5 bg-pink-500/20 border border-pink-400/30 text-pink-400 rounded-xl hover:bg-pink-500/30 transition">Select / Change Charity →</button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
