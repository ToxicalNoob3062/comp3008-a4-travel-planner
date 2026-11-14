# Implementation notes

More detail on the OC Transpo Travel Planner (COMP 3008, Assignment 4, Group 22).
How to run it and where to begin the task are in the [README](../README.md).

## Technology

- Next.js 16 (App Router) and React 19, TypeScript
- Material UI components (the Figma prototype was built with the Material UI kit), the MUI X calendar (`@mui/x-date-pickers` with `dayjs`), and Tailwind CSS for layout
- Motion (`motion`, formerly Framer Motion) for transitions and feedback animations
- SQLite (`node:sqlite`) for places, lines and saved routes
- Three API routes (below), Leaflet + OpenStreetMap for the maps

## How the code is organised

| Part | Files | Responsibility |
| --- | --- | --- |
| Screens (view) | `components/steps/StartScreen`, `WhereStep`, `WhenStep`, `ServicesStep`, `ReviewStep`, `ResultsScreen`, `TripPreview`; `components/RouteDetailsDialog`, `SearchErrorPanel`, `PlaceField`, `DateField`, `TimeWheel`, `Timeline`, `StepCard`, `StepActions`, `AnimatedCheckbox`, `AppBar`, `screenCard.ts` (the shared phone/desktop surface), `map/MapView`, `map/TripMap`, `motion/*` (see Motion below) | Show the current state and report user actions. |
| Application logic | `components/TripPlanner.tsx`, `components/lazyScreens.tsx` | Holds the state, decides which screen to show, calls the API (`runSearch`, `acceptSuggestedStop`, `addService`, `shiftTime`, `sendSelected`), loads later screens on demand. |
| State | `lib/plannerReducer.ts` | `PlannerState`, every `Action`, the reducer, and the checks that unlock Next (`isWhereComplete`, `isWhenComplete`, `isServicesComplete`, `buildSearchRequest`). |
| API client | `lib/api.ts` | `fetchPlaces` (loads the place list once, then `filterPlaces` filters it in the browser), `searchRoutes`, `sendTrip`: browser calls to the API routes, with network failures turned into messages. |
| API routes | `app/api/places/route.ts` (GET), `app/api/routes/route.ts` (POST), `app/api/trips/route.ts` (POST) | Validate the request and return JSON. |
| Services | `lib/routing.ts` | The mock trip search: walking-limit check, route finding, picking the trip closest to the requested time. |
| Storage | `lib/db.ts`, `lib/seed.ts`, `data/planner.db` | SQLite tables `places`, `lines`, `line_stops`, `event_dates`, `saved_trips`. |
| Saved route page | `app/trip/[code]/page.tsx` | Reads a saved route back from SQLite. |
| Shared helpers | `lib/types.ts`, `lib/time.ts`, `lib/labels.ts`, `lib/services.ts`, `lib/tripLink.ts` | Types, time formatting, wording. |

## What changed from the Assignment 3 prototype

The screens, wording and order follow the Figma prototype. These are the differences:

1. **Everything is live.** Any place in the demo data can be the start or destination, Leave at works,
   any date and time can be entered, the service checkboxes change the results, the earlier/later buttons
   search again, and Explore route shows the route that was clicked. The prototype check in Assignment 3
   listed each of these as fixed paths.
2. **A second recovery path.** If the chosen services give no routes, the Review screen explains why and
   offers a one-click fix (add the missing service, or change the time).
3. **Step 3 cannot be passed with no service selected.** A participant could continue with nothing checked and was unsure if that was intended.
4. **Hints beside a disabled Next button** say what is still missing.
5. **"Change start location instead"** was added under the suggested stop (it was in the storyboard and the state diagram).
   All four **Edit** links stay visible while the error is shown. In the prototype two of them disappeared.
6. **Review shows the accepted walk**, for example "Place d'Orléans Dr (12-min walk to Place d'Orléans Station)".
7. **Maps are real, interactive maps** (Leaflet and OpenStreetMap) instead of screenshots. Google Maps was not used because it needs a private API key.
8. **The sent confirmation has a reference code and a link** to the saved route.
9. **Up to three routes are listed** instead of two, and the times differ slightly from the prototype's made-up numbers. The pre-selected route is still 4:30 PM → 5:28 PM.
10. **The date is picked from a calendar and the time from two scroll wheels** (hour and minute, like a phone's
    time picker) instead of typed text fields, so only valid dates and times can be entered. The wheels start
    on "– –", so no time is chosen for the user.
