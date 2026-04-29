"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { ScoreStore, DrawStore, WinnerStore, generateDrawNumbers, calculateMatches, seedSampleData } from "../context/DataStore";

export default function DrawPage() {
  const { user } = useAuth();
  const [draws, setDraws] = useState<any[]>([]);
  const [winners, setWinners] = useState<any[]>([]);
  const [selectedDraw, setSelectedDraw] = useState<any>(null);
  const [userScores, setUserScores] = useState<number[]>([]);
  const [simNumbers, setSimNumbers] = useState<number[]>([]);

  useEffect(() => {
    seedSampleData();
    const allDraws = [...DrawStore.getAll()].reverse();
    setDraws(allDraws);
    if (allDraws.length > 0) setSelectedDraw(allDraws[0]);
    setWinners(WinnerStore.getAll());
    if (user) setUserScores(ScoreStore.getByUser(user.id).map((s) => s.score));
    setSimNumbers(generateDrawNumbers());
  }, [user]);

  const drawWinners = selectedDraw ? winners.filter((w) => w.drawId === selectedDraw.id) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-yellow-950/10 to-slate-900">
      <nav className="border-b border-white/5 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">⛳</span>
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">GolfChain</span>
          </Link>
          <Link href="/dashboard"><button className="px-4 py-2 bg-white/5 text-gray-300 rounded-lg text-sm hover:bg-white/10 transition">Dashboard</button></Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-2">🎯 Draw Table</h1>
          <p className="text-gray-400">Monthly prize draw — match your scores to win big</p>
        </div>

        {/* Draw Selector */}
        {draws.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {draws.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedDraw(d)}
                className={`px-4 py-2 rounded-lg text-sm transition ${selectedDraw?.id === d.id ? "bg-yellow-500 text-black font-bold" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}
              >
                {d.month}
              </button>
            ))}
          </div>
        )}

        {selectedDraw && (
          <div className="space-y-6">
            {/* Draw Numbers */}
            <div className="p-8 bg-yellow-500/5 border border-yellow-400/20 rounded-2xl text-center">
              <h2 className="text-yellow-400 font-bold text-2xl mb-2">{selectedDraw.month}</h2>
              <p className="text-gray-400 text-sm mb-6">
                Drawn: {new Date(selectedDraw.runAt).toLocaleString()} · {selectedDraw.participants} participants
              </p>
              <p className="text-gray-400 text-sm mb-4">Winning Numbers</p>
              <div className="flex flex-wrap gap-4 justify-center">
                {selectedDraw.drawNumbers.map((n: number) => {
                  const matched = userScores.includes(n);
                  return (
                    <div
                      key={n}
                      className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black border-2 transition ${
                        matched
                          ? "bg-green-400/20 border-green-400 text-green-300 shadow-lg shadow-green-400/30"
                          : "bg-yellow-400/10 border-yellow-400/50 text-yellow-300"
                      }`}
                    >
                      {n}
                    </div>
                  );
                })}
              </div>
              {user && (
                <div className="mt-6 p-4 bg-white/5 rounded-xl">
                  <p className="text-gray-400 text-sm">Your scores: <span className="text-white font-semibold">{userScores.join(", ") || "None submitted"}</span></p>
                  {userScores.length > 0 && (
                    <p className="text-green-400 font-bold mt-1">
                      🎯 {calculateMatches(userScores, selectedDraw.drawNumbers)} match(es) — {
                        (() => {
                          const m = calculateMatches(userScores, selectedDraw.drawNumbers);
                          if (m >= 5) return "🏆 JACKPOT! 40% prize!";
                          if (m >= 4) return "🥈 4-match — 35% prize!";
                          if (m >= 3) return "🥉 3-match — 25% prize!";
                          return "Keep playing!";
                        })()
                      }
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Prize Tiers */}
            <div className="grid grid-cols-3 gap-4">
              {[["5 Match", "40%", "Rollover", "🎯", "bg-yellow-500/10 border-yellow-400/20 text-yellow-400"],["4 Match", "35%", "4th tier", "🥈", "bg-gray-400/10 border-gray-400/20 text-gray-300"],["3 Match", "25%", "3rd tier", "🥉", "bg-orange-500/10 border-orange-400/20 text-orange-400"]].map(([t, p, n, i, c]) => (
                <div key={t} className={`p-5 rounded-xl border text-center ${c}`}>
                  <p className="text-2xl mb-1">{i}</p>
                  <p className="font-bold text-sm">{t}</p>
                  <p className="text-2xl font-black">{p}</p>
                  <p className="text-xs opacity-70 mt-0.5">{n}</p>
                </div>
              ))}
            </div>

            {/* Winners for this draw */}
            {drawWinners.length > 0 && (
              <div>
                <h3 className="text-white font-bold text-lg mb-4">🏆 This Draw's Winners</h3>
                <div className="space-y-3">
                  {drawWinners.map((w) => (
                    <div key={w.id} className="p-5 bg-white/5 border border-white/10 rounded-xl flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{w.position === 1 ? "🥇" : w.position === 2 ? "🥈" : "🥉"}</span>
                        <div>
                          <p className="text-white font-semibold">{w.userName}</p>
                          <p className="text-gray-400 text-xs">{w.matchCount} matches · {w.prizePercent}% prize</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-yellow-400 font-bold">{w.prize}</p>
                        <p className="text-xs">{w.verified ? <span className="text-green-400">✓ Verified</span> : <span className="text-yellow-400">⏳ Pending</span>}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {draws.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-4">🎯</p>
            <p>No draws have been run yet.</p>
            <Link href="/admin" className="text-cyan-400 hover:underline mt-2 inline-block">Admin: Run a draw →</Link>
          </div>
        )}

        {/* Simulation Box */}
        <div className="mt-10 p-6 bg-blue-500/5 border border-blue-400/20 rounded-2xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-blue-400 font-bold">🔮 Draw Simulator</h3>
            <button onClick={() => setSimNumbers(generateDrawNumbers())} className="px-4 py-1.5 bg-blue-500/20 border border-blue-400/30 text-blue-400 rounded-lg text-sm hover:bg-blue-500/30 transition">Re-simulate</button>
          </div>
          <div className="flex flex-wrap gap-3">
            {simNumbers.map((n) => (
              <span key={n} className="w-12 h-12 flex items-center justify-center bg-blue-400/20 border border-blue-400/40 rounded-full text-blue-300 font-bold">{n}</span>
            ))}
          </div>
          <p className="text-gray-500 text-xs mt-3">Simulation only — not part of actual draws.</p>
        </div>
      </div>
    </div>
  );
}