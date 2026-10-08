import { useCallback, useEffect, useState } from "react";
import { ApiRequestError, apiGet } from "../services/api.ts";

export type ApiState<T> = {
  data: T | undefined;
  error: ApiRequestError | null;
  isLoading: boolean;
  /** Fetch again (e.g. from a "Try again" button). */
  reload: () => void;
};

// Responses already received in this browser tab. Showing them immediately
// makes going back to a page instant; a fresh copy is still fetched.
const cache = new Map<string, unknown>();

/** Forget every cached response (used by tests). */
export function clearApiCache() {
  cache.clear();
}

type Result<T> = { path: string; data?: T; error?: ApiRequestError };

function toApiRequestError(error: unknown) {
  return error instanceof ApiRequestError
    ? error
    : new ApiRequestError(0, "UNKNOWN", "Something went wrong.");
}

/**
 * Loads GET /api{path} for a component. Pass `null` to load nothing yet.
 * The request is cancelled if the component unmounts or `path` changes.
 */
export function useApi<T>(path: string | null): ApiState<T> {
  const [result, setResult] = useState<Result<T> | null>(null);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    if (path === null) return;
    const controller = new AbortController();
    apiGet<T>(path, { signal: controller.signal })
      .then((data) => {
        cache.set(path, data);
        setResult({ path, data });
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setResult({ path, error: toApiRequestError(error) });
        }
      });
    return () => controller.abort();
  }, [path, reloadCount]);

  const reload = useCallback(() => {
    if (path !== null) cache.delete(path);
    setResult(null);
    setReloadCount((count) => count + 1);
  }, [path]);

  // Ignore a result that belongs to a previous path.
  const current = result?.path === path ? result : null;
  const cached =
    path !== null && cache.has(path) ? (cache.get(path) as T) : undefined;

  return {
    data: current?.error ? undefined : (current?.data ?? cached),
    error: current?.error ?? null,
    isLoading: path !== null && current === null && cached === undefined,
    reload,
  };
}
