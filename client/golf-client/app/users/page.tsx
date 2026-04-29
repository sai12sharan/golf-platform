"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { SubscriptionStore, ScoreStore, seedSampleData } from "../context/DataStore";

export default function UsersPage() {
  const { user } = useAuth();
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [subs, setSubs] = useState<any[]>([]);
  const [scores, setScores] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    seedSampleData();
    setSubs(SubscriptionStore.getAll());
    setScores(ScoreStore.getAll());
    try {
      const raw = localStorage.getItem("gc_users");
      const parsed = raw ? JSON.parse(raw).map((u: any) => { const { passwordHash: _, ...rest } = u; return rest; }) : [];
      setAllUsers(parsed);
    } catch { setAllUsers([]); }
  }, []);

  const filtered = allUsers.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const roleBadge = (role: string) =>
    role === "admin" ? "bg-red-400/10 text-red-300 border-red-400/30" :
    role === "subscriber" ? "bg-cyan-400/10 text-cyan-300 border-cyan-400/30" :
    "bg-gray-400/10 text-gray-300 border-gray-400/30";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/20 to-slate-900">
      <nav className="border-b border-white/5 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">⛳</span>
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">GolfChain</span>
          </Link>
          <div className="flex gap-3">
            {user?.role === "admin" && <Link href="/admin"><button className="px-4 py-2 bg-red-500/20 border border-red-400/30 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition">⚙️ Admin</button></Link>}
            <Link href="/dashboard"><button className="px-4 py-2 bg-white/5 text-gray-300 rounded-lg text-sm hover:bg-white/10 transition">Dashboard</button></Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">👥 Users Table</h1>
          <p className="text-gray-400">All registered GolfChain members</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-center">
            <p className="text-2xl font-bold text-blue-400">{allUsers.length}</p>
            <p className="text-gray-400 text-xs mt-1">Total Members</p>
          </div>
          <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-center">
            <p className="text-2xl font-bold text-cyan-400">{subs.filter((s) => s.status === "active").length}</p>
            <p className="text-gray-400 text-xs mt-1">Active Subscribers</p>
          </div>
          <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-center">
            <p className="text-2xl font-bold text-red-400">{allUsers.filter((u) => u.role === "admin").length}</p>
            <p className="text-gray-400 text-xs mt-1">Admins</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-white/10 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition text-sm"
          />
          <div className="flex gap-2">
            {["all", "admin", "subscriber", "visitor"].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-4 py-2 rounded-lg text-sm transition capitalize ${roleFilter === r ? "bg-cyan-500 text-white" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
          <table className="w-full">
            <thead><tr className="text-xs text-gray-400 border-b border-white/5">
              <th className="px-6 py-3 text-left">Member</th>
              <th className="px-6 py-3 text-left">Role</th>
              <th className="px-6 py-3 text-center">Subscription</th>
              <th className="px-6 py-3 text-right">Scores</th>
              <th className="px-6 py-3 text-right">Joined</th>
            </tr></thead>
            <tbody>
              {filtered.map((u) => {
                const sub = subs.find((s) => s.userId === u.id && s.status === "active");
                const userScores = scores.filter((s: any) => s.userId === u.id);
                return (
                  <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition">
                    <td className="px-6 py-4">
                      <p className="text-white font-semibold text-sm">{u.name}</p>
                      <p className="text-gray-500 text-xs">{u.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 text-xs rounded-full border font-semibold ${roleBadge(u.role)}`}>{u.role}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {sub ? (
                        <span className="text-green-400 text-xs font-semibold">✓ {sub.plan}</span>
                      ) : (
                        <span className="text-gray-500 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-cyan-400 font-semibold">{userScores.length}/5</td>
                    <td className="px-6 py-4 text-right text-gray-500 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">No members found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="text-gray-500 text-xs mt-4 text-center">Showing {filtered.length} of {allUsers.length} members</p>
      </div>
    </div>
  );
}
