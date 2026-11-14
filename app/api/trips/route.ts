// POST /api/trips  ->  saves the chosen route ("Send to my phone") and returns its reference code.
// Sending a text message is simulated: the trip is stored in SQLite and can be opened at /trip/<code>.
import { saveTrip } from "@/lib/db";
import type { Itinerary, SavedTrip } from "@/lib/types";

type Body = Omit<SavedTrip, "code" | "createdAt">;

function isItinerary(value: unknown): value is Itinerary {
  const it = value as Itinerary;
  return !!it && typeof it.id === "string" && Number.isInteger(it.leave) && Number.isInteger(it.arrive) && Array.isArray(it.legs);
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return Response.json({ ok: false, message: "The request was not valid JSON." }, { status: 400 });
  }
  if (!isItinerary(body.itinerary) || typeof body.fromName !== "string" || typeof body.toName !== "string") {
    return Response.json({ ok: false, message: "Choose a route before sending it." }, { status: 400 });
  }
  try {
    const saved = saveTrip({
      fromName: body.fromName,
      toName: body.toName,
      date: String(body.date),
      mode: body.mode === "leave" ? "leave" : "arrive",
      time: Number(body.time),
      itinerary: body.itinerary,
    });
    return Response.json({ ok: true, code: saved.code });
  } catch (error) {
    console.error("POST /api/trips failed", error);
    return Response.json({ ok: false, message: "We could not send the route. Please try again." }, { status: 500 });
  }
}
