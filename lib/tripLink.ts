// Link to the saved-route page. The route travels in the link as well as being stored in SQLite,
// so the page still works where the database file is temporary (Vercel keeps it in /tmp per function).
import type { SavedTrip } from "./types";

type LinkTrip = Omit<SavedTrip, "createdAt">;

export function tripLink(trip: LinkTrip): string {
  return `/trip/${trip.code}?d=${encodeURIComponent(JSON.stringify(trip))}`;
}

/** Reads a route back out of the link. Returns null if the data is missing or not a route. */
export function tripFromLink(data: string | string[] | undefined, code: string): LinkTrip | null {
  if (typeof data !== "string") return null;
  try {
    const trip = JSON.parse(data) as LinkTrip;
    const it = trip.itinerary;
    const valid =
      typeof trip.fromName === "string" &&
      typeof trip.toName === "string" &&
      typeof trip.date === "string" &&
      (trip.mode === "arrive" || trip.mode === "leave") &&
      Number.isInteger(it?.leave) &&
      Number.isInteger(it?.arrive) &&
      Number.isInteger(it?.walkMinutes) &&
      Number.isInteger(it?.offsetMinutes) &&
      Array.isArray(it?.legs) &&
      it.legs.every(
        (leg) =>
          (leg.type === "walk" || leg.type === "ride") &&
          Number.isInteger(leg.depart) &&
          // Map coordinates: a list of [latitude, longitude] pairs.
          Array.isArray(leg.path) &&
          leg.path.every((point) => Array.isArray(point) && point.length === 2 && point.every((n) => Number.isFinite(n))),
      );
    return valid ? { ...trip, code: code.toUpperCase() } : null;
  } catch {
    return null;
  }
}
