"use client";

// A scrollable "wheel" for picking one value, like the time picker on a phone.
// Scroll (or drag on touch), click a value, or use the arrow keys. The value in the middle band is the choice.
import { useEffect, useRef } from "react";

const ROW = 40; // height of one value, in px
const VISIBLE = 3; // values shown at once

interface TimeWheelProps {
  label: string;
  /** Choices in order. An empty string is the "not chosen yet" position, shown as a dash. */
  options: string[];
  value: string;
  onChange: (value: string) => void;
  /** How far Page Up / Page Down move. */
  pageStep?: number;
}

export default function TimeWheel({ label, options, value, onChange, pageStep = 5 }: TimeWheelProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const settle = useRef<ReturnType<typeof setTimeout> | null>(null);
  const index = Math.max(0, options.indexOf(value));

  // Keep the wheel lined up with the value (for example after an earlier/later search changes the time).
  useEffect(() => {
    const list = listRef.current;
    if (list && Math.round(list.scrollTop / ROW) !== index) list.scrollTop = index * ROW;
  }, [index]);

  useEffect(() => () => {
    if (settle.current) clearTimeout(settle.current);
  }, []);

  const select = (next: number, smooth = true) => {
    const clamped = Math.min(options.length - 1, Math.max(0, next));
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    listRef.current?.scrollTo({ top: clamped * ROW, behavior: smooth && !reduceMotion ? "smooth" : "auto" });
    if (options[clamped] !== value) onChange(options[clamped]);
  };

  // When scrolling stops, the value sitting in the middle band becomes the choice.
  const onScroll = () => {
    if (settle.current) clearTimeout(settle.current);
    settle.current = setTimeout(() => {
      const list = listRef.current;
      if (!list) return;
      const next = Math.min(options.length - 1, Math.max(0, Math.round(list.scrollTop / ROW)));
      if (options[next] !== value) onChange(options[next]);
    }, 120);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    const moves: Record<string, number> = {
      ArrowDown: index + 1,
      ArrowUp: index - 1,
      PageDown: index + pageStep,
      PageUp: index - pageStep,
      Home: options[0] === "" ? 1 : 0,
      End: options.length - 1,
    };
    if (event.key in moves) {
      event.preventDefault();
      select(moves[event.key], false);
    }
  };

  const labelId = `wheel-${label.toLowerCase()}`;
  return (
    <div className="flex flex-col gap-1">
      <span id={labelId} className="text-xs tracking-[0.15px] text-[rgba(57,56,63,0.6)]">
        {label}
      </span>
      <div className="relative w-[72px]">
        {/* The highlighted band marks the chosen value. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-10 h-10 rounded-md border border-brand bg-brand-tint" />
        <div
          ref={listRef}
          role="spinbutton"
          tabIndex={0}
          aria-labelledby={labelId}
          aria-valuemin={Number(options.find((o) => o !== "") ?? 0)}
          aria-valuemax={Number(options[options.length - 1])}
          aria-valuenow={value === "" ? undefined : Number(value)}
          aria-valuetext={value === "" ? "Not chosen" : value}
          onScroll={onScroll}
          onKeyDown={onKeyDown}
          className="time-wheel focus-ring relative snap-y snap-mandatory overflow-y-auto rounded-md"
          style={{ height: ROW * VISIBLE, paddingBlock: ROW }}
        >
          {options.map((option, i) => (
            <div
              key={option}
              aria-hidden="true"
              onClick={() => select(i)}
              className={`flex cursor-pointer snap-center items-center justify-center text-lg tabular-nums select-none ${
                i === index ? "font-semibold text-brand" : "text-[rgba(57,56,63,0.55)] hover:text-ink"
              }`}
              style={{ height: ROW }}
            >
              {option === "" ? "– –" : option}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
