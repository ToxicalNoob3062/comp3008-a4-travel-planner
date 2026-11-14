// Demo data loaded into SQLite the first time the app runs.
// The network is a small, simplified slice of Ottawa transit. Times are made up
// so the example trip from Assignment 3 (Place d'Orléans -> Carleton, arrive by 5:30 PM) works.
import type { ServiceId } from "./types";

export const WALK_LIMIT_MINUTES = 10;

export interface SeedPlace {
  id: string;
  name: string;
  subtitle: string;
  kind: "street" | "station" | "place";
  lat: number;
  lon: number;
  /** The stop this place is served by (its own id when the place is a stop). */
  stopId: string;
  /** Walking minutes from the place to that stop. */
  walkMinutes: number;
}

export const PLACES: SeedPlace[] = [
  // Stops and stations
  { id: "pdo_stn", name: "Place d'Orléans Station", subtitle: "Bus + O-Train station", kind: "station", lat: 45.479, lon: -75.5169, stopId: "pdo_stn", walkMinutes: 0 },
  { id: "blair", name: "Blair Station", subtitle: "Bus + O-Train station", kind: "station", lat: 45.431, lon: -75.6084, stopId: "blair", walkMinutes: 0 },
  { id: "hurdman", name: "Hurdman Station", subtitle: "Bus + O-Train station", kind: "station", lat: 45.4123, lon: -75.6644, stopId: "hurdman", walkMinutes: 0 },
  { id: "uottawa", name: "uOttawa Station", subtitle: "O-Train station · University of Ottawa", kind: "station", lat: 45.4207, lon: -75.6825, stopId: "uottawa", walkMinutes: 0 },
  { id: "rideau", name: "Rideau Station", subtitle: "O-Train station · Rideau Centre", kind: "station", lat: 45.4263, lon: -75.6916, stopId: "rideau", walkMinutes: 0 },
  { id: "lyon", name: "Lyon Station", subtitle: "O-Train station · Downtown", kind: "station", lat: 45.4185, lon: -75.7049, stopId: "lyon", walkMinutes: 0 },
  { id: "bayview", name: "Bayview Station", subtitle: "O-Train station · Lines 1 and 2", kind: "station", lat: 45.4093, lon: -75.7222, stopId: "bayview", walkMinutes: 0 },
  { id: "tunneys", name: "Tunney's Pasture Station", subtitle: "Bus + O-Train station", kind: "station", lat: 45.4037, lon: -75.7352, stopId: "tunneys", walkMinutes: 0 },
  { id: "carleton", name: "Carleton University", subtitle: "University · O-Train station on campus", kind: "place", lat: 45.3857, lon: -75.696, stopId: "carleton", walkMinutes: 0 },
  { id: "south_keys", name: "South Keys Station", subtitle: "Bus + O-Train station", kind: "station", lat: 45.3536, lon: -75.6551, stopId: "south_keys", walkMinutes: 0 },
  { id: "terry_fox", name: "Terry Fox Station", subtitle: "Bus station · Kanata", kind: "station", lat: 45.3098, lon: -75.9064, stopId: "terry_fox", walkMinutes: 0 },
  { id: "fallowfield", name: "Fallowfield Station", subtitle: "Bus station · Barrhaven", kind: "station", lat: 45.2993, lon: -75.736, stopId: "fallowfield", walkMinutes: 0 },
  { id: "cite", name: "Station de la Cité", subtitle: "STO Rapibus station · Gatineau, Quebec", kind: "station", lat: 45.4689, lon: -75.6945, stopId: "cite", walkMinutes: 0 },
  { id: "lansdowne", name: "Lansdowne Park", subtitle: "Stadium and shops · Bank St bus stop", kind: "place", lat: 45.3984, lon: -75.6835, stopId: "lansdowne", walkMinutes: 0 },

  // Streets and places that are served by a nearby stop
  { id: "pdo_dr", name: "Place d'Orléans Dr", subtitle: "Street · Orléans", kind: "street", lat: 45.4718, lon: -75.5105, stopId: "pdo_stn", walkMinutes: 12 },
  { id: "pdo_mall", name: "Place d'Orléans Shopping Centre", subtitle: "Place · Orléans", kind: "place", lat: 45.4779, lon: -75.5143, stopId: "pdo_stn", walkMinutes: 4 },
  { id: "parliament", name: "Parliament Hill", subtitle: "Place · Downtown", kind: "place", lat: 45.4236, lon: -75.7009, stopId: "lyon", walkMinutes: 7 },
  { id: "rideau_centre", name: "Rideau Centre", subtitle: "Shopping centre · Downtown", kind: "place", lat: 45.4256, lon: -75.6921, stopId: "rideau", walkMinutes: 2 },
  { id: "kanata_centrum", name: "Kanata Centrum", subtitle: "Shopping centre · Kanata", kind: "place", lat: 45.3118, lon: -75.9105, stopId: "terry_fox", walkMinutes: 6 },
  { id: "promenades", name: "Les Promenades Gatineau", subtitle: "Shopping centre · Gatineau, Quebec", kind: "place", lat: 45.4722, lon: -75.6992, stopId: "cite", walkMinutes: 8 },
  { id: "hogs_back", name: "Hog's Back Park", subtitle: "Park · south of Carleton", kind: "place", lat: 45.3716, lon: -75.6976, stopId: "carleton", walkMinutes: 19 },
];

