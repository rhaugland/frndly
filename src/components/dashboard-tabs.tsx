"use client";

import { useState, useEffect, useCallback } from "react";
import { DashboardGrid } from "./dashboard-grid";
import { SuggestionPanel } from "./suggestion-panel";
import { InvitePanel } from "./invite-panel";
import { TeamList } from "./team-list";
import { WorkspacesPanel } from "./workspaces-panel";
import { FavoritesPanel } from "./favorites-panel";
import { Suggestion } from "@/lib/suggestions/types";

type WeatherType = "sunny" | "partly_cloudy" | "cloudy" | "rain" | "thunderstorm";

interface OpenSlot {
  start: string;
  end: string;
  duration: number;
}

interface TeammateWithWeek {
  id: string;
  name: string;
  avatarUrl?: string | null;
  weatherCondition: WeatherType;
  meetingsCount: number;
  percentBlocked: number;
  nextAvailable?: string | null;
  weeklyForecast: {
    date: string;
    weatherCondition: WeatherType;
    meetingsCount: number;
    percentBlocked: number;
    isBestDay: boolean;
  }[];
  openSlots?: OpenSlot[];
}

interface Workspace {
  id: string;
  name: string;
  inviteCode: string;
  isActive: boolean;
  isOwner: boolean;
  memberCount: number;
}

const QUICK_SUGGESTIONS: Record<WeatherType, (name: string) => string> = {
  sunny: (n) => `${n} has a clear day — great time to reach out or schedule a sync.`,
  partly_cloudy: (n) => `${n} has a few meetings but still has gaps — try catching them between calls.`,
  cloudy: (n) => `${n} is moderately busy today — check their openings before booking.`,
  rain: (n) => `${n} is pretty packed — keep it async unless it's urgent.`,
  thunderstorm: (n) => `${n} is slammed today — hold off and try again tomorrow.`,
};

interface DashboardTabsProps {
  teammates: TeammateWithWeek[];
  teamId: string;
  teamName: string;
  inviteCode: string;
  suggestions: Suggestion[];
  hasRealData: boolean;
  workspaces: Workspace[];
}

export function DashboardTabs({ teammates, teamId, teamName, inviteCode, suggestions, hasRealData, workspaces }: DashboardTabsProps) {
  const [tab, setTab] = useState<"home" | "team" | "favorites">("home");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    const stored = localStorage.getItem("frndly-favorites");
    if (stored) {
      try {
        setFavorites(new Set(JSON.parse(stored)));
      } catch {}
    }
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      localStorage.setItem("frndly-favorites", JSON.stringify([...next]));
      return next;
    });
  }, []);

  const favoriteTeammates = teammates
    .filter((t) => favorites.has(t.id))
    .map((t) => ({
      ...t,
      suggestion: QUICK_SUGGESTIONS[t.weatherCondition](t.name.split(" ")[0]),
      workspaceName: teamName,
    }));

  const tabs = [
    { key: "home" as const, label: "Home" },
    { key: "team" as const, label: "Team" },
    { key: "favorites" as const, label: "Favorites" },
  ];

  return (
    <div>
      <div className="mb-6 flex gap-1 rounded-xl bg-white/50 backdrop-blur-sm p-1 border border-sky-100 w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-lg px-5 py-2 text-sm font-medium transition-colors ${
              tab === t.key
                ? "bg-sky-400 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-800 hover:bg-white/50"
            }`}
          >
            {t.label}
            {t.key === "favorites" && favoriteTeammates.length > 0 && (
              <span className={`ml-1.5 text-xs ${tab === "favorites" ? "text-sky-100" : "text-sky-400"}`}>
                {favoriteTeammates.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {!hasRealData && tab !== "favorites" && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-800">
          Showing demo data — invite teammates to see real forecasts.
        </div>
      )}

      {tab === "home" && (
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <h2 className="mb-4 text-lg font-semibold text-slate-800">
              Today&apos;s forecast
            </h2>
            <DashboardGrid teammates={teammates} teamId={teamId} />
          </div>
          <div className="w-full lg:w-80 shrink-0 space-y-4">
            <InvitePanel inviteCode={inviteCode} />
            <SuggestionPanel suggestions={suggestions} />
          </div>
        </div>
      )}

      {tab === "team" && (
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <h2 className="mb-4 text-lg font-semibold text-slate-800">
              Team members
            </h2>
            <TeamList
              teammates={teammates}
              workspaceName={teamName}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
            />
          </div>
          <div className="w-full lg:w-80 shrink-0">
            <InvitePanel inviteCode={inviteCode} />
          </div>
        </div>
      )}

      {tab === "favorites" && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-slate-800">
            Favorites
          </h2>
          <FavoritesPanel favorites={favoriteTeammates} />
        </div>
      )}

    </div>
  );
}
