// Shared types used by the UI, the API routes and the data layer.

export type ServiceId = "regular" | "sto" | "school" | "event";
export type TimeMode = "arrive" | "leave";
export type Meridiem = "AM" | "PM";

export interface Place {
  id: string;
  name: string;
  /** Short description shown under the name in the suggestions list. */
  subtitle: string;
  kind: "street" | "station" | "place";
  lat: number;
  lon: number;
}

export interface RideLeg {
  type: "ride";
  lineName: string;
  vehicle: "bus" | "train";
  service: ServiceId;
  fromStop: string;
  toStop: string;
  /** Minutes after midnight. */
  depart: number;
  arrive: number;
  /** Stop coordinates along the ride, used to draw the map line. */
  path: [number, number][];
}

export interface WalkLeg {
  type: "walk";
  from: string;
  to: string;
  depart: number;
  minutes: number;
  path: [number, number][];
}

export type Leg = RideLeg | WalkLeg;

export interface Itinerary {
  id: string;
  /** Minutes after midnight. */
  leave: number;
  arrive: number;
  walkMinutes: number;
  /** e.g. "Bus 39 → O-Train Line 1 → O-Train Line 2" */
  summary: string;
  /** Minutes between this trip and the requested time (early for arrive-by, wait for leave-at). */
  offsetMinutes: number;
  legs: Leg[];
}

export interface SearchRequest {
  fromId: string;
  toId: string;
  mode: TimeMode;
  /** YYYY-MM-DD */
  date: string;
  /** Minutes after midnight. */
  time: number;
  services: ServiceId[];
  /** Set when the user accepted a stop beyond the walking limit. */
  acceptWalk?: { from?: boolean; to?: boolean };
}

export type SearchError =
  | {
      code: "NO_STOP_NEARBY";
      which: "from" | "to";
      place: Place;
      stop: Place;
      walkMinutes: number;
      limitMinutes: number;
    }
  | {
      code: "NO_ROUTES";
      /** A service that would produce routes if it were switched on. */
      addService?: ServiceId;
    }
  | { code: "INVALID" | "SERVER"; message: string };

export type SearchResponse =
  | {
      ok: true;
      itineraries: Itinerary[];
      /** The trip to pre-select: closest to the requested time without being late. */
      selectedId: string;
      from: Place;
      to: Place;
    }
  | { ok: false; error: SearchError };

export interface SavedTrip {
  code: string;
  createdAt: string;
  fromName: string;
  toName: string;
  date: string;
  mode: TimeMode;
  time: number;
  itinerary: Itinerary;
}
