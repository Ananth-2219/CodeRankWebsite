import React from "react";

function Spinner({ label = "Loading" }) {
  return (
    <div className="flex items-center justify-center gap-3 p-8 text-sm text-slate-500 dark:text-slate-400">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-500" />
      {label}
    </div>
  );
}

export default Spinner;
