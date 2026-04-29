"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CharityStore, seedSampleData } from "../context/DataStore";
import { useAuth } from "../context/AuthContext";

export default function CharityPage() {
  const { user, updateUser } = useAuth();
  const [charities, setCharities] = useState<any[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  useEffect(() => {
    seedSampleData();
    setCharities(CharityStore.getAll());
    if (user?.preferredCharityId) setSelected(user.preferredCharityId);
  }, [user]);

  const handleSelect = (id: string) => {
    setSelected(id);
    if (user) {
      updateUser({ preferredCharityId: id });
      showToast("✅ Charity preference saved!");
    }
  };

  const totalDonations = charities.reduce((s, c) => s + c.totalReceived, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-pink-950/10 to-slate-900">
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-6 py-3 bg-green-500/20 border border-green-400/50 text-green-300 rounded-xl shadow-xl">
          {toast}
        </div>
      )}

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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-red-400 bg-clip-text text-transparent mb-2">❤️ Charities Table</h1>
          <p className="text-gray-400">Every subscription contributes to charities that matter</p>
        </div>

        {/* Impact stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="p-5 bg-pink-500/5 border border-pink-400/20 rounded-xl text-center">
            <p className="text-3xl font-bold text-pink-400">${totalDonations.toLocaleString()}</p>
            <p className="text-gray-400 text-xs mt-1">Total Donated</p>
          </div>
          <div className="p-5 bg-pink-500/5 border border-pink-400/20 rounded-xl text-center">
            <p className="text-3xl font-bold text-pink-400">{charities.length}</p>
            <p className="text-gray-400 text-xs mt-1">Active Charities</p>
          </div>
          <div className="p-5 bg-pink-500/5 border border-pink-400/20 rounded-xl text-center">
            <p className="text-3xl font-bold text-pink-400">10%</p>
            <p className="text-gray-400 text-xs mt-1">Per Subscription</p>
          </div>
        </div>

        <div className="mb-6">
          {user ? (
            <p className="text-gray-400 text-center">
              {selected ? (
                <>
                  ✅ Your charity: <strong className="text-white">{charities.find((c) => c.id === selected)?.name || selected}</strong>. Click any card to change.
                </>
              ) : (
                "Click a charity below to select where your subscription goes."
              )}
            </p>
          ) : (
            <p className="text-center text-gray-400">
              <Link href="/login" className="text-cyan-400 hover:underline">Login</Link> to select your preferred charity.
            </p>
          )}
        </div>

        {/* Charities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {charities.map((c) => {
            const isSelected = selected === c.id;
            return (
              <button
                key={c.id}
                onClick={() => user && handleSelect(c.id)}
                className={`p-6 rounded-2xl border-2 text-left transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl group ${
                  isSelected
                    ? "border-pink-400 bg-pink-500/15 shadow-lg shadow-pink-500/20"
                    : "border-white/10 bg-white/5 hover:border-pink-400/50 hover:bg-pink-500/5"
                } ${user ? "cursor-pointer" : "cursor-default"}`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-4xl">{c.logoEmoji}</span>
                  <div>
                    <p className="text-white font-bold text-sm leading-snug">{c.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full mt-0.5 inline-block ${isSelected ? "bg-pink-400/20 text-pink-300" : "bg-white/10 text-gray-400"}`}>{c.category}</span>
                  </div>
                  {isSelected && <span className="ml-auto text-pink-400 text-xl">✓</span>}
                </div>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">{c.description}</p>

                {/* Contribution bar */}
                <div className="mt-auto">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">Total Received</span>
                    <span className="text-green-400 font-semibold">${c.totalReceived.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-pink-400 to-red-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((c.totalReceived / 25000) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* How charity works */}
        <div className="mt-12 p-8 bg-pink-500/5 border border-pink-400/20 rounded-2xl">
          <h3 className="text-pink-400 font-bold text-xl mb-6">❤️ How Charity Contributions Work</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            {[
              { emoji: "💎", title: "You Subscribe", desc: "Monthly ($9.99) or Yearly ($99.99) plan" },
              { emoji: "🔢", title: "10% Goes to Charity", desc: "charityAmt = subscription × 10%" },
              { emoji: "❤️", title: "Impact is Tracked", desc: "Real-time totals per charity updated live" },
            ].map((s) => (
              <div key={s.title}>
                <p className="text-3xl mb-2">{s.emoji}</p>
                <p className="text-white font-semibold mb-1">{s.title}</p>
                <p className="text-gray-400 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-white/5 rounded-xl text-center">
            <code className="text-pink-300 text-sm">charityContribution = subscriptionAmount × (charityPercent / 100)</code>
          </div>
        </div>
      </div>
    </div>
  );
}
