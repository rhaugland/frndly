"use client";

import { useState } from "react";
import { WeatherCard } from "./weather-card";
import { Clock } from "lucide-react";

interface OpenSlot {
  start: string;
  end: string;
  duration: number;
}

interface TeammateWeather {
  id: string;
  name: string;
  avatarUrl?: string | null;
  weatherCondition: "sunny" | "partly_cloudy" | "cloudy" | "rain" | "thunderstorm";
  meetingsCount: number;
  percentBlocked: number;
  nextAvailable?: string | null;
  openSlots?: OpenSlot[];
}

interface DashboardGridProps {
  teammates: TeammateWeather[];
  teamId: string;
}

const WEATHER_ORDER = ["sunny", "partly_cloudy", "cloudy", "rain", "thunderstorm"];

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

export function DashboardGrid({ teammates, teamId }: DashboardGridProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const sorted = [...teammates].sort(
    (a, b) =>
      WEATHER_ORDER.indexOf(a.weatherCondition) -
      WEATHER_ORDER.indexOf(b.weatherCondition)
  );

  if (sorted.length === 0) {
    return (
      <div className="rounded-2xl bg-sky-50 p-12 text-center">
        <p className="text-sky-400">No teammates yet. Share your invite link to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {sorted.map((t) => {
        const isOpen = expanded === t.id;
        const slots = t.openSlots || [];

        return (
          <div key={t.id} className="flex flex-col">
            <div onClick={() => setExpanded(isOpen ? null : t.id)}>
              <WeatherCard
                name={t.name}
                avatarUrl={t.avatarUrl}
                weatherCondition={t.weatherCondition}
                meetingsCount={t.meetingsCount}
                percentBlocked={t.percentBlocked}
                nextAvailable={t.nextAvailable}
                expanded={isOpen}
              />
            </div>

            {isOpen && (
              <div className="rounded-b-2xl bg-white/60 backdrop-blur-sm border border-sky-100 border-t-0 px-4 py-3">
                <p className="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1.5">
                  <Clock size={12} />
                  Available times
                </p>
                {t.meetingsCount === 0 ? (
                  <div className="rounded-lg bg-emerald-50/80 px-3 py-2">
                    <p className="text-sm font-medium text-emerald-700">No meetings today — free all day</p>
                  </div>
                ) : slots.length === 0 ? (
                  <p className="text-xs text-slate-400">No gaps between meetings today.</p>
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
