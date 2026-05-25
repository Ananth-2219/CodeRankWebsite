import "dotenv/config";
import cors from "cors";
import express from "express";
import morgan from "morgan";
import { connectDB } from "./config/db.js";
import codechefRoutes from "./routes/codechefRoutes.js";
import codeforcesRoutes from "./routes/codeforcesRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";
import leetcodeRoutes from "./routes/leetcodeRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = (process.env.CLIENT_ORIGINS || "http://localhost:5173,https://code-rank-website.vercel.app")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOriginPatterns = [
  /^https:\/\/code-rank-website(?:-[a-z0-9-]+)?\.vercel\.app$/i,
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || isAllowedOrigin(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan("tiny"));

app.use((req, _res, next) => {
  console.log(req.method, req.originalUrl);
  next();
});

app.get("/", (_req, res) => {
  res.send("CodeRank Backend Running");
});

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

app.use((req, res) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: "Route not found",
    path: req.originalUrl,
  });
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
    app.listen(PORT, () => {
      console.log(`CodingRank backend running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Backend startup failed:", error.message);
    process.exit(1);
  });

function isAllowedOrigin(origin) {
  return allowedOrigins.includes(origin) || allowedOriginPatterns.some((pattern) => pattern.test(origin));
}
