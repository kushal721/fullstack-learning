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

/** Sends a request to /api{path} and returns the JSON body as T. */
async function send<T>(
  path: string,
  init: RequestInit,
  signal?: AbortSignal,
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api${path}`, { ...init, signal });
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

/** GET /api{path} and return the JSON body as T. */
export function apiGet<T>(
  path: string,
  { signal }: { signal?: AbortSignal } = {},
): Promise<T> {
  return send<T>(path, { headers: { Accept: "application/json" } }, signal);
}

/**
 * POST `body` as JSON to /api{path} and return the JSON answer as T. Used
 * for actions such as checking a practice answer, so it isn't cached.
 */
export function apiPost<T>(
  path: string,
  body: unknown,
  { signal }: { signal?: AbortSignal } = {},
): Promise<T> {
  return send<T>(
    path,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
    signal,
  );
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
  flows: (group?: string) =>
    group ? `/flows?group=${encodeURIComponent(group)}` : "/flows",
  flow: (id: string) => `/flows/${encodeURIComponent(id)}`,
  fileSymbols: (path: string) =>
    `/files/${path.split("/").map(encodeURIComponent).join("/")}/symbols`,
  exercises: (mode?: string) =>
    mode ? `/exercises?mode=${encodeURIComponent(mode)}` : "/exercises",
  exercise: (id: string) => `/exercises/${encodeURIComponent(id)}`,
  checkExercise: (id: string) => `/exercises/${encodeURIComponent(id)}/check`,
  search: (query: string) => `/search?q=${encodeURIComponent(query)}`,
  path: (topic: string) => `/paths/${encodeURIComponent(topic)}`,
  step: (topic: string, step: string) =>
    `/paths/${encodeURIComponent(topic)}/steps/${encodeURIComponent(step)}`,
  checkStep: (topic: string, step: string) =>
    `/paths/${encodeURIComponent(topic)}/steps/${encodeURIComponent(step)}/check`,
  glossary: () => "/glossary",
  glossaryEntry: (id: string) => `/glossary/${encodeURIComponent(id)}`,
  courseMap: () => "/course-map",
};
