// Mock trip search. It stands in for the real OC Transpo planner service:
// it reads the small demo network from SQLite and works out trips that match the request.
import { getLines, getPlace, isEventDate, toPlace, type PlaceRecord } from "./db";
import { WALK_LIMIT_MINUTES, type SeedLine } from "./seed";
import { dayOfWeek, isValidDate } from "./time";
import type { Itinerary, Leg, RideLeg, SearchRequest, SearchResponse, ServiceId } from "./types";

const TRANSFER_MINUTES = 3;
const MAX_RIDES = 3;
const MAX_RESULTS = 3;
const ALL_SERVICES: ServiceId[] = ["regular", "sto", "school", "event"];

/** One direct ride on a line between two of its stops. */
interface Ride {
  line: SeedLine;
  from: string;
  to: string;
  duration: number;
  /** Departures from `from` happen at minutes where minute % headway === phase. */
  phase: number;
  stops: string[];
}

function buildRides(lines: SeedLine[]): Ride[] {
  const rides: Ride[] = [];
  for (const line of lines) {
    const ids = line.stops.map(([id]) => id);
    // cumulative[i] = minutes from the first stop to stop i
    const cumulative = line.stops.reduce<number[]>((acc, [, m], i) => [...acc, (acc[i - 1] ?? 0) + m], []);
    const total = cumulative[cumulative.length - 1];
    for (let i = 0; i < ids.length; i++) {
      for (let j = 0; j < ids.length; j++) {
        if (i === j) continue;
        const forward = j > i;
        const sinceStart = forward ? cumulative[i] : total - cumulative[i];
        rides.push({
          line,
          from: ids[i],
          to: ids[j],
          duration: Math.abs(cumulative[j] - cumulative[i]),
          phase: (line.offset + sinceStart) % line.headway,
          stops: forward ? ids.slice(i, j + 1) : ids.slice(j, i + 1).reverse(),
        });
      }
    }
  }
  return rides;
}

function runsOn(line: SeedLine, date: string): boolean {
  if (line.days === "daily") return true;
  if (line.days === "weekdays") return dayOfWeek(date) >= 1 && dayOfWeek(date) <= 5;
  return isEventDate(date);
}

/** Every way to get from origin to destination using at most MAX_RIDES rides. */
function findPaths(rides: Ride[], origin: string, destination: string): Ride[][] {
  const paths: Ride[][] = [];
  const walk = (stop: string, path: Ride[], visited: Set<string>) => {
    if (stop === destination) {
      paths.push(path);
      return;
    }
    if (path.length === MAX_RIDES) return;
    for (const ride of rides) {
      if (ride.from !== stop || visited.has(ride.to)) continue;
      if (path.length > 0 && path[path.length - 1].line.id === ride.line.id) continue;
      walk(ride.to, [...path, ride], new Set(visited).add(ride.to));
    }
  };
  walk(origin, [], new Set([origin]));
  return paths;
}

/** Latest departure of this ride that arrives at or before `deadline`. */
function latestDeparture(ride: Ride, deadline: number): number | null {
  const limit = Math.min(deadline - ride.duration, ride.line.lastMinute);
  const depart = limit - ((((limit - ride.phase) % ride.line.headway) + ride.line.headway) % ride.line.headway);
  return depart >= ride.line.firstMinute ? depart : null;
}

/** Earliest departure of this ride at or after `from`. */
function earliestDeparture(ride: Ride, from: number): number | null {
  const start = Math.max(from, ride.line.firstMinute);
  const depart = start + ((((ride.phase - start) % ride.line.headway) + ride.line.headway) % ride.line.headway);
  return depart <= ride.line.lastMinute && depart + ride.duration < 1440 ? depart : null;
}

/** Works out departure times for each ride in a path. Returns null when it cannot be done. */
function schedule(path: Ride[], mode: "arrive" | "leave", time: number): number[] | null {
  const departs: number[] = new Array(path.length);
  if (mode === "arrive") {
    let deadline = time;
    for (let i = path.length - 1; i >= 0; i--) {
      const depart = latestDeparture(path[i], deadline);
      if (depart === null) return null;
      departs[i] = depart;
      deadline = depart - TRANSFER_MINUTES;
    }
  } else {
    let ready = time;
    for (let i = 0; i < path.length; i++) {
      const depart = earliestDeparture(path[i], ready);
      if (depart === null) return null;
      departs[i] = depart;
      ready = depart + path[i].duration + TRANSFER_MINUTES;
    }
  }
  return departs;
}

interface Endpoints {
  from: PlaceRecord;
  to: PlaceRecord;
  originStop: PlaceRecord;
  destinationStop: PlaceRecord;
}

