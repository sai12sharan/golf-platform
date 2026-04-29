const express = require("express");
const cors = require("cors");
require("dotenv").config();

const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";
const NODE_ENV = process.env.NODE_ENV || "development";

const app = express();
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

// LOGIN API
app.post("/api/login", (req, res) => {
  const { email } = req.body;
  res.json({ message: "Login successful", email });
});

// SCORE API
let scores = {};

app.post("/api/scores", (req, res) => {
  const { userId, score } = req.body;

  if (!scores[userId]) scores[userId] = [];

  if (scores[userId].length >= 5) {s
    scores[userId].shift();
  }

  scores[userId].push(score);

  res.json(scores[userId]);
});

// DRAW API
app.get("/api/draw", (req, res) => {
  const numbers = Array.from({ length: 5 }, () =>
    Math.floor(Math.random() * 45) + 1
  );

  res.json({ numbers });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} (Environment: ${NODE_ENV})`);
});