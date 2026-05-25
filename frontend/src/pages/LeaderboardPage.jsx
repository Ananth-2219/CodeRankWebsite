import React from "react";
import { RefreshCw } from "lucide-react";
import EmptyState from "../components/EmptyState.jsx";
import LeaderboardTable from "../components/LeaderboardTable.jsx";
import Spinner from "../components/Spinner.jsx";
import { useLeaderboard } from "../hooks/useLeaderboard.js";

function LeaderboardPage() {
  const { leaderboard, failures, loading, error, refresh } = useLeaderboard();

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold">Live Leaderboard</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Built only from usernames submitted through this session.
          </p>
        </div>
        <button
          type="button"
          onClick={refresh}
          className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {loading && <Spinner label="Fetching live platform stats..." />}
      {!loading && error && <EmptyState title="API error" message={error} />}
      {!loading && !error && leaderboard.length === 0 && (
        <EmptyState title="No competitors yet" message="Add at least one username on the homepage to generate rankings." />
      )}
      {!loading && !error && leaderboard.length > 0 && <LeaderboardTable rows={leaderboard} onRefresh={refresh} />}

      {!loading && failures.length > 0 && (
        <div className="border-t border-slate-200 p-4 text-sm text-red-500 dark:border-slate-800">
          {failures.join(" | ")}
        </div>
      )}
    </section>
  );
}

export default LeaderboardPage;
