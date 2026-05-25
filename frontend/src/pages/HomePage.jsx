import React from "react";
import { RotateCcw, Send } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TextField from "../components/TextField.jsx";
import { addUser } from "../services/api.js";

const initialForm = {
  codechef: "",
  codeforces: "",
  leetcode: "",
};

function HomePage() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const hasUsername = Object.values(form).some((value) => value.trim());

  async function submit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!hasUsername) {
      setError("Enter at least one username.");
      return;
    }

    setLoading(true);
    try {
      await addUser(form);
      setSuccess("User added. Fetching live rankings now.");
      setForm(initialForm);
      navigate("/leaderboard");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to add user.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setForm(initialForm);
    setError("");
    setSuccess("");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-3xl font-bold">Add a competitor</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Submit any combination of CodeChef, Codeforces, and LeetCode usernames.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <TextField
            label="CodeChef username"
            value={form.codechef}
            placeholder="e.g. tourist"
            onChange={(codechef) => setForm((current) => ({ ...current, codechef }))}
          />
          <TextField
            label="Codeforces username"
            value={form.codeforces}
            placeholder="e.g. tourist"
            onChange={(codeforces) => setForm((current) => ({ ...current, codeforces }))}
          />
          <TextField
            label="LeetCode username"
            value={form.leetcode}
            placeholder="e.g. leetcode"
            onChange={(leetcode) => setForm((current) => ({ ...current, leetcode }))}
          />

          {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-300">{error}</p>}
          {success && (
            <p className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
              {success}
            </p>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={loading}
              className="flex flex-1 items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send className="h-4 w-4" />
              {loading ? "Adding..." : "Submit"}
            </button>
            <button
              type="button"
              onClick={reset}
              className="flex items-center justify-center gap-2 rounded-md border border-slate-300 px-4 py-2 font-semibold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-xl font-bold">Scoring model</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <ScoreNote title="CodeChef" items={["rating x 0.1", "problems x 2", "contests x 5", "badges weighted"]} />
          <ScoreNote title="Codeforces" items={["rating x 0.15", "max rating x 0.05", "rank bonuses"]} />
          <ScoreNote title="LeetCode" items={["easy x 1", "medium x 3", "hard x 7", "contest rating x 0.05"]} />
        </div>
      </section>
    </div>
  );
}

function ScoreNote({ title, items }) {
  return (
    <div className="rounded-md bg-slate-100 p-4 dark:bg-slate-800">
      <h3 className="font-semibold">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default HomePage;
