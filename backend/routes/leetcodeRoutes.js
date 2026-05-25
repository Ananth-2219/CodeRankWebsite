import { Router } from "express";
import { fetchLeetCodeProfile } from "../scrapers/leetcodeScraper.js";
import { calculateLeetCodeScore } from "../services/rankingService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { assertUsername } from "../utils/validators.js";

const router = Router();

router.get(
  "/:username",
  asyncHandler(async (req, res) => {
    const username = assertUsername(req.params.username);
    const profile = await fetchLeetCodeProfile(username);
    const score = calculateLeetCodeScore(profile);

    res.json({
      username: profile.username,
      platform: "LeetCode",
      totalSolved: profile.totalSolved,
      easySolved: profile.easySolved,
      mediumSolved: profile.mediumSolved,
      hardSolved: profile.hardSolved,
      contestRating: profile.contestRating,
      totalScore: score.totalScore,
      scoreBreakdown: score.breakdown,
    });
  }),
);

export default router;
