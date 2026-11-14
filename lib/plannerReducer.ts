// All interface state for the planner lives in one reducer.
// Components dispatch actions; nothing else changes the state.
import { RECOMMENDED_SERVICES } from "./services";
import { fromMinutes, isValidDate, toMinutes } from "./time";
import type { Itinerary, Meridiem, Place, SearchError, SearchRequest, ServiceId, TimeMode } from "./types";

export type Screen = "start" | "where" | "when" | "services" | "review" | "results" | "preview";
export type EditableStep = "where" | "when" | "services";

/** A stop beyond the walking limit that the user agreed to walk to. */
export interface AcceptedStop {
  stopName: string;
  walkMinutes: number;
}

export interface PlannerState {
  screen: Screen;
  /** True when a step was opened with "Edit" on the Review screen, so it returns there. */
  editing: boolean;
  from: Place | null;
  to: Place | null;
  mode: TimeMode | null;
  date: string;
  hour: string;
  minute: string;
  meridiem: Meridiem | null;
  services: Record<ServiceId, boolean>;
  acceptedStops: { from: AcceptedStop | null; to: AcceptedStop | null };
  search: { status: "idle" | "loading" } | { status: "error"; error: SearchError };
  results: Itinerary[];
  selectedId: string | null;
  /** The route shown in the details popup, if it is open. */
  detailsId: string | null;
  /** A message shown on the Results screen when an earlier/later search finds nothing. */
  notice: string | null;
  send:
    | { status: "idle" | "sending" }
    | { status: "sent"; code: string; itineraryId: string }
    | { status: "error"; message: string };
}

export const initialState: PlannerState = {
  screen: "start",
  editing: false,
  from: null,
  to: null,
  mode: null,
  date: "",
  hour: "",
  minute: "",
  meridiem: null,
  services: { ...RECOMMENDED_SERVICES },
  acceptedStops: { from: null, to: null },
  search: { status: "idle" },
  results: [],
  selectedId: null,
  detailsId: null,
  notice: null,
  send: { status: "idle" },
};

export type Action =
  | { type: "GO"; screen: Screen }
  | { type: "EDIT"; step: EditableStep }
  | { type: "SET_PLACE"; which: "from" | "to"; place: Place | null }
  | { type: "SET_MODE"; mode: TimeMode }
  | { type: "SET_FIELD"; field: "date" | "hour" | "minute"; value: string }
  | { type: "SET_MERIDIEM"; meridiem: Meridiem }
  | { type: "TOGGLE_SERVICE"; service: ServiceId }
  | { type: "USE_RECOMMENDED" }
  | { type: "ADD_SERVICE"; service: ServiceId }
  | { type: "ACCEPT_STOP"; which: "from" | "to"; stop: AcceptedStop }
  | { type: "SEARCH_START" }
  | { type: "SEARCH_SUCCESS"; itineraries: Itinerary[]; selectedId: string; time: number }
  | { type: "SEARCH_ERROR"; error: SearchError }
  | { type: "SHIFT_FAILED"; notice: string }
  | { type: "SELECT_ROUTE"; id: string }
  | { type: "OPEN_DETAILS"; id: string }
  | { type: "CLOSE_DETAILS" }
  | { type: "SEND_START" }
  | { type: "SEND_SUCCESS"; code: string; itineraryId: string }
  | { type: "SEND_ERROR"; message: string }
  | { type: "RESET" };

/** Any change to the trip makes an earlier search error out of date. */
const cleared = { search: { status: "idle" } as const, notice: null };

export function plannerReducer(state: PlannerState, action: Action): PlannerState {
  switch (action.type) {
    case "GO":
      return { ...state, screen: action.screen, editing: false, detailsId: null };
    case "EDIT":
      return { ...state, screen: action.step, editing: true };
    case "SET_PLACE":
      return {
        ...state,
        ...cleared,
        [action.which]: action.place,
        acceptedStops: { ...state.acceptedStops, [action.which]: null },
      };
    case "SET_MODE":
      return { ...state, ...cleared, mode: action.mode };
    case "SET_FIELD":
      return { ...state, ...cleared, [action.field]: action.value };
    case "SET_MERIDIEM":
      return { ...state, ...cleared, meridiem: action.meridiem };
    case "TOGGLE_SERVICE":
      return { ...state, ...cleared, services: { ...state.services, [action.service]: !state.services[action.service] } };
    case "USE_RECOMMENDED":
      return { ...state, ...cleared, services: { ...RECOMMENDED_SERVICES } };
    case "ADD_SERVICE":
      return { ...state, services: { ...state.services, [action.service]: true } };
    case "ACCEPT_STOP":
      return { ...state, acceptedStops: { ...state.acceptedStops, [action.which]: action.stop } };
    case "SEARCH_START":
      return { ...state, search: { status: "loading" }, notice: null };
    case "SEARCH_SUCCESS":
      return {
        ...state,
        ...fromMinutes(action.time),
        screen: "results",
        editing: false,
        search: { status: "idle" },
        results: action.itineraries,
        selectedId: action.selectedId,
        detailsId: null,
        notice: null,
        send: { status: "idle" },
      };
    case "SEARCH_ERROR":
      return { ...state, screen: "review", search: { status: "error", error: action.error } };
    case "SHIFT_FAILED":
      return { ...state, search: { status: "idle" }, notice: action.notice };
    case "SELECT_ROUTE":
      return {
        ...state,
        selectedId: action.id,
        // A confirmation only applies to the route that was sent.
        send: state.send.status === "sent" && state.send.itineraryId !== action.id ? { status: "idle" } : state.send,
      };
    case "OPEN_DETAILS":
      return plannerReducer({ ...state, detailsId: action.id }, { type: "SELECT_ROUTE", id: action.id });
    case "CLOSE_DETAILS":
      return { ...state, detailsId: null };
    case "SEND_START":
      return { ...state, send: { status: "sending" } };
    case "SEND_SUCCESS":
      return { ...state, screen: "results", detailsId: null, send: { status: "sent", code: action.code, itineraryId: action.itineraryId } };
    case "SEND_ERROR":
      return { ...state, screen: "results", detailsId: null, send: { status: "error", message: action.message } };
    case "RESET":
      return initialState;
  }
}

// ---------- Derived values (selectors) ----------

/** The requested time in minutes after midnight, or null while the fields are incomplete. */
export function requestedTime(state: PlannerState): number | null {
  return toMinutes(state.hour, state.minute, state.meridiem);
}

export function isWhereComplete(state: PlannerState): boolean {
  return !!state.from && !!state.to && state.from.id !== state.to.id;
}

export function isWhenComplete(state: PlannerState): boolean {
  return state.mode !== null && isValidDate(state.date) && requestedTime(state) !== null;
}

export function selectedServices(state: PlannerState): ServiceId[] {
  return (Object.keys(state.services) as ServiceId[]).filter((id) => state.services[id]);
}

export function isServicesComplete(state: PlannerState): boolean {
  return selectedServices(state).length > 0;
}

/** Builds the search request from the answers. Returns null if a step is incomplete. */
export function buildSearchRequest(state: PlannerState): SearchRequest | null {
  const time = requestedTime(state);
  if (!isWhereComplete(state) || !isWhenComplete(state) || !isServicesComplete(state) || time === null) return null;
  return {
    fromId: state.from!.id,
    toId: state.to!.id,
    mode: state.mode!,
    date: state.date,
    time,
    services: selectedServices(state),
    acceptWalk: { from: !!state.acceptedStops.from, to: !!state.acceptedStops.to },
  };
}
