// ─── DataStore.ts ─────────────────────────────────────────────────────────
// Central localStorage-based data store for the GolfChain platform.

export interface Score {
  id: string;
  userId: string;
  userName: string;
  score: number;
  course: string;
  date: string;
}

export interface DrawEntry {
  id: string;
  month: string;
  drawNumbers: number[];
  participants: number;
  runAt: string;
  status: "pending" | "completed";
}

export interface Winner {
  id: string;
  drawId: string;
  month: string;
  userId: string;
  userName: string;
  matchCount: number;
  prize: string;
  prizePercent: number;
  position: number;
  verified: boolean;
  paidOut: boolean;
  charityContribution: string;
}

export interface Charity {
  id: string;
  name: string;
  description: string;
  category: string;
  totalReceived: number;
  logoEmoji: string;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: "monthly" | "yearly";
  status: "active" | "cancelled";
  amount: number;
  startDate: string;
  renewDate: string;
  charityPercent: number;
}

// ─── Generic helpers ───────────────────────────────────────────────────────
function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ─── Scores ───────────────────────────────────────────────────────────────
export const ScoreStore = {
  getAll: (): Score[] => load<Score[]>("gc_scores", []),
  getByUser: (userId: string): Score[] =>
    ScoreStore.getAll().filter((s) => s.userId === userId),
  add: (score: Omit<Score, "id">) => {
    const all = ScoreStore.getAll();
    // keep only latest 5 per user
    const userScores = all.filter((s) => s.userId === score.userId);
    let updated = all;
    if (userScores.length >= 5) {
      const oldest = [...userScores].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      )[0];
      updated = all.filter((s) => s.id !== oldest.id);
    }
    const newScore: Score = { ...score, id: `score-${Date.now()}` };
    save("gc_scores", [...updated, newScore]);
    return newScore;
  },
  delete: (id: string) => {
    save("gc_scores", ScoreStore.getAll().filter((s) => s.id !== id));
  },
  leaderboard: (): { userId: string; userName: string; totalPoints: number; rounds: number; avg: number }[] => {
    const all = ScoreStore.getAll();
    const map: Record<string, { userId: string; userName: string; total: number; rounds: number }> = {};
    all.forEach((s) => {
      if (!map[s.userId]) map[s.userId] = { userId: s.userId, userName: s.userName, total: 0, rounds: 0 };
      map[s.userId].total += s.score;
      map[s.userId].rounds += 1;
    });
    return Object.values(map)
      .map((m) => ({ userId: m.userId, userName: m.userName, totalPoints: m.total, rounds: m.rounds, avg: +(m.total / m.rounds).toFixed(1) }))
      .sort((a, b) => b.totalPoints - a.totalPoints);
  },
};

// ─── Draw Numbers Generator ────────────────────────────────────────────────
export function generateDrawNumbers(): number[] {
  const nums = new Set<number>();
  while (nums.size < 5) nums.add(Math.floor(Math.random() * 45) + 1);
  return Array.from(nums).sort((a, b) => a - b);
}

export function calculateMatches(userScores: number[], drawNumbers: number[]): number {
  return userScores.filter((s) => drawNumbers.includes(s)).length;
}

// ─── Draws ────────────────────────────────────────────────────────────────
export const DrawStore = {
  getAll: (): DrawEntry[] => load<DrawEntry[]>("gc_draws", []),
  getLatest: (): DrawEntry | null => {
    const all = DrawStore.getAll();
    return all.length ? [...all].sort((a, b) => new Date(b.runAt).getTime() - new Date(a.runAt).getTime())[0] : null;
  },
  add: (entry: Omit<DrawEntry, "id">): DrawEntry => {
    const newEntry: DrawEntry = { ...entry, id: `draw-${Date.now()}` };
    save("gc_draws", [...DrawStore.getAll(), newEntry]);
    return newEntry;
  },
};

// ─── Winners ──────────────────────────────────────────────────────────────
export const WinnerStore = {
  getAll: (): Winner[] => load<Winner[]>("gc_winners", []),
  getByDraw: (drawId: string): Winner[] =>
    WinnerStore.getAll().filter((w) => w.drawId === drawId),
  add: (winner: Omit<Winner, "id">): Winner => {
    const newWinner: Winner = { ...winner, id: `win-${Date.now()}` };
    save("gc_winners", [...WinnerStore.getAll(), newWinner]);
    return newWinner;
  },
  verify: (id: string) => {
    const all = WinnerStore.getAll();
    const idx = all.findIndex((w) => w.id === id);
    if (idx !== -1) { all[idx].verified = true; save("gc_winners", all); }
  },
  markPaid: (id: string) => {
    const all = WinnerStore.getAll();
    const idx = all.findIndex((w) => w.id === id);
    if (idx !== -1) { all[idx].paidOut = true; save("gc_winners", all); }
  },
};

