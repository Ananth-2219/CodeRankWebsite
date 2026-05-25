import React from "react";
import { formatNumber } from "../utils/formatters.js";

function ScoreBreakdown({ scores }) {
  const platforms = [
    ["CodeChef", scores?.codechef],
    ["Codeforces", scores?.codeforces],
    ["LeetCode", scores?.leetcode],
  ];

  return (
    <div className="grid min-w-[320px] gap-2">
      {platforms.map(([name, score]) => (
        <div key={name} className="rounded-md bg-slate-100 p-3 dark:bg-slate-800">
          <div className="flex justify-between gap-3 text-sm font-semibold">
            <span>{name}</span>
            <span>{formatNumber(score?.totalScore || 0)}</span>
          </div>
          <div className="mt-2 grid gap-1 text-xs text-slate-500 dark:text-slate-400">
            {Object.entries(score?.breakdown || {}).map(([key, value]) => (
              <div key={key} className="flex justify-between gap-3">
                <span>{key}</span>
                <span>{formatNumber(value)}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default ScoreBreakdown;
