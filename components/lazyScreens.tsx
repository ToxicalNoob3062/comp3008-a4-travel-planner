"use client";

// Every screen after the start screen is loaded on demand, so the first page only downloads what it shows.
// To keep clicks instant, `preloadScreens()` fetches them all in the background as soon as the browser is idle.
import dynamic from "next/dynamic";

/** Shown for the moment a screen's code is still arriving (normally never seen, because of the preload). */
function ScreenLoading() {
  return (
    <section
      aria-busy="true"
      aria-label="Loading"
      className="min-h-[600px] w-full max-w-[760px] rounded-xl border border-line bg-white shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
    />
  );
}

// next/dynamic needs each import and its options written out in place, so they are not built from a list.
export const WhereStep = dynamic(() => import("@/components/steps/WhereStep"), { loading: ScreenLoading });
export const WhenStep = dynamic(() => import("@/components/steps/WhenStep"), { loading: ScreenLoading });
export const ServicesStep = dynamic(() => import("@/components/steps/ServicesStep"), { loading: ScreenLoading });
export const ReviewStep = dynamic(() => import("@/components/steps/ReviewStep"), { loading: ScreenLoading });
export const ResultsScreen = dynamic(() => import("@/components/steps/ResultsScreen"), { loading: ScreenLoading });
export const TripPreview = dynamic(() => import("@/components/steps/TripPreview"), { loading: ScreenLoading });
// The dialog has nothing to show while it loads.
export const RouteDetailsDialog = dynamic(() => import("@/components/RouteDetailsDialog"), { loading: () => null });

// The same files, in the order the user reaches them, for the background preload.
const loaders: (() => Promise<unknown>)[] = [
  () => import("@/components/steps/WhereStep"),
  () => import("@/components/steps/WhenStep"),
  () => import("@/components/steps/ServicesStep"),
  () => import("@/components/steps/ReviewStep"),
  () => import("@/components/steps/ResultsScreen"),
  () => import("@/components/RouteDetailsDialog"),
  () => import("@/components/steps/TripPreview"),
];

/** Downloads every screen in the background, in the order the user will reach them. */
export function preloadScreens() {
  const run = async () => {
    for (const load of loaders) {
      // A failed download is not a problem here: the screen is fetched again when it is needed.
      await load().catch(() => undefined);
    }
  };
  if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(() => void run(), { timeout: 2000 });
  else setTimeout(() => void run(), 300);
}
