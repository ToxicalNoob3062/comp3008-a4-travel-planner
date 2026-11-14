"use client";

// Trip preview: the whole journey on a map, next to the list of steps.
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import MapLegend from "@/components/map/MapLegend";
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
          <MapLegend />
        </div>
      </div>
    </StepCard>
  );
}
