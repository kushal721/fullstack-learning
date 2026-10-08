import { vi } from "vitest";

/** Make fetch() answer with this JSON body and status. */
export function mockFetchJson(body: unknown, status = 200) {
  return vi.spyOn(globalThis, "fetch").mockImplementation(
    async () =>
      new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
      }),
  );
}

/**
 * Answer fetch() by URL: each key is a path like "/api/topics"; any other
 * URL gets the API's JSON 404.
 */
export function mockFetchRoutes(routes: Record<string, unknown>) {
  return vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
    const url = String(input);
    if (url in routes) {
      return new Response(JSON.stringify(routes[url]), { status: 200 });
    }
    return new Response(
      JSON.stringify({ error: { code: "NOT_FOUND", message: "Not found" } }),
      { status: 404 },
    );
  });
}
