import { Router } from "express";
import { getCodeforcesStats } from "../services/codeforces.js";
import { getLeetCodeStats } from "../services/leetcode.js";
import { buildProfile, rankProfiles } from "../services/ranking.js";

const router = Router();

router.get("/profile", async (req, res, next) => {
  try {
    const profile = await fetchProfile({
      name: req.query.name,
      leetcodeUsername: req.query.leetcodeUsername,
      codeforcesHandle: req.query.codeforcesHandle,
    });

    res.json(profile);
  } catch (error) {
    next(error);
  }
});

router.post("/leaderboard", async (req, res, next) => {
  try {
    const users = Array.isArray(req.body.users) ? req.body.users : [];
    const profiles = await Promise.all(users.map(fetchProfile));

    res.json({
      generatedAt: new Date().toISOString(),
      leaderboard: rankProfiles(profiles),
    });
  } catch (error) {
    next(error);
  }
});

router.get("/leaderboard", async (_req, res, next) => {
  try {
    const users = parseDefaultUsers();
    const profiles = await Promise.all(users.map(fetchProfile));

    res.json({
      generatedAt: new Date().toISOString(),
      leaderboard: rankProfiles(profiles),
    });
  } catch (error) {
    next(error);
  }
});

async function fetchProfile(user) {
  if (!user?.leetcodeUsername && !user?.codeforcesHandle) {
    const error = new Error("Provide at least one LeetCode username or Codeforces handle.");
    error.status = 400;
    throw error;
  }

  const [leetcode, codeforces] = await Promise.all([
    user.leetcodeUsername ? getLeetCodeStats(user.leetcodeUsername) : null,
    user.codeforcesHandle ? getCodeforcesStats(user.codeforcesHandle) : null,
  ]);

  return buildProfile({
    name: user.name,
    leetcodeUsername: user.leetcodeUsername,
    codeforcesHandle: user.codeforcesHandle,
    leetcode,
    codeforces,
  });
}

function parseDefaultUsers() {
  if (!process.env.DEFAULT_USERS) return [];

  try {
    const users = JSON.parse(process.env.DEFAULT_USERS);
    return Array.isArray(users) ? users : [];
  } catch {
    return [];
  }
}

export default router;
