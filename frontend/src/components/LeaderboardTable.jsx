import React from "react";
import { Trash2 } from "lucide-react";
import { deleteUser } from "../services/api.js";
import { formatNumber, joinBadges } from "../utils/formatters.js";
import ScoreBreakdown from "./ScoreBreakdown.jsx";

function LeaderboardTable({ rows, onRefresh }) {
  async function removeRow(id) {
    await deleteUser(id);
    onRefresh();
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1180px] text-left text-sm">
        <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          <tr>
            <th className="px-4 py-3">Rank</th>
            <th className="px-4 py-3">Total Score</th>
            <th className="px-4 py-3">CodeChef</th>
            <th className="px-4 py-3">CodeChef Rating</th>
            <th className="px-4 py-3">Codeforces</th>
            <th className="px-4 py-3">Codeforces Rating</th>
            <th className="px-4 py-3">LeetCode</th>
            <th className="px-4 py-3">LC Solved</th>
            <th className="px-4 py-3">Solved</th>
            <th className="px-4 py-3">Contests</th>
            <th className="px-4 py-3">Badges</th>
            <th className="px-4 py-3">Score Breakdown</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
          {rows.map((row) => (
            <tr key={row.id} className="align-top hover:bg-slate-50 dark:hover:bg-slate-800/70">
              <td className="px-4 py-4 text-lg font-bold">#{row.rank}</td>
              <td className="px-4 py-4 font-bold text-emerald-600">{formatNumber(row.totalScore)}</td>
              <td className="px-4 py-4">{row.platforms.codechef?.username || row.submittedUsernames.codechef || "-"}</td>
              <td className="px-4 py-4">{formatNumber(row.platforms.codechef?.rating)}</td>
              <td className="px-4 py-4">{row.platforms.codeforces?.handle || row.submittedUsernames.codeforces || "-"}</td>
              <td className="px-4 py-4">{formatNumber(row.platforms.codeforces?.rating)}</td>
              <td className="px-4 py-4">{row.platforms.leetcode?.username || row.submittedUsernames.leetcode || "-"}</td>
              <td className="px-4 py-4">{formatNumber(row.platforms.leetcode?.totalSolved)}</td>
              <td className="px-4 py-4">{formatNumber(row.problemsSolved)}</td>
              <td className="px-4 py-4">{formatNumber(row.contestsAttended)}</td>
              <td className="max-w-64 px-4 py-4 text-xs text-slate-600 dark:text-slate-300">{joinBadges(row.badges)}</td>
              <td className="px-4 py-4">
                <ScoreBreakdown scores={row.platformScores} />
                {row.errors?.length > 0 && (
                  <div className="mt-2 text-xs text-red-500">
                    {row.errors.map((error) => `${error.platform}: ${error.message}`).join(" | ")}
                  </div>
                )}
              </td>
              <td className="px-4 py-4">
                <button
                  type="button"
                  onClick={() => removeRow(row.id)}
                  className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-red-950/30"
                  title="Remove user"
                  aria-label="Remove user"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default LeaderboardTable;
