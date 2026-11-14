// One place for every timing, easing and spring used by the animations.
// Change a value here and it changes everywhere that effect is used.

/** Fast start, soft landing. Used for things arriving on screen. */
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export const DURATION = {
  /** A screen leaving. Kept short so a click never feels held up. */
  exit: 0.13,
  /** A screen or an item arriving. */
  enter: 0.3,
  /** A progress bar segment filling or draining. */
  progress: 0.55,
} as const;

export const SPRING = {
  /** Message boxes: rises and settles with one soft bounce. */
  pop: { type: "spring", stiffness: 480, damping: 16, mass: 0.8 },
  /** Small confirmations such as the check mark. */
  snap: { type: "spring", stiffness: 520, damping: 18 },
  /** Panels that open from a control, such as the calendar. No bounce. */
  drop: { type: "spring", stiffness: 520, damping: 30 },
} as const;

/**
 * Every message box waits this long before it pops in. Because the wait is the same for all of them,
 * boxes that appear together always bounce together, and the bounce starts once the screen has arrived.
 */
export const POP_DELAY = 0.25;

/** Seconds between one item and the next in a staggered list. */
export const STAGGER = 0.07;

/** How far (px) a screen travels when it slides in. */
export const SLIDE_DISTANCE = 36;

/** Scale of a button or pill while it is pressed. Also used by the `.press` CSS class and the MUI theme. */
export const PRESS_SCALE = 0.95;
