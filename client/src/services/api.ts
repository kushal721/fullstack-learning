import type { ApiError } from "@fsl/shared";

// The only place in the client that talks to the API. Components never call
// fetch() themselves: they use these functions (usually through useApi).

/** An API call that failed: HTTP error, unreachable server or bad response. */
export class ApiRequestError extends Error {
  /** HTTP status, or 0 when the server could not be reached. */
  readonly status: number;
  /** Machine-readable code from the API (e.g. "NOT_FOUND"). */
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.code = code;
  }

  get isNotFound() {
    return this.status === 404;
  }
}

function isApiError(body: unknown): body is ApiError {
  const error = (body as ApiError | null)?.error;
  return typeof error?.code === "string" && typeof error.message === "string";
}

/** GET /api{path} and return the JSON body as T. */
export async function apiGet<T>(
  path: string,
  { signal }: { signal?: AbortSignal } = {},
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api${path}`, {
      signal,
      headers: { Accept: "application/json" },
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new ApiRequestError(0, "NETWORK", "Could not reach the server.");
  }

  const body: unknown = await res.json().catch(() => null);

  if (!res.ok) {
    if (isApiError(body)) {
      throw new ApiRequestError(
        res.status,
        body.error.code,
        body.error.message,
      );
    }
    throw new ApiRequestError(
      res.status,
      "HTTP_ERROR",
      `Request failed (${res.status}).`,
    );
  }
  if (body === null) {
    throw new ApiRequestError(
      res.status,
      "INVALID_RESPONSE",
      "The server sent an unexpected response.",
    );
  }
  return body as T;
}

/** Every API path the client uses, so URLs are written in one place. */
export const apiPaths = {
  health: () => "/health",
  topicTree: () => "/topics",
  topic: (slug: string) => `/topics/${encodeURIComponent(slug)}`,
  concepts: () => "/concepts",
  concept: (slug: string) => `/concepts/${encodeURIComponent(slug)}`,
  fileTree: () => "/files",
  // Each folder name is encoded on its own, so the path keeps its slashes.
  file: (path: string) =>
    `/files/${path.split("/").map(encodeURIComponent).join("/")}`,
  buildSteps: () => "/build-steps",
  buildStep: (slug: string) => `/build-steps/${encodeURIComponent(slug)}`,
  snapshot: (order: number) => `/project/snapshots/${order}`,
  diff: (from: number, to: number) => `/project/diff?from=${from}&to=${to}`,
  // Symbol ids contain ":", spaces and "/", so they are encoded whole.
  symbol: (id: string) => `/symbols/${encodeURIComponent(id)}`,
  symbolGraph: (id: string, depth = 1) =>
    `/symbols/${encodeURIComponent(id)}/graph?depth=${depth}`,
  fileSymbols: (path: string) =>
    `/files/${path.split("/").map(encodeURIComponent).join("/")}/symbols`,
};
