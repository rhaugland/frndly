"use client";

import { WeatherIcon } from "./weather-icon";

type WeatherType = "sunny" | "partly_cloudy" | "cloudy" | "rain" | "thunderstorm";

interface TopBarProps {
  teamName: string;
  userName: string;
  userWeather?: WeatherType;
}

export function TopBar({ teamName, userName, userWeather }: TopBarProps) {
  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold text-gray-900">{teamName}</h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {userWeather && <WeatherIcon condition={userWeather} size={28} />}
          <span className="text-sm text-gray-600">{userName}</span>
        </div>
        <a
          href="/settings"
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          Settings
        </a>
      </div>
    </header>
  );
}
