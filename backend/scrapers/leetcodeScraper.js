import axios from "axios";
import { createHttpError } from "../utils/httpError.js";

const LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql";

export async function fetchLeetCodeProfile(username) {
  const query = `
    query codingRankLeetCodeProfile($username: String!) {
      matchedUser(username: $username) {
        username
        submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
          }
        }
      }
      userContestRanking(username: $username) {
        rating
      }
    }
  `;

  try {
    const { data } = await axios.post(
      LEETCODE_GRAPHQL_URL,
      { query, variables: { username } },
      {
        timeout: Number(process.env.REQUEST_TIMEOUT_MS) || 12000,
        headers: {
          "Content-Type": "application/json",
          Referer: "https://leetcode.com",
          "User-Agent": "Mozilla/5.0 CodingRankBot/1.0",
        },
      },
    );

    const matchedUser = data?.data?.matchedUser;
    if (!matchedUser) {
      throw createHttpError(404, `LeetCode profile '${username}' was not found.`);
    }

    const solved = Object.fromEntries(
      matchedUser.submitStatsGlobal.acSubmissionNum.map((item) => [item.difficulty.toLowerCase(), item.count]),
    );

    return {
      username: matchedUser.username,
      platform: "LeetCode",
      totalSolved: solved.all || 0,
      easySolved: solved.easy || 0,
      mediumSolved: solved.medium || 0,
      hardSolved: solved.hard || 0,
      contestRating: Math.round(data?.data?.userContestRanking?.rating || 0),
    };
  } catch (error) {
    if (error.response?.status === 429) {
      throw createHttpError(429, "LeetCode rate limit reached. Try again later.");
    }

    if (error.statusCode) throw error;
    throw createHttpError(500, "Failed to fetch LeetCode profile.", error.message);
  }
}
