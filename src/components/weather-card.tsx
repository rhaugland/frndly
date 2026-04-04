"use client";

import { WeatherIcon } from "./weather-icon";

type WeatherType = "sunny" | "partly_cloudy" | "cloudy" | "rain" | "thunderstorm";

interface WeatherCardProps {
  name: string;
  avatarUrl?: string | null;
  weatherCondition: WeatherType;
  meetingsCount: number;
  percentBlocked: number;
  nextAvailable?: string | null;
}

const WEATHER_LABELS: Record<WeatherType, string> = {
  sunny: "Sunny",
  partly_cloudy: "Partly Cloudy",
  cloudy: "Cloudy",
  rain: "Rainy",
  thunderstorm: "Thunderstorm",
};

const WEATHER_GRADIENTS: Record<WeatherType, string> = {
  sunny: "from-amber-100 to-sky-100",
  partly_cloudy: "from-sky-100 to-gray-200",
  cloudy: "from-gray-200 to-slate-300",
  rain: "from-slate-300 to-blue-200",
  thunderstorm: "from-purple-900 to-gray-800",
};

const WEATHER_TEXT: Record<WeatherType, string> = {
  sunny: "text-amber-900",
  partly_cloudy: "text-sky-900",
  cloudy: "text-gray-800",
  rain: "text-blue-900",
  thunderstorm: "text-purple-100",
};

export function WeatherCard({
  name,
  avatarUrl,
  weatherCondition,
  meetingsCount,
  percentBlocked,
  nextAvailable,
}: WeatherCardProps) {
  const gradient = WEATHER_GRADIENTS[weatherCondition];
  const textColor = WEATHER_TEXT[weatherCondition];
  const openPercent = Math.round(100 - percentBlocked);

  return (
    <div
      className={`rounded-2xl bg-gradient-to-br ${gradient} p-5 shadow-md hover:shadow-lg transition-shadow cursor-pointer`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-white/40 flex items-center justify-center text-lg font-semibold">
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className="h-10 w-10 rounded-full" />
            ) : (
              name[0]
            )}
          </div>
          <div>
            <h3 className={`font-semibold ${textColor}`}>{name}</h3>
            <p className={`text-sm ${textColor} opacity-70`}>
              {WEATHER_LABELS[weatherCondition]}
            </p>
          </div>
        </div>
        <WeatherIcon condition={weatherCondition} size={48} />
      </div>

      <div className={`mt-3 text-sm ${textColor} opacity-80`}>
        <p>
          {meetingsCount} meeting{meetingsCount !== 1 ? "s" : ""}, {openPercent}%
          open
        </p>
        {nextAvailable && (
          <p className="mt-1 font-medium opacity-100">
            Free at {nextAvailable}
          </p>
        )}
      </div>
    </div>
  );
}
