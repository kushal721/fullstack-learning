import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { mockFetchJson } from "../test/mock-fetch.ts";
import { useApi } from "./useApi.ts";

describe("useApi", () => {
  it("starts loading, then returns the data", async () => {
    mockFetchJson({ value: 1 });
    const { result } = renderHook(() => useApi<{ value: number }>("/thing"));

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.data).toEqual({ value: 1 }));
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("returns the API error", async () => {
    mockFetchJson({ error: { code: "NOT_FOUND", message: "Nope" } }, 404);
    const { result } = renderHook(() => useApi("/missing"));

    await waitFor(() => expect(result.current.error).not.toBeNull());
    expect(result.current.error?.isNotFound).toBe(true);
    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
  });

  it("loads nothing when the path is null", () => {
    const fetchMock = mockFetchJson({});
    const { result } = renderHook(() => useApi(null));

    expect(result.current.isLoading).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("cancels the request when the component unmounts", () => {
    const fetchMock = mockFetchJson({});
    const { unmount } = renderHook(() => useApi("/slow"));

    const signal = fetchMock.mock.calls[0]?.[1]?.signal;
    expect(signal?.aborted).toBe(false);
    unmount();
    expect(signal?.aborted).toBe(true);
  });

  it("fetches again on reload", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockRejectedValueOnce(new TypeError("offline"))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true })));
    const { result } = renderHook(() => useApi("/flaky"));

    await waitFor(() => expect(result.current.error?.code).toBe("NETWORK"));
    act(() => result.current.reload());
    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.data).toEqual({ ok: true }));
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("shows a cached response immediately on the next mount", async () => {
    mockFetchJson({ value: 1 });
    const first = renderHook(() => useApi("/cached"));
    await waitFor(() => expect(first.result.current.data).toBeDefined());
    first.unmount();

    const second = renderHook(() => useApi("/cached"));
    expect(second.result.current.isLoading).toBe(false);
    expect(second.result.current.data).toEqual({ value: 1 });
  });
});
