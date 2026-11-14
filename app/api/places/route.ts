// GET /api/places?q=orl  ->  places whose name matches the text (all places when q is empty).
import { searchPlaces } from "@/lib/db";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q") ?? "";
  try {
    return Response.json({ places: searchPlaces(query.slice(0, 80)) });
  } catch (error) {
    console.error("GET /api/places failed", error);
    return Response.json({ places: [], error: "Could not load places." }, { status: 500 });
  }
}
