"use client";

import { WeatherIcon } from "./weather-icon";

type WeatherType = "sunny" | "partly_cloudy" | "cloudy" | "rain" | "thunderstorm";

interface DayForecast {
  date: string;
  weatherCondition: WeatherType;
  meetingsCount: number;
  percentBlocked: number;
  isBestDay: boolean;
}

interface WeeklyForecastProps {
  userName: string;
  days: DayForecast[];
}

const WEATHER_BG: Record<WeatherType, string> = {
  sunny: "bg-gradient-to-b from-amber-100 to-sky-50",
  partly_cloudy: "bg-gradient-to-b from-sky-100 to-gray-100",
  cloudy: "bg-gradient-to-b from-gray-200 to-slate-200",
  rain: "bg-gradient-to-b from-slate-300 to-blue-100",
  thunderstorm: "bg-gradient-to-b from-purple-800 to-gray-700",
};

const WEATHER_TEXT_COLOR: Record<WeatherType, string> = {
  sunny: "text-amber-900",
  partly_cloudy: "text-sky-900",
  cloudy: "text-gray-700",
  rain: "text-blue-900",
  thunderstorm: "text-purple-100",
};

export function WeeklyForecast({ userName, days }: WeeklyForecastProps) {
  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-gray-800">
        {userName}&apos;s week
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-4">
        {days.map((day) => (
          <div
            key={day.date}
            className={`relative flex-shrink-0 w-32 rounded-2xl ${WEATHER_BG[day.weatherCondition]} p-4 shadow-sm ${
              day.isBestDay ? "ring-2 ring-amber-400 ring-offset-2" : ""
            }`}
          >
            {day.isBestDay && (
              <span className="absolute -top-2 -right-2 rounded-full bg-amber-400 px-2 py-0.5 text-xs font-bold text-amber-900">
                Best
              </span>
            )}
            <p className={`text-xs font-medium ${WEATHER_TEXT_COLOR[day.weatherCondition]} mb-2`}>
              {day.date}
            </p>
            <div className="flex justify-center mb-2">
              <WeatherIcon condition={day.weatherCondition} size={40} />
            </div>
            <div className={`text-center text-xs ${WEATHER_TEXT_COLOR[day.weatherCondition]}`}>
              <p>{day.meetingsCount} mtgs</p>
              <p>{Math.round(100 - day.percentBlocked)}% open</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
