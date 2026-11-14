"use client";

// Route details popup: every walk, bus, train and transfer for one route.
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import Close from "@mui/icons-material/Close";
import Timeline from "@/components/Timeline";
import { formatDateShort, formatTime } from "@/lib/time";
import type { Itinerary } from "@/lib/types";

interface RouteDetailsDialogProps {
  itinerary: Itinerary | null;
  date: string;
  destination: string;
  timingNote: string;
  sending: boolean;
  onClose: () => void;
  onPreview: () => void;
  onSend: () => void;
}

export default function RouteDetailsDialog({ itinerary, date, destination, timingNote, sending, onClose, onPreview, onSend }: RouteDetailsDialogProps) {
  return (
    <Dialog open={!!itinerary} onClose={onClose} aria-labelledby="route-details-title" maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 3, m: { xs: 2, sm: 4 }, width: { xs: "calc(100% - 32px)", sm: "calc(100% - 64px)" } } } }}>
      {itinerary ? (
        <div className="flex flex-col gap-3 p-4 sm:gap-4 sm:p-6">
          <div className="flex items-start gap-4">
            <h2 id="route-details-title" className="flex-1 text-xl font-medium text-ink sm:text-2xl">
              Leave {formatTime(itinerary.leave)} <span aria-hidden="true">→</span>
              <span className="visually-hidden">, </span> Arrive {formatTime(itinerary.arrive)}
            </h2>
            <IconButton aria-label="Close route details" onClick={onClose} sx={{ bgcolor: "primary.main", color: "#fff", "&:hover": { bgcolor: "primary.dark" }, width: 36, height: 36 }}>
              <Close fontSize="small" />
            </IconButton>
          </div>
          <p className="text-[13px] text-muted sm:text-sm">
            {formatDateShort(date)} · {itinerary.arrive - itinerary.leave} min · walking {itinerary.walkMinutes} min · {timingNote}
          </p>
          <Timeline itinerary={itinerary} destination={destination} />
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-between sm:gap-3">
            <Button variant="contained" onClick={onPreview} disabled={sending}>
              Trip preview
            </Button>
            <Button variant="contained" onClick={onSend} disabled={sending} endIcon={sending ? <CircularProgress size={16} color="inherit" /> : null}>
              {sending ? "Sending…" : "Send to my phone"}
            </Button>
          </div>
        </div>
      ) : null}
    </Dialog>
  );
}
