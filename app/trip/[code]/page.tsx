// The page a "Send to my phone" link opens: the saved route, read back from SQLite.
import { Suspense } from "react";
import Link from "next/link";
import Timeline from "@/components/Timeline";
import { getSavedTrip } from "@/lib/db";
import { timingNote } from "@/lib/labels";
import { formatDate, formatTime } from "@/lib/time";

async function SavedTripCard({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const trip = getSavedTrip(code);
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
    </>
  );
}

export default function TripPage({ params }: PageProps<"/trip/[code]">) {
  return (
    <section className="flex w-full max-w-[760px] flex-col gap-5 rounded-xl border border-line bg-white p-5 shadow-[0_4px_16px_rgba(0,0,0,0.06)] sm:p-8">
      <Suspense fallback={<p className="text-muted">Loading your route…</p>}>
        <SavedTripCard params={params} />
      </Suspense>
      <Link href="/" className="focus-ring self-start rounded text-sm font-medium text-brand underline">
        Plan another trip
      </Link>
    </section>
  );
}
