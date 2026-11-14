"use client";

import { useEffect } from "react";
import Image from "next/image";
import Button from "@mui/material/Button";
import ChevronRight from "@mui/icons-material/ChevronRight";
import FadeUp from "@/components/motion/FadeUp";
import { resetProgress } from "@/components/motion/ProgressBar";
import { ACTION_BAR, SCREEN_CARD } from "@/components/screenCard";

const STEPS = ["Where", "When", "Services", "Review"];

export default function StartScreen({ onStart }: { onStart: () => void }) {
  // A new trip starts with an empty progress bar.
  useEffect(() => resetProgress(), []);

  return (
    <section aria-labelledby="screen-title" className={SCREEN_CARD}>
      <FadeUp decorative className="flex flex-col items-center gap-3 overflow-hidden rounded-xl bg-[#fdecee] pt-6 pb-4 sm:pt-7 sm:pb-5">
        {/* The picture keeps its shape and shrinks with the screen; the labels are placed by percentage so they move with it. */}
        <div className="relative aspect-[520/170] w-[520px] max-w-[calc(100%-24px)]">
          <Image src="/img/hero-map.svg" alt="" width={520} height={170} priority className="h-full w-full" />
          <div className="absolute top-[75%] left-[17.7%] origin-top-left scale-[0.8] rounded-lg bg-white sm:scale-100 px-2.5 py-1.5 shadow-[0_1px_4px_rgba(0,0,0,0.1)]">
            <p className="text-xs font-semibold text-[#212121]">Location A</p>
            <p className="text-[11px] text-[#737373]">Start</p>
          </div>
          <div className="absolute top-[-2.4%] left-[54%] origin-top-left scale-[0.8] rounded-lg bg-white sm:left-[63%] sm:scale-100 px-2.5 py-1.5 shadow-[0_1px_4px_rgba(0,0,0,0.1)]">
            <p className="text-xs font-semibold text-[#212121]">Location B</p>
            <p className="text-[11px] text-[#737373]">Destination</p>
          </div>
        </div>
        <p className="mt-3 px-4 text-center text-[13px] text-brand-dark sm:mt-0 sm:text-sm">Buses, O-Train and STO, planned in one search</p>
      </FadeUp>

      <h1 id="screen-title" tabIndex={-1} data-screen-heading className="text-xl font-medium text-ink outline-none sm:text-[32px]">
        Plan a trip
      </h1>
      <p className="text-[15px] text-muted sm:text-base">
        Answer 4 quick questions, one at a time, and we&apos;ll find routes that get you there on time.
      </p>
      <ol className="flex flex-wrap gap-x-3 gap-y-2 sm:gap-x-6" aria-label="The four steps">
        {STEPS.map((step, i) => (
          <FadeUp as="li" key={step} order={i} delay={0.25} className="flex items-center gap-1.5 text-sm text-ink sm:gap-2 sm:text-base">
            <span className="flex size-6 items-center justify-center rounded-full bg-brand-tint text-[13px] font-medium sm:size-7 sm:text-sm text-brand" aria-hidden="true">
              {i + 1}
            </span>
            {step}
          </FadeUp>
        ))}
      </ol>

      <div className="min-h-px flex-1" />
      <div className={`${ACTION_BAR} flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-3`}>
        <p className="text-[13px] text-muted sm:min-w-px sm:flex-1">Takes about a minute · You can go back at any step</p>
        <Button variant="contained" size="large" endIcon={<ChevronRight />} onClick={onStart}>
          Start planning
        </Button>
      </div>
    </section>
  );
}
