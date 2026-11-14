"use client";

// Wrapper that loads the Leaflet map in the browser only (Leaflet needs `window`).
import dynamic from "next/dynamic";
import type { MapLine, MapMarker } from "./TripMap";

const TripMap = dynamic(() => import("./TripMap"), {
  ssr: false,
  loading: () => <div className="flex h-full items-center justify-center text-sm text-muted">Loading map…</div>,
});

interface MapViewProps {
  markers: MapMarker[];
  lines?: MapLine[];
  /** Text alternative read by screen readers instead of the map tiles. */
  description: string;
  className?: string;
}

export default function MapView({ markers, lines, description, className = "h-[220px]" }: MapViewProps) {
  return (
    <div role="group" aria-label={description} className={`overflow-hidden rounded-lg border border-line bg-[#eef1f4] ${className}`}>
      <TripMap markers={markers} lines={lines} />
    </div>
  );
}
