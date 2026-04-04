import { describe, it, expect } from "vitest";
import { generateInviteCode, isValidInviteCode } from "@/lib/team/invite";

describe("generateInviteCode", () => {
  it("returns a string of 12 characters", () => {
    const code = generateInviteCode();
    expect(code).toHaveLength(12);
  });

  it("returns URL-safe characters only", () => {
    const code = generateInviteCode();
    expect(code).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("generates unique codes", () => {
    const codes = new Set(Array.from({ length: 100 }, () => generateInviteCode()));
    expect(codes.size).toBe(100);
  });
});

describe("isValidInviteCode", () => {
  it("accepts valid 12-char alphanumeric codes", () => {
    expect(isValidInviteCode("abcdef123456")).toBe(true);
  });

  it("rejects empty string", () => {
    expect(isValidInviteCode("")).toBe(false);
  });

  it("rejects codes with special characters", () => {
    expect(isValidInviteCode("abc!@#123456")).toBe(false);
  });

  it("rejects codes shorter than 12 chars", () => {
    expect(isValidInviteCode("abc123")).toBe(false);
  });
});
