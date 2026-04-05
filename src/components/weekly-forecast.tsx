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
  sunny: "bg-gradient-to-b from-amber-100 to-sky-100",
  partly_cloudy: "bg-gradient-to-b from-sky-100 to-blue-100",
  cloudy: "bg-gradient-to-b from-blue-100 to-slate-200",
  rain: "bg-gradient-to-b from-slate-200 to-indigo-200",
  thunderstorm: "bg-gradient-to-b from-indigo-200 to-violet-200",
};

const WEATHER_TEXT_COLOR: Record<WeatherType, string> = {
  sunny: "text-amber-800",
  partly_cloudy: "text-sky-800",
  cloudy: "text-slate-700",
  rain: "text-slate-700",
  thunderstorm: "text-indigo-800",
};

export function WeeklyForecast({ userName, days }: WeeklyForecastProps) {
  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-stone-700">
        {userName}&apos;s week
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-4">
        {days.map((day) => (
          <div
            key={day.date}
            className={`relative flex-shrink-0 w-32 rounded-2xl ${WEATHER_BG[day.weatherCondition]} p-4 shadow-sm ${
              day.isBestDay ? "ring-2 ring-amber-300 ring-offset-2" : ""
            }`}
          >
            {day.isBestDay && (
              <span className="absolute -top-2 -right-2 rounded-full bg-amber-200 px-2 py-0.5 text-xs font-bold text-amber-800">
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