11. **The card grows with its content and there is a phone layout** (full-width screens, buttons in a bar at the bottom).
    The prototype was a fixed 1280 × 800 frame.
12. **Animation was added** to show what changed (screen slides, progress bar, message boxes). See Motion below.
13. **Up-front tips fade out after 5 seconds.** Feedback on something the user did stays on screen.

## Motion

Animation is used to show what changed, not for decoration. Every effect is its own small component in
`components/motion/`, so it is written once and reused, and all timings live in `motion/tokens.ts`.
Each one marks its element with a `data-motion` attribute, which makes it easy to find in tests or in the browser.

| Component | `data-motion` | What it does | Used for |
| --- | --- | --- | --- |
| `MotionProvider`, `LayoutMotion` | none | Load Motion's features (see Performance). | `app/providers.tsx`, the Results screen. |
| `ScreenTransition` | `screen` | Slides a screen in from the direction of travel (Next from the right, Back from the left) and moves focus to its heading. | Every step change, in `TripPlanner`. |
| `ProgressBar` | `progress` | Fills the next segment going forward, drains it going back. | The four-step bar in `StepCard`. |
| `Pop` | `pop` | Rises and settles with one soft bounce. Up-front tips and cautions then fade out in place after 5 seconds; boxes marked `stay` (feedback on an action) remain. | Tips, warnings, errors, the goal sentence, the "Route sent" confirmation. |
| `FadeUp` | `fade-up` | Fades and moves into place; `order` staggers a list, `from="left"` slides sideways, `as="li"` renders a list item. | Route cards, route steps, the start screen, the date and time row. |
| `ScaleIn` | `scale-in` | Snaps a small element into view. | The check mark on the chosen Arrive by / Leave at card. |
| `CheckDraw` | `check-draw` | The box bounces in, the tick draws itself and a ring bursts outward, only when the user ticks it. | The service checkboxes, through `AnimatedCheckbox`. |
| `SelectionHighlight` | `selection` | The selected look glides from the old item to the new one. | The route cards on Results. |
| `DropIn` | `drop-in` | Opens a panel downward from its control with a soft settle; with `open={false}` it fades out and reports when it has finished. | The calendar. |
| `PopupTransition` | none (set in the theme) | Grows out from the centre with a slight overshoot, shrinks away faster. | Every dialog, starting with Route details. |
| `DropInPopper` | `drop-in` | `DropIn` inside a Material UI popper: drops in on open, fades out on close, and lets the first options arrive one after another once per opening (not on every keystroke). | The place suggestions list. |
| `.press` (CSS class) and the MUI button theme | none | Presses the control down slightly while it is clicked. | Every button, pill and choice card. |

## Screen sizes

The layout is written phone-first with Tailwind: a class with no prefix is the phone layout, and `sm:` (640 px and
wider) changes it for larger screens. Checked on an iPhone simulator (402 pt wide) and on desktop.

- **Phone, no card:** the white surface fills the screen edge to edge, so all the width goes to content. From 640 px it
  becomes the centred card. Both layouts come from one shared class list (`components/screenCard.ts`).
- **Buttons always in reach:** on a phone the main buttons sit in a bar fixed to the bottom of the screen. Back (small)
  and the main button share one row; an extra button such as "Use recommended" takes a full row above them.
- **Less scrolling:** smaller type and spacing on a phone, the two "Arrive by / Leave at" cards side by side, the time
  wheels and AM/PM on one row, route cards three lines tall with a compact "Explore" button, and the route popup's two buttons side by side as "Preview" and "Send". Every step and the
  results list fit on one phone screen without scrolling.
- **Review:** on a phone each row's edit control is a pencil icon (40 px tap target, named for screen readers).
- **Up-front tips fade out:** tips and cautions shown before the user has done anything (the wheel tip, "Pick one",
  the services caution) fade out in place after 5 seconds, keeping their space so nothing moves. Feedback on an action
  (the goal sentence, errors, "Route sent", "no routes for that time") stays.
- **Time wheels with a mouse:** a wheel scrolls only while it has focus (after a click or Tab). Scrolling the page with
  the pointer over a wheel therefore cannot change the time by accident. On touch screens the wheel is dragged directly,
  and the tip under the wheels changes its wording to match.

## Tests

Animation and interaction tests use Vitest and React Testing Library (jsdom). The animations really run in
the tests, so they check where an element starts, where it ends, and what happens in between.

```bash
npm test
```

