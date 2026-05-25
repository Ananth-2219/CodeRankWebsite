import { Moon, Search, Sun, Trophy, UserPlus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, Route, Routes, useNavigate, useParams } from "react-router-dom";
import { api } from "./api";
import React from 'react';
const starterUsers = [
  { name: "Tourist", leetcodeUsername: "", codeforcesHandle: "tourist" },
  { name: "Benq", leetcodeUsername: "", codeforcesHandle: "Benq" },
];

function App() {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold">
            <Trophy className="h-6 w-6 text-emerald-500" />
            CodingRank
          </Link>
          <nav className="flex items-center gap-2">
            <NavLink className={navClass} to="/">
              Leaderboard
            </NavLink>
            <NavLink className={navClass} to="/profile">
              Profile
            </NavLink>
            <button
              type="button"
              onClick={() => setDarkMode((value) => !value)}
              className="grid h-10 w-10 place-items-center rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              aria-label="Toggle dark mode"
              title="Toggle dark mode"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Routes>
          <Route path="/" element={<LeaderboardPage />} />
          <Route path="/profile" element={<ProfileSearchPage />} />
          <Route path="/profile/:kind/:handle" element={<ProfilePage />} />
        </Routes>
      </main>
    </div>
  );
}

function navClass({ isActive }) {
  return `rounded-md px-3 py-2 text-sm font-medium ${
    isActive
      ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
  }`;
}

function LeaderboardPage() {
  const [users, setUsers] = useLocalUsers();
  const [form, setForm] = useState({ name: "", leetcodeUsername: "", codeforcesHandle: "" });
  const [leaderboard, setLeaderboard] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    refreshLeaderboard(users, setLeaderboard, setStatus, setError);
  }, [users]);

  function addUser(event) {
    event.preventDefault();
    if (!form.leetcodeUsername && !form.codeforcesHandle) return;
    setUsers((current) => [...current, form]);
    setForm({ name: "", leetcodeUsername: "", codeforcesHandle: "" });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-5">
          <h1 className="text-2xl font-bold">Leaderboard</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Rank coders using live LeetCode and Codeforces public stats.
          </p>
        </div>
        <form onSubmit={addUser} className="space-y-4">
          <TextField label="Display name" value={form.name} onChange={(name) => setForm({ ...form, name })} />
          <TextField
            label="LeetCode username"
            value={form.leetcodeUsername}
            onChange={(leetcodeUsername) => setForm({ ...form, leetcodeUsername })}
          />
          <TextField
            label="Codeforces handle"
            value={form.codeforcesHandle}
            onChange={(codeforcesHandle) => setForm({ ...form, codeforcesHandle })}
          />
          <button className="flex w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700">
            <UserPlus className="h-4 w-4" />
            Add coder
          </button>
        </form>
      </section>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div>
            <h2 className="font-semibold">Global board</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{users.length} tracked profiles</p>
          </div>
          <button
            type="button"
            onClick={() => refreshLeaderboard(users, setLeaderboard, setStatus, setError)}
            className="rounded-md border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Refresh
          </button>
        </div>
        {status === "loading" && <StateMessage text="Fetching live coding stats..." />}
        {error && <StateMessage text={error} tone="error" />}
        {status !== "loading" && !error && <LeaderboardTable rows={leaderboard} />}
      </section>
    </div>
  );
}

