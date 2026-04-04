"use client";

type WeatherType = "sunny" | "partly_cloudy" | "cloudy" | "rain" | "thunderstorm";

interface WeatherIconProps {
  condition: WeatherType;
  size?: number;
}

export function WeatherIcon({ condition, size = 64 }: WeatherIconProps) {
  const s = size;

  switch (condition) {
    case "sunny":
      return (
        <svg width={s} height={s} viewBox="0 0 64 64" className="animate-pulse">
          <circle cx="32" cy="32" r="14" fill="#FBBF24" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
            <line
              key={angle}
              x1="32"
              y1="8"
              x2="32"
              y2="14"
              stroke="#FBBF24"
              strokeWidth="2"
              strokeLinecap="round"
              transform={`rotate(${angle} 32 32)`}
            />
          ))}
        </svg>
      );

    case "partly_cloudy":
      return (
        <svg width={s} height={s} viewBox="0 0 64 64">
          <circle cx="24" cy="24" r="10" fill="#FBBF24" className="animate-pulse" />
          <ellipse cx="36" cy="40" rx="16" ry="10" fill="#CBD5E1" />
          <ellipse cx="28" cy="38" rx="12" ry="8" fill="#E2E8F0" />
        </svg>
      );

    case "cloudy":
      return (
        <svg width={s} height={s} viewBox="0 0 64 64">
          <ellipse cx="32" cy="36" rx="20" ry="12" fill="#94A3B8" />
          <ellipse cx="24" cy="32" rx="14" ry="10" fill="#CBD5E1" />
          <ellipse cx="40" cy="34" rx="12" ry="8" fill="#B0BEC5" />
        </svg>
      );

    case "rain":
      return (
        <svg width={s} height={s} viewBox="0 0 64 64">
          <ellipse cx="32" cy="24" rx="18" ry="10" fill="#64748B" />
          <ellipse cx="24" cy="22" rx="12" ry="8" fill="#94A3B8" />
          {[20, 32, 44].map((x, i) => (
            <line
              key={x}
              x1={x}
              y1="38"
              x2={x - 4}
              y2="50"
              stroke="#60A5FA"
              strokeWidth="2"
              strokeLinecap="round"
              className="animate-bounce"
              style={{ animationDelay: `${i * 200}ms` }}
            />
          ))}
        </svg>
      );

    case "thunderstorm":
      return (
        <svg width={s} height={s} viewBox="0 0 64 64">
          <ellipse cx="32" cy="20" rx="20" ry="10" fill="#374151" />
          <ellipse cx="24" cy="18" rx="14" ry="8" fill="#4B5563" />
          <polygon
            points="30,30 26,42 32,42 28,54 38,38 32,38 36,30"
            fill="#EAB308"
            className="animate-pulse"
          />
          {[18, 44].map((x, i) => (
            <line
              key={x}
              x1={x}
              y1="34"
              x2={x - 3}
              y2="46"
              stroke="#60A5FA"
              strokeWidth="2"
              strokeLinecap="round"
              className="animate-bounce"
              style={{ animationDelay: `${i * 300}ms` }}
            />
          ))}
        </svg>
      );
  }
}
