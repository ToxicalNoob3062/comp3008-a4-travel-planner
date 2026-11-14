"use client";

// Back / Next buttons shared by the wizard steps.
import Button from "@mui/material/Button";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import ChevronRight from "@mui/icons-material/ChevronRight";

interface StepActionsProps {
  onBack: () => void;
  onNext: () => void;
  nextDisabled: boolean;
  /** Explains what is still missing while Next is disabled. */
  hint?: string;
  /** True when the step was opened from Review with "Edit". */
  editing: boolean;
  extra?: React.ReactNode;
}

export default function StepActions({ onBack, onNext, nextDisabled, hint, editing, extra }: StepActionsProps) {
  return (
    <>
      {/* Phone order: hint, extra button (full width), then Back and Next side by side.
          Wide order: Back, hint, extra, Next in one row. */}
      <p id="next-hint" aria-live="polite" className="order-1 col-span-2 text-[13px] text-muted max-sm:empty:hidden sm:order-2 sm:ml-auto sm:min-h-5">
        {nextDisabled ? hint : ""}
      </p>
      <Button className="order-3 sm:order-1" variant="outlined" size="large" startIcon={<ChevronLeft />} onClick={onBack}>
        Back
      </Button>
      {extra ? <div className="order-2 col-span-2 flex flex-col sm:order-3">{extra}</div> : null}
      <Button
        className="order-4"
        variant="contained"
        size="large"
        endIcon={<ChevronRight />}
        onClick={onNext}
        disabled={nextDisabled}
        aria-describedby="next-hint"
      >
        {editing ? "Back to review" : "Next"}
      </Button>
    </>
  );
}
