"use client";

// The bar at the top of every page. The logo and name are a "home" control:
// pressing it clears the planner and goes back to the first screen, from any step or from a saved-route page.
import Image from "next/image";
import Link from "next/link";

/** The planner listens for this event and starts again (see TripPlanner). */
export const RESTART_EVENT = "planner:restart";

export default function AppBar() {
  return (
    <header className="flex h-14 shrink-0 items-center border-b border-[#e4e4e7] bg-white px-4 sm:h-16 sm:px-8">
      <Link
        href="/"
        aria-label="OC Transpo Travel Planner: start a new trip"
        title="Start a new trip"
        onClick={() => window.dispatchEvent(new Event(RESTART_EVENT))}
        className="press focus-ring -mx-2 flex items-center gap-2.5 rounded-lg px-2 py-1 hover:bg-[#f5f5f6] sm:gap-3"
      >
        <Image src="/img/logo-ring.svg" alt="" width={36} height={36} priority className="size-8 sm:size-9" />
        <p className="text-lg whitespace-nowrap sm:text-xl">
          <span className="font-bold text-brand">OC Transpo</span>
          <span aria-hidden="true" className="text-ink">{"  |  "}</span>
          <span className="font-semibold text-ink">Travel Planner</span>
        </p>
      </Link>
    </header>
  );
}
