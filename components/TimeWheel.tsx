"use client";

// A scrollable "wheel" for picking one value, like the time picker on a phone.
// Mouse / touch: scroll or drag, or click a value.
// Keyboard: Tab to the wheel (it turns red while focused), then type the number (7, or 1 then 0 for 10),
// or use the arrow keys, Page Up/Down, Home/End. Backspace clears it. Escape or Tab leaves the wheel.
import { useEffect, useRef } from "react";

const ROW = 40; // height of one value, in px
const VISIBLE = 3; // values shown at once
const TYPING_PAUSE_MS = 1000; // digits typed within this time are read as one number

interface TimeWheelProps {
  /** Name read by screen readers, e.g. "Hour". */
  label: string;
  /** Unit shown beside the chosen value inside the band, e.g. "hour". */
  unit: string;
  /** Which end of the shared band this wheel is, so two wheels side by side look like one pill. */
  side: "left" | "right";
  /** Choices in order. An empty string is the "not chosen yet" position, shown as a dash. */
  options: string[];
  value: string;
  onChange: (value: string) => void;
  /** How far Page Up / Page Down move. */
  pageStep?: number;
  /** Id of the text that explains how to use the wheel. */
  describedBy?: string;
}

export default function TimeWheel({ label, unit, side, options, value, onChange, pageStep = 5, describedBy }: TimeWheelProps) {
  const listRef = useRef<HTMLDivElement>(null);
  /** The row an animated scroll is heading to, or null when the wheel is not animating. */
  const animatingTo = useRef<number | null>(null);
  const animationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Digits typed so far, e.g. "1" while waiting to see if "0" follows. */
  const typed = useRef("");
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const index = Math.max(0, options.indexOf(value));

  // Keep the wheel lined up with the value (for example after an earlier/later search changes the time).
  // Skipped while an animated scroll is already on its way to that value.
  useEffect(() => {
    const list = listRef.current;
    if (!list || animatingTo.current === index) return;
    if (Math.round(list.scrollTop / ROW) !== index) list.scrollTop = index * ROW;
  }, [index]);

  useEffect(
    () => () => {
      if (animationTimer.current) clearTimeout(animationTimer.current);
      if (typingTimer.current) clearTimeout(typingTimer.current);
    },
    [],
  );

  const stopAnimating = () => {
    animatingTo.current = null;
    if (animationTimer.current) clearTimeout(animationTimer.current);
  };

  /** Chooses a row: the value changes straight away and the wheel scrolls to it. */
  const select = (next: number) => {
    const list = listRef.current;
    const target = Math.min(options.length - 1, Math.max(0, next));
    if (list) {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      stopAnimating();
      if (reduceMotion || Math.round(list.scrollTop / ROW) === target) {
        list.scrollTop = target * ROW;
      } else {
        animatingTo.current = target;
        // Safety net in case the browser never reports reaching the row.
        animationTimer.current = setTimeout(stopAnimating, 800);
        list.scrollTo({ top: target * ROW, behavior: "smooth" });
      }
    }
    if (options[target] !== value) onChange(options[target]);
  };

  // Scrolling by hand: the value in the middle band is the choice straight away.
  const onScroll = () => {
    const list = listRef.current;
    if (!list) return;
    const current = Math.min(options.length - 1, Math.max(0, Math.round(list.scrollTop / ROW)));
    if (animatingTo.current !== null) {
      // Rows passed during an animated scroll are not choices; only the destination is.
      if (current === animatingTo.current) stopAnimating();
      return;
    }
    if (options[current] !== value) onChange(options[current]);
  };

  /** Typing digits: "7" goes to 7; "1" then "0" goes to 10. */
  const typeDigit = (digit: string) => {
    const find = (text: string) => options.findIndex((option) => option !== "" && Number(option) === Number(text));
    let text = typed.current + digit;
    let match = text.length <= 2 ? find(text) : -1;
    if (match === -1) {
      // The two digits together are not a valid value, so start again from this digit.
      text = digit;
      match = find(text);
    }
    typed.current = match === -1 ? "" : text;
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => (typed.current = ""), TYPING_PAUSE_MS);
    if (match !== -1) select(match);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (/^\d$/.test(event.key)) {
      event.preventDefault();
      typeDigit(event.key);
      return;
    }
    if (event.key === "Escape") {
      event.currentTarget.blur();
      return;
    }
    const moves: Record<string, number> = {
      ArrowDown: index + 1,
      ArrowUp: index - 1,
      PageDown: index + pageStep,
      PageUp: index - pageStep,
      Home: options[0] === "" ? 1 : 0,
      End: options.length - 1,
      Backspace: 0,
      Delete: 0,
    };
    if (event.key in moves) {
      event.preventDefault();
      typed.current = "";
      select(moves[event.key]);
    }
  };

  const rounded = side === "left" ? "rounded-l-full" : "rounded-r-full";
  return (
    // The wrapper clips the list, which is wider than it, so the scrollbar is never visible in any browser.
    // `group` lets the band, the chosen value and the unit change colour while the wheel has focus.
    <div className="group relative w-[104px] overflow-hidden">
      {/* The band marks the chosen value: grey normally, red while the wheel is focused. */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 top-10 h-10 border border-[#bdbdc2] bg-[#f2f2f4] transition-colors group-focus-within:border-2 group-focus-within:border-brand group-focus-within:bg-brand-tint ${rounded} ${
          side === "left" ? "border-r-0 group-focus-within:border-r-2" : "border-l-0 group-focus-within:border-l-2"
        }`}
      />
      {/* The unit stays in the band beside the chosen value, like a phone's timer picker. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-10 left-[54px] flex h-10 items-center text-sm font-semibold text-ink group-focus-within:text-brand"
      >
        {unit}
      </span>
      <div
        ref={listRef}
        role="spinbutton"
        tabIndex={0}
        aria-label={label}
        aria-describedby={describedBy}
        aria-valuemin={Number(options.find((o) => o !== "") ?? 0)}
        aria-valuemax={Number(options[options.length - 1])}
        aria-valuenow={value === "" ? undefined : Number(value)}
        aria-valuetext={value === "" ? "Not chosen" : value}
        onScroll={onScroll}
        onKeyDown={onKeyDown}
        // A wheel, touch or drag by the user takes over from any animated scroll.
        onWheel={stopAnimating}
        onTouchStart={stopAnimating}
        className="time-wheel relative w-[calc(100%+32px)] snap-y snap-mandatory overflow-y-scroll pr-8 outline-none"
        style={{ height: ROW * VISIBLE, paddingBlock: ROW }}
      >
        {options.map((option, i) => (
          <div
            key={option}
            aria-hidden="true"
            onClick={() => select(i)}
            className={`flex cursor-pointer snap-center items-center justify-end pr-[58px] text-lg tabular-nums select-none ${
              i === index ? "font-semibold text-ink group-focus-within:text-brand" : "text-[rgba(57,56,63,0.55)] hover:text-ink"
            }`}
            style={{ height: ROW }}
          >
            {option === "" ? "– –" : option}
          </div>
        ))}
      </div>
    </div>
  );
}
