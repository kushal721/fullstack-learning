import { useLocation } from "react-router";

/** Which view the URL asks for; null when the panel is closed. */
export function useGlossaryView() {
  const params = new URLSearchParams(useLocation().search);
  const term = params.get("term");
  const find = params.get("find");
  if (find !== null && (find !== "" || term === null)) {
    return { kind: "find" as const, find };
  }
  if (term !== null) return { kind: "term" as const, term };
  return null;
}
