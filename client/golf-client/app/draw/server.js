const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
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

  if (scores[userId].length >= 5) {
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

app.listen(5000, () =>
  console.log("Server running on http://localhost:5000")
);