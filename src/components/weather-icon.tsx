"use client";

import { Sun, CloudSun, Cloud, CloudRain, CloudLightning } from "lucide-react";

type WeatherType = "sunny" | "partly_cloudy" | "cloudy" | "rain" | "thunderstorm";

interface WeatherIconProps {
  condition: WeatherType;
  size?: number;
}

const ICON_MAP: Record<WeatherType, { icon: typeof Sun; color: string }> = {
  sunny: { icon: Sun, color: "#FBBF24" },
  partly_cloudy: { icon: CloudSun, color: "#93C5FD" },
  cloudy: { icon: Cloud, color: "#A5B4C8" },
  rain: { icon: CloudRain, color: "#7C9CB8" },
  thunderstorm: { icon: CloudLightning, color: "#8B8FA8" },
};

export function WeatherIcon({ condition, size = 64 }: WeatherIconProps) {
  const { icon: Icon, color } = ICON_MAP[condition];
  return <Icon size={size} color={color} strokeWidth={1.5} />;
}
