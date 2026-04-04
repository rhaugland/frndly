import { describe, it, expect } from "vitest";
import {
  computeWeather,
  computeDayMetrics,
  detectDeadline,
  countBackToBacks,
} from "@/lib/weather/algorithm";
import {
  WeatherCondition,
  DEFAULT_THRESHOLDS,
  CalendarEvent,
} from "@/lib/weather/types";

function makeEvent(
  startHour: number,
  endHour: number,
  overrides: Partial<CalendarEvent> = {}
): CalendarEvent {
  const base = new Date("2026-04-06T00:00:00Z");
  return {
    startTime: new Date(base.getTime() + startHour * 3600000),
    endTime: new Date(base.getTime() + endHour * 3600000),
    isAllDay: false,
    title: "Meeting",
    isDeadline: false,
    ...overrides,
  };
}

describe("detectDeadline", () => {
  it("detects 'deadline' keyword in title", () => {
    expect(detectDeadline("Project deadline")).toBe(true);
  });

  it("detects 'due' keyword in title", () => {
    expect(detectDeadline("Report due")).toBe(true);
  });

  it("detects 'launch' keyword in title", () => {
    expect(detectDeadline("Product launch")).toBe(true);
  });

  it("returns false for normal titles", () => {
    expect(detectDeadline("Weekly standup")).toBe(false);
  });

  it("returns false for null titles", () => {
    expect(detectDeadline(null)).toBe(false);
  });
});

describe("countBackToBacks", () => {
  it("returns 0 for no events", () => {
    expect(countBackToBacks([])).toBe(0);
  });

  it("returns 0 for events with gaps", () => {
    const events = [makeEvent(9, 10), makeEvent(11, 12)];
    expect(countBackToBacks(events)).toBe(0);
  });

  it("counts adjacent events as back-to-back", () => {
    const events = [makeEvent(9, 10), makeEvent(10, 11)];
    expect(countBackToBacks(events)).toBe(1);
  });

  it("counts chain of 3 back-to-backs", () => {
    const events = [makeEvent(9, 10), makeEvent(10, 11), makeEvent(11, 12)];
    expect(countBackToBacks(events)).toBe(2);
  });
});

describe("computeDayMetrics", () => {
  it("computes metrics for an empty day", () => {
    const metrics = computeDayMetrics([], 8);
    expect(metrics.meetingsCount).toBe(0);
    expect(metrics.hoursBlocked).toBe(0);
    expect(metrics.percentBlocked).toBe(0);
    expect(metrics.backToBacks).toBe(0);
    expect(metrics.hasDeadline).toBe(false);
  });

  it("computes metrics for a day with 2 one-hour meetings", () => {
    const events = [makeEvent(9, 10), makeEvent(14, 15)];
    const metrics = computeDayMetrics(events, 8);
    expect(metrics.meetingsCount).toBe(2);
    expect(metrics.hoursBlocked).toBe(2);
    expect(metrics.percentBlocked).toBe(25);
    expect(metrics.backToBacks).toBe(0);
    expect(metrics.hasDeadline).toBe(false);
  });

  it("detects deadline from event title", () => {
    const events = [makeEvent(9, 10, { title: "Project deadline review" })];
    const metrics = computeDayMetrics(events, 8);
    expect(metrics.hasDeadline).toBe(true);
  });

  it("detects deadline from isDeadline flag", () => {
    const events = [makeEvent(9, 10, { isDeadline: true })];
    const metrics = computeDayMetrics(events, 8);
    expect(metrics.hasDeadline).toBe(true);
  });

  it("skips all-day events from hours calculation but checks deadline", () => {
    const events = [
      makeEvent(0, 24, { isAllDay: true, title: "Launch day" }),
      makeEvent(9, 10),
    ];
    const metrics = computeDayMetrics(events, 8);
    expect(metrics.meetingsCount).toBe(1);
    expect(metrics.hoursBlocked).toBe(1);
    expect(metrics.hasDeadline).toBe(true);
  });
});

describe("computeWeather", () => {
  const thresholds = DEFAULT_THRESHOLDS;

  it("returns sunny for an empty day", () => {
    const metrics = { meetingsCount: 0, hoursBlocked: 0, percentBlocked: 0, backToBacks: 0, hasDeadline: false };
    expect(computeWeather(metrics, thresholds)).toBe(WeatherCondition.Sunny);
  });

  it("returns sunny for light day (20% blocked, 2 meetings)", () => {
    const metrics = { meetingsCount: 2, hoursBlocked: 1.6, percentBlocked: 20, backToBacks: 0, hasDeadline: false };
    expect(computeWeather(metrics, thresholds)).toBe(WeatherCondition.Sunny);
  });

  it("returns partly_cloudy for moderate day (40% blocked, 3 meetings)", () => {
    const metrics = { meetingsCount: 3, hoursBlocked: 3.2, percentBlocked: 40, backToBacks: 0, hasDeadline: false };
    expect(computeWeather(metrics, thresholds)).toBe(WeatherCondition.PartlyCloudy);
  });

  it("returns cloudy for busy day (60% blocked, 5 meetings)", () => {
    const metrics = { meetingsCount: 5, hoursBlocked: 4.8, percentBlocked: 60, backToBacks: 1, hasDeadline: false };
    expect(computeWeather(metrics, thresholds)).toBe(WeatherCondition.Cloudy);
  });

  it("returns rain for heavy day (75% blocked)", () => {
    const metrics = { meetingsCount: 6, hoursBlocked: 6, percentBlocked: 75, backToBacks: 2, hasDeadline: false };
    expect(computeWeather(metrics, thresholds)).toBe(WeatherCondition.Rain);
  });

  it("returns rain for 3+ back-to-backs even if percent is moderate", () => {
    const metrics = { meetingsCount: 4, hoursBlocked: 4, percentBlocked: 50, backToBacks: 3, hasDeadline: false };
    expect(computeWeather(metrics, thresholds)).toBe(WeatherCondition.Rain);
  });

  it("returns thunderstorm for 85%+ blocked", () => {
    const metrics = { meetingsCount: 7, hoursBlocked: 7, percentBlocked: 90, backToBacks: 4, hasDeadline: false };
    expect(computeWeather(metrics, thresholds)).toBe(WeatherCondition.Thunderstorm);
  });

  it("returns thunderstorm for 70%+ blocked with deadline", () => {
    const metrics = { meetingsCount: 6, hoursBlocked: 6, percentBlocked: 75, backToBacks: 2, hasDeadline: true };
    expect(computeWeather(metrics, thresholds)).toBe(WeatherCondition.Thunderstorm);
  });
});
