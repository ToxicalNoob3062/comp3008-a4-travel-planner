// Browser-side calls to the three API routes. Every function turns network
// failures into a value the UI can show, so the components never have to catch.
import type { Itinerary, Place, SearchRequest, SearchResponse, TimeMode } from "./types";

let placesRequest: Promise<Place[]> | null = null;

/** Loads every place once (GET /api/places) and reuses the list for the rest of the visit. */
export function fetchPlaces(): Promise<Place[]> {
  placesRequest ??= fetch("/api/places")
    .then((response) => {
      if (!response.ok) throw new Error("Could not load places");
      return response.json() as Promise<{ places: Place[] }>;
    })
    .then((body) => body.places)
    .catch((error: unknown) => {
      placesRequest = null; // let the next attempt try again
      throw error;
    });
  return placesRequest;
}

/** Removes accents and case so "orleans" matches "Orléans". */
function normalise(text: string): string {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

/** Places whose name or description contains the typed text. */
export function filterPlaces(places: Place[], query: string): Place[] {
  const q = normalise(query);
  return q === "" ? places : places.filter((place) => normalise(`${place.name} ${place.subtitle}`).includes(q));
}

export async function searchRoutes(request: SearchRequest): Promise<SearchResponse> {
  try {
    const response = await fetch("/api/routes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
    return (await response.json()) as SearchResponse;
  } catch {
    return {
      ok: false,
      error: { code: "SERVER", message: "We could not reach the trip search. Check your connection and try again." },
    };
  }
}

export interface SendTripRequest {
  fromName: string;
  toName: string;
  date: string;
  mode: TimeMode;
  time: number;
  itinerary: Itinerary;
}

export async function sendTrip(request: SendTripRequest): Promise<{ ok: true; code: string } | { ok: false; message: string }> {
  try {
    const response = await fetch("/api/trips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
    return (await response.json()) as { ok: true; code: string } | { ok: false; message: string };
  } catch {
    return { ok: false, message: "We could not send the route. Check your connection and try again." };
  }
}
