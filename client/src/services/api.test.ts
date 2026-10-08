import { describe, expect, it, vi } from "vitest";
import { mockFetchJson } from "../test/mock-fetch.ts";
import { ApiRequestError, apiGet } from "./api.ts";

describe("apiGet", () => {
  it("requests /api + path and returns the JSON body", async () => {
    const fetchMock = mockFetchJson({ status: "ok" });

    await expect(apiGet("/health")).resolves.toEqual({ status: "ok" });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/health",
      expect.objectContaining({ headers: { Accept: "application/json" } }),
    );
  });

  it("turns an API error response into ApiRequestError", async () => {
    mockFetchJson({ error: { code: "NOT_FOUND", message: "No topic" } }, 404);

    const error = await apiGet("/topics/x").catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiRequestError);
    expect(error).toMatchObject({
      status: 404,
      code: "NOT_FOUND",
      message: "No topic",
      isNotFound: true,
    });
  });

  it("handles error responses that are not JSON", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("Bad gateway", { status: 502 }),
    );

    await expect(apiGet("/health")).rejects.toMatchObject({
      status: 502,
      code: "HTTP_ERROR",
    });
  });

  it("reports an unreachable server as status 0", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("offline"));

    await expect(apiGet("/health")).rejects.toMatchObject({
      status: 0,
      code: "NETWORK",
    });
  });
});
