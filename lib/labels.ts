// Wording for how a route compares with the time the user asked for.
import { formatTime } from "./time";
import type { Itinerary, TimeMode } from "./types";

export function timingNote(itinerary: Itinerary, mode: TimeMode): string {
  const n = itinerary.offsetMinutes;
  if (mode === "arrive") return n === 0 ? "right on time" : `${n} min early`;
  return n === 0 ? "leaves right at your time" : `leaves ${n} min after your time`;
}

export function resultsTitle(mode: TimeMode, time: number): string {
  return mode === "arrive" ? `Routes arriving by ${formatTime(time)}` : `Routes leaving from ${formatTime(time)}`;
}

/** Label for the earlier/later buttons, e.g. "Arrive by 5:15 PM". */
export function shiftLabel(mode: TimeMode, time: number): string {
  return `${mode === "arrive" ? "Arrive by" : "Leave at"} ${formatTime(time)}`;
}