| Test file | What it checks |
| --- | --- |
| `motion/__tests__/Pop.test.tsx` | Starts hidden and small, ends at rest, overshoots once (the bounce), two boxes stay exactly in step, no sliding with reduced motion, fades out in place when its time is up (no movement, keeps its space), stays when told to, waits while the pointer is on it. |
| `motion/__tests__/FadeUp.test.tsx` | Start and end positions, `from="left"`, list items arrive in order, `delay`, list-item mode, screen-reader attributes, reduced motion. |
| `motion/__tests__/ProgressBar.test.tsx` | ARIA values, fills the new segment going forward, drains going back, resets for a new trip, fills gradually. |
| `motion/__tests__/ScreenTransition.test.tsx` | First screen does not slide or take focus; Next arrives from the right and Back from the left; focus moves to the new heading; one screen at a time. |
| `motion/__tests__/PopupTransition.test.tsx` | Dialog opens with the shared timing and easing, closes faster, then is removed. |
| `motion/__tests__/smallEffects.test.tsx` | `ScaleIn`, `DropIn` (opens from above, fades out and reports closing, marks fresh contents) and `SelectionHighlight` (one highlight, on the selected item only). |
| `motion/__tests__/tokens.test.ts` | Guard rails on the timing values (leaving is faster than arriving, nothing longer than 0.6 s, and so on). |
| `__tests__/AnimatedCheckbox.test.tsx` | Pre-checked boxes do not animate, ticking plays the celebration, keyboard works, the tick is hidden from screen readers. |
| `__tests__/TimeWheel.test.tsx` | Nothing chosen at first, typing one or two digits, arrow/Home/End/Page keys, limits, Backspace, Escape, click, scroll. |

Shared helpers are in `test/motion.tsx` (`renderWithMotion`, `waitUntilSettled`, `timeToVisible`).

## Performance

- **Slim Motion:** the motion components use Motion's lightweight `m` elements, and `motion/MotionProvider` loads only the
  basic animation features. The layout-animation features needed by `SelectionHighlight` are added by `motion/LayoutMotion`
  on the Results screen only, so that code downloads with that screen.
- **Screens load on demand:** every screen after the start screen is a separate download (`components/lazyScreens.tsx`),
  fetched in the background as soon as the browser is idle, so the first page is smaller and clicks are still instant.
- **Cheap properties only:** animations change `transform` and `opacity`, which the browser can animate without redoing layout.
- **Measured on the production build when these changes were made (before the phone layout):** scripts for the first page went from 359 KB to 268 KB compressed (1137 KB to 827 KB
  uncompressed). Every step transition, the search, the recovery and the route details popup ran at about 60 frames per
  second with no frame longer than 18 ms.

## Accessibility

- Every control works from the keyboard, with a visible focus ring. There is a "Skip to the trip planner" link.
- When the screen changes, focus moves to the new heading. When a search fails, focus moves to the error.
- Errors, hints, the goal sentence and the sent confirmation are announced to screen readers (`aria-live` / `role="alert"`).
- The date opens with Enter, Space or the down arrow, and the calendar is fully keyboard operable. The hour and minute wheels
  are spin buttons. A wheel is grey normally and turns red with an outline while it has focus. When focused, type the
  number (7, or 1 then 0 for 10) and the wheel scrolls to it; Up/Down change the value, Page Up/Down jump,
  Home/End go to the first and last value, Backspace clears it, and Escape or Tab leaves the wheel.
- Arrive by / Leave at and the route list are real radio groups. AM/PM buttons report their pressed state.
- The maps have a text description, and the same route is always available as a text list of steps.
- Colour is never the only signal (selected items also have a check mark, a radio dot or a label).
- A tip that fades out is also removed from screen readers and the tab order (`aria-hidden`, `inert`); the wheel instructions
  stay available to screen readers in hidden text. The countdown pauses while the pointer or focus is on the tip.
- Short labels on a phone ("Explore", "Preview", "Send", the pencil) keep their full names for screen readers.
- Animations are reduced when the system asks for reduced motion: sliding and bouncing are switched off and only fades remain
  (`MotionConfig reducedMotion="user"` in `app/providers.tsx`).

## Deploying to Vercel

Import the repository in Vercel with the default Next.js settings and Node 22 or 24. On Vercel the SQLite
file lives in `/tmp`, which is temporary and not shared between server functions. The demo data is
re-created automatically. Saved routes are still written to SQLite, and the "See what was sent" link also
carries a copy of the route (`lib/tripLink.ts`), so the saved-route page works even when the row is gone.
