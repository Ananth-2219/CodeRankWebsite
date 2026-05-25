import axios from "axios";
import { createHttpError } from "../utils/httpError.js";

const CODEFORCES_API_URL = "https://codeforces.com/api";

export async function fetchCodeforcesProfile(username) {
  let user;

  try {
    const { data } = await axios.get(`${CODEFORCES_API_URL}/user.info`, {
      params: { handles: username },
      timeout: Number(process.env.REQUEST_TIMEOUT_MS) || 12000,
    });

    if (data.status !== "OK" || !data.result?.length) {
      throw createHttpError(404, `Codeforces profile '${username}' was not found.`);
    }

    user = data.result[0];
  } catch (error) {
    if (error.response?.status === 400) {
      throw createHttpError(404, `Codeforces profile '${username}' was not found.`);
    }

    if (error.response?.status === 429) {
      throw createHttpError(429, "Codeforces rate limit reached. Try again later.");
    }

    if (error.statusCode) throw error;
    throw createHttpError(500, "Failed to fetch Codeforces profile.", error.message);
  }

  const [problemsSolved, contestsAttended] = await Promise.all([
    fetchCodeforcesSolvedCount(user.handle),
    fetchCodeforcesContestCount(user.handle),
  ]);

  return {
    handle: user.handle,
    platform: "Codeforces",
    rating: user.rating || 0,
    maxRating: user.maxRating || 0,
    rank: user.rank || "unrated",
    maxRank: user.maxRank || "unrated",
    problemsSolved,
    contestsAttended,
  };
}

async function fetchCodeforcesSolvedCount(handle) {
  try {
    const { data } = await axios.get(`${CODEFORCES_API_URL}/user.status`, {
      params: { handle, from: 1, count: 10000 },
      timeout: Number(process.env.REQUEST_TIMEOUT_MS) || 12000,
    });

    if (data.status !== "OK") return 0;

    const solved = new Set();
    for (const submission of data.result || []) {
      if (submission.verdict !== "OK" || !submission.problem) continue;
      solved.add(`${submission.problem.contestId || "gym"}-${submission.problem.index}`);
    }

    return solved.size;
  } catch {
    return 0;
  }
}

async function fetchCodeforcesContestCount(handle) {
  try {
    const { data } = await axios.get(`${CODEFORCES_API_URL}/user.rating`, {
      params: { handle },
      timeout: Number(process.env.REQUEST_TIMEOUT_MS) || 12000,
    });

    return data.status === "OK" ? data.result.length : 0;
  } catch {
    return 0;
  }
}
