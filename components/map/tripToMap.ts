// Turns a route into the markers and lines drawn on the map.
import type { Itinerary, Place } from "@/lib/types";
import type { MapLine, MapMarker } from "./TripMap";

export function itineraryToMap(itinerary: Itinerary, from: Place, to: Place): { markers: MapMarker[]; lines: MapLine[] } {
  const lines: MapLine[] = itinerary.legs.map((leg) =>
    leg.type === "walk"
      ? { path: leg.path, kind: "walk", label: `Walk ${leg.minutes} min` }
      : { path: leg.path, kind: leg.vehicle },
  );
  // A small marker at every stop where the rider boards.
  const stops: MapMarker[] = itinerary.legs
    .filter((leg) => leg.type === "ride")
    .map((leg) => ({ position: leg.path[0], label: `Board ${leg.lineName} at ${leg.fromStop}` }));
  return {
    lines,
    markers: [
      ...stops,
      { position: [from.lat, from.lon], letter: "A", label: `Start: ${from.name}` },
      { position: [to.lat, to.lon], letter: "B", label: `Destination: ${to.name}` },
    ],
  };
}

/**
 * Map data for a saved route, where only the place names are stored.
 * The start and end points are read from the first and last leg. Returns null if the route has no coordinates.
 */
export function savedTripToMap(itinerary: Itinerary, fromName: string, toName: string) {
  const first = itinerary.legs[0]?.path[0];
  const lastPath = itinerary.legs[itinerary.legs.length - 1]?.path ?? [];
  const last = lastPath[lastPath.length - 1];
  if (!first || !last) return null;
  const place = (name: string, [lat, lon]: [number, number]): Place => ({ id: name, name, subtitle: "", kind: "place", lat, lon });
  return itineraryToMap(itinerary, place(fromName, first), place(toName, last));
}
