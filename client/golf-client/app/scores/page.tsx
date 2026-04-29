"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { ScoreStore } from "../context/DataStore";

const COURSES = [
  "St Andrews Links",
  "Augusta National",
  "Pebble Beach",
  "Royal Birkdale",
  "Carnoustie",
  "Muirfield",
  "Royal Troon",
  "TPC Sawgrass",
];

export default function ScoresPage() {
  const { user } = useAuth();
  const [myScores, setMyScores] = useState<any[]>([]);
  const [form, setForm] = useState({ score: "", course: COURSES[0], date: new Date().toISOString().split("T")[0] });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const refresh = () => {
    if (user) setMyScores(ScoreStore.getByUser(user.id));
  };

  useEffect(() => { refresh(); }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!user) { setError("Please login to submit scores."); return; }
    const score = parseInt(form.score);
    if (isNaN(score) || score < 1 || score > 45) { setError("Score must be a number between 1 and 45 (Stableford points)."); return; }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    ScoreStore.add({ userId: user.id, userName: user.name, score, course: form.course, date: new Date(form.date).toISOString() });
    setForm({ score: "", course: COURSES[0], date: new Date().toISOString().split("T")[0] });
    refresh();
    setLoading(false);
    setSuccess("✅ Score submitted! Your draw numbers have been updated.");
  };

  const handleDelete = (id: string) => {
    ScoreStore.delete(id);
    refresh();
  };

  const remaining = 5 - myScores.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950/10 to-slate-900">
      <nav className="border-b border-white/5 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">⛳</span>
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">GolfChain</span>
          </Link>
          <div className="flex gap-3">
            <Link href="/leaderboard"><button className="px-4 py-2 bg-cyan-500/20 border border-cyan-400/30 text-cyan-400 rounded-lg text-sm hover:bg-cyan-500/30 transition">📊 Leaderboard</button></Link>
            <Link href="/dashboard"><button className="px-4 py-2 bg-white/5 text-gray-300 rounded-lg text-sm hover:bg-white/10 transition">Dashboard</button></Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-2">⛳ Score Entry</h1>
          <p className="text-gray-400">Submit your Stableford scores — each score becomes your draw number (1–45)</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Submit Form */}
          <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
            <h2 className="text-white font-bold text-lg mb-5">Submit a Score</h2>
            {success && <div className="mb-4 p-3 bg-green-500/20 border border-green-400/30 text-green-300 rounded-xl text-sm">{success}</div>}
            {error && <div className="mb-4 p-3 bg-red-500/20 border border-red-400/30 text-red-400 rounded-xl text-sm">⚠️ {error}</div>}

            {!user ? (
              <div className="text-center py-6">
                <p className="text-gray-400 mb-4">Login to submit your scores.</p>
                <Link href="/login"><button className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-xl hover:shadow-lg transition">Login / Register</button></Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {remaining === 0 && (
                  <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-400/20 rounded-xl text-yellow-300 text-xs">
                    💡 All 5 slots full. Submitting a new score will replace your oldest one.
                  </div>
                )}
                <div>
                  <label className="block text-sm text-gray-300 mb-1.5">
                    Stableford Score <span className="text-gray-500">(1–45)</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={45}
                    value={form.score}
                    onChange={(e) => setForm({ ...form, score: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/10 border border-emerald-400/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400 focus:bg-white/15 transition"
                    placeholder="e.g. 36"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1.5">Course</label>
                  <select
                    value={form.course}
                    onChange={(e) => setForm({ ...form, course: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/10 border border-emerald-400/30 rounded-xl text-white focus:outline-none focus:border-emerald-400 transition"
                  >
                    {COURSES.map((c) => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1.5">Date Played</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/10 border border-emerald-400/30 rounded-xl text-white focus:outline-none focus:border-emerald-400 transition"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 transition transform hover:scale-[1.02] disabled:opacity-50"
                >
                  {loading ? "Submitting…" : "Submit Score"}
                </button>
              </form>
            )}

            {/* Info box */}
            <div className="mt-5 p-4 bg-blue-500/5 border border-blue-400/10 rounded-xl text-xs text-gray-400 space-y-1">
              <p>• Scores range from 1–45 (draw number system)</p>
              <p>• Maximum 5 scores stored per player</p>
              <p>• Oldest score auto-removed when adding a 6th</p>
              <p>• Your scores = your draw numbers each month</p>
            </div>
          </div>

          {/* My Scores */}
          <div>
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-white font-bold text-lg">My Scores</h2>
              <span className={`text-sm px-3 py-1 rounded-full ${remaining > 0 ? "bg-emerald-400/10 text-emerald-300" : "bg-yellow-400/10 text-yellow-300"}`}>
                {myScores.length}/5 slots used
              </span>
            </div>

            {/* Slot visualization */}
            <div className="flex gap-2 mb-5">
              {Array.from({ length: 5 }).map((_, i) => {
                const sc = myScores[i];
                return (
                  <div key={i} className={`flex-1 rounded-lg py-3 text-center text-sm font-bold border ${sc ? "bg-emerald-400/10 border-emerald-400/40 text-emerald-300" : "bg-white/5 border-white/10 text-gray-600"}`}>
                    {sc ? sc.score : "—"}
                  </div>
                );
              })}
            </div>

            <div className="space-y-3">
              {myScores.length === 0 && (
                <div className="text-center py-10 text-gray-400">
                  <p className="text-3xl mb-2">⛳</p>
                  <p className="text-sm">No scores yet. Submit your first round!</p>
                </div>
              )}
              {myScores.map((sc, i) => (
                <div key={sc.id} className="p-4 bg-white/5 border border-white/10 rounded-xl flex justify-between items-center group hover:border-white/20 transition">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 text-xs">#{i + 1}</span>
                      <span className="text-emerald-400 font-black text-xl">{sc.score}</span>
                      <span className="text-gray-300 text-xs">pts</span>
                    </div>
                    <p className="text-gray-400 text-xs mt-0.5">{sc.course}</p>
                    <p className="text-gray-500 text-xs">{new Date(sc.date).toLocaleDateString()}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(sc.id)}
                    className="opacity-0 group-hover:opacity-100 px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs hover:bg-red-500/30 transition"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>

            {/* Score Logic info */}
            <div className="mt-5 p-4 bg-emerald-500/5 border border-emerald-400/10 rounded-xl">
              <p className="text-emerald-400 text-xs font-semibold mb-1">Score Logic</p>
              <pre className="text-gray-400 text-xs leading-relaxed whitespace-pre-wrap">
{`if (scores.length >= 5) {
  deleteOldestScore(userId);
}
insertScore(userId, score, date);`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}