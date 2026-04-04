import { TimeWindow, ScoredWindow, Suggestion, UserSchedule } from "./types";

export function findGaps(
  events: { startTime: Date; endTime: Date }[],
  workStart: Date,
  workEnd: Date,
  minMinutes: number
): TimeWindow[] {
  const sorted = [...events].sort(
    (a, b) => a.startTime.getTime() - b.startTime.getTime()
  );

  const gaps: TimeWindow[] = [];
  let cursor = workStart.getTime();

  for (const event of sorted) {
    const eventStart = event.startTime.getTime();
    const eventEnd = event.endTime.getTime();

    if (eventStart > cursor) {
      const durationMinutes = (eventStart - cursor) / 60000;
      if (durationMinutes >= minMinutes) {
        gaps.push({
          start: new Date(cursor),
          end: new Date(eventStart),
          durationMinutes,
        });
      }
    }
    cursor = Math.max(cursor, eventEnd);
  }

  const workEndMs = workEnd.getTime();
  if (cursor < workEndMs) {
    const durationMinutes = (workEndMs - cursor) / 60000;
    if (durationMinutes >= minMinutes) {
      gaps.push({
        start: new Date(cursor),
        end: workEnd,
        durationMinutes,
      });
    }
  }

  return gaps;
}

export function rankWindows(
  windows: TimeWindow[],
  workStart: Date,
  workEnd: Date
): ScoredWindow[] {
  const workStartMs = workStart.getTime();
  const workEndMs = workEnd.getTime();
  const bufferMs = 30 * 60000;

  return windows
    .map((w) => {
      let score = 0;
      score += Math.min(w.durationMinutes, 120);
      if (w.durationMinutes >= 45) score += 20;
      if (w.start.getTime() < workStartMs + bufferMs) score -= 30;
      if (w.end.getTime() > workEndMs - bufferMs) score -= 30;
      return { ...w, score };
    })
    .sort((a, b) => b.score - a.score);
}

function parseTimeToDate(timeStr: string, dateRef: Date): Date {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const d = new Date(dateRef);
  d.setUTCHours(hours, minutes, 0, 0);
  return d;
}

function formatTime(date: Date): string {
  const h = date.getUTCHours();
  const period = h >= 12 ? "pm" : "am";
  const hour = h % 12 || 12;
  const min = date.getUTCMinutes();
  return min === 0 ? `${hour}${period}` : `${hour}:${String(min).padStart(2, "0")}${period}`;
}

export function generateSuggestions(
  schedules: UserSchedule[],
  date: Date
): Suggestion[] {
  const suggestions: Suggestion[] = [];

  for (const schedule of schedules) {
    const workStart = parseTimeToDate(schedule.workingHoursStart, date);
    const workEnd = parseTimeToDate(schedule.workingHoursEnd, date);

    const gaps = findGaps(schedule.events, workStart, workEnd, 30);
    const ranked = rankWindows(gaps, workStart, workEnd);

    if (ranked.length === 0) {
      if (
        schedule.weatherCondition === "thunderstorm" ||
        schedule.weatherCondition === "rain"
      ) {
        suggestions.push({
          userId: schedule.userId,
          userName: schedule.userName,
          message: `Avoid ${schedule.userName} today — fully booked`,
          type: "avoid",
        });
      }
      continue;
    }

    const best = ranked[0];
    const startStr = formatTime(best.start);
    const endStr = formatTime(best.end);
    const weatherLabel =
      schedule.weatherCondition === "sunny"
        ? "sunny day"
        : schedule.weatherCondition === "partly_cloudy"
          ? "light day"
          : "has an opening";

    suggestions.push({
      userId: schedule.userId,
      userName: schedule.userName,
      message: `Best time to reach ${schedule.userName}: ${startStr}-${endStr} — ${weatherLabel}`,
      type: "best_time",
      window: best,
    });
  }

  return suggestions;
}
