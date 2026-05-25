import axios from "axios";

const LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql";

export async function getLeetCodeStats(username) {
  const query = `
    query userProfile($username: String!) {
      matchedUser(username: $username) {
        username
        profile {
          realName
          ranking
          reputation
        }
        submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
          }
        }
      }
    }
  `;

  const { data } = await axios.post(
    LEETCODE_GRAPHQL_URL,
    { query, variables: { username } },
    {
      headers: {
        "Content-Type": "application/json",
        Referer: "https://leetcode.com",
      },
      timeout: 10000,
    },
  );

  const matchedUser = data?.data?.matchedUser;

  if (!matchedUser) {
    return {
      username,
      found: false,
      solved: 0,
      ranking: null,
      reputation: 0,
      breakdown: { easy: 0, medium: 0, hard: 0 },
    };
  }

  const solvedByDifficulty = Object.fromEntries(
    matchedUser.submitStatsGlobal.acSubmissionNum.map((item) => [
      item.difficulty.toLowerCase(),
      item.count,
    ]),
  );

  return {
    username: matchedUser.username,
    realName: matchedUser.profile?.realName || "",
    found: true,
    solved: solvedByDifficulty.all || 0,
    ranking: matchedUser.profile?.ranking || null,
    reputation: matchedUser.profile?.reputation || 0,
    breakdown: {
      easy: solvedByDifficulty.easy || 0,
      medium: solvedByDifficulty.medium || 0,
      hard: solvedByDifficulty.hard || 0,
    },
  };
}
