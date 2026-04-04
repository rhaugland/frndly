"use client";

import { Suggestion } from "@/lib/suggestions/types";

interface SuggestionPanelProps {
  suggestions: Suggestion[];
}

const TYPE_COLORS: Record<string, string> = {
  best_time: "bg-amber-50 border-amber-200",
  avoid: "bg-red-50 border-red-200",
  rare_opening: "bg-blue-50 border-blue-200",
  pattern: "bg-purple-50 border-purple-200",
};

export function SuggestionPanel({ suggestions }: SuggestionPanelProps) {
  if (suggestions.length === 0) {
    return (
      <div className="rounded-2xl bg-gray-50 p-6 text-center text-gray-400">
        <p className="text-sm">No suggestions yet — check back after the first sync.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-gray-800">Reach-out suggestions</h2>
      {suggestions.map((s, i) => (
        <div
          key={`${s.userId}-${i}`}
          className={`rounded-xl border p-4 ${TYPE_COLORS[s.type] || "bg-gray-50 border-gray-200"}`}
        >
          <p className="text-sm text-gray-800">{s.message}</p>
        </div>
      ))}
    </div>
  );
}
