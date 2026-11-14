# OC Transpo Travel Planner: guided trip planner (COMP 3008, Assignment 4, Group 22)

A working version of our Assignment 3 prototype (Design A, the guided step-by-step trip planner).
It is a student project, not an official OC Transpo site. Routes and times are demo data.

## Software required

- **Node.js 22.13 or newer** (Node 24 recommended). Check with `node -v`.
- npm (comes with Node).

Nothing else needs to be installed. The database is SQLite through Node's built-in `node:sqlite`
module, and the file `data/planner.db` is created and filled with demo data the first time the app runs.
No accounts, passwords or API keys are needed.

## How to run it

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>. (If port 3000 is busy, Next.js prints the port it used instead.)

To run the production build instead: `npm run build`, then `npm start`.

The map uses OpenStreetMap tiles, so the two map views need an internet connection. Everything else works offline.

## Where to begin the task

Start on the first screen, **Plan a trip**, and press **Start planning**.

**Task:** find a route from *Place d'Orléans Dr* to *Carleton University* that arrives by 5:30 PM on Tuesday, October 6, 2026.

| Step | What to do | What happens |
| --- | --- | --- |
| 1. Where | Type `orleans` in **From** and pick **Place d'Orléans Dr**. Type `carl` in **To** and pick **Carleton University**. | Suggestions filter as you type. A map preview appears when both are chosen, and **Next** unlocks. |
| 2. When | Choose **Arrive by**. Click **Date** and pick October 6, 2026 in the calendar. Scroll the **Hour** wheel to `5` and the **Min** wheel to `30` (or click a value, or use the arrow keys), then press **PM**. | The date and time fields only appear after you choose Arrive by or Leave at. A sentence repeats the goal back. |
| 3. Services | Leave the recommended services, press **Next**. | Each option is explained in plain language. |
| 4. Review | Press **Find my routes**. | **Error path:** no stop is within the 10-minute walking limit of Place d'Orléans Dr. |
| Recovery | Press **Use this stop** (or **Change start location instead**). | The search runs again with every other answer kept, and the results appear. |
| Results | The 4:30 PM → 5:28 PM route is already selected. Try **Arrive by 5:15 PM**, pick another route, or press **Explore route**. | Results update. The popup lists every walk, bus and train. |
| Finish | In the popup press **Send to my phone** (or **Trip preview** first for the map). | A confirmation with a reference code appears. **See what was sent** opens the saved route. |

Other things to try:

- **Edit** on the Review screen opens a step with your answers still filled in, and returns to Review.
- Services: uncheck everything (Next is blocked with an explanation). Or keep only *School routes*, search,
  and use the suggested fix **Add Regular buses & O-Train**.
- Start from *Les Promenades Gatineau* with *STO buses* unchecked: the fix suggests adding STO.
- Destination *Hog's Back Park*: the same walking-limit error, this time for the destination.
- **Leave at** instead of Arrive by.

## Demo data

About 20 places (stations, streets and landmarks) and 10 lines are seeded from `lib/seed.ts`:
O-Train Lines 1 and 2, Buses 6, 10, 39, 61 and 75, STO 400, School route 639 (weekdays, afternoons) and
Event shuttle 450 (runs only on 2026-11-21, 2026-11-28 and 2026-12-05). The network is a simplified
slice of Ottawa and the timetable is made up. Any date works, including past dates such as October 6, 2026.

"Send to my phone" is simulated: the route is saved in SQLite and shown at `/trip/<code>` with its steps and a map. No message is sent.

To reset the data, stop the app and delete `data/planner.db`.

## Technology

- Next.js 16 (App Router) and React 19, TypeScript
- Material UI components (the Figma prototype was built with the Material UI kit), the MUI X calendar (`@mui/x-date-pickers` with `dayjs`), and Tailwind CSS for layout
- Motion (`motion`, formerly Framer Motion) for transitions and feedback animations
- SQLite (`node:sqlite`) for places, lines and saved routes
- Three API routes (below), Leaflet + OpenStreetMap for the maps

## How the code is organised

| Part | Files | Responsibility |
| --- | --- | --- |
| Screens (view) | `components/steps/StartScreen`, `WhereStep`, `WhenStep`, `ServicesStep`, `ReviewStep`, `ResultsScreen`, `TripPreview`; `components/RouteDetailsDialog`, `SearchErrorPanel`, `PlaceField`, `DateField`, `TimeWheel`, `Timeline`, `StepCard`, `StepActions`, `map/MapView`, `map/TripMap`, `motion/ScreenTransition`, `motion/Pop`, `motion/FadeUp` | Show the current state and report user actions. |
| Application logic | `components/TripPlanner.tsx` | Holds the state, decides which screen to show, calls the API (`runSearch`, `acceptSuggestedStop`, `addService`, `shiftTime`, `sendSelected`), moves focus when the screen changes. |
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
11. **The card grows with its content and the layout works on a phone.** The prototype was a fixed 1280 × 800 frame.

## Motion

Animation is used to show what changed, not for decoration:

- **Step transitions** slide in the direction of travel: forward comes from the right, Back from the left (`motion/ScreenTransition`).
- **The progress bar** fills one segment when moving forward and drains it when going back (`ProgressBar` in `StepCard`).
- **Buttons and pills** press down slightly when clicked.
- **Message boxes** (tips, warnings, errors, the "Route sent" confirmation) pop in with a soft spring so they are noticed once, then stay still (`motion/Pop`).
- **Route cards and route steps** appear one after another, in reading order.
- The calendar drops down from the date pill, and the check mark pops in on the chosen Arrive by / Leave at card.

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
- Animations are reduced when the system asks for reduced motion: sliding and bouncing are switched off and only fades remain
  (`MotionConfig reducedMotion="user"` in `app/providers.tsx`).

## Deploying to Vercel

Import the repository in Vercel with the default Next.js settings and Node 22 or 24. On Vercel the SQLite
file lives in `/tmp`, which is temporary and not shared between server functions. The demo data is
re-created automatically. Saved routes are still written to SQLite, and the "See what was sent" link also
carries a copy of the route (`lib/tripLink.ts`), so the saved-route page works even when the row is gone.
