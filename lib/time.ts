// Small time/date helpers shared by the client and the server.
import type { Meridiem } from "./types";

/** 17 * 60 + 30 -> "5:30 PM" */
export function formatTime(minutes: number): string {
  const m = ((minutes % 1440) + 1440) % 1440;
  const h24 = Math.floor(m / 60);
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m % 60).padStart(2, "0")} ${h24 < 12 ? "AM" : "PM"}`;
}

/** 17 * 60 + 30 -> "5:30" (used in the route details timeline). */
export function formatClock(minutes: number): string {
  return formatTime(minutes).replace(/ (AM|PM)$/, "");
}

/** 17 * 60 + 30 -> "17:30" */
export function format24(minutes: number): string {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

/** (5, 30, "PM") -> 1050. Returns null when the values are not a valid 12-hour time. */
export function toMinutes(hour: string, minute: string, meridiem: Meridiem | null): number | null {
  if (!/^\d{1,2}$/.test(hour) || !/^\d{1,2}$/.test(minute) || !meridiem) return null;
  const h = Number(hour);
  const m = Number(minute);
  if (h < 1 || h > 12 || m < 0 || m > 59) return null;
  return ((h % 12) + (meridiem === "PM" ? 12 : 0)) * 60 + m;
}

/** 1050 -> { hour: "5", minute: "30", meridiem: "PM" } */
export function fromMinutes(minutes: number): { hour: string; minute: string; meridiem: Meridiem } {
  const h24 = Math.floor(minutes / 60);
  return {
    hour: String(h24 % 12 === 0 ? 12 : h24 % 12),
    minute: String(minutes % 60).padStart(2, "0"),
    meridiem: h24 < 12 ? "AM" : "PM",
  };
}

function parseDate(date: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) return null;
  const d = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return Number.isNaN(d.getTime()) || d.getUTCDate() !== Number(match[3]) ? null : d;
}

export function isValidDate(date: string): boolean {
  return parseDate(date) !== null;
}

/** 0 = Sunday ... 6 = Saturday */
export function dayOfWeek(date: string): number {
  return parseDate(date)?.getUTCDay() ?? 0;
}

/** "2026-10-06" -> "Tue, Oct 6, 2026" (short) or "Tuesday, Oct 6, 2026" (long) */
export function formatDate(date: string, weekday: "short" | "long" = "short"): string {
  const d = parseDate(date);
  if (!d) return date;
  return d.toLocaleDateString("en-CA", {
    weekday,
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** "2026-10-06" -> "Tue, Oct 6" */
export function formatDateShort(date: string): string {
  const d = parseDate(date);
  if (!d) return date;
  return d.toLocaleDateString("en-CA", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });
}
