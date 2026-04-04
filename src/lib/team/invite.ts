import { nanoid } from "nanoid";

export function generateInviteCode(): string {
  return nanoid(12);
}

export function isValidInviteCode(code: string): boolean {
  return /^[A-Za-z0-9_-]{12,}$/.test(code);
}
