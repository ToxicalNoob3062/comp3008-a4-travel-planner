// Browser-side calls to the three API routes. Every function turns network
// failures into a value the UI can show, so the components never have to catch.
import type { Itinerary, Place, SearchRequest, SearchResponse, TimeMode } from "./types";

export async function fetchPlaces(query: string, signal?: AbortSignal): Promise<Place[]> {
  const response = await fetch(`/api/places?q=${encodeURIComponent(query)}`, { signal });
  if (!response.ok) throw new Error("Could not load places");
  return ((await response.json()) as { places: Place[] }).places;
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
