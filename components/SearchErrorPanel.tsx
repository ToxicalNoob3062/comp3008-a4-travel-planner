"use client";

// Error and recovery path. Shown on the Review screen, right where the user clicked "Find my routes".
// It says what went wrong in plain words and offers a one-click fix.
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Button from "@mui/material/Button";
import ChevronRight from "@mui/icons-material/ChevronRight";
import { serviceLabel } from "@/lib/services";
import type { SearchError, ServiceId } from "@/lib/types";

interface SearchErrorPanelProps {
  error: SearchError;
  busy: boolean;
  onUseStop: () => void;
  onAddService: (service: ServiceId) => void;
  onRetry: () => void;
  onEdit: (step: "where" | "when" | "services") => void;
}

/** Simple picture of the cause: the stop sits outside the walking-limit circle. */
function WalkRadiusDiagram({ walkMinutes, limitMinutes, which }: { walkMinutes: number; limitMinutes: number; which: "from" | "to" }) {
  const limitRadius = 28;
  // Drawn a little further out than true scale so the stop is clearly outside the limit.
  const stopDistance = Math.min(54, Math.max(limitRadius + 14, (limitRadius * walkMinutes) / limitMinutes));
  const cx = 84;
  const cy = 70;
  const sx = cx + stopDistance * Math.cos(-Math.PI / 4);
  const sy = cy + stopDistance * Math.sin(-Math.PI / 4);
  return (
    <svg viewBox="0 0 200 140" className="h-[140px] w-[200px] rounded-lg border border-line bg-white" aria-hidden="true">
      <circle cx={cx} cy={cy} r={stopDistance} fill="#fdeded" stroke="#d32f2f" strokeDasharray="4 3" opacity="0.6" />
      <circle cx={cx} cy={cy} r={limitRadius} fill="#fbdcdc" stroke="#d32f2f" strokeDasharray="4 3" />
      <line x1={cx} y1={cy} x2={sx} y2={sy} stroke="#d32f2f" strokeWidth="2" strokeDasharray="2 3" />
      <circle cx={cx} cy={cy} r="5" fill="#d32f2f" />
      <rect x={sx - 5} y={sy - 5} width="10" height="10" rx="2" fill="#1976d2" />
      <text x={cx} y={cy + 16} textAnchor="middle" fontSize="10" fill="#d32f2f">
        {which === "from" ? "Start" : "End"}
      </text>
      <text x={sx + 9} y={sy + 3} fontSize="10" fill="#1976d2">
        Stop · {walkMinutes} min
      </text>
      <text x={cx} y={cy + stopDistance + 12} textAnchor="middle" fontSize="9" fill="#d32f2f">
        {limitMinutes}-min limit
      </text>
    </svg>
  );
}

function SuggestedFix({ title, text, action }: { title: string; text: string; action: React.ReactNode }) {
  return (
    <>
      <p className="text-[11px] font-semibold tracking-[0.88px] text-[#d32f2f]">SUGGESTED FIX</p>
      <div className="flex flex-wrap items-center gap-3.5 rounded-[10px] border border-[rgba(211,47,47,0.35)] bg-white py-3.5 pr-3.5 pl-4 shadow-[0_2px_6px_rgba(0,0,0,0.08)]">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[rgba(25,118,210,0.12)]" aria-hidden="true">
          <span className="size-3.5 rounded-[2px] bg-[#1976d2]" />
        </span>
        <span className="flex min-w-[140px] flex-1 flex-col gap-[3px]">
          <span className="text-[15px] font-semibold text-[#212121]">{title}</span>
          <span className="text-xs text-muted">{text}</span>
        </span>
        {action}
      </div>
    </>
  );
}

export default function SearchErrorPanel({ error, busy, onUseStop, onAddService, onRetry, onEdit }: SearchErrorPanelProps) {
  if (error.code === "NO_STOP_NEARBY") {
    const end = error.which === "from" ? "start" : "destination";
    const over = error.walkMinutes - error.limitMinutes;
    return (
      <div className="flex flex-wrap items-start gap-5">
        <div className="flex min-w-[260px] flex-1 flex-col gap-2">
          <Alert severity="error" variant="outlined" sx={{ bgcolor: "#fdeded", borderColor: "#d32f2f", borderRadius: 2 }}>
            <AlertTitle sx={{ fontWeight: 500 }}>We couldn&apos;t find a stop near your {end}</AlertTitle>
            No stop is within your {error.limitMinutes}-min walking limit of {error.place.name}. We widened the search: the
            closest stop is {error.stop.name}, a {error.walkMinutes}-min walk.
          </Alert>
          <SuggestedFix
            title={error.stop.name}
            text={`Nearest stop · ${error.walkMinutes}-min walk (${over} min over your limit)`}
            action={
              <Button variant="contained" endIcon={<ChevronRight />} onClick={onUseStop} disabled={busy}>
                Use this stop
              </Button>
            }
          />
          <div>
            <Button onClick={() => onEdit("where")} disabled={busy}>
              Change {end} location instead
            </Button>
          </div>
        </div>
        <figure className="flex flex-col gap-1.5">
          <WalkRadiusDiagram walkMinutes={error.walkMinutes} limitMinutes={error.limitMinutes} which={error.which} />
          <figcaption className="w-[210px] text-xs leading-normal text-muted">
            <span className="text-[#d32f2f]">●</span> Your {end}: {error.place.name}
            <br />
            <span className="text-[#d32f2f]">○</span> {error.limitMinutes}-min walking limit
            <br />
            <span className="text-[#1976d2]">■</span> Nearest stop: {error.stop.name}
          </figcaption>
        </figure>
      </div>
    );
  }

  if (error.code === "NO_ROUTES") {
    const service = error.addService;
    return (
      <div className="flex flex-col gap-2">
        <Alert severity="error" variant="outlined" sx={{ bgcolor: "#fdeded", borderColor: "#d32f2f", borderRadius: 2 }}>
          <AlertTitle sx={{ fontWeight: 500 }}>We couldn&apos;t find any routes for this trip</AlertTitle>
          {service
            ? `None of the services you chose connect these two places at that time. ${serviceLabel(service)} would.`
            : "No service runs between these two places at that time, even with every service switched on. Transit runs from about 5 AM to midnight."}
        </Alert>
        {service ? (
          <SuggestedFix
            title={`Add ${serviceLabel(service)}`}
            text="Your other answers stay the same."
            action={
              <Button variant="contained" endIcon={<ChevronRight />} onClick={() => onAddService(service)} disabled={busy}>
                Add and search again
              </Button>
            }
          />
        ) : (
          <SuggestedFix
            title="Try a different time"
            text="Your other answers stay the same."
            action={
              <Button variant="contained" endIcon={<ChevronRight />} onClick={() => onEdit("when")} disabled={busy}>
                Change time
              </Button>
            }
          />
        )}
      </div>
    );
  }

  return (
    <Alert
      severity="error"
      variant="outlined"
      sx={{ bgcolor: "#fdeded", borderColor: "#d32f2f", borderRadius: 2 }}
      action={
        <Button color="inherit" onClick={onRetry} disabled={busy}>
          Try again
        </Button>
      }
    >
      <AlertTitle sx={{ fontWeight: 500 }}>The search didn&apos;t finish</AlertTitle>
      {error.message} Your answers are still here.
    </Alert>
  );
}
