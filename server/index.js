const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// In-memory database (replace with MongoDB in production)
const users = [];
const scores = [];
const charities = [];
const subscriptions = [];
const drawResults = [];

// ============= AUTH ENDPOINTS =============

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'All fields required' });
    }

    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = Date.now().toString();

    const user = {
      id: userId,
      email,
      password: hashedPassword,
      name,
      createdAt: new Date()
    };

    users.push(user);

    const token = jwt.sign({ userId, email }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({ token, user: { id: userId, email, name } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    const token = jwt.sign({ userId: user.id, email }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ============= SUBSCRIPTION ENDPOINTS =============

// Get subscription plans
app.get('/api/subscriptions/plans', (req, res) => {
  const plans = [
    { id: 'monthly', name: 'Monthly', price: 9.99, period: 'month' },
    { id: 'yearly', name: 'Yearly', price: 99.99, period: 'year' }
  ];
  res.json(plans);
});

// Create subscription
app.post('/api/subscriptions/create', verifyToken, (req, res) => {
  try {
    const { planId } = req.body;
    const subscription = {
      id: Date.now().toString(),
      userId: req.userId,
      planId,
      status: 'active',
      createdAt: new Date(),
      renewsAt: new Date(Date.now() + (planId === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000)
    };
    subscriptions.push(subscription);
    res.json({ success: true, subscription });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user subscription
app.get('/api/subscriptions/my-subscription', verifyToken, (req, res) => {
  const subscription = subscriptions.find(s => s.userId === req.userId);
  res.json(subscription || null);
});

// ============= CHARITY ENDPOINTS =============

// Get all charities
app.get('/api/charities', (req, res) => {
  const allCharities = [
    { id: '1', name: 'World Golf Foundation', description: 'Growing the game of golf worldwide' },
    { id: '2', name: 'The R&A', description: 'Supporting golf development globally' },
    { id: '3', name: 'PGA Tour Charities', description: 'Supporting charitable causes' },
    { id: '4', name: 'Golf Channel Foundation', description: 'Giving back to the community' },
    { id: '5', name: 'First Tee', description: 'Youth golf development' }
  ];
  res.json(allCharities);
});

// Set user charity preference
app.post('/api/charities/set-preference', verifyToken, (req, res) => {
  try {
    const { charityId } = req.body;
    const user = users.find(u => u.id === req.userId);
    if (user) {
      user.preferredCharityId = charityId;
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= SCORE ENDPOINTS =============

// Submit score (Stableford format)
app.post('/api/scores/submit', verifyToken, (req, res) => {
  try {
    const { courseId, courseRating, slope, holes } = req.body;

    // Calculate Stableford points
    let totalPoints = 0;
    const scoreDetails = holes.map(hole => {
      const pointLookup = {
        eagle: 4,
        birdie: 3,
        par: 2,
        bogey: 1,
        double: 0
      };
      const points = pointLookup[hole.score] || 0;
      totalPoints += points;
      return { hole: hole.number, score: hole.score, points };
    });

    const score = {
      id: Date.now().toString(),
      userId: req.userId,
      courseId,
      courseRating,
      slope,
      totalPoints,
      scoreDetails,
      date: new Date()
    };

    scores.push(score);
    res.json({ success: true, score });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user scores
app.get('/api/scores/my-scores', verifyToken, (req, res) => {
  const userScores = scores.filter(s => s.userId === req.userId);
  res.json(userScores);
});

// ============= LEADERBOARD ENDPOINTS =============

// Get leaderboard
app.get('/api/leaderboard', (req, res) => {
  const leaderboard = scores.reduce((acc, score) => {
    const existing = acc.find(l => l.userId === score.userId);
    if (existing) {
      existing.totalPoints += score.totalPoints;
      existing.rounds += 1;
      existing.average = (existing.totalPoints / existing.rounds).toFixed(2);
    } else {
      const user = users.find(u => u.id === score.userId);
      acc.push({
        userId: score.userId,
        userName: user?.name || 'Unknown',
        totalPoints: score.totalPoints,
        rounds: 1,
        average: score.totalPoints
      });
    }
    return acc;
  }, []);

  leaderboard.sort((a, b) => b.totalPoints - a.totalPoints);
  res.json(leaderboard.map((l, idx) => ({ ...l, rank: idx + 1 })));
});

// ============= DRAW ENDPOINTS =============

// Create monthly draw
app.post('/api/draws/create-monthly', (req, res) => {
  try {
    const eligibleUsers = subscriptions
      .filter(s => s.status === 'active')
      .map(s => s.userId);

    if (eligibleUsers.length === 0) {
      return res.status(400).json({ error: 'No eligible users' });
    }

    const winner = eligibleUsers[Math.floor(Math.random() * eligibleUsers.length)];
    const secondPlace = eligibleUsers[Math.floor(Math.random() * eligibleUsers.length)];
    const thirdPlace = eligibleUsers[Math.floor(Math.random() * eligibleUsers.length)];

    const draw = {
      id: Date.now().toString(),
      month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
      winners: [
        { position: 1, userId: winner, prize: '$500' },
        { position: 2, userId: secondPlace, prize: '$250' },
        { position: 3, userId: thirdPlace, prize: '$100' }
      ],
      prizePool: '$5000',
      createdAt: new Date()
    };

    drawResults.push(draw);
    res.json({ success: true, draw });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get latest draws
app.get('/api/draws/latest', (req, res) => {
  const latest = drawResults
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3)
    .map(draw => ({
      ...draw,
      winners: draw.winners.map(w => {
        const user = users.find(u => u.id === w.userId);
        return { ...w, userName: user?.name || 'Anonymous' };
      })
    }));

  res.json(latest);
});

// ============= USER ENDPOINTS =============

// Get user profile
app.get('/api/users/profile', verifyToken, (req, res) => {
  const user = users.find(u => u.id === req.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const subscription = subscriptions.find(s => s.userId === req.userId);
  const userScores = scores.filter(s => s.userId === req.userId);

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    subscription: subscription || null,
    totalScores: userScores.length,
    totalPoints: userScores.reduce((sum, s) => sum + s.totalPoints, 0)
  });
});

// ============= ADMIN ENDPOINTS =============

app.get('/api/admin/stats', (req, res) => {
  res.json({
    totalUsers: users.length,
    activeSubscriptions: subscriptions.filter(s => s.status === 'active').length,
    totalScores: scores.length,
    recentDraws: drawResults.length
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🏌️ Golf Platform API running on port ${PORT}`);
});
