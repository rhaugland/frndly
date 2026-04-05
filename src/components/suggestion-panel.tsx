"use client";

import { Suggestion } from "@/lib/suggestions/types";

interface SuggestionPanelProps {
  suggestions: Suggestion[];
}

const TYPE_COLORS: Record<string, string> = {
  best_time: "bg-amber-50 border-amber-200",
  avoid: "bg-slate-50 border-slate-200",
  rare_opening: "bg-sky-50 border-sky-200",
  pattern: "bg-violet-50 border-violet-200",
};

export function SuggestionPanel({ suggestions }: SuggestionPanelProps) {
  if (suggestions.length === 0) {
    return (
      <div className="rounded-2xl bg-sky-50 p-6 text-center text-sky-400">
        <p className="text-sm">No suggestions yet — check back after the first sync.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-sky-900">Reach-out suggestions</h2>
      {suggestions.map((s, i) => (
        <div
          key={`${s.userId}-${i}`}
          className={`rounded-xl border p-4 ${TYPE_COLORS[s.type] || "bg-sky-50 border-sky-100"}`}
        >
          <p className="text-sm text-slate-700">{s.message}</p>
        </div>
      ))}
    </div>
  );
}
