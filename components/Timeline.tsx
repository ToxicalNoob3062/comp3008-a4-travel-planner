// The list of every walk, bus, train and transfer in a route, with times.
// Used in the Route details popup, the Trip preview screen and the saved-trip page.
import { formatClock, formatTime } from "@/lib/time";
import type { Itinerary } from "@/lib/types";

interface Row {
  time: number;
  text: React.ReactNode;
  label: string;
  last?: boolean;
}

function rows(itinerary: Itinerary, destination: string): Row[] {
  const list: Row[] = itinerary.legs.map((leg) =>
    leg.type === "walk"
      ? {
          time: leg.depart,
          label: `Walk ${leg.minutes} minutes to ${leg.to}`,
          text: (
            <>
              Walk {leg.minutes} min to <strong className="font-semibold">{leg.to}</strong>
            </>
          ),
        }
      : {
          time: leg.depart,
          label: `${leg.lineName} from ${leg.fromStop} to ${leg.toStop}`,
          text: (
            <>
              {leg.lineName} from <strong className="font-semibold">{leg.fromStop}</strong>
              <span className="text-muted"> to {leg.toStop}</span>
            </>
          ),
        },
  );
  list.push({
    time: itinerary.arrive,
    label: `Arrive at ${destination}`,
    last: true,
    text: (
      <>
        Arrive at <strong className="font-semibold">{destination}</strong>
      </>
    ),
  });
  return list;
}

export default function Timeline({ itinerary, destination }: { itinerary: Itinerary; destination: string }) {
  const list = rows(itinerary, destination);
  return (
    <ol className="flex flex-col" aria-label="Route steps">
      {list.map((row, i) => (
        <li key={i} className="flex items-stretch gap-3 text-[15px] text-ink" aria-label={`${formatTime(row.time)}: ${row.label}`}>
          <span className="w-10 shrink-0 pt-px text-sm text-muted tabular-nums" aria-hidden="true">
            {formatClock(row.time)}
          </span>
          <span className="relative flex w-4 shrink-0 justify-center" aria-hidden="true">
            {row.last ? null : <span className="absolute top-3 bottom-[-4px] w-0.5 bg-brand" />}
            <span className={`relative mt-1 h-3.5 w-3.5 rounded-full border-2 border-brand ${row.last ? "bg-brand" : "bg-white"}`} />
          </span>
          <span className="pb-4" aria-hidden="true">
            {row.text}
          </span>
        </li>
      ))}
    </ol>
  );
}
