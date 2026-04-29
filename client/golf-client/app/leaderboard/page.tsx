"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ScoreStore, seedSampleData } from "../context/DataStore";

export default function Leaderboard() {
  const [board, setBoard] = useState<any[]>([]);
  const [allScores, setAllScores] = useState<any[]>([]);
  const [view, setView] = useState<"leaderboard" | "scores">("leaderboard");

  useEffect(() => {
    seedSampleData();
    setBoard(ScoreStore.leaderboard());
    setAllScores(ScoreStore.getAll().sort((a: any, b: any) => b.score - a.score));
  }, []);

  const medal = (i: number) => (i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`);
  const rowColor = (i: number) => i === 0 ? "bg-yellow-400/5 border-l-4 border-l-yellow-400" : i === 1 ? "bg-gray-400/5 border-l-4 border-l-gray-400" : i === 2 ? "bg-orange-400/5 border-l-4 border-l-orange-400" : "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/30 to-slate-900">
      <nav className="border-b border-white/5 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">⛳</span>
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">GolfChain</span>
          </Link>
          <div className="flex gap-3">
            <Link href="/scores"><button className="px-4 py-2 bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 rounded-lg text-sm hover:bg-emerald-500/30 transition">+ Submit Score</button></Link>
            <Link href="/dashboard"><button className="px-4 py-2 bg-white/5 text-gray-300 rounded-lg text-sm hover:bg-white/10 transition">Dashboard</button></Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">📊 Score Table</h1>
          <p className="text-gray-400">Real-time rankings across all GolfChain players</p>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2 mb-8 justify-center">
          {[{ id: "leaderboard", label: "🏆 Leaderboard" }, { id: "scores", label: "📋 All Scores" }].map((v) => (
            <button key={v.id} onClick={() => setView(v.id as any)} className={`px-5 py-2 rounded-lg text-sm font-medium transition ${view === v.id ? "bg-cyan-500 text-white" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}>{v.label}</button>
          ))}
        </div>

        {/* LEADERBOARD */}
        {view === "leaderboard" && (
          <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-white font-bold">Global Leaderboard</h2>
              <span className="text-gray-400 text-sm">{board.length} players</span>
            </div>
            <table className="w-full">
              <thead><tr className="text-xs text-gray-400 border-b border-white/5">
                <th className="px-6 py-3 text-left">Rank</th>
                <th className="px-6 py-3 text-left">Player</th>
                <th className="px-6 py-3 text-right">Total Points</th>
                <th className="px-6 py-3 text-right">Rounds</th>
                <th className="px-6 py-3 text-right">Avg / Round</th>
              </tr></thead>
              <tbody>
                {board.map((p, i) => (
                  <tr key={p.userId} className={`border-b border-white/5 hover:bg-white/5 transition ${rowColor(i)}`}>
                    <td className="px-6 py-4 text-lg">{medal(i)}</td>
                    <td className="px-6 py-4 text-white font-semibold">{p.userName}</td>
                    <td className="px-6 py-4 text-right text-cyan-400 font-bold text-lg">{p.totalPoints}</td>
                    <td className="px-6 py-4 text-right text-gray-400">{p.rounds}</td>
                    <td className="px-6 py-4 text-right text-gray-300">{p.avg}</td>
                  </tr>
                ))}
                {board.length === 0 && <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">No scores yet.</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {/* ALL SCORES */}
        {view === "scores" && (
          <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10">
              <h2 className="text-white font-bold">All Submitted Scores ({allScores.length})</h2>
            </div>
            <table className="w-full">
              <thead><tr className="text-xs text-gray-400 border-b border-white/5">
                <th className="px-6 py-3 text-left">Player</th>
                <th className="px-6 py-3 text-left">Course</th>
                <th className="px-6 py-3 text-right">Score</th>
                <th className="px-6 py-3 text-right">Date</th>
              </tr></thead>
              <tbody>
                {allScores.map((sc: any) => (
                  <tr key={sc.id} className="border-b border-white/5 hover:bg-white/5 transition">
                    <td className="px-6 py-3 text-white">{sc.userName}</td>
                    <td className="px-6 py-3 text-gray-400 text-sm">{sc.course}</td>
                    <td className="px-6 py-3 text-right text-cyan-400 font-bold">{sc.score}</td>
                    <td className="px-6 py-3 text-right text-gray-500 text-xs">{new Date(sc.date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Prize Info */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          {[["5 Match", "40%", "text-yellow-400", "🎯"],["4 Match", "35%", "text-gray-300", "🥈"],["3 Match", "25%", "text-orange-400", "🥉"]].map(([label, pct, color, icon]) => (
            <div key={label} className="p-4 bg-white/5 border border-white/10 rounded-xl text-center">
              <p className="text-2xl mb-1">{icon}</p>
              <p className="text-white font-semibold text-sm">{label}</p>
              <p className={`font-bold text-xl ${color}`}>{pct}</p>
              <p className="text-gray-500 text-xs">of prize pool</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
