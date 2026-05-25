import React from "react";
import { Moon, Sun, Trophy } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useDarkMode } from "../hooks/useDarkMode.js";

function Layout({ children }) {
  const [darkMode, setDarkMode] = useDarkMode();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold">
            <Trophy className="h-6 w-6 text-emerald-500" />
            CodingRank
          </Link>

          <nav className="flex items-center gap-2">
            <NavLink className={navClass} to="/">
              Add User
            </NavLink>
            <NavLink className={navClass} to="/leaderboard">
              Leaderboard
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

      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
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

export default Layout;
