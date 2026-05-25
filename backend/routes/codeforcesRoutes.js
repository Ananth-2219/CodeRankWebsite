import { Router } from "express";
import { fetchCodeforcesProfile } from "../scrapers/codeforcesScraper.js";
import { calculateCodeforcesScore } from "../services/rankingService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { assertUsername } from "../utils/validators.js";

const router = Router();

router.get(
  "/:username",
  asyncHandler(async (req, res) => {
    const username = assertUsername(req.params.username);
    const profile = await fetchCodeforcesProfile(username);
    const score = calculateCodeforcesScore(profile);

    res.json({
      username: profile.handle,
      platform: "Codeforces",
      rating: profile.rating,
      maxRating: profile.maxRating,
      rank: profile.rank,
      maxRank: profile.maxRank,
      problemsSolved: profile.problemsSolved,
      contestsAttended: profile.contestsAttended,
      badges: [],
      totalScore: score.totalScore,
      scoreBreakdown: score.breakdown,
    });
  }),
);

export default router;