// ─── Charities ────────────────────────────────────────────────────────────
const DEFAULT_CHARITIES: Charity[] = [
  { id: "1", name: "World Golf Foundation", description: "Growing the game of golf worldwide through youth programs and community outreach", category: "Sports Development", totalReceived: 12400, logoEmoji: "🌍" },
  { id: "2", name: "The R&A Charity", description: "Supporting golf development globally and preserving the spirit of the game", category: "Heritage", totalReceived: 8750, logoEmoji: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
  { id: "3", name: "PGA Tour Charities", description: "Supporting local and national charitable causes through golf tournaments", category: "Community", totalReceived: 19300, logoEmoji: "🏆" },
  { id: "4", name: "First Tee", description: "Youth golf development program teaching life skills through golf", category: "Youth", totalReceived: 15600, logoEmoji: "⛳" },
  { id: "5", name: "Golf Channel Foundation", description: "Giving back to communities through golf-focused charitable initiatives", category: "Media & Community", totalReceived: 6200, logoEmoji: "📺" },
  { id: "6", name: "Birdies for the Brave", description: "Supporting military families and veterans through golf", category: "Veterans", totalReceived: 9800, logoEmoji: "🎖️" },
];

export const CharityStore = {
  getAll: (): Charity[] => {
    const stored = load<Charity[]>("gc_charities", []);
    return stored.length ? stored : DEFAULT_CHARITIES;
  },
  init: () => {
    if (!localStorage.getItem("gc_charities")) {
      save("gc_charities", DEFAULT_CHARITIES);
    }
  },
  update: (id: string, updates: Partial<Charity>) => {
    const all = CharityStore.getAll();
    const idx = all.findIndex((c) => c.id === id);
    if (idx !== -1) { all[idx] = { ...all[idx], ...updates }; save("gc_charities", all); }
  },
  addContribution: (charityId: string, amount: number) => {
    const all = CharityStore.getAll();
    const idx = all.findIndex((c) => c.id === charityId);
    if (idx !== -1) { all[idx].totalReceived += amount; save("gc_charities", all); }
  },
};

// ─── Subscriptions ────────────────────────────────────────────────────────
export const SubscriptionStore = {
  getAll: (): Subscription[] => load<Subscription[]>("gc_subscriptions", []),
  getByUser: (userId: string): Subscription | null =>
    SubscriptionStore.getAll().find((s) => s.userId === userId && s.status === "active") ?? null,
  create: (sub: Omit<Subscription, "id">): Subscription => {
    const all = SubscriptionStore.getAll();
    // cancel existing
    const updated = all.map((s) => s.userId === sub.userId ? { ...s, status: "cancelled" as const } : s);
    const newSub: Subscription = { ...sub, id: `sub-${Date.now()}` };
    save("gc_subscriptions", [...updated, newSub]);
    return newSub;
  },
  cancel: (userId: string) => {
    const all = SubscriptionStore.getAll();
    const updated = all.map((s) => s.userId === userId && s.status === "active" ? { ...s, status: "cancelled" as const } : s);
    save("gc_subscriptions", updated);
  },
};

// ─── Seed Sample Data ──────────────────────────────────────────────────────
export function seedSampleData() {
  CharityStore.init();

  if (ScoreStore.getAll().length === 0) {
    const sampleUsers = [
      { userId: "sub-001", userName: "John Subscriber" },
      { userId: "user-sample-1", userName: "Alice Green" },
      { userId: "user-sample-2", userName: "Bob Smith" },
      { userId: "user-sample-3", userName: "Carol White" },
      { userId: "user-sample-4", userName: "David Brown" },
    ];
    const courses = ["St Andrews", "Augusta National", "Pebble Beach", "Royal Birkdale"];
    sampleUsers.forEach((u) => {
      for (let i = 0; i < 5; i++) {
        ScoreStore.add({
          userId: u.userId,
          userName: u.userName,
          score: Math.floor(Math.random() * 30) + 20,
          course: courses[Math.floor(Math.random() * courses.length)],
          date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        });
      }
    });
  }

  if (DrawStore.getAll().length === 0) {
    const draw = DrawStore.add({
      month: new Date().toLocaleString("default", { month: "long", year: "numeric" }),
      drawNumbers: generateDrawNumbers(),
      participants: 47,
      runAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: "completed",
    });

    // Add sample winners
    [
      { pos: 1, userId: "user-sample-1", userName: "Alice Green", matches: 5, prize: "$2,000", pct: 40 },
      { pos: 2, userId: "user-sample-2", userName: "Bob Smith", matches: 4, prize: "$1,750", pct: 35 },
      { pos: 3, userId: "user-sample-3", userName: "Carol White", matches: 3, prize: "$1,250", pct: 25 },
    ].forEach((w) => {
      WinnerStore.add({
        drawId: draw.id,
        month: draw.month,
        userId: w.userId,
        userName: w.userName,
        matchCount: w.matches,
        prize: w.prize,
        prizePercent: w.pct,
        position: w.pos,
        verified: true,
        paidOut: w.pos < 3,
        charityContribution: "$" + (w.pct * 0.2).toFixed(2),
      });
    });
  }

  if (SubscriptionStore.getAll().length === 0) {
    SubscriptionStore.create({
      userId: "sub-001",
      plan: "monthly",
      status: "active",
      amount: 9.99,
      startDate: new Date().toISOString(),
      renewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      charityPercent: 10,
    });
  }
}