function buildItinerary(
  path: Ride[],
  departs: number[],
  ends: Endpoints,
  request: SearchRequest,
  coords: (stopId: string) => [number, number],
  stopName: (stopId: string) => string,
): Itinerary {
  const legs: Leg[] = [];
  const leave = departs[0] - ends.from.walkMinutes;
  if (ends.from.walkMinutes > 0) {
    legs.push({
      type: "walk",
      from: ends.from.name,
      to: ends.originStop.name,
      depart: leave,
      minutes: ends.from.walkMinutes,
      path: [[ends.from.lat, ends.from.lon], coords(ends.originStop.id)],
    });
  }
  path.forEach((ride, i) => {
    const leg: RideLeg = {
      type: "ride",
      lineName: ride.line.name,
      vehicle: ride.line.vehicle,
      service: ride.line.service,
      fromStop: stopName(ride.from),
      toStop: stopName(ride.to),
      depart: departs[i],
      arrive: departs[i] + ride.duration,
      path: ride.stops.map(coords),
    };
    legs.push(leg);
  });
  const lastRideArrival = departs[path.length - 1] + path[path.length - 1].duration;
  if (ends.to.walkMinutes > 0) {
    legs.push({
      type: "walk",
      from: ends.destinationStop.name,
      to: ends.to.name,
      depart: lastRideArrival,
      minutes: ends.to.walkMinutes,
      path: [coords(ends.destinationStop.id), [ends.to.lat, ends.to.lon]],
    });
  }
  const arrive = lastRideArrival + ends.to.walkMinutes;
  return {
    id: `${leave}-${arrive}-${path.map((r) => r.line.id).join("-")}`,
    leave,
    arrive,
    walkMinutes: ends.from.walkMinutes + ends.to.walkMinutes,
    summary: path.map((r) => r.line.name).join(" → "),
    offsetMinutes: request.mode === "arrive" ? request.time - arrive : leave - request.time,
    legs,
  };
}

function findItineraries(request: SearchRequest, ends: Endpoints, services: ServiceId[]): Itinerary[] {
  const lines = getLines().filter((line) => services.includes(line.service) && runsOn(line, request.date));
  const rides = buildRides(lines);
  const paths = findPaths(rides, ends.originStop.id, ends.destinationStop.id);

  const stopCache = new Map<string, PlaceRecord | null>();
  const stop = (id: string) => {
    if (!stopCache.has(id)) stopCache.set(id, getPlace(id));
    return stopCache.get(id)!;
  };
  const coords = (id: string): [number, number] => [stop(id).lat, stop(id).lon];
  const stopName = (id: string) => stop(id).name;

  const found = new Map<string, Itinerary>();
  for (const path of paths) {
    // Time at the first/last stop, after taking the walk at either end into account.
    let time = request.mode === "arrive" ? request.time - ends.to.walkMinutes : request.time + ends.from.walkMinutes;
    // Take up to three departures of each path so the user has earlier/later options.
    for (let k = 0; k < 3; k++) {
      const departs = schedule(path, request.mode, time);
      if (!departs) break;
      const itinerary = buildItinerary(path, departs, ends, request, coords, stopName);
      if (itinerary.leave < 0) break;
      found.set(itinerary.id, itinerary);
      const last = path.length - 1;
      time = request.mode === "arrive" ? departs[last] + path[last].duration - 1 : departs[0] + 1;
    }
  }

  // Drop trips that are worse in every way (another trip leaves later and arrives earlier).
  const all = [...found.values()];
  const useful = all.filter(
    (a) => !all.some((b) => b !== a && b.leave >= a.leave && b.arrive <= a.arrive && (b.leave > a.leave || b.arrive < a.arrive)),
  );

  if (request.mode === "arrive") {
    // Closest to the deadline first, then show them in time order.
    return useful.sort((a, b) => b.arrive - a.arrive || b.leave - a.leave).slice(0, MAX_RESULTS).reverse();
  }
  return useful.sort((a, b) => a.arrive - b.arrive || b.leave - a.leave).slice(0, MAX_RESULTS);
}

export function searchRoutes(request: SearchRequest): SearchResponse {
  const from = getPlace(request.fromId);
  const to = getPlace(request.toId);
  if (!from || !to) return { ok: false, error: { code: "INVALID", message: "Choose a start and a destination from the list." } };
  if (!isValidDate(request.date)) return { ok: false, error: { code: "INVALID", message: "Choose a valid date." } };
  if (!Number.isInteger(request.time) || request.time < 0 || request.time > 1439) {
    return { ok: false, error: { code: "INVALID", message: "Choose a valid time." } };
  }
  if (request.mode !== "arrive" && request.mode !== "leave") {
    return { ok: false, error: { code: "INVALID", message: "Choose whether to arrive by or leave at a time." } };
  }
  const services = ALL_SERVICES.filter((s) => request.services?.includes(s));
  if (services.length === 0) return { ok: false, error: { code: "INVALID", message: "Choose at least one service." } };

  const originStop = getPlace(from.stopId)!;
  const destinationStop = getPlace(to.stopId)!;
  if (originStop.id === destinationStop.id) {
    return { ok: false, error: { code: "INVALID", message: "Your start and destination are at the same stop. Choose two different places." } };
  }

  // Error path: no stop within the walking limit, unless the user accepted the longer walk.
  for (const which of ["from", "to"] as const) {
    const place = which === "from" ? from : to;
    if (place.walkMinutes > WALK_LIMIT_MINUTES && !request.acceptWalk?.[which]) {
      return {
        ok: false,
        error: {
          code: "NO_STOP_NEARBY",
          which,
          place: toPlace(place),
          stop: toPlace(which === "from" ? originStop : destinationStop),
          walkMinutes: place.walkMinutes,
          limitMinutes: WALK_LIMIT_MINUTES,
        },
      };
    }
  }

  const ends: Endpoints = { from, to, originStop, destinationStop };
  const itineraries = findItineraries(request, ends, services);
  if (itineraries.length === 0) {
    // Recovery hint: would switching one more service on produce a trip?
    const addService = ALL_SERVICES.filter((s) => !services.includes(s)).find(
      (s) => findItineraries(request, ends, [...services, s]).length > 0,
    );
    return { ok: false, error: { code: "NO_ROUTES", addService } };
  }

  // Pre-select the trip closest to the requested time without being late.
  const selected = request.mode === "arrive" ? itineraries[itineraries.length - 1] : itineraries[0];
  return { ok: true, itineraries, selectedId: selected.id, from: toPlace(from), to: toPlace(to) };
}