function LeaderboardTable({ rows }) {
  if (!rows.length) return <StateMessage text="Add a coder to generate the leaderboard." />;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          <tr>
            <th className="px-5 py-3">Rank</th>
            <th className="px-5 py-3">Coder</th>
            <th className="px-5 py-3">Solved</th>
            <th className="px-5 py-3">Score</th>
            <th className="px-5 py-3">Codeforces</th>
            <th className="px-5 py-3">LeetCode</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/70">
              <td className="px-5 py-4 text-lg font-bold">#{row.rank}</td>
              <td className="px-5 py-4">
                <Link className="font-semibold hover:text-emerald-600" to={profilePath(row)}>
                  {row.name}
                </Link>
                <div className="text-xs text-slate-500">{[row.leetcodeUsername, row.codeforcesHandle].filter(Boolean).join(" / ")}</div>
              </td>
              <td className="px-5 py-4">{row.totals.solved}</td>
              <td className="px-5 py-4 font-semibold">{row.totals.score}</td>
              <td className="px-5 py-4">{row.codeforces?.rating || "unrated"}</td>
              <td className="px-5 py-4">{row.leetcode?.ranking ? `#${row.leetcode.ranking}` : "unranked"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProfileSearchPage() {
  const [leetcodeUsername, setLeetcodeUsername] = useState("");
  const [codeforcesHandle, setCodeforcesHandle] = useState("");
  const navigate = useNavigate();

  function submit(event) {
    event.preventDefault();
    if (leetcodeUsername) navigate(`/profile/leetcode/${leetcodeUsername}`);
    else if (codeforcesHandle) navigate(`/profile/codeforces/${codeforcesHandle}`);
  }

  return (
    <section className="mx-auto max-w-xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h1 className="text-2xl font-bold">Profile lookup</h1>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Search a single competitive programming profile.</p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <TextField label="LeetCode username" value={leetcodeUsername} onChange={setLeetcodeUsername} />
        <TextField label="Codeforces handle" value={codeforcesHandle} onChange={setCodeforcesHandle} />
        <button className="flex w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700">
          <Search className="h-4 w-4" />
          Search profile
        </button>
      </form>
    </section>
  );
}

function ProfilePage() {
  const { kind, handle } = useParams();
  const [profile, setProfile] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    const params =
      kind === "leetcode" ? { leetcodeUsername: handle } : { codeforcesHandle: handle };

    api
      .get("/profile", { params })
      .then(({ data }) => setProfile(data))
      .catch((err) => setError(err.response?.data?.message || "Unable to load profile."))
      .finally(() => setStatus("idle"));
  }, [kind, handle]);

  if (status === "loading") return <StateMessage text="Loading profile..." />;
  if (error) return <StateMessage text={error} tone="error" />;
  if (!profile) return null;

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{profile.name}</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">Composite score: {profile.totals.score}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total solved" value={profile.totals.solved} />
        <StatCard label="LeetCode solved" value={profile.leetcode?.solved || 0} />
        <StatCard label="Codeforces solved" value={profile.codeforces?.solved || 0} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <PlatformPanel title="LeetCode" stats={profile.leetcode} />
        <PlatformPanel title="Codeforces" stats={profile.codeforces} />
      </div>
    </section>
  );
}

function PlatformPanel({ title, stats }) {
  if (!stats) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-semibold">{title}</h2>
        <p className="mt-3 text-sm text-slate-500">No handle supplied.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="font-semibold">{title}</h2>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        {Object.entries(stats)
          .filter(([, value]) => typeof value !== "object")
          .map(([key, value]) => (
            <div key={key} className="rounded-md bg-slate-100 p-3 dark:bg-slate-800">
              <dt className="text-xs uppercase text-slate-500">{key}</dt>
              <dd className="mt-1 font-semibold">{String(value ?? "n/a")}</dd>
            </div>
          ))}
      </dl>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}

function TextField({ label, value, onChange }) {
  const id = useMemo(() => label.toLowerCase().replace(/\s+/g, "-"), [label]);

  return (
    <label htmlFor={id} className="block text-sm font-medium">
      {label}
      <input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none ring-emerald-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
      />
    </label>
  );
}

function StateMessage({ text, tone = "neutral" }) {
  return (
    <div className={`p-8 text-center text-sm ${tone === "error" ? "text-red-500" : "text-slate-500 dark:text-slate-400"}`}>
      {text}
    </div>
  );
}

function useLocalUsers() {
  const [users, setUsers] = useState(() => {
    const stored = localStorage.getItem("codingrank-users");
    return stored ? JSON.parse(stored) : starterUsers;
  });

  useEffect(() => {
    localStorage.setItem("codingrank-users", JSON.stringify(users));
  }, [users]);

  return [users, setUsers];
}

function refreshLeaderboard(users, setLeaderboard, setStatus, setError) {
  setStatus("loading");
  setError("");

  api
    .post("/leaderboard", { users })
    .then(({ data }) => setLeaderboard(data.leaderboard || []))
    .catch((err) => setError(err.response?.data?.message || "Unable to fetch leaderboard."))
    .finally(() => setStatus("idle"));
}

function profilePath(row) {
  if (row.leetcodeUsername) return `/profile/leetcode/${row.leetcodeUsername}`;
  return `/profile/codeforces/${row.codeforcesHandle}`;
}

export default App;
