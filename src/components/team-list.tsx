"use client";

import { useState } from "react";
import { WeatherIcon } from "./weather-icon";
import { ChevronDown, Star } from "lucide-react";

type WeatherType = "sunny" | "partly_cloudy" | "cloudy" | "rain" | "thunderstorm";

interface DayForecast {
  date: string;
  weatherCondition: WeatherType;
  meetingsCount: number;
  percentBlocked: number;
  isBestDay: boolean;
}

interface Teammate {
  id: string;
  name: string;
  avatarUrl?: string | null;
  weatherCondition: WeatherType;
  meetingsCount: number;
  percentBlocked: number;
  nextAvailable?: string | null;
  weeklyForecast: DayForecast[];
}

const WEATHER_LABELS: Record<WeatherType, string> = {
  sunny: "Sunny",
  partly_cloudy: "Partly Cloudy",
  cloudy: "Cloudy",
  rain: "Rainy",
  thunderstorm: "Thunderstorm",
};

const WEATHER_BG: Record<WeatherType, string> = {
  sunny: "from-amber-100 to-sky-100",
  partly_cloudy: "from-sky-100 to-blue-100",
  cloudy: "from-blue-100 to-slate-200",
  rain: "from-slate-200 to-indigo-200",
  thunderstorm: "from-indigo-200 to-violet-200",
};

const WEATHER_TEXT: Record<WeatherType, string> = {
  sunny: "text-amber-800",
  partly_cloudy: "text-sky-800",
  cloudy: "text-slate-700",
  rain: "text-slate-700",
  thunderstorm: "text-indigo-800",
};

interface TeamListProps {
  teammates: Teammate[];
  workspaceName: string;
  favorites: Set<string>;
  onToggleFavorite: (id: string) => void;
}

export function TeamList({ teammates, workspaceName, favorites, onToggleFavorite }: TeamListProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  function toggle(id: string) {
    setExpanded(expanded === id ? null : id);
  }

  if (teammates.length === 0) {
    return (
      <div className="rounded-2xl bg-white/50 backdrop-blur-sm border border-sky-100 p-12 text-center">
        <p className="text-sky-400">No teammates yet. Share your invite link to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 pl-1">
      {teammates.map((t) => {
        const isOpen = expanded === t.id;
        const openPercent = Math.round(100 - t.percentBlocked);
        const isFav = favorites.has(t.id);

        return (
          <div
            key={t.id}
            className="rounded-2xl bg-white/50 backdrop-blur-sm border border-sky-100 transition-all"
          >
            <div className="flex items-center">
              <button
                onClick={(e) => { e.stopPropagation(); onToggleFavorite(t.id); }}
                className="shrink-0 pl-4 pr-1 py-4"
                title={isFav ? "Remove from favorites" : "Add to favorites"}
              >
                <Star
                  size={18}
                  className={`transition-colors ${
                    isFav
                      ? "fill-amber-400 text-amber-400"
                      : "text-slate-300 hover:text-amber-300"
                  }`}
                />
              </button>
              <button
                onClick={() => toggle(t.id)}
                className="flex-1 flex items-center gap-4 p-4 pl-2 text-left hover:bg-white/30 transition-colors"
              >
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-sky-100 to-violet-100 flex items-center justify-center text-sm font-semibold text-slate-700 shrink-0">
                  {t.avatarUrl ? (
                    <img src={t.avatarUrl} alt={t.name} className="h-10 w-10 rounded-full" />
                  ) : (
                    t.name[0]
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-800 truncate">{t.name}</h3>
                    <span className="shrink-0 rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-medium text-sky-600">
                      {workspaceName}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {WEATHER_LABELS[t.weatherCondition]} &middot; {t.meetingsCount} meeting{t.meetingsCount !== 1 ? "s" : ""} &middot; {openPercent}% open
                  </p>
                </div>
                <WeatherIcon condition={t.weatherCondition} size={32} />
                <ChevronDown
                  size={18}
                  className={`text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </button>
            </div>

            {isOpen && (
              <div className="px-4 pb-4">
                <div className="border-t border-sky-100/50 pt-4">
                  <p className="text-xs font-medium text-slate-500 mb-3">Weekly forecast</p>
                  <div className="flex gap-2 overflow-x-auto pt-2 pb-2 pl-1">
                    {t.weeklyForecast.map((day) => (
                      <div
                        key={day.date}
                        className={`relative flex-shrink-0 w-24 rounded-xl bg-gradient-to-b ${WEATHER_BG[day.weatherCondition]} p-3 shadow-sm ${
                          day.isBestDay ? "ring-2 ring-amber-300 ring-offset-1" : ""
                        }`}
                      >
                        {day.isBestDay && (
                          <span className="absolute -top-1.5 -right-1.5 rounded-full bg-amber-200 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                            Best
                          </span>
                        )}
                        <p className={`text-[10px] font-medium ${WEATHER_TEXT[day.weatherCondition]} mb-1`}>
                          {day.date}
                        </p>
                        <div className="flex justify-center mb-1">
                          <WeatherIcon condition={day.weatherCondition} size={28} />
                        </div>
                        <div className={`text-center text-[10px] ${WEATHER_TEXT[day.weatherCondition]}`}>
                          <p>{day.meetingsCount} mtgs</p>
                          <p>{Math.round(100 - day.percentBlocked)}% open</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
