"use client";

// Step 1: Where. Start and destination, with a map preview once both are chosen.
import type { Dispatch } from "react";
import MapView from "@/components/map/MapView";
import PlaceField from "@/components/PlaceField";
import StepActions from "@/components/StepActions";
import StepCard from "@/components/StepCard";
import { isWhereComplete, type Action, type PlannerState } from "@/lib/plannerReducer";

export default function WhereStep({ state, dispatch }: { state: PlannerState; dispatch: Dispatch<Action> }) {
  const { from, to } = state;
  const samePlace = !!from && !!to && from.id === to.id;
  const complete = isWhereComplete(state);

  return (
    <StepCard
      title="Where are you going?"
      step={1}
      actions={
        <StepActions
          editing={state.editing}
          onBack={() => dispatch({ type: "GO", screen: state.editing ? "review" : "start" })}
          onNext={() => dispatch({ type: "GO", screen: state.editing ? "review" : "when" })}
          nextDisabled={!complete}
          hint={samePlace ? "Choose two different places." : "Choose a start and a destination to continue."}
        />
      }
    >
      <div className="flex flex-col gap-2">
        <PlaceField
          label="From (A)"
          value={from}
          onChange={(place) => dispatch({ type: "SET_PLACE", which: "from", place })}
        />
        <PlaceField
          label="To (B)"
          value={to}
          error={samePlace ? "Your destination is the same as your start. Choose a different place." : undefined}
          onChange={(place) => dispatch({ type: "SET_PLACE", which: "to", place })}
        />
      </div>

      {/* The map area is always present, so the buttons below do not jump when the map appears. */}
      <div className="flex flex-col gap-3">
        <h2 className="text-base font-semibold text-ink">Trip preview</h2>
        {from && to && !samePlace ? (
          <MapView
            description={`Map preview. A marks your start, ${from.name}. B marks your destination, ${to.name}.`}
            markers={[
              { position: [from.lat, from.lon], letter: "A", label: `Start: ${from.name}` },
              { position: [to.lat, to.lon], letter: "B", label: `Destination: ${to.name}` },
            ]}
          />
        ) : (
          <p className="flex h-[220px] items-center justify-center rounded-lg border border-dashed border-line bg-[#fafafa] px-6 text-center text-sm text-muted">
            A map of your trip appears here once you choose a start and a destination.
          </p>
        )}
      </div>
    </StepCard>
  );
}
