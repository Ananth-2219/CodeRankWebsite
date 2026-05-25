import { badgeScore, rankBonus, roundScore } from "../utils/scoreUtils.js";

export function calculateCodeChefScore(profile) {
  const ratingScore = roundScore((profile.rating || 0) * 0.1);
  const problemScore = roundScore((profile.problemsSolved || 0) * 2);
  const contestScore = roundScore((profile.contestsAttended || 0) * 5);
  const badgeScoreTotal = (profile.badges || []).reduce((total, badge) => total + badgeScore(badge), 0);

  return buildScore({
    ratingScore,
    problemScore,
    contestScore,
    badgeScore: badgeScoreTotal,
  });
}

export function calculateCodeforcesScore(profile) {
  return buildScore({
    ratingScore: roundScore((profile.rating || 0) * 0.15),
    maxRatingBonus: roundScore((profile.maxRating || 0) * 0.05),
    rankBonus: rankBonus(profile.rank),
  });
}

export function calculateLeetCodeScore(profile) {
  return buildScore({
    easyScore: roundScore((profile.easySolved || 0) * 1),
    mediumScore: roundScore((profile.mediumSolved || 0) * 3),
    hardScore: roundScore((profile.hardSolved || 0) * 7),
    contestRatingBonus: roundScore((profile.contestRating || 0) * 0.05),
  });
}

export function calculateCombinedScore(platformScores) {
  const codechef = platformScores.codechef?.totalScore || 0;
  const codeforces = platformScores.codeforces?.totalScore || 0;
  const leetcode = platformScores.leetcode?.totalScore || 0;

  return roundScore(codechef + codeforces + leetcode);
}

function buildScore(breakdown) {
  return {
    totalScore: roundScore(Object.values(breakdown).reduce((total, value) => total + (Number(value) || 0), 0)),
    breakdown,
  };
}
