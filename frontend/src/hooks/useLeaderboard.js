import { useCallback, useEffect, useState } from "react";
import { getLeaderboard } from "../services/api.js";

export function useLeaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [failures, setFailures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getLeaderboard();
      setLeaderboard(data.leaderboard || []);
      setFailures(data.failures || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load leaderboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { leaderboard, failures, loading, error, refresh };
}
