import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/db", () => ({ prisma: {} }));
vi.mock("@/lib/calendar/google", () => ({ googleCalendar: {} }));
vi.mock("@/lib/calendar/microsoft", () => ({ microsoftCalendar: {} }));

import { normalizeEventForStorage } from "@/lib/calendar/sync";
import { NormalizedEvent } from "@/lib/calendar/types";

describe("normalizeEventForStorage", () => {
  const baseEvent: NormalizedEvent = {
    sourceEventId: "evt-1",
    startTime: new Date("2026-04-06T09:00:00Z"),
    endTime: new Date("2026-04-06T10:00:00Z"),
    isAllDay: false,
    title: "Weekly standup",
  };

  it("preserves title when privacy is titles or full_details", () => {
    const result = normalizeEventForStorage(baseEvent, "titles");
    expect(result.title).toBe("Weekly standup");
  });

  it("nulls title when privacy is free_busy", () => {
    const result = normalizeEventForStorage(baseEvent, "free_busy");
    expect(result.title).toBeNull();
  });

  it("detects deadline from title", () => {
    const event = { ...baseEvent, title: "Q2 deadline review" };
    const result = normalizeEventForStorage(event, "titles");
    expect(result.isDeadline).toBe(true);
  });

  it("detects deadline even when title will be nulled", () => {
    const event = { ...baseEvent, title: "Project launch" };
    const result = normalizeEventForStorage(event, "free_busy");
    expect(result.isDeadline).toBe(true);
    expect(result.title).toBeNull();
  });

  it("marks non-deadline events correctly", () => {
    const result = normalizeEventForStorage(baseEvent, "titles");
    expect(result.isDeadline).toBe(false);
  });
});
