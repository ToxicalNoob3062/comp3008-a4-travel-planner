// The page a "Send to my phone" link opens: the saved route, read back from SQLite.
import { Suspense } from "react";
import Link from "next/link";
import MapView from "@/components/map/MapView";
import { savedTripToMap } from "@/components/map/tripToMap";
import MapLegend from "@/components/map/MapLegend";
import Timeline from "@/components/Timeline";
import { getSavedTrip } from "@/lib/db";
import { timingNote } from "@/lib/labels";
import { formatDate, formatTime } from "@/lib/time";
import { tripFromLink } from "@/lib/tripLink";

function readSavedTrip(code: string) {
  try {
    return getSavedTrip(code);
  } catch (error) {
    console.error("Reading the saved trip failed", error);
    return null;
  }
}

async function SavedTripCard({ params, searchParams }: Pick<PageProps<"/trip/[code]">, "params" | "searchParams">) {
  const { code } = await params;
  // SQLite first; if the row is not there (temporary storage on Vercel), use the copy carried in the link.
  const trip = readSavedTrip(code) ?? tripFromLink((await searchParams).d, code);
  if (!trip) {
    return (
      <>
        <h1 className="text-[28px] font-medium text-ink">We couldn&apos;t find that trip</h1>
        <p className="text-base text-muted">
          The reference {code.toUpperCase()} does not match a saved route. It may have expired. Plan the trip again to get a new link.
        </p>
      </>
    );
  }
  const { itinerary } = trip;
  const map = savedTripToMap(itinerary, trip.fromName, trip.toName);
  return (
    <>
      <p className="text-sm font-medium text-brand">Sent to your phone · Reference {trip.code}</p>
      <h1 className="text-[28px] font-medium text-ink">
        Leave {formatTime(itinerary.leave)} → Arrive {formatTime(itinerary.arrive)}
      </h1>
      <p className="text-sm text-muted">
        {trip.fromName} → {trip.toName} · {formatDate(trip.date)} · {itinerary.arrive - itinerary.leave} min · walking{" "}
        {itinerary.walkMinutes} min · {timingNote(itinerary, trip.mode)}
      </p>
      <Timeline itinerary={itinerary} destination={trip.toName} />
      {map ? (
        <div className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-ink">Map of your route</h2>
          <MapView
            className="h-[320px]"
            description={`Map of the route from ${trip.fromName} (A) to ${trip.toName} (B). The same steps are listed above.`}
            markers={map.markers}
            lines={map.lines}
          />
          <MapLegend />
        </div>
      ) : null}
    </>
  );
}

export default function TripPage({ params, searchParams }: PageProps<"/trip/[code]">) {
  return (
    <section className="flex w-full max-w-[760px] flex-col gap-5 rounded-xl border border-line bg-white p-5 shadow-[0_4px_16px_rgba(0,0,0,0.06)] sm:p-8">
      <Suspense fallback={<p className="text-muted">Loading your route…</p>}>
        <SavedTripCard params={params} searchParams={searchParams} />
      </Suspense>
      <Link href="/" className="focus-ring self-start rounded text-sm font-medium text-brand underline">
        Plan another trip
      </Link>
    </section>
  );
}
