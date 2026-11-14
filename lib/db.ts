// SQLite storage. Uses Node's built-in `node:sqlite`, so there is nothing extra to install.
// The database file is created and seeded automatically the first time it is opened.
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { EVENT_DATES, LINES, PLACES, type SeedLine, type SeedPlace } from "./seed";
import type { Place, SavedTrip } from "./types";

// On Vercel only /tmp is writable, so the file lives there (it is re-seeded on a cold start).
const DB_FILE = process.env.VERCEL
  ? "/tmp/planner.db"
  : path.join(process.cwd(), "data", "planner.db");

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS places (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    kind TEXT NOT NULL,
    lat REAL NOT NULL,
    lon REAL NOT NULL,
    stop_id TEXT NOT NULL,
    walk_minutes INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS lines (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    service TEXT NOT NULL,
    vehicle TEXT NOT NULL,
    headway INTEGER NOT NULL,
    offset_minutes INTEGER NOT NULL,
    first_minute INTEGER NOT NULL,
    last_minute INTEGER NOT NULL,
    days TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS line_stops (
    line_id TEXT NOT NULL,
    seq INTEGER NOT NULL,
    stop_id TEXT NOT NULL,
    minutes_from_previous INTEGER NOT NULL,
    PRIMARY KEY (line_id, seq)
  );
  CREATE TABLE IF NOT EXISTS event_dates (date TEXT PRIMARY KEY);
  CREATE TABLE IF NOT EXISTS saved_trips (
    code TEXT PRIMARY KEY,
    created_at TEXT NOT NULL,
    payload TEXT NOT NULL
  );
`;

let db: DatabaseSync | null = null;

function seed(database: DatabaseSync) {
  const insertPlace = database.prepare(
    "INSERT INTO places (id, name, subtitle, kind, lat, lon, stop_id, walk_minutes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
  );
  const insertLine = database.prepare(
    "INSERT INTO lines (id, name, service, vehicle, headway, offset_minutes, first_minute, last_minute, days) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
  );
  const insertStop = database.prepare(
    "INSERT INTO line_stops (line_id, seq, stop_id, minutes_from_previous) VALUES (?, ?, ?, ?)",
  );
  const insertEvent = database.prepare("INSERT INTO event_dates (date) VALUES (?)");

  database.exec("BEGIN");
  for (const p of PLACES) {
    insertPlace.run(p.id, p.name, p.subtitle, p.kind, p.lat, p.lon, p.stopId, p.walkMinutes);
  }
  for (const line of LINES) {
    insertLine.run(line.id, line.name, line.service, line.vehicle, line.headway, line.offset, line.firstMinute, line.lastMinute, line.days);
    line.stops.forEach(([stopId, minutes], seq) => insertStop.run(line.id, seq, stopId, minutes));
  }
  for (const date of EVENT_DATES) insertEvent.run(date);
  database.exec("COMMIT");
}

export function getDb(): DatabaseSync {
  if (db) return db;
  fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
  const database = new DatabaseSync(DB_FILE);
  database.exec(SCHEMA);
  const { count } = database.prepare("SELECT COUNT(*) AS count FROM places").get() as { count: number };
  if (count === 0) seed(database);
  db = database;
  return database;
}

// ---------- Places ----------

interface PlaceRow {
  id: string;
  name: string;
  subtitle: string;
  kind: SeedPlace["kind"];
  lat: number;
  lon: number;
  stop_id: string;
  walk_minutes: number;
}

export interface PlaceRecord extends Place {
  stopId: string;
  walkMinutes: number;
}

function toPlaceRecord(row: PlaceRow): PlaceRecord {
  return {
    id: row.id,
    name: row.name,
    subtitle: row.subtitle,
    kind: row.kind,
    lat: row.lat,
    lon: row.lon,
    stopId: row.stop_id,
    walkMinutes: row.walk_minutes,
  };
}

export function toPlace(record: PlaceRecord): Place {
  return { id: record.id, name: record.name, subtitle: record.subtitle, kind: record.kind, lat: record.lat, lon: record.lon };
}

/** Removes accents and case so "orleans" matches "Orléans". */
function normalise(text: string): string {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

export function searchPlaces(query: string): Place[] {
  const rows = getDb().prepare("SELECT * FROM places ORDER BY name").all() as unknown as PlaceRow[];
  const q = normalise(query);
  return rows
    .filter((row) => q === "" || normalise(`${row.name} ${row.subtitle}`).includes(q))
    .map((row) => toPlace(toPlaceRecord(row)));
}

export function getPlace(id: string): PlaceRecord | null {
  const row = getDb().prepare("SELECT * FROM places WHERE id = ?").get(id) as unknown as PlaceRow | undefined;
  return row ? toPlaceRecord(row) : null;
}

// ---------- Transit network ----------

export function getLines(): SeedLine[] {
  const database = getDb();
  const lines = database.prepare("SELECT * FROM lines").all() as unknown as {
    id: string; name: string; service: SeedLine["service"]; vehicle: SeedLine["vehicle"];
    headway: number; offset_minutes: number; first_minute: number; last_minute: number; days: SeedLine["days"];
  }[];
  const stops = database.prepare("SELECT * FROM line_stops ORDER BY line_id, seq").all() as unknown as {
    line_id: string; stop_id: string; minutes_from_previous: number;
  }[];
  return lines.map((line) => ({
    id: line.id,
    name: line.name,
    service: line.service,
    vehicle: line.vehicle,
    headway: line.headway,
    offset: line.offset_minutes,
    firstMinute: line.first_minute,
    lastMinute: line.last_minute,
    days: line.days,
    stops: stops.filter((s) => s.line_id === line.id).map((s) => [s.stop_id, s.minutes_from_previous]),
  }));
}

export function isEventDate(date: string): boolean {
  return getDb().prepare("SELECT 1 FROM event_dates WHERE date = ?").get(date) !== undefined;
}

// ---------- Saved trips ("Send to my phone") ----------

export function saveTrip(trip: Omit<SavedTrip, "code" | "createdAt">): SavedTrip {
  const database = getDb();
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const insert = database.prepare("INSERT OR IGNORE INTO saved_trips (code, created_at, payload) VALUES (?, ?, ?)");
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = Array.from({ length: 6 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
    const saved: SavedTrip = { ...trip, code, createdAt: new Date().toISOString() };
    const result = insert.run(code, saved.createdAt, JSON.stringify(saved));
    if (result.changes === 1) return saved;
  }
  throw new Error("Could not create a unique trip code");
}

export function getSavedTrip(code: string): SavedTrip | null {
  const row = getDb().prepare("SELECT payload FROM saved_trips WHERE code = ?").get(code.toUpperCase()) as
    | { payload: string }
    | undefined;
  return row ? (JSON.parse(row.payload) as SavedTrip) : null;
}
