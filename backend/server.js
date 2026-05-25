import "dotenv/config";
import cors from "cors";
import express from "express";
import { connectDB } from "./config/db.js";
import codechefRoutes from "./routes/codechefRoutes.js";
import codeforcesRoutes from "./routes/codeforcesRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";
import leetcodeRoutes from "./routes/leetcodeRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "*",
  }),
);
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    service: "coding-rank-api",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/codechef", codechefRoutes);
app.use("/api/codeforces", codeforcesRoutes);
app.use("/api/leetcode", leetcodeRoutes);
app.use("/api/users", userRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

app.use((_req, _res, next) => {
  const error = new Error("Route not found");
  error.statusCode = 404;
  next(error);
});

app.use((error, _req, res, _next) => {
  if (error?.code === 11000) {
    return res.status(409).json({
      success: false,
      statusCode: 409,
      message: "This platform username combination already exists.",
    });
  }

  const statusCode = error.statusCode || 500;

  return res.status(statusCode).json({
    success: false,
    statusCode,
    message: error.message || "Internal server error",
    ...(process.env.NODE_ENV !== "production" && error.details ? { details: error.details } : {}),
  });
});

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`CodingRank backend running on port ${port}`);
    });
  })
  .catch(() => {
    process.exit(1);
  });