export interface SeedLine {
  id: string;
  name: string;
  service: ServiceId;
  vehicle: "bus" | "train";
  /** Minutes between departures. */
  headway: number;
  /** Minute offset of the first stop's departures within each headway. */
  offset: number;
  /** Service window, minutes after midnight. */
  firstMinute: number;
  lastMinute: number;
  days: "daily" | "weekdays" | "events";
  /** Ordered stops with travel minutes from the previous stop. */
  stops: [stopId: string, minutesFromPrevious: number][];
}

export const LINES: SeedLine[] = [
  {
    id: "line1", name: "O-Train Line 1", service: "regular", vehicle: "train",
    headway: 5, offset: 3, firstMinute: 300, lastMinute: 1439, days: "daily",
    stops: [["blair", 0], ["hurdman", 5], ["uottawa", 2], ["rideau", 2], ["lyon", 2], ["bayview", 3], ["tunneys", 2]],
  },
  {
    id: "line2", name: "O-Train Line 2", service: "regular", vehicle: "train",
    headway: 12, offset: 3, firstMinute: 330, lastMinute: 1410, days: "daily",
    stops: [["bayview", 0], ["carleton", 13], ["south_keys", 9]],
  },
  {
    id: "bus39", name: "Bus 39", service: "regular", vehicle: "bus",
    headway: 15, offset: 12, firstMinute: 300, lastMinute: 1410, days: "daily",
    stops: [["pdo_stn", 0], ["blair", 13]],
  },
  {
    id: "bus10", name: "Bus 10", service: "regular", vehicle: "bus",
    headway: 15, offset: 2, firstMinute: 330, lastMinute: 1380, days: "daily",
    stops: [["lyon", 0], ["carleton", 15]],
  },
  {
    id: "bus6", name: "Bus 6", service: "regular", vehicle: "bus",
    headway: 15, offset: 8, firstMinute: 330, lastMinute: 1410, days: "daily",
    stops: [["rideau", 0], ["lansdowne", 14]],
  },
  {
    id: "bus61", name: "Bus 61", service: "regular", vehicle: "bus",
    headway: 15, offset: 5, firstMinute: 300, lastMinute: 1410, days: "daily",
    stops: [["tunneys", 0], ["terry_fox", 26]],
  },
  {
    id: "bus75", name: "Bus 75", service: "regular", vehicle: "bus",
    headway: 15, offset: 10, firstMinute: 300, lastMinute: 1410, days: "daily",
    stops: [["tunneys", 0], ["fallowfield", 28]],
  },
  {
    id: "sto400", name: "STO 400", service: "sto", vehicle: "bus",
    headway: 20, offset: 4, firstMinute: 330, lastMinute: 1380, days: "daily",
    stops: [["cite", 0], ["lyon", 22]],
  },
  {
    id: "school639", name: "School route 639", service: "school", vehicle: "bus",
    headway: 30, offset: 14, firstMinute: 870, lastMinute: 1050, days: "weekdays",
    stops: [["pdo_stn", 0], ["hurdman", 16]],
  },
  {
    id: "shuttle450", name: "Event shuttle 450", service: "event", vehicle: "bus",
    headway: 10, offset: 0, firstMinute: 900, lastMinute: 1380, days: "events",
    stops: [["blair", 0], ["lansdowne", 20]],
  },
];

/** Dates with a special event at Lansdowne Park, when the event shuttle runs. */
export const EVENT_DATES = ["2026-11-21", "2026-11-28", "2026-12-05"];
