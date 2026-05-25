import React from "react";

function EmptyState({ title, message }) {
  return (
    <div className="p-8 text-center">
      <h2 className="font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{message}</p>
    </div>
  );
}

export default EmptyState;
