"use client";

// The planner: owns the state (one reducer), talks to the API, and shows the current screen.
import { useCallback, useEffect, useReducer, useRef } from "react";
import RouteDetailsDialog from "@/components/RouteDetailsDialog";
import ResultsScreen from "@/components/steps/ResultsScreen";
import ReviewStep from "@/components/steps/ReviewStep";
import ServicesStep from "@/components/steps/ServicesStep";
import StartScreen from "@/components/steps/StartScreen";
import TripPreview from "@/components/steps/TripPreview";
import WhenStep from "@/components/steps/WhenStep";
import WhereStep from "@/components/steps/WhereStep";
import { searchRoutes, sendTrip } from "@/lib/api";
import { shiftLabel, timingNote } from "@/lib/labels";
import { buildSearchRequest, initialState, plannerReducer } from "@/lib/plannerReducer";
import type { SearchRequest, ServiceId } from "@/lib/types";

export default function TripPlanner() {
  const [state, dispatch] = useReducer(plannerReducer, initialState);

  // Accessibility: when the screen changes, move keyboard focus to its heading
  // so screen-reader and keyboard users start at the top of the new step.
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    document.querySelector<HTMLElement>("[data-screen-heading]")?.focus();
    window.scrollTo({ top: 0 });
  }, [state.screen]);

  /** Runs a search. `changes` holds answers that were changed in the same click (state updates are not instant). */
  const runSearch = useCallback(
    async (changes: Partial<SearchRequest> = {}, failureNotice?: string) => {
      const base = buildSearchRequest(state);
      if (!base) return;
      const request: SearchRequest = { ...base, ...changes };
      dispatch({ type: "SEARCH_START" });
      const result = await searchRoutes(request);
      if (result.ok) {
        dispatch({ type: "SEARCH_SUCCESS", itineraries: result.itineraries, selectedId: result.selectedId, time: request.time });
      } else if (failureNotice) {
        dispatch({ type: "SHIFT_FAILED", notice: failureNotice });
      } else {
        dispatch({ type: "SEARCH_ERROR", error: result.error });
      }
    },
    [state],
  );

  // Recovery: accept the suggested stop beyond the walking limit, then search again.
  const acceptSuggestedStop = () => {
    if (state.search.status !== "error" || state.search.error.code !== "NO_STOP_NEARBY") return;
    const { which, stop, walkMinutes } = state.search.error;
    dispatch({ type: "ACCEPT_STOP", which, stop: { stopName: stop.name, walkMinutes } });
    const base = buildSearchRequest(state);
    void runSearch({ acceptWalk: { ...base?.acceptWalk, [which]: true } });
  };

  // Recovery: switch on the service that would produce routes, then search again.
  const addService = (service: ServiceId) => {
    dispatch({ type: "ADD_SERVICE", service });
    const base = buildSearchRequest(state);
    void runSearch({ services: [...(base?.services ?? []), service] });
  };

  // "Arrive by 5:15 PM" / "Arrive by 5:45 PM": search again 15 minutes earlier or later.
  const shiftTime = (minutes: number) => {
    const base = buildSearchRequest(state);
    if (!base) return;
    const time = base.time + minutes;
    void runSearch({ time }, `No routes found for "${shiftLabel(base.mode, time)}". Your earlier results are still shown.`);
  };

  const selected = state.results.find((r) => r.id === state.selectedId) ?? null;
  const details = state.results.find((r) => r.id === state.detailsId) ?? null;

  // "Send to my phone": saves the selected route through POST /api/trips.
  const sendSelected = async () => {
    const request = buildSearchRequest(state);
    if (!selected || !request || !state.from || !state.to) return;
    dispatch({ type: "SEND_START" });
    const result = await sendTrip({
      fromName: state.from.name,
      toName: state.to.name,
      date: request.date,
      mode: request.mode,
      time: request.time,
      itinerary: selected,
    });
    if (result.ok) dispatch({ type: "SEND_SUCCESS", code: result.code, itineraryId: selected.id });
    else dispatch({ type: "SEND_ERROR", message: result.message });
  };

  const sending = state.send.status === "sending";

  switch (state.screen) {
    case "start":
      return <StartScreen onStart={() => dispatch({ type: "GO", screen: "where" })} />;
    case "where":
      return <WhereStep state={state} dispatch={dispatch} />;
    case "when":
      return <WhenStep state={state} dispatch={dispatch} />;
    case "services":
      return <ServicesStep state={state} dispatch={dispatch} />;
    case "review":
      return <ReviewStep state={state} dispatch={dispatch} onSearch={() => void runSearch()} onUseStop={acceptSuggestedStop} onAddService={addService} />;
    case "preview":
      if (selected && state.from && state.to) {
        return (
          <TripPreview
            itinerary={selected}
            from={state.from}
            to={state.to}
            date={state.date}
            sending={sending}
            onBack={() => dispatch({ type: "GO", screen: "results" })}
            onSend={() => void sendSelected()}
          />
        );
      }
    // falls through to the results when there is nothing to preview
    case "results":
      return (
        <>
          <ResultsScreen state={state} dispatch={dispatch} onShift={shiftTime} onSend={() => void sendSelected()} onReset={() => dispatch({ type: "RESET" })} />
          <RouteDetailsDialog
            itinerary={details}
            date={state.date}
            destination={state.to?.name ?? ""}
            timingNote={details && state.mode ? timingNote(details, state.mode) : ""}
            sending={sending}
            onClose={() => dispatch({ type: "CLOSE_DETAILS" })}
            onPreview={() => dispatch({ type: "GO", screen: "preview" })}
            onSend={() => void sendSelected()}
          />
        </>
      );
  }
}
