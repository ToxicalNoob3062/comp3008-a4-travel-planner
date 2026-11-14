"use client";

// Step 3: Services. Each option is explained in plain language.
import type { Dispatch } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import AnimatedCheckbox from "@/components/AnimatedCheckbox";
import Pop from "@/components/motion/Pop";
import StepActions from "@/components/StepActions";
import StepCard from "@/components/StepCard";
import { isServicesComplete, type Action, type PlannerState } from "@/lib/plannerReducer";
import { SERVICE_OPTIONS } from "@/lib/services";

export default function ServicesStep({ state, dispatch }: { state: PlannerState; dispatch: Dispatch<Action> }) {
  const complete = isServicesComplete(state);
  return (
    <StepCard
      title="Which services can we use?"
      step={3}
      actions={
        <StepActions
          editing={state.editing}
          onBack={() => dispatch({ type: "GO", screen: state.editing ? "review" : "when" })}
          onNext={() => dispatch({ type: "GO", screen: "review" })}
          nextDisabled={!complete}
          extra={
            <Button variant="outlined" size="large" onClick={() => dispatch({ type: "USE_RECOMMENDED" })}>
              Use recommended
            </Button>
          }
        />
      }
    >
      <fieldset className="flex flex-col">
        <legend className="visually-hidden">Services to include in the search</legend>
        {SERVICE_OPTIONS.map((option) => (
          <label key={option.id} className="flex cursor-pointer items-start gap-1 rounded py-1 hover:bg-[#fafafa]">
            <AnimatedCheckbox
              checked={state.services[option.id]}
              onChange={() => dispatch({ type: "TOGGLE_SERVICE", service: option.id })}
              slotProps={{ input: { "aria-describedby": `service-${option.id}` } }}
            />
            <span className="flex flex-col gap-0.5 pt-2">
              <span className="text-base text-ink">{option.label}</span>
              <span id={`service-${option.id}`} className="text-[13px] text-muted">
                {option.description}
              </span>
            </span>
          </label>
        ))}
      </fieldset>

      <div aria-live="polite">
        {/* The key makes the box pop again when it switches between the note and the error. */}
        <Pop key={complete ? "note" : "error"}>
          {complete ? (
            <Alert severity="warning">Unchecking a service removes those trips from your results.</Alert>
          ) : (
            <Alert severity="error">No service is selected, so there would be no trips to show. Choose at least one, or use the recommended set.</Alert>
          )}
        </Pop>
      </div>
    </StepCard>
  );
}
