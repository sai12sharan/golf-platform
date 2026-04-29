"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { WinnerStore, seedSampleData } from "../context/DataStore";

export default function WinnersPage() {
  const [winners, setWinners] = useState<any[]>([]);

  useEffect(() => {
    seedSampleData();
    setWinners([...WinnerStore.getAll()].sort((a, b) => new Date(b.drawId).getTime() - new Date(a.drawId).getTime()));
  }, []);

  const posEmoji = (p: number) => p === 1 ? "🥇" : p === 2 ? "🥈" : "🥉";
  const posColor = (p: number) => p === 1 ? "border-yellow-400/40 bg-yellow-400/5" : p === 2 ? "border-gray-400/40 bg-gray-400/5" : "border-orange-400/40 bg-orange-400/5";
  const prizeColor = (p: number) => p === 1 ? "text-yellow-400" : p === 2 ? "text-gray-300" : "text-orange-400";

  const totalPrizes = winners.reduce((sum, w) => {
    const num = parseFloat(w.prize.replace(/[$,]/g, "")) || 0;
    return sum + num;
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-yellow-950/10 to-slate-900">
      <nav className="border-b border-white/5 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">⛳</span>
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">GolfChain</span>
          </Link>
          <div className="flex gap-3">
            <Link href="/draw"><button className="px-4 py-2 bg-yellow-500/20 border border-yellow-400/30 text-yellow-400 rounded-lg text-sm hover:bg-yellow-500/30 transition">🎯 Draw Table</button></Link>
            <Link href="/dashboard"><button className="px-4 py-2 bg-white/5 text-gray-300 rounded-lg text-sm hover:bg-white/10 transition">Dashboard</button></Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-2">🏆 Winners Table</h1>
          <p className="text-gray-400">Hall of Champions — verified draw winners and prize payouts</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="p-5 bg-white/5 border border-white/10 rounded-xl text-center">
            <p className="text-3xl font-bold text-yellow-400">{winners.length}</p>
            <p className="text-gray-400 text-xs mt-1">Total Winners</p>
          </div>
          <div className="p-5 bg-white/5 border border-white/10 rounded-xl text-center">
            <p className="text-3xl font-bold text-green-400">${totalPrizes.toLocaleString()}</p>
            <p className="text-gray-400 text-xs mt-1">Total Paid Out</p>
          </div>
          <div className="p-5 bg-white/5 border border-white/10 rounded-xl text-center">
            <p className="text-3xl font-bold text-pink-400">{winners.filter((w) => w.verified).length}</p>
            <p className="text-gray-400 text-xs mt-1">Verified Winners</p>
          </div>
        </div>

        {/* Winners Table */}
        {winners.length > 0 ? (
          <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-white/10">
              <h2 className="text-white font-bold">All Time Winners</h2>
            </div>
            <table className="w-full">
              <thead><tr className="text-xs text-gray-400 border-b border-white/5">
                <th className="px-6 py-3 text-left">Pos</th>
                <th className="px-6 py-3 text-left">Winner</th>
                <th className="px-6 py-3 text-left">Draw</th>
                <th className="px-6 py-3 text-right">Matches</th>
                <th className="px-6 py-3 text-right">Prize</th>
                <th className="px-6 py-3 text-right">Charity</th>
                <th className="px-6 py-3 text-center">Status</th>
              </tr></thead>
              <tbody>
                {winners.map((w) => (
                  <tr key={w.id} className={`border-b border-white/5 hover:bg-white/5 transition ${w.position === 1 ? "bg-yellow-400/3" : ""}`}>
                    <td className="px-6 py-4 text-2xl">{posEmoji(w.position)}</td>
                    <td className="px-6 py-4 text-white font-semibold">{w.userName}</td>
                    <td className="px-6 py-4 text-gray-400 text-sm">{w.month}</td>
                    <td className="px-6 py-4 text-right text-cyan-400 font-bold">{w.matchCount}</td>
                    <td className={`px-6 py-4 text-right font-bold text-lg ${prizeColor(w.position)}`}>{w.prize}</td>
                    <td className="px-6 py-4 text-right text-pink-400 text-sm">{w.charityContribution}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1 flex-wrap">
                        {w.verified ? <span className="px-2 py-0.5 bg-green-400/10 text-green-300 rounded text-xs">✓ Verified</span> : <span className="px-2 py-0.5 bg-yellow-400/10 text-yellow-300 rounded text-xs">⏳ Pending</span>}
                        {w.paidOut && <span className="px-2 py-0.5 bg-blue-400/10 text-blue-300 rounded text-xs">💰 Paid</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-4">🏆</p>
            <p>No winners yet. Run a draw to see results here.</p>
          </div>
        )}

        {/* Cards view */}
        <h3 className="text-white font-bold text-xl mb-6">Winner Spotlight</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {winners.filter((w) => w.position <= 3).slice(0, 3).map((w) => (
            <div key={w.id} className={`p-6 rounded-2xl border-2 ${posColor(w.position)} text-center`}>
              <p className="text-4xl mb-2">{posEmoji(w.position)}</p>
              <p className="text-white font-bold text-lg">{w.userName}</p>
              <p className="text-gray-400 text-xs mb-3">{w.month}</p>
              <p className={`text-3xl font-black ${prizeColor(w.position)}`}>{w.prize}</p>
              <p className="text-gray-400 text-xs mt-2">{w.matchCount} number matches</p>
              <p className="text-pink-400 text-xs mt-1">❤️ {w.charityContribution} to charity</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
