// POST /api/routes  ->  trips that match the request, or a structured error the UI can recover from.
import { searchRoutes } from "@/lib/routing";
import type { SearchRequest, SearchResponse } from "@/lib/types";

export async function POST(request: Request) {
  let body: SearchRequest;
  try {
    body = (await request.json()) as SearchRequest;
  } catch {
    return Response.json(
      { ok: false, error: { code: "INVALID", message: "The request was not valid JSON." } } satisfies SearchResponse,
      { status: 400 },
    );
  }
  try {
    const result = searchRoutes(body);
    const status = result.ok || result.error.code !== "INVALID" ? 200 : 400;
    return Response.json(result, { status });
  } catch (error) {
    console.error("POST /api/routes failed", error);
    return Response.json(
      { ok: false, error: { code: "SERVER", message: "The trip search is not available right now." } } satisfies SearchResponse,
      { status: 500 },
    );
  }
}
