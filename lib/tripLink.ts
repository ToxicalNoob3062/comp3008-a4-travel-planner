// Link to the saved-route page. The route travels in the link as well as being stored in SQLite,
// so the page still works where the database file is temporary (Vercel keeps it in /tmp per function).
import type { Itinerary, SavedTrip } from "./types";

type LinkTrip = Omit<SavedTrip, "createdAt">;

export function tripLink(trip: LinkTrip): string {
  // Map coordinates are not needed on the saved-route page, so they are left out to keep the link short.
  const itinerary: Itinerary = { ...trip.itinerary, legs: trip.itinerary.legs.map((leg) => ({ ...leg, path: [] })) };
  return `/trip/${trip.code}?d=${encodeURIComponent(JSON.stringify({ ...trip, itinerary }))}`;
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
      it.legs.every((leg) => (leg.type === "walk" || leg.type === "ride") && Number.isInteger(leg.depart));
    return valid ? { ...trip, code: code.toUpperCase() } : null;
  } catch {
    return null;
  }
}
