"use client";

import { useState } from "react";
import { WeatherIcon } from "./weather-icon";
import { Clock, ChevronDown } from "lucide-react";

type WeatherType = "sunny" | "partly_cloudy" | "cloudy" | "rain" | "thunderstorm";

interface OpenSlot {
  start: string;
  end: string;
  duration: number;
}

interface FavoriteTeammate {
  id: string;
  name: string;
  avatarUrl?: string | null;
  weatherCondition: WeatherType;
  meetingsCount: number;
  percentBlocked: number;
  nextAvailable?: string | null;
  suggestion?: string;
  workspaceName: string;
  openSlots?: OpenSlot[];
}

const WEATHER_LABELS: Record<WeatherType, string> = {
  sunny: "Sunny",
  partly_cloudy: "Partly Cloudy",
  cloudy: "Cloudy",
  rain: "Rainy",
  thunderstorm: "Thunderstorm",
};

const CARD_GRADIENTS: Record<WeatherType, string> = {
  sunny: "from-amber-200 via-amber-100 to-sky-100",
  partly_cloudy: "from-sky-200 via-sky-100 to-blue-100",
  cloudy: "from-blue-200 via-blue-100 to-slate-200",
  rain: "from-slate-300 via-slate-200 to-indigo-200",
  thunderstorm: "from-indigo-300 via-indigo-200 to-violet-200",
};

const CARD_TEXT: Record<WeatherType, string> = {
  sunny: "text-amber-900",
  partly_cloudy: "text-sky-900",
  cloudy: "text-slate-800",
  rain: "text-slate-800",
  thunderstorm: "text-indigo-900",
};

const CARD_SUBTEXT: Record<WeatherType, string> = {
  sunny: "text-amber-700/70",
  partly_cloudy: "text-sky-700/70",
  cloudy: "text-slate-600/70",
  rain: "text-slate-600/70",
  thunderstorm: "text-indigo-700/70",
};

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

function formatDuration(min: number) {
  if (min >= 60) {
    const hrs = Math.floor(min / 60);
    const rem = min % 60;
    return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`;
  }
  return `${min}m`;
}

export function FavoritesPanel({ favorites }: { favorites: FavoriteTeammate[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (favorites.length === 0) {
    return (
      <div className="rounded-2xl bg-white/50 backdrop-blur-sm border border-sky-100 p-12 text-center">
        <p className="text-sky-400 text-sm">
          No favorites in this workspace — star teammates on the Team tab to add them here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-xl">
      {favorites.map((f) => {
        const openPercent = Math.round(100 - f.percentBlocked);
        const isOpen = expanded === f.id;
        const slots = f.openSlots || [];

        return (
          <div key={f.id}>
            <div
              onClick={() => setExpanded(isOpen ? null : f.id)}
              className={`rounded-3xl bg-gradient-to-br ${CARD_GRADIENTS[f.weatherCondition]} p-6 shadow-md cursor-pointer transition-shadow hover:shadow-lg ${isOpen ? "rounded-b-none" : ""}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className={`text-lg font-bold ${CARD_TEXT[f.weatherCondition]}`}>
                    {f.name}
                  </h3>
                  <p className={`text-sm ${CARD_SUBTEXT[f.weatherCondition]}`}>
                    {WEATHER_LABELS[f.weatherCondition]}
                  </p>
                </div>
                <WeatherIcon condition={f.weatherCondition} size={52} />
              </div>

              <div className={`flex items-center gap-4 text-sm ${CARD_SUBTEXT[f.weatherCondition]} mb-3`}>
                <span>{f.meetingsCount} meeting{f.meetingsCount !== 1 ? "s" : ""}</span>
                <span className="w-1 h-1 rounded-full bg-current opacity-50" />
                <span>{openPercent}% open</span>
                {f.nextAvailable && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-current opacity-50" />
                    <span>Free at {f.nextAvailable}</span>
                  </>
                )}
              </div>

              {f.suggestion && (
                <div className={`rounded-xl bg-white/30 backdrop-blur-sm px-4 py-3 text-sm ${CARD_TEXT[f.weatherCondition]}`}>
                  {f.suggestion}
                </div>
              )}

              <div className="mt-3 flex items-center justify-between">
                <span className="rounded-full bg-white/40 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                  {f.workspaceName}
                </span>
                <div className={`flex items-center gap-1 text-xs ${CARD_SUBTEXT[f.weatherCondition]}`}>
                  <Clock size={12} />
                  <span>Open times</span>
                  <ChevronDown size={14} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </div>
              </div>
            </div>

            {isOpen && (
              <div className="bg-white/60 backdrop-blur-sm border border-t-0 border-sky-100 rounded-b-3xl px-6 py-4">
                <p className="text-xs font-medium text-slate-500 mb-2">Open times today</p>
                {slots.length === 0 ? (
                  <p className="text-xs text-slate-400">No open slots remaining today.</p>
                ) : (
                  <div className="space-y-1.5">
                    {slots.map((s, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-lg bg-sky-50/80 px-3 py-2"
                      >
                        <span className="text-sm font-medium text-slate-700">
                          {formatTime(s.start)} – {formatTime(s.end)}
                        </span>
                        <span className="text-xs text-sky-500 font-medium">
                          {formatDuration(s.duration)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
