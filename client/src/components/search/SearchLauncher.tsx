import { useCallback, useEffect, useState } from "react";
import { SearchDialog } from "./SearchDialog.tsx";

/** True while the user is typing somewhere, so "/" belongs to that field. */
function isTyping(target: EventTarget | null) {
  const element = target as HTMLElement | null;
  return Boolean(
    element &&
    (element.isContentEditable ||
      ["INPUT", "TEXTAREA", "SELECT"].includes(element.tagName)),
  );
}

const isMac = () => /Mac|iPhone|iPad/.test(navigator.platform);

/**
 * The header's search button, plus the keyboard shortcuts that open the
 * same dialog from anywhere: "/" (when not typing) and Ctrl+K / Cmd+K.
 */
export function SearchLauncher() {
  const [open, setOpen] = useState(false);
  const openSearch = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const commandK =
        event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey);
      const slash =
        event.key === "/" &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey &&
        !isTyping(event.target);
      if (commandK || slash) {
        event.preventDefault();
        openSearch();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openSearch]);

  return (
    <>
      <button
        type="button"
        onClick={openSearch}
        aria-keyshortcuts="/ Control+K Meta+K"
        className="flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm text-muted hover:bg-foreground/5 hover:text-foreground"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        Search
        <kbd className="hidden rounded border border-border px-1.5 font-mono text-xs sm:inline">
          {isMac() ? "⌘K" : "Ctrl K"}
        </kbd>
      </button>
      <SearchDialog open={open} onClose={close} />
    </>
  );
}
