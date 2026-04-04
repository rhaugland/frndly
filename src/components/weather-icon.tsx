"use client";

import { Sun, CloudSun, Cloud, CloudRain, CloudLightning } from "lucide-react";

type WeatherType = "sunny" | "partly_cloudy" | "cloudy" | "rain" | "thunderstorm";

interface WeatherIconProps {
  condition: WeatherType;
  size?: number;
}

const ICON_MAP: Record<WeatherType, { icon: typeof Sun; color: string }> = {
  sunny: { icon: Sun, color: "#FBBF24" },
  partly_cloudy: { icon: CloudSun, color: "#94A3B8" },
  cloudy: { icon: Cloud, color: "#64748B" },
  rain: { icon: CloudRain, color: "#3B82F6" },
  thunderstorm: { icon: CloudLightning, color: "#7C3AED" },
};

export function WeatherIcon({ condition, size = 64 }: WeatherIconProps) {
  const { icon: Icon, color } = ICON_MAP[condition];
  return <Icon size={size} color={color} strokeWidth={1.5} />;
}
