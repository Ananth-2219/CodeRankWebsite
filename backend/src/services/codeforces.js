import axios from "axios";

const CODEFORCES_API_URL = "https://codeforces.com/api";

export async function getCodeforcesStats(handle) {
  let userData;
  let statusData;

  try {
    [{ data: userData }, { data: statusData }] = await Promise.all([
      axios.get(`${CODEFORCES_API_URL}/user.info`, {
        params: { handles: handle },
        timeout: 10000,
      }),
      axios.get(`${CODEFORCES_API_URL}/user.status`, {
        params: { handle, from: 1, count: 10000 },
        timeout: 10000,
      }),
    ]);
  } catch {
    return emptyCodeforces(handle);
  }

  if (userData.status !== "OK") {
    return emptyCodeforces(handle);
  }

  const user = userData.result?.[0];
  const solvedSet = new Set();

  for (const submission of statusData.result || []) {
    if (submission.verdict !== "OK" || !submission.problem) continue;
    const contest = submission.problem.contestId || "gym";
    solvedSet.add(`${contest}-${submission.problem.index}`);
  }

  return {
    handle: user.handle,
    found: true,
    rating: user.rating || null,
    maxRating: user.maxRating || null,
    rank: user.rank || "unrated",
    contribution: user.contribution || 0,
    solved: solvedSet.size,
  };
}

function emptyCodeforces(handle) {
  return {
    handle,
    found: false,
    rating: null,
    maxRating: null,
    rank: "unrated",
    contribution: 0,
    solved: 0,
  };
}
