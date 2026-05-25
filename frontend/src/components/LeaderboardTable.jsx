import React, { useState } from "react";
import { ExternalLink, Sparkles, Trash2 } from "lucide-react";
import { deleteUser, getLatestAddedUser } from "../services/api.js";
import { formatNumber, joinBadges } from "../utils/formatters.js";

const LEADERBOARD_LIMIT = 15;

function LeaderboardTable({ rows, onRefresh }) {
  const [actionError, setActionError] = useState("");
  const latestAddedUserId = getLatestAddedUser();
  const shouldLimitRows = rows.length > LEADERBOARD_LIMIT;
  const visibleRows = shouldLimitRows ? rows.slice(0, LEADERBOARD_LIMIT) : rows;
  const latestAddedRow = shouldLimitRows ? rows.find((row) => row.id === latestAddedUserId) : null;
  const showLatestAddedRank = latestAddedRow && latestAddedRow.rank > LEADERBOARD_LIMIT;

  async function removeRow(id) {
    setActionError("");

    const ownerName = window.prompt("Enter the same name used when adding this user:");
    if (!ownerName) return;

    const ownerSecret = window.prompt("Enter the deletion PIN:");
    if (!ownerSecret) return;

    try {
      await deleteUser(id, { ownerName, ownerSecret });
      onRefresh();
    } catch (err) {
      setActionError(err.response?.data?.message || "Unable to delete user.");
    }
  }

  return (
    <div className="overflow-x-auto">
      {actionError && (
        <div className="border-b border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-950 dark:bg-red-950/30 dark:text-red-300">
          {actionError}
        </div>
      )}
      <table className="w-full min-w-[860px] text-left text-sm">
        <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          <tr>
            <th className="px-4 py-3">Rank</th>
            <th className="px-4 py-3">Total Score</th>
            <th className="px-4 py-3">Profiles</th>
            <th className="px-4 py-3">Activity</th>
            <th className="px-4 py-3">Platform Scores</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
          {visibleRows.map((row) => (
            <LeaderboardRow key={row.id} row={row} onRemove={removeRow} highlighted={row.id === latestAddedUserId} />
          ))}
          {showLatestAddedRank && (
            <>
              <tr className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                <td colSpan={6} className="px-4 py-3 font-semibold">
                  Your rank
                </td>
              </tr>
              <LeaderboardRow row={latestAddedRow} onRemove={removeRow} highlighted />
            </>
          )}
        </tbody>
      </table>
    </div>
  );
}

function LeaderboardRow({ row, onRemove, highlighted = false }) {
  return (
    <tr
      className={`align-top transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/70 ${
        highlighted ? "bg-amber-50/80 ring-1 ring-inset ring-amber-300/70 dark:bg-amber-950/20 dark:ring-amber-500/40" : ""
      }`}
    >
      <td className="px-4 py-4">
        <div className="flex min-w-24 flex-col items-start gap-2">
          <span className="text-lg font-bold">#{row.rank}</span>
          {highlighted && (
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
              <Sparkles className="h-3.5 w-3.5" />
              Latest
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-4 font-bold text-emerald-600">{formatNumber(row.totalScore)}</td>
      <td className="px-4 py-4">
        <PlatformProfiles row={row} />
        {row.errors?.length > 0 && (
          <div className="mt-2 text-xs text-red-500">
            {row.errors.map((error) => `${error.platform}: ${error.message}`).join(" | ")}
          </div>
        )}
      </td>
      <td className="px-4 py-4">
        <div className="grid gap-2 text-xs text-slate-600 dark:text-slate-300">
          <Metric label="Solved" value={row.problemsSolved} />
          <Metric label="Contests" value={row.contestsAttended} />
          <div className="max-w-72">
            <span className="font-semibold text-slate-700 dark:text-slate-200">Badges: </span>
            {joinBadges(row.badges)}
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        <PlatformScores scores={row.platformScores} />
      </td>
      <td className="px-4 py-4">
        <button
          type="button"
          onClick={() => onRemove(row.id)}
          className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-red-950/30"
          title="Delete with owner name and PIN"
          aria-label="Delete with owner name and PIN"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
}

function PlatformProfiles({ row }) {
  const platforms = [
    {
      key: "codechef",
      label: "CodeChef",
      username: row.platforms.codechef?.username || row.submittedUsernames.codechef,
      url: profileUrl("codechef", row.platforms.codechef?.username || row.submittedUsernames.codechef),
      stats: [
        ["Rating", row.platforms.codechef?.rating],
        ["Problems", row.platforms.codechef?.problemsSolved],
      ],
    },
    {
      key: "codeforces",
      label: "Codeforces",
      username: row.platforms.codeforces?.handle || row.submittedUsernames.codeforces,
      url: profileUrl("codeforces", row.platforms.codeforces?.handle || row.submittedUsernames.codeforces),
      stats: [
        ["Rating", row.platforms.codeforces?.rating],
        ["Max", row.platforms.codeforces?.maxRating],
      ],
    },
    {
      key: "leetcode",
      label: "LeetCode",
      username: row.platforms.leetcode?.username || row.submittedUsernames.leetcode,
      url: profileUrl("leetcode", row.platforms.leetcode?.username || row.submittedUsernames.leetcode),
      stats: [
        ["Solved", row.platforms.leetcode?.totalSolved],
        ["Contest", row.platforms.leetcode?.contestRating],
      ],
    },
  ];

  return (
    <div className="grid gap-2">
      {platforms.map((platform) => (
        <div key={platform.key} className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="w-24 text-xs font-semibold text-slate-500 dark:text-slate-400">{platform.label}</span>
          {platform.username ? (
            <a
              href={platform.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-w-0 items-center gap-1 font-semibold text-slate-900 hover:text-emerald-600 dark:text-slate-100 dark:hover:text-emerald-400"
              title={`Open ${platform.label} profile`}
            >
              <span className="max-w-40 truncate">{platform.username}</span>
              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
            </a>
          ) : (
            <span>-</span>
          )}
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {platform.stats.map(([label, value]) => `${label} ${formatNumber(value)}`).join(" | ")}
          </span>
        </div>
      ))}
    </div>
  );
}

function PlatformScores({ scores }) {
  const platforms = [
    ["CC", scores?.codechef?.totalScore],
    ["CF", scores?.codeforces?.totalScore],
    ["LC", scores?.leetcode?.totalScore],
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {platforms.map(([label, value]) => (
        <span
          key={label}
          className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          {label}: {formatNumber(value || 0)}
        </span>
      ))}
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div>
      <span className="font-semibold text-slate-700 dark:text-slate-200">{label}: </span>
      {formatNumber(value)}
    </div>
  );
}

function profileUrl(platform, username) {
  if (!username) return "#";

  const encodedUsername = encodeURIComponent(username);
  const urls = {
    codechef: `https://www.codechef.com/users/${encodedUsername}`,
    codeforces: `https://codeforces.com/profile/${encodedUsername}`,
    leetcode: `https://leetcode.com/u/${encodedUsername}/`,
  };

  return urls[platform];
}

export default LeaderboardTable;
