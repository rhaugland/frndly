"use client";

import { WeatherCard } from "./weather-card";

interface TeammateWeather {
  id: string;
  name: string;
  avatarUrl?: string | null;
  weatherCondition: "sunny" | "partly_cloudy" | "cloudy" | "rain" | "thunderstorm";
  meetingsCount: number;
  percentBlocked: number;
  nextAvailable?: string | null;
}

interface DashboardGridProps {
  teammates: TeammateWeather[];
  teamId: string;
}

const WEATHER_ORDER = ["sunny", "partly_cloudy", "cloudy", "rain", "thunderstorm"];

export function DashboardGrid({ teammates, teamId }: DashboardGridProps) {
  const sorted = [...teammates].sort(
    (a, b) =>
      WEATHER_ORDER.indexOf(a.weatherCondition) -
      WEATHER_ORDER.indexOf(b.weatherCondition)
  );

  if (sorted.length === 0) {
    return (
      <div className="rounded-2xl bg-gray-50 p-12 text-center">
        <p className="text-gray-400">No teammates yet. Share your invite link to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {sorted.map((t) => (
        <a key={t.id} href={`/team/${teamId}/week?user=${t.id}`}>
          <WeatherCard
            name={t.name}
            avatarUrl={t.avatarUrl}
            weatherCondition={t.weatherCondition}
            meetingsCount={t.meetingsCount}
            percentBlocked={t.percentBlocked}
            nextAvailable={t.nextAvailable}
          />
        </a>
      ))}
    </div>
  );
}
