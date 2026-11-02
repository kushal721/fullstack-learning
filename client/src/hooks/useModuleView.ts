import { useCallback, useState } from "react";

/** How a module is read: one part at a time (the default) or as one page. */
export type ModuleView = "parts" | "page";

/** Saved in this browser only, like progress. */
export const MODULE_VIEW_KEY = "fsl:module-view:v1";

// Storage can be missing or blocked (private windows, strict settings):
// the choice then lasts until the page is reloaded.
function load(): ModuleView {
  try {
    return localStorage.getItem(MODULE_VIEW_KEY) === "page" ? "page" : "parts";
  } catch {
    return "parts";
  }
}

/** The learner's chosen way to read modules, remembered across visits. */
export function useModuleView(): [ModuleView, (view: ModuleView) => void] {
  const [view, setView] = useState(load);
  const choose = useCallback((next: ModuleView) => {
    setView(next);
    try {
      localStorage.setItem(MODULE_VIEW_KEY, next);
    } catch {
      // Not saved; it still applies until the page is reloaded.
    }
  }, []);
  return [view, choose];
}
