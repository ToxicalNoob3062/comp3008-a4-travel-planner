// One place for every timing, easing and spring used by the animations.
// Change a value here and it changes everywhere that effect is used.

/** Fast start, soft landing. Used for things arriving on screen. */
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/** Gentle start and gentle landing. Used for list items, so they glide in instead of snapping. */
export const EASE_SMOOTH = [0.4, 0, 0.2, 1] as const;

export const DURATION = {
  /** A screen leaving. Kept short so a click never feels held up. */
  exit: 0.13,
  /** A screen arriving. */
  enter: 0.3,
  /** One item of a list (a route card, a route step) fading into place. Slow enough to read as a glide. */
  item: 0.55,
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

/** Dropdown panels (calendar, place suggestions). Kept gentle: the place list reopens often while typing. */
export const DROP = {
  /** How far (px) the panel drops as it opens. */
  distance: 12,
  /** Its size at the start of the drop. */
  scale: 0.97,
  /** Soft settle, no bounce. */
  spring: { type: "spring", stiffness: 380, damping: 30 },
  /** Seconds for the closing fade. Short, so closing never feels held up. */
  closeSeconds: 0.14,
  /** Milliseconds after opening during which the options arrive one after another. */
  freshMs: 450,
} as const;

/**
 * Every message box waits this long before it pops in. Because the wait is the same for all of them,
 * boxes that appear together always bounce together, and the bounce starts once the screen has arrived.
 */
export const POP_DELAY = 0.25;

/** How long an up-front tip or caution stays on screen before it fades out by itself (milliseconds). */
export const NOTICE_VISIBLE_MS = 5000;

/** Seconds a message box takes to fade out. Slow, so it is seen leaving rather than vanishing. */
export const NOTICE_EXIT = 0.8;

/** Seconds between one item and the next in a staggered list. */
export const STAGGER = 0.13;

/** How far (px) a screen travels when it slides in. */
export const SLIDE_DISTANCE = 36;

/** Scale of a button or pill while it is pressed. Also used by the `.press` CSS class and the MUI theme. */
export const PRESS_SCALE = 0.95;

/** Dialogs: grow in with a slight overshoot, leave a little faster. */
export const POPUP = {
  enterMs: 320,
  exitMs: 170,
  enterEasing: "cubic-bezier(0.34, 1.45, 0.64, 1)",
  exitEasing: "cubic-bezier(0.4, 0, 1, 1)",
} as const;
