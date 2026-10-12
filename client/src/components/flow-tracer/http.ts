/** Reason phrases for the status codes the Notes App uses. */
export const STATUS_TEXT: Record<number, string> = {
  200: "OK",
  201: "Created",
  204: "No Content",
  400: "Bad Request",
  401: "Unauthorized",
  404: "Not Found",
  409: "Conflict",
  500: "Internal Server Error",
};

/**
 * Splits a raw HTTP response ("HTTP/1.1 201 Created\nHeader: value\n\nbody")
 * into its parts, so each can be labelled.
 */
export function parseRawResponse(raw: string): {
  statusLine: string;
  headers: [string, string][];
  body: string;
} {
  const [head = "", ...rest] = raw.split("\n\n");
  const [statusLine = "", ...headerLines] = head.split("\n");
  const headers = headerLines.map((line): [string, string] => {
    const colon = line.indexOf(":");
    return [line.slice(0, colon).trim(), line.slice(colon + 1).trim()];
  });
  return { statusLine, headers, body: rest.join("\n\n") };
}

/** JSON pretty-printed when it parses; anything else (e.g. shortened with "…") as is. */
export function formatBody(body: string): { text: string; isJson: boolean } {
  try {
    return { text: JSON.stringify(JSON.parse(body), null, 2), isJson: true };
  } catch {
    return { text: body, isJson: false };
  }
}
