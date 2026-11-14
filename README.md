# OC Transpo Travel Planner: guided trip planner (COMP 3008, Assignment 4, Group 22)

A working version of our Assignment 3 prototype (Design A, the guided step-by-step trip planner).
It is a student project, not an official OC Transpo site. Routes and times are demo data.

- **Running online:** <https://comp3008-a4-travel-planner.vercel.app>
- **Assignment 3 prototype (Figma):** [open the prototype](https://www.figma.com/proto/WatRJObVFN6fVwSuB6bzx9/Material-UI-for-Figma--and-MUI-X---Community---Copy-?node-id=8408-34&t=AH0RTuuAQzNqKEwy-1&scaling=min-zoom&content-scaling=fixed&page-id=6036%3A164056&starting-point-node-id=8408%3A34)

## Software required

- **Node.js 22.13 or newer** (Node 24 recommended). Check with `node -v`.
- npm (comes with Node).

Nothing else needs to be installed. `npm install` downloads the libraries listed in `package.json`
(Next.js, React, Material UI, Tailwind CSS, Motion, Leaflet). The database is SQLite through Node's built-in
`node:sqlite` module, and the file `data/planner.db` is created and filled with demo data the first time the app runs.
No accounts, passwords or API keys are needed.

## How to run it

From this folder:

```bash
npm install
```

```bash
npm run dev
```

Then open <http://localhost:3000>. (If port 3000 is busy, Next.js prints the port it used instead.)

To run the production build instead: `npm run build`, then `npm start`.

The map uses OpenStreetMap tiles, so the map views need an internet connection. Everything else works offline.

## Where to begin the task

Start on the first screen, **Plan a trip**, and press **Start planning**.

**Task:** find a route from *Place d'Orléans Dr* to *Carleton University* that arrives by 5:30 PM on Tuesday, October 6, 2026.

| Step | What to do | What happens |
| --- | --- | --- |
| 1. Where | Type `orleans` in **From** and pick **Place d'Orléans Dr**. Type `carl` in **To** and pick **Carleton University**. | Suggestions filter as you type. A map preview appears when both are chosen, and **Next** unlocks. |
| 2. When | Choose **Arrive by**. Press **Choose date** and pick October 6, 2026 in the calendar. Click the **hour** wheel and scroll or type `5`, then the **min** wheel and `30` (or click a value directly; on a phone, swipe or tap), then press **PM**. | The date and time controls only appear after you choose Arrive by or Leave at. A sentence repeats the goal back. |
| 3. Services | Leave the recommended services, press **Next**. | Each option is explained in plain language. |
| 4. Review | Press **Find my routes**. | **Error path:** no stop is within the 10-minute walking limit of Place d'Orléans Dr. |
| Recovery | Press **Use this stop** (or **Change start location instead**). | The search runs again with every other answer kept, and the results appear. |
| Results | The 4:30 PM → 5:28 PM route is already selected. Try **Arrive by 5:15 PM**, pick another route, or press **Explore route** (**Explore** on a phone). | Results update. The popup lists every walk, bus and train. |
| Finish | In the popup press **Send to my phone** (or **Trip preview** first for the map). On a phone these are **Send** and **Preview**. | A confirmation with a reference code appears. **See what was sent** opens the saved route. |

Other things to try:

- **Edit** on the Review screen (a pencil icon on a phone) opens a step with your answers still filled in, and returns to Review.
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

## Tests

```bash
npm test
```

Runs the animation and interaction tests (Vitest and React Testing Library).

## More detail

[docs/IMPLEMENTATION.md](docs/IMPLEMENTATION.md) covers the technology, how the code is organised, what changed from the
Assignment 3 prototype, motion, screen sizes, the tests, performance, accessibility and deployment.
