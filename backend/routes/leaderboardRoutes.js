import { Router } from "express";
import User from "../models/User.js";
import { scrapeCodeChefProfile } from "../scrapers/codechefScraper.js";
import { fetchCodeforcesProfile } from "../scrapers/codeforcesScraper.js";
import { fetchLeetCodeProfile } from "../scrapers/leetcodeScraper.js";
import {
  calculateCodeChefScore,
  calculateCodeforcesScore,
  calculateCombinedScore,
  calculateLeetCodeScore,
} from "../services/rankingService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const users = await User.find().sort({ createdAt: -1 });
    const settledProfiles = await Promise.allSettled(users.map(fetchRankedProfile));

    const leaderboard = settledProfiles
      .filter((result) => result.status === "fulfilled")
      .map((result) => result.value)
      .sort((a, b) => b.totalScore - a.totalScore)
      .map((profile, index) => ({
        rank: index + 1,
        ...profile,
      }));

    const failures = settledProfiles
      .filter((result) => result.status === "rejected")
      .map((result) => result.reason.message);

    res.json({
      generatedAt: new Date().toISOString(),
      count: leaderboard.length,
      leaderboard,
      failures,
    });
  }),
);

async function fetchRankedProfile(user) {
  const [codechefResult, codeforcesResult, leetcodeResult] = await Promise.allSettled([
    user.codechef ? scrapeCodeChefProfile(user.codechef) : null,
    user.codeforces ? fetchCodeforcesProfile(user.codeforces) : null,
    user.leetcode ? fetchLeetCodeProfile(user.leetcode) : null,
  ]);

  const codechef = unwrapPlatform(codechefResult);
  const codeforces = unwrapPlatform(codeforcesResult);
  const leetcode = unwrapPlatform(leetcodeResult);

  const platformScores = {
    codechef: codechef ? calculateCodeChefScore(codechef) : null,
    codeforces: codeforces ? calculateCodeforcesScore(codeforces) : null,
    leetcode: leetcode ? calculateLeetCodeScore(leetcode) : null,
  };

  const totalScore = calculateCombinedScore(platformScores);
  const scoreBreakdown = {
    codechef: platformScores.codechef?.breakdown || {},
    codeforces: platformScores.codeforces?.breakdown || {},
    leetcode: platformScores.leetcode?.breakdown || {},
  };

  await User.findByIdAndUpdate(user._id, {
    totalScore,
    scoreBreakdown,
  });

  return {
    id: user._id.toString(),
    submittedUsernames: {
      codechef: user.codechef || "",
      codeforces: user.codeforces || "",
      leetcode: user.leetcode || "",
    },
    platforms: {
      codechef,
      codeforces,
      leetcode,
    },
    platformScores,
    totalScore,
    scoreBreakdown,
    problemsSolved:
      (codechef?.problemsSolved || 0) + (codeforces?.problemsSolved || 0) + (leetcode?.totalSolved || 0),
    contestsAttended: (codechef?.contestsAttended || 0) + (codeforces?.contestsAttended || 0),
    badges: codechef?.badges || [],
    errors: [
      platformError("CodeChef", codechefResult),
      platformError("Codeforces", codeforcesResult),
      platformError("LeetCode", leetcodeResult),
    ].filter(Boolean),
  };
}

function unwrapPlatform(result) {
  return result.status === "fulfilled" ? result.value : null;
}

function platformError(platform, result) {
  if (result.status !== "rejected") return null;
  console.warn(`${platform} fetch failed: ${result.reason.message}`);
  return { platform, message: result.reason.message };
}

export default router;
