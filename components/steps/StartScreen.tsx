"use client";

import { useEffect } from "react";
import Image from "next/image";
import Button from "@mui/material/Button";
import ChevronRight from "@mui/icons-material/ChevronRight";
import FadeUp from "@/components/motion/FadeUp";
import { resetProgress } from "@/components/motion/ProgressBar";

const STEPS = ["Where", "When", "Services", "Review"];

export default function StartScreen({ onStart }: { onStart: () => void }) {
  // A new trip starts with an empty progress bar.
  useEffect(() => resetProgress(), []);

  return (
    <section
      aria-labelledby="screen-title"
      className="flex min-h-[600px] w-full max-w-[760px] flex-col gap-6 rounded-xl border border-line bg-white p-5 shadow-[0_4px_16px_rgba(0,0,0,0.06)] sm:p-8"
    >
      <FadeUp decorative className="flex flex-col items-center gap-3 overflow-hidden rounded-xl bg-[#fdecee] pt-7 pb-5">
        <div className="relative h-[170px] w-[520px] max-w-full">
          <Image src="/img/hero-map.svg" alt="" width={520} height={170} priority />
          <div className="absolute top-[128px] left-[92px] rounded-lg bg-white px-2.5 py-1.5 shadow-[0_1px_4px_rgba(0,0,0,0.1)]">
            <p className="text-xs font-semibold text-[#212121]">Location A</p>
            <p className="text-[11px] text-[#737373]">Start</p>
          </div>
          <div className="absolute top-[-4px] left-[328px] rounded-lg bg-white px-2.5 py-1.5 shadow-[0_1px_4px_rgba(0,0,0,0.1)]">
            <p className="text-xs font-semibold text-[#212121]">Location B</p>
            <p className="text-[11px] text-[#737373]">Destination</p>
          </div>
        </div>
        <p className="text-sm text-brand-dark">Buses, O-Train and STO, planned in one search</p>
      </FadeUp>

      <h1 id="screen-title" tabIndex={-1} data-screen-heading className="text-[32px] font-medium text-ink outline-none">
        Plan a trip
      </h1>
      <p className="text-base text-muted">
        Answer 4 quick questions, one at a time, and we&apos;ll find routes that get you there on time.
      </p>
      <ol className="flex flex-wrap gap-x-6 gap-y-2" aria-label="The four steps">
        {STEPS.map((step, i) => (
          <FadeUp as="li" key={step} order={i} delay={0.25} className="flex items-center gap-2 text-base text-ink">
            <span className="flex size-7 items-center justify-center rounded-full bg-brand-tint text-sm font-medium text-brand" aria-hidden="true">
              {i + 1}
            </span>
            {step}
          </FadeUp>
        ))}
      </ol>

      <div className="min-h-px flex-1" />
      <div className="flex flex-wrap items-center justify-end gap-3">
        <p className="min-w-px flex-1 text-[13px] text-muted">Takes about a minute · You can go back at any step</p>
        <Button variant="contained" size="large" endIcon={<ChevronRight />} onClick={onStart}>
          Start planning
        </Button>
      </div>
    </section>
  );
}
