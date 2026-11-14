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
      <Button variant="outlined" size="large" startIcon={<ChevronLeft />} onClick={onBack}>
        Back
      </Button>
      <div className="flex flex-wrap items-center justify-end gap-3">
        <p id="next-hint" aria-live="polite" className="min-h-5 text-[13px] text-muted max-sm:basis-full max-sm:text-right">
          {nextDisabled ? hint : ""}
        </p>
        {extra}
        <Button
          variant="contained"
          size="large"
          endIcon={<ChevronRight />}
          onClick={onNext}
          disabled={nextDisabled}
          aria-describedby="next-hint"
        >
          {editing ? "Back to review" : "Next"}
        </Button>
      </div>
    </>
  );
}
