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
  const index = Math.max(0, options.indexOf(value));

  // Keep the wheel lined up with the value (for example after an earlier/later search changes the time).
  useEffect(() => {
    const list = listRef.current;
    if (list && Math.round(list.scrollTop / ROW) !== index) list.scrollTop = index * ROW;
  }, [index]);

  // Click or key press: jump straight to the value, with no animation to wait for.
  const select = (next: number) => {
    const clamped = Math.min(options.length - 1, Math.max(0, next));
    if (listRef.current) listRef.current.scrollTop = clamped * ROW;
    if (options[clamped] !== value) onChange(options[clamped]);
  };

  // Scrolling: the value in the middle band is the choice straight away, without waiting for the wheel
  // to stop. (Waiting left Next locked for a moment, so a quick click on it did nothing.)
  const onScroll = () => {
    const list = listRef.current;
    if (!list) return;
    const next = Math.min(options.length - 1, Math.max(0, Math.round(list.scrollTop / ROW)));
    if (options[next] !== value) onChange(options[next]);
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
      select(moves[event.key]);
    }
  };

  const labelId = `wheel-${label.toLowerCase()}`;
  return (
    <div className="flex flex-col gap-1">
      <span id={labelId} className="text-xs tracking-[0.15px] text-[rgba(57,56,63,0.6)]">
        {label}
      </span>
      {/* The wrapper clips the list, which is wider than it, so the scrollbar is never visible in any browser. */}
      <div className="relative w-[72px] overflow-hidden rounded-md has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[#1976d2]">
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
          className="time-wheel relative w-[calc(100%+32px)] snap-y snap-mandatory overflow-y-scroll pr-8 outline-none"
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
