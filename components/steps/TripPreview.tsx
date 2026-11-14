"use client";

// Trip preview: the whole journey on a map, next to the list of steps.
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import MapView from "@/components/map/MapView";
import { itineraryToMap } from "@/components/map/tripToMap";
import StepCard from "@/components/StepCard";
import Timeline from "@/components/Timeline";
import { formatDateShort, formatTime } from "@/lib/time";
import type { Itinerary, Place } from "@/lib/types";

interface TripPreviewProps {
  itinerary: Itinerary;
  from: Place;
  to: Place;
  date: string;
  sending: boolean;
  onBack: () => void;
  onSend: () => void;
}

const LEGEND: { label: string; className: string }[] = [
  { label: "Walk", className: "border-t-4 border-dotted border-ink" },
  { label: "Bus", className: "border-t-4 border-[#1976d2]" },
  { label: "O-Train", className: "border-t-4 border-brand" },
];

export default function TripPreview({ itinerary, from, to, date, sending, onBack, onSend }: TripPreviewProps) {
  const { markers, lines } = itineraryToMap(itinerary, from, to);
  return (
    <StepCard
      title="Trip preview"
      actions={
        <>
          <Button variant="outlined" size="large" startIcon={<ChevronLeft />} onClick={onBack} disabled={sending}>
            Back
          </Button>
          <Button variant="contained" size="large" onClick={onSend} disabled={sending} endIcon={sending ? <CircularProgress size={18} color="inherit" /> : null}>
            {sending ? "Sending…" : "Send to my phone"}
          </Button>
        </>
      }
    >
      <p className="-mt-3 text-sm text-muted">
        {formatDateShort(date)} · Leave {formatTime(itinerary.leave)} → Arrive {formatTime(itinerary.arrive)} · {itinerary.summary}
      </p>
      <div className="flex flex-col gap-5 md:flex-row">
        <div className="md:w-[250px] md:shrink-0">
          <Timeline itinerary={itinerary} destination={to.name} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <MapView
            className="h-[340px]"
            description={`Map of the route from ${from.name} (A) to ${to.name} (B). The same steps are listed beside the map.`}
            markers={markers}
            lines={lines}
          />
          <ul className="flex flex-wrap gap-4 text-xs text-muted" aria-label="Map legend">
            {LEGEND.map((item) => (
              <li key={item.label} className="flex items-center gap-2">
                <span className={`inline-block w-7 ${item.className}`} aria-hidden="true" />
                {item.label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </StepCard>
  );
}
