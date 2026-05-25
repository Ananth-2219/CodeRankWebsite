import React from "react";
import { ExternalLink } from "lucide-react";

function TextField({ label, value, onChange, placeholder, link, type = "text" }) {
  const id = label.toLowerCase().replace(/\s+/g, "-");

  return (
    <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-200">
      <span className="flex items-center justify-between gap-3">
        <span>{label}</span>
        {link && (
          <a
            href={link.href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
            onClick={(event) => event.stopPropagation()}
          >
            {link.label}
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </span>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none ring-emerald-500 transition focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
      />
    </label>
  );
}

export default TextField;
