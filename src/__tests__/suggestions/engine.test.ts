import { describe, it, expect } from "vitest";
import { findGaps, rankWindows, generateSuggestions } from "@/lib/suggestions/engine";
import { UserSchedule } from "@/lib/suggestions/types";

function makeDate(hour: number, minute = 0): Date {
  return new Date(`2026-04-06T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00Z`);
}

describe("findGaps", () => {
  it("returns full working day when no events", () => {
    const gaps = findGaps([], makeDate(9), makeDate(17), 30);
    expect(gaps).toHaveLength(1);
    expect(gaps[0].durationMinutes).toBe(480);
  });

  it("finds gap between two meetings", () => {
    const events = [
      { startTime: makeDate(9), endTime: makeDate(10) },
      { startTime: makeDate(11), endTime: makeDate(12) },
    ];
    const gaps = findGaps(events, makeDate(9), makeDate(17), 30);
    const oneHourGap = gaps.find((g) => g.durationMinutes === 60);
    expect(oneHourGap).toBeDefined();
  });

  it("filters out gaps shorter than minMinutes", () => {
    const events = [
      { startTime: makeDate(9), endTime: makeDate(9, 50) },
      { startTime: makeDate(10), endTime: makeDate(11) },
    ];
    const gaps = findGaps(events, makeDate(9), makeDate(17), 30);
    const shortGap = gaps.find((g) => g.durationMinutes === 10);
    expect(shortGap).toBeUndefined();
  });

  it("returns empty when fully booked", () => {
    const events = [{ startTime: makeDate(9), endTime: makeDate(17) }];
    const gaps = findGaps(events, makeDate(9), makeDate(17), 30);
    expect(gaps).toHaveLength(0);
  });
});

describe("rankWindows", () => {
  it("ranks longer gaps higher", () => {
    const windows = [
      { start: makeDate(10), end: makeDate(10, 30), durationMinutes: 30 },
      { start: makeDate(14), end: makeDate(15), durationMinutes: 60 },
    ];
    const ranked = rankWindows(windows, makeDate(9), makeDate(17));
    expect(ranked[0].durationMinutes).toBe(60);
  });

  it("penalizes first 30 min of work day", () => {
    const windows = [
      { start: makeDate(9), end: makeDate(9, 45), durationMinutes: 45 },
      { start: makeDate(10), end: makeDate(10, 45), durationMinutes: 45 },
    ];
    const ranked = rankWindows(windows, makeDate(9), makeDate(17));
    expect(ranked[0].start.getHours()).toBe(10);
  });

  it("penalizes last 30 min of work day", () => {
    const windows = [
      { start: makeDate(14), end: makeDate(14, 45), durationMinutes: 45 },
      { start: makeDate(16, 30), end: makeDate(17), durationMinutes: 30 },
    ];
    const ranked = rankWindows(windows, makeDate(9), makeDate(17));
    expect(ranked[0].start.getHours()).toBe(14);
  });
});

describe("generateSuggestions", () => {
  it("generates a best_time suggestion for a sunny user", () => {
    const schedules: UserSchedule[] = [
      {
        userId: "u1",
        userName: "Alex",
        events: [{ startTime: makeDate(9), endTime: makeDate(10) }],
        workingHoursStart: "09:00",
        workingHoursEnd: "17:00",
        timezone: "UTC",
        weatherCondition: "sunny",
      },
    ];
    const suggestions = generateSuggestions(schedules, new Date("2026-04-06"));
    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions[0].type).toBe("best_time");
    expect(suggestions[0].message).toContain("Alex");
  });

  it("generates an avoid suggestion for a thunderstorm user with no gaps", () => {
    const schedules: UserSchedule[] = [
      {
        userId: "u2",
        userName: "Jordan",
        events: [{ startTime: makeDate(9), endTime: makeDate(17) }],
        workingHoursStart: "09:00",
        workingHoursEnd: "17:00",
        timezone: "UTC",
        weatherCondition: "thunderstorm",
      },
    ];
    const suggestions = generateSuggestions(schedules, new Date("2026-04-06"));
    expect(suggestions.some((s) => s.type === "avoid")).toBe(true);
  });
});
