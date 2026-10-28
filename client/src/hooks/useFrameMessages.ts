import { type RefObject, useEffect, useRef } from "react";

/** A message a sandboxed playground or exercise frame sends this page. */
export type FrameMessage =
  /** A page's console line or error. */
  | { source: "fsl-page"; kind: "log" | "warn" | "error"; text: string }
  /** How a "your turn" run went, with each check's result for a page. */
  | {
      source: "fsl-runner";
      passed: number;
      total: number;
      results?: { label: string; pass: boolean; detail: string }[];
    };

function isFrameMessage(data: unknown): data is FrameMessage {
  if (typeof data !== "object" || data === null) return false;
  const m = data as Record<string, unknown>;
  if (m.source === "fsl-page") {
    return typeof m.text === "string" && typeof m.kind === "string";
  }
  return (
    m.source === "fsl-runner" &&
    typeof m.passed === "number" &&
    typeof m.total === "number" &&
    (m.results === undefined || Array.isArray(m.results))
  );
}

/**
 * Calls `onMessage` for each message from this frame only: never from
 * another frame or page, whatever it claims to be.
 */
export function useFrameMessages(
  frame: RefObject<HTMLIFrameElement | null>,
  onMessage: (message: FrameMessage) => void,
) {
  // The latest callback, without re-adding the listener every render.
  const handler = useRef(onMessage);
  useEffect(() => {
    handler.current = onMessage;
  });
  useEffect(() => {
    function listener(event: MessageEvent) {
      if (event.source !== frame.current?.contentWindow) return;
      if (isFrameMessage(event.data)) handler.current(event.data);
    }
    window.addEventListener("message", listener);
    return () => window.removeEventListener("message", listener);
  }, [frame]);
}
