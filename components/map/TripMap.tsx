"use client";

// Leaflet map (OpenStreetMap tiles). Loaded only in the browser through MapView.
import { Fragment, useEffect } from "react";
import L from "leaflet";
import { MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export interface MapMarker {
  position: [number, number];
  /** "A" / "B" for the start and destination, empty for a stop along the way. */
  letter?: string;
  label: string;
}

export interface MapLine {
  path: [number, number][];
  kind: "walk" | "bus" | "train";
  /** Shown on the map beside the line, e.g. "Walk 12 min". Used for walks, which are too short to spot. */
  label?: string;
}

const LINE_STYLE: Record<MapLine["kind"], L.PathOptions> = {
  walk: { color: "#39383f", weight: 4, dashArray: "2 8" },
  bus: { color: "#1976d2", weight: 5 },
  train: { color: "#d30f1d", weight: 5 },
};

function pin(marker: MapMarker) {
  return L.divIcon({
    className: "",
    html: `<div class="map-pin${marker.letter ? "" : " map-pin--stop"}">${marker.letter ?? ""}</div>`,
    iconSize: marker.letter ? [28, 28] : [14, 14],
    iconAnchor: marker.letter ? [14, 14] : [7, 7],
  });
}

/** Zooms the map so every marker and line is visible. */
function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  const key = JSON.stringify(points);
  useEffect(() => {
    const parsed = JSON.parse(key) as [number, number][];
    if (parsed.length > 0) map.fitBounds(L.latLngBounds(parsed), { padding: [32, 32], maxZoom: 15 });
  }, [map, key]);
  return null;
}

export default function TripMap({ markers, lines = [] }: { markers: MapMarker[]; lines?: MapLine[] }) {
  const points = [...markers.map((m) => m.position), ...lines.flatMap((l) => l.path)];
  return (
    <MapContainer center={points[0] ?? [45.4215, -75.6972]} zoom={12} scrollWheelZoom={false} className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {/* Walks are drawn last so they sit on top, with a white outline and a label that is always visible:
          a 10-minute walk is only a few pixels long at city zoom and would otherwise hide under the pins. */}
      {[...lines.filter((l) => l.kind !== "walk"), ...lines.filter((l) => l.kind === "walk")].map((line, i) => (
        <Fragment key={i}>
          {line.kind === "walk" ? <Polyline positions={line.path} pathOptions={{ color: "#ffffff", weight: 8 }} /> : null}
          <Polyline positions={line.path} pathOptions={LINE_STYLE[line.kind]}>
            {line.label ? (
              <Tooltip permanent direction="top" offset={[0, -6]} className="map-walk-label">
                {line.label}
              </Tooltip>
            ) : null}
          </Polyline>
        </Fragment>
      ))}
      {markers.map((marker, i) => (
        <Marker key={i} position={marker.position} icon={pin(marker)} alt={marker.label} title={marker.label}>
          <Tooltip>{marker.label}</Tooltip>
        </Marker>
      ))}
      <FitBounds points={points} />
    </MapContainer>
  );
}
