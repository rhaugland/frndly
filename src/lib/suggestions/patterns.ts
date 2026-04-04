export interface DayHistory {
  date: Date;
  dayOfWeek: number;
  weatherCondition: string;
}

export interface Pattern {
  dayOfWeek: number;
  type: "heavy" | "light";
  confidence: number;
}

const HEAVY_CONDITIONS = new Set(["thunderstorm", "rain"]);
const LIGHT_CONDITIONS = new Set(["sunny", "partly_cloudy"]);

export function detectPatterns(history: DayHistory[]): Pattern[] {
  if (history.length < 3) return [];

  const byDay = new Map<number, DayHistory[]>();
  for (const entry of history) {
    const existing = byDay.get(entry.dayOfWeek) || [];
    existing.push(entry);
    byDay.set(entry.dayOfWeek, existing);
  }

  const patterns: Pattern[] = [];

  for (const [dayOfWeek, entries] of byDay) {
    if (entries.length < 3) continue;

    const heavyCount = entries.filter((e) =>
      HEAVY_CONDITIONS.has(e.weatherCondition)
    ).length;
    const lightCount = entries.filter((e) =>
      LIGHT_CONDITIONS.has(e.weatherCondition)
    ).length;

    const heavyRatio = heavyCount / entries.length;
    const lightRatio = lightCount / entries.length;

    if (heavyRatio >= 0.75) {
      patterns.push({ dayOfWeek, type: "heavy", confidence: heavyRatio });
    } else if (lightRatio >= 0.75) {
      patterns.push({ dayOfWeek, type: "light", confidence: lightRatio });
    }
  }

  return patterns;
}
