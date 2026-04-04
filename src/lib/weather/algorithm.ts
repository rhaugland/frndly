import {
  WeatherCondition,
  WeatherThresholds,
  DayMetrics,
  CalendarEvent,
} from "./types";

const DEADLINE_KEYWORDS = /\b(deadline|due|launch)\b/i;

export function detectDeadline(title: string | null): boolean {
  if (!title) return false;
  return DEADLINE_KEYWORDS.test(title);
}

export function countBackToBacks(events: CalendarEvent[]): number {
  const timed = events
    .filter((e) => !e.isAllDay)
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  let count = 0;
  for (let i = 1; i < timed.length; i++) {
    if (timed[i].startTime.getTime() <= timed[i - 1].endTime.getTime()) {
      count++;
    }
  }
  return count;
}

export function computeDayMetrics(
  events: CalendarEvent[],
  workingHours: number
): DayMetrics {
  const timedEvents = events.filter((e) => !e.isAllDay);
  const meetingsCount = timedEvents.length;

  const hoursBlocked = timedEvents.reduce((sum, e) => {
    const hours =
      (e.endTime.getTime() - e.startTime.getTime()) / (1000 * 60 * 60);
    return sum + hours;
  }, 0);

  const percentBlocked =
    workingHours > 0 ? (hoursBlocked / workingHours) * 100 : 0;

  const backToBacks = countBackToBacks(events);

  const hasDeadline = events.some(
    (e) => e.isDeadline || detectDeadline(e.title)
  );

  return {
    meetingsCount,
    hoursBlocked: Math.round(hoursBlocked * 100) / 100,
    percentBlocked: Math.round(percentBlocked * 100) / 100,
    backToBacks,
    hasDeadline,
  };
}

export function computeWeather(
  metrics: DayMetrics,
  thresholds: WeatherThresholds
): WeatherCondition {
  if (metrics.percentBlocked >= thresholds.thunderstorm.minPercentBlocked) {
    return WeatherCondition.Thunderstorm;
  }
  if (
    metrics.hasDeadline &&
    metrics.percentBlocked >= thresholds.thunderstorm.deadlinePercentThreshold
  ) {
    return WeatherCondition.Thunderstorm;
  }

  if (
    metrics.percentBlocked > thresholds.cloudy.maxPercentBlocked ||
    metrics.backToBacks >= thresholds.rain.minBackToBacks
  ) {
    return WeatherCondition.Rain;
  }

  if (
    metrics.percentBlocked > thresholds.partlyCloudy.maxPercentBlocked ||
    metrics.meetingsCount > thresholds.partlyCloudy.maxMeetings
  ) {
    return WeatherCondition.Cloudy;
  }

  if (
    metrics.percentBlocked > thresholds.sunny.maxPercentBlocked ||
    metrics.meetingsCount > thresholds.sunny.maxMeetings
  ) {
    return WeatherCondition.PartlyCloudy;
  }

  return WeatherCondition.Sunny;
}
