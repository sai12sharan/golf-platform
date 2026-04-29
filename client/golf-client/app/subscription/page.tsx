"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { SubscriptionStore } from "../context/DataStore";

const PLANS = [
  {
    id: "monthly",
    label: "Monthly",
    price: 9.99,
    period: "month",
    charityPct: 10,
    features: ["Enter Monthly Draw", "Submit up to 5 scores", "Pick your charity", "View Leaderboard", "Email notifications"],
    highlight: false,
    color: "border-cyan-400/30 hover:border-cyan-400",
    accent: "text-cyan-400",
    badge: "",
  },
  {
    id: "yearly",
    label: "Yearly",
    price: 99.99,
    period: "year",
    charityPct: 12,
    features: ["Everything in Monthly", "2 months FREE", "Priority draw entry", "12% charity contribution", "Exclusive member badge", "Early access to features"],
    highlight: true,
    color: "border-purple-400/60 hover:border-purple-400",
    accent: "text-purple-400",
    badge: "BEST VALUE",
  },
];

export default function SubscriptionPage() {
  const { user } = useAuth();
  const [current, setCurrent] = useState<any>(null);
  const [toast, setToast] = useState({ msg: "", type: "" });
  const [loading, setLoading] = useState<string | null>(null);

  const showToast = (msg: string, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast({ msg: "", type: "" }), 4000); };

  useEffect(() => {
    if (user) setCurrent(SubscriptionStore.getByUser(user.id));
  }, [user]);

  const handleSubscribe = async (planId: string) => {
    if (!user) { showToast("Please login to subscribe.", "error"); return; }
    setLoading(planId);
    await new Promise((r) => setTimeout(r, 1000)); // simulate processing
    const plan = PLANS.find((p) => p.id === planId)!;
    SubscriptionStore.create({
      userId: user.id,
      plan: planId as "monthly" | "yearly",
      status: "active",
      amount: plan.price,
      startDate: new Date().toISOString(),
      renewDate: new Date(Date.now() + (planId === "monthly" ? 30 : 365) * 86400000).toISOString(),
      charityPercent: plan.charityPct,
    });
    setCurrent(SubscriptionStore.getByUser(user.id));
    setLoading(null);
    showToast(`✅ Subscribed to ${plan.label} plan!`);
  };

  const handleCancel = () => {
    if (!user) return;
    SubscriptionStore.cancel(user.id);
    setCurrent(null);
    showToast("Subscription cancelled.", "error");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/10 to-slate-900">
      {toast.msg && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-xl border ${toast.type === "error" ? "bg-red-500/20 border-red-400/50 text-red-300" : "bg-green-500/20 border-green-400/50 text-green-300"}`}>
          {toast.msg}
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

      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-3">💎 Subscription Plans</h1>
          <p className="text-gray-400 max-w-xl mx-auto">Subscribe to enter monthly draws, submit scores, and support your chosen charity. Cancel any time.</p>
        </div>

        {/* Current subscription */}
        {current && (
          <div className="mb-10 p-6 bg-green-500/5 border border-green-400/20 rounded-2xl max-w-xl mx-auto">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-green-400 font-bold">✓ Active Subscription</h3>
              <span className="px-3 py-0.5 bg-green-400/10 border border-green-400/30 text-green-300 rounded-full text-xs font-semibold">Active</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">Plan</span><span className="text-white font-semibold capitalize">{current.plan}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Amount</span><span className="text-white">${current.amount}/mo</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Charity</span><span className="text-pink-400">{current.charityPercent}%</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Renews</span><span className="text-white">{new Date(current.renewDate).toLocaleDateString()}</span></div>
            </div>
            <button onClick={handleCancel} className="mt-4 w-full py-2 border border-red-400/30 text-red-400 rounded-xl text-sm hover:bg-red-400/10 transition">Cancel Subscription</button>
          </div>
        )}

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative p-8 rounded-2xl border-2 bg-white/5 ${plan.highlight ? "bg-purple-500/5" : ""} ${plan.color} transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-purple-500 text-white text-xs font-bold rounded-full">{plan.badge}</div>
              )}
              <h3 className={`text-2xl font-bold ${plan.accent} mb-1`}>{plan.label}</h3>
              <div className="flex items-end gap-1 mb-5">
                <span className="text-4xl font-black text-white">${plan.price}</span>
                <span className="text-gray-400 text-sm mb-1">/{plan.period}</span>
              </div>
              <div className="text-sm text-pink-300 mb-5">❤️ {plan.charityPct}% goes to your charity</div>
              <ul className="space-y-2.5 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                    <span className="text-green-400">✓</span> {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading === plan.id || (current?.plan === plan.id)}
                className={`w-full py-3 rounded-xl font-bold text-sm transition ${
                  current?.plan === plan.id
                    ? "bg-green-500/20 border border-green-400/30 text-green-300 cursor-default"
                    : plan.highlight
                    ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:shadow-lg hover:shadow-purple-500/40"
                    : "bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/40"
                } disabled:opacity-50`}
              >
                {loading === plan.id ? "Processing…" : current?.plan === plan.id ? "✓ Current Plan" : user ? "Subscribe Now" : "Login to Subscribe"}
              </button>
            </div>
          ))}
        </div>

        {/* Stripe notice */}
        <div className="mt-10 text-center">
          <p className="text-gray-500 text-sm">🔒 Payments processed via Stripe. Cancel anytime. <span className="text-gray-600">(Demo mode — no real charges)</span></p>
        </div>

        {/* Features comparison */}
        <div className="mt-16">
          <h3 className="text-xl font-bold text-white text-center mb-6">What's Included</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { emoji: "⛳", title: "Score Tracking", desc: "Submit up to 5 Stableford scores per draw cycle" },
              { emoji: "🎯", title: "Monthly Draws", desc: "Your scores become your lucky numbers (1–45)" },
              { emoji: "🏆", title: "Prize Pool", desc: "5-match 40%, 4-match 35%, 3-match 25% of pool" },
              { emoji: "❤️", title: "Charity Impact", desc: "A % of your subscription supports chosen charity" },
              { emoji: "📊", title: "Live Leaderboard", desc: "Real-time rankings updated after every score" },
              { emoji: "🔄", title: "Auto-Renewal", desc: "Subscription auto-renews — cancel any time" },
            ].map((f) => (
              <div key={f.title} className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition">
                <span className="text-2xl">{f.emoji}</span>
                <div>
                  <p className="text-white font-semibold text-sm">{f.title}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
