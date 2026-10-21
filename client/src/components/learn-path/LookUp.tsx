import type { GlossaryIndexResponse } from "@fsl/shared";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useApi } from "../../hooks/useApi.ts";
import { apiPaths } from "../../services/api.ts";
import { exactEntry } from "./glossary-search.ts";
import { glossaryHref } from "./levels.ts";

/** Where selected text may be looked up: the step and the panel. */
const LOOKUP_AREA = "[data-lookup-area]";

type Selected = { text: string; top: number; left: number };

/** The selection, if it is a short piece of text inside a lookup area. */
function readSelection(): Selected | null {
  const selection = document.getSelection();
  const text = selection?.toString().trim().replace(/\s+/g, " ") ?? "";
  if (text.length < 2 || text.length > 40 || !selection?.rangeCount) {
    return null;
  }
  const range = selection.getRangeAt(0);
  const node = range.commonAncestorContainer;
  const element = node instanceof Element ? node : node.parentElement;
  if (!element?.closest(LOOKUP_AREA) || element.closest("input, textarea")) {
    return null;
  }
  const box = range.getBoundingClientRect();
  return {
    text,
    top: Math.min(box.bottom + 8, window.innerHeight - 48),
    left: Math.max(8, Math.min(box.left, window.innerWidth - 240)),
  };
}

/**
 * Select any word on the page (even one that isn't linked) and a "Look up"
 * button appears: a known term opens its entry, anything else is searched.
 */
export function LookUp() {
  const [selected, setSelected] = useState<Selected | null>(null);
  const navigate = useNavigate();
  const { search } = useLocation();
  const index = useApi<GlossaryIndexResponse>(
    selected ? apiPaths.glossary() : null,
  );

  useEffect(() => {
    let timer = 0;
    const onChange = () => {
      clearTimeout(timer);
      timer = window.setTimeout(() => setSelected(readSelection()), 250);
    };
    const hide = () => setSelected(null);
    document.addEventListener("selectionchange", onChange);
    window.addEventListener("scroll", hide, { passive: true });
    return () => {
      clearTimeout(timer);
      document.removeEventListener("selectionchange", onChange);
      window.removeEventListener("scroll", hide);
    };
  }, []);

  if (!selected) return null;
  const label =
    selected.text.length > 24
      ? `${selected.text.slice(0, 24)}…`
      : selected.text;

  function lookUp() {
    if (!selected) return;
    const entry = exactEntry(index.data?.entries ?? [], selected.text);
    navigate(
      glossaryHref(
        search,
        entry ? { term: entry.id } : { find: selected.text },
      ),
    );
    setSelected(null);
  }

  return (
    <button
      type="button"
      // Keep the selection while the button is pressed.
      onMouseDown={(event) => event.preventDefault()}
      onClick={lookUp}
      style={{ top: selected.top, left: selected.left }}
      className="fixed z-50 rounded-full bg-foreground px-3 py-1.5 text-sm font-medium text-background shadow-lg"
    >
      Look up “{label}”
    </button>
  );
}
