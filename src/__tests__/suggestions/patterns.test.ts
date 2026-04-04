import { describe, it, expect } from "vitest";
import { detectPatterns } from "@/lib/suggestions/patterns";

describe("detectPatterns", () => {
  it("detects consistently heavy day", () => {
    const history = [
      { date: new Date("2026-03-09"), dayOfWeek: 1, weatherCondition: "thunderstorm" },
      { date: new Date("2026-03-16"), dayOfWeek: 1, weatherCondition: "thunderstorm" },
      { date: new Date("2026-03-23"), dayOfWeek: 1, weatherCondition: "thunderstorm" },
      { date: new Date("2026-03-30"), dayOfWeek: 1, weatherCondition: "rain" },
    ];
    const patterns = detectPatterns(history);
    expect(patterns.length).toBeGreaterThan(0);
    expect(patterns[0].dayOfWeek).toBe(1);
    expect(patterns[0].type).toBe("heavy");
  });

  it("detects consistently light day", () => {
    const history = [
      { date: new Date("2026-03-11"), dayOfWeek: 3, weatherCondition: "sunny" },
      { date: new Date("2026-03-18"), dayOfWeek: 3, weatherCondition: "sunny" },
      { date: new Date("2026-03-25"), dayOfWeek: 3, weatherCondition: "partly_cloudy" },
    ];
    const patterns = detectPatterns(history);
    expect(patterns.length).toBeGreaterThan(0);
    expect(patterns[0].dayOfWeek).toBe(3);
    expect(patterns[0].type).toBe("light");
  });

  it("returns nothing when data is mixed", () => {
    const history = [
      { date: new Date("2026-03-09"), dayOfWeek: 1, weatherCondition: "sunny" },
      { date: new Date("2026-03-16"), dayOfWeek: 1, weatherCondition: "thunderstorm" },
      { date: new Date("2026-03-23"), dayOfWeek: 1, weatherCondition: "cloudy" },
    ];
    const patterns = detectPatterns(history);
    expect(patterns).toHaveLength(0);
  });
});
