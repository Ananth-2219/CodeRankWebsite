export function buildProfile({ name, leetcodeUsername, codeforcesHandle, leetcode, codeforces }) {
  const score = calculateScore({ leetcode, codeforces });

  return {
    id: `${leetcodeUsername || "lc-none"}-${codeforcesHandle || "cf-none"}`,
    name: name || leetcode?.realName || leetcodeUsername || codeforcesHandle || "Anonymous coder",
    leetcodeUsername,
    codeforcesHandle,
    leetcode,
    codeforces,
    totals: {
      solved: (leetcode?.solved || 0) + (codeforces?.solved || 0),
      score,
    },
  };
}

export function rankProfiles(profiles) {
  return [...profiles]
    .sort((a, b) => {
      if (b.totals.score !== a.totals.score) return b.totals.score - a.totals.score;
      return b.totals.solved - a.totals.solved;
    })
    .map((profile, index) => ({ ...profile, rank: index + 1 }));
}

function calculateScore({ leetcode, codeforces }) {
  const leetcodeSolved = leetcode?.solved || 0;
  const leetcodeHard = leetcode?.breakdown?.hard || 0;
  const leetcodeMedium = leetcode?.breakdown?.medium || 0;
  const codeforcesSolved = codeforces?.solved || 0;
  const codeforcesRating = codeforces?.rating || 0;

  const leetcodeScore = leetcodeSolved * 8 + leetcodeMedium * 3 + leetcodeHard * 8;
  const codeforcesScore = codeforcesSolved * 10 + codeforcesRating * 1.5;
  const reputationBonus = Math.min(leetcode?.reputation || 0, 1000) * 0.5;

  return Math.round(leetcodeScore + codeforcesScore + reputationBonus);
}
