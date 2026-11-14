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
