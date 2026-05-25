import { Router } from "express";
import { scrapeCodeChefProfile } from "../scrapers/codechefScraper.js";
import { calculateCodeChefScore } from "../services/rankingService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { assertUsername } from "../utils/validators.js";

const router = Router();

router.get(
  "/:username",
  asyncHandler(async (req, res) => {
    const username = assertUsername(req.params.username);
    const profile = await scrapeCodeChefProfile(username);
    const score = calculateCodeChefScore(profile);

    res.json({
      username: profile.username,
      platform: "CodeChef",
      rating: profile.rating,
      highestRating: profile.highestRating,
      stars: profile.stars,
      globalRank: profile.globalRank,
      countryRank: profile.countryRank,
      problemsSolved: profile.problemsSolved,
      contestsAttended: profile.contestsAttended,
      badges: profile.badges,
      badgeProgress: profile.badgeProgress,
      totalScore: score.totalScore,
      scoreBreakdown: score.breakdown,
    });
  }),
);

export default router;
