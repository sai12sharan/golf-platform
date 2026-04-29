"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────
export type UserRole = "admin" | "subscriber" | "visitor";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  subscriptionPlan?: "monthly" | "yearly" | null;
  subscriptionStatus?: "active" | "cancelled" | null;
  subscriptionStart?: string;
  preferredCharityId?: string;
  createdAt: string;
}

interface StoredUser extends AppUser {
  passwordHash: string;
}

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (updates: Partial<AppUser>) => void;
}

// ─── Helpers ───────────────────────────────────────────────────────────────
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "golfchain_salt_2026");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function getStoredUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem("gc_users");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredUsers(users: StoredUser[]) {
  localStorage.setItem("gc_users", JSON.stringify(users));
}

// ─── Seed default accounts ─────────────────────────────────────────────────
async function ensureDefaultAccounts() {
  const existing = getStoredUsers();
  if (existing.length > 0) return; // already seeded

  const adminHash = await hashPassword("admin123");
  const subHash = await hashPassword("user123");
  const visitorHash = await hashPassword("visitor123");

  const defaults: StoredUser[] = [
    {
      id: "admin-001",
      name: "Admin User",
      email: "admin@golfchain.com",
      passwordHash: adminHash,
      role: "admin",
      subscriptionPlan: "yearly",
      subscriptionStatus: "active",
      subscriptionStart: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    },
    {
      id: "sub-001",
      name: "John Subscriber",
      email: "subscriber@golfchain.com",
      passwordHash: subHash,
      role: "subscriber",
      subscriptionPlan: "monthly",
      subscriptionStatus: "active",
      subscriptionStart: new Date().toISOString(),
      preferredCharityId: "1",
      createdAt: new Date().toISOString(),
    },
    {
      id: "vis-001",
      name: "Jane Visitor",
      email: "visitor@golfchain.com",
      passwordHash: visitorHash,
      role: "visitor",
      createdAt: new Date().toISOString(),
    },
  ];

  saveStoredUsers(defaults);
}

// ─── Context ───────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ensureDefaultAccounts().then(() => {
      const savedUser = localStorage.getItem("gc_current_user");
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          localStorage.removeItem("gc_current_user");
        }
      }
      setLoading(false);
    });
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const users = getStoredUsers();
      const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (!found) return { success: false, error: "No account found with that email" };

      const hash = await hashPassword(password);
      if (hash !== found.passwordHash) return { success: false, error: "Incorrect password" };

      const { passwordHash: _, ...publicUser } = found;
      setUser(publicUser);
      localStorage.setItem("gc_current_user", JSON.stringify(publicUser));
      return { success: true };
    } catch {
      return { success: false, error: "Login failed. Please try again." };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const users = getStoredUsers();
      if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
        return { success: false, error: "An account with this email already exists" };
      }
      if (password.length < 6) {
        return { success: false, error: "Password must be at least 6 characters" };
      }

      const hash = await hashPassword(password);
      const newUser: StoredUser = {
        id: `user-${Date.now()}`,
        name,
        email,
        passwordHash: hash,
        role: "visitor",
        createdAt: new Date().toISOString(),
      };

      saveStoredUsers([...users, newUser]);

      const { passwordHash: _, ...publicUser } = newUser;
      setUser(publicUser);
      localStorage.setItem("gc_current_user", JSON.stringify(publicUser));
      return { success: true };
    } catch {
      return { success: false, error: "Registration failed. Please try again." };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("gc_current_user");
  };

  const updateUser = (updates: Partial<AppUser>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem("gc_current_user", JSON.stringify(updated));

    // also update in stored users
    const users = getStoredUsers();
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...updates };
      saveStoredUsers(users);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
