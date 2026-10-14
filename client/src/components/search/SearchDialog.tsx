import type { SearchResponse, SearchResult } from "@fsl/shared";
import {
  type KeyboardEvent,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router";
import { useApi } from "../../hooks/useApi.ts";
import { apiPaths } from "../../services/api.ts";
import { RichText } from "../ui/RichText.tsx";

const MIN_LENGTH = 2;
const DEBOUNCE_MS = 200;

/** `value`, but only after it has stopped changing for `ms`. */
function useDebounced(value: string, ms: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(timer);
  }, [value, ms]);
  return debounced;
}

type Props = { open: boolean; onClose: () => void };

/**
 * Global search in a modal <dialog>: the browser traps focus inside it and
 * closes it on Esc. The input is a combobox; arrow keys move through the
 * grouped results (announced with aria-activedescendant), Enter opens one.
 */
export function SearchDialog({ open, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const listId = useId();
  const [query, setQuery] = useState("");
  // The active result belongs to one query; a new query starts at 0.
  const [chosen, setChosen] = useState({ query: "", index: 0 });
  const debounced = useDebounced(query.trim(), DEBOUNCE_MS);
  const searching = debounced.length >= MIN_LENGTH;
  const { data, error, isLoading } = useApi<SearchResponse>(
    searching ? apiPaths.search(debounced) : null,
  );

  // Where focus was before opening, to give it back on close.
  const opener = useRef<Element | null>(null);

  // The `open` prop is the only source of truth: Esc, the close button and
  // the backdrop all go through onClose, and only this effect opens or
  // closes the native dialog, so React and the browser never disagree.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      opener.current = document.activeElement;
      dialog.showModal();
      // Start in the search box, with any earlier query selected.
      inputRef.current?.focus();
      inputRef.current?.select();
    } else if (!open && dialog.open) {
      const target = opener.current;
      const giveBack =
        target instanceof HTMLElement &&
        target !== document.body &&
        target.isConnected;
      // Nothing to go back to: don't leave focus in the hidden dialog. Blur
      // first, while the search box is still part of the page.
      if (
        !giveBack &&
        document.activeElement instanceof HTMLElement &&
        dialog.contains(document.activeElement)
      ) {
        document.activeElement.blur();
      }
      dialog.close();
      if (giveBack) target.focus();
    }
  }, [open]);

  const groups = useMemo(
    () => (searching && data?.query === debounced ? data.groups : []),
    [searching, data, debounced],
  );
  const flat = useMemo(() => groups.flatMap((g) => g.results), [groups]);
  const optionId = (index: number) => `${listId}-option-${index}`;
  const active =
    chosen.query === debounced && chosen.index < flat.length ? chosen.index : 0;
  const setActive = (index: number) => setChosen({ query: debounced, index });
  // Where each group's options start in the flat list.
  const starts = groups.map((_, g) =>
    groups.slice(0, g).reduce((sum, group) => sum + group.results.length, 0),
  );

  // Keep the active result in view while moving with the keyboard.
  useEffect(() => {
    document
      .getElementById(optionId(active))
      ?.scrollIntoView?.({ block: "nearest" });
    // optionId only depends on listId, which never changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  function go(result: SearchResult) {
    onClose();
    navigate(result.href);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    // One Esc closes, even with text in the box (a search box would
    // otherwise only clear itself); the query is kept for next time.
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }
    if (flat.length === 0) return;
    const moves: Record<string, number> = {
      ArrowDown: (active + 1) % flat.length,
      ArrowUp: (active - 1 + flat.length) % flat.length,
      Home: 0,
      End: flat.length - 1,
    };
    if (event.key in moves) {
      event.preventDefault();
      setActive(moves[event.key]!);
    } else if (event.key === "Enter") {
      event.preventDefault();
      go(flat[active]!);
    }
  }

  const total = groups.reduce((sum, g) => sum + g.total, 0);
  const status = !query.trim()
    ? "Search concepts, files, code, build steps, connections and flows."
    : query.trim().length < MIN_LENGTH
      ? `Type at least ${MIN_LENGTH} characters.`
      : error
        ? error.message
        : isLoading || debounced !== query.trim()
          ? "Searching…"
          : total === 0
            ? `No results for “${debounced}”.`
            : `${total} result${total === 1 ? "" : "s"} for “${debounced}”. Use the arrow keys to choose, Enter to open.`;

  return (
    <dialog
      ref={dialogRef}
      aria-label="Search"
      // Keep Tab inside the dialog: from the last control back to the
      // first, and Shift+Tab the other way.
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const controls = [
          ...(dialogRef.current?.querySelectorAll<HTMLElement>(
            "input, button",
          ) ?? []),
        ];
        const first = controls[0];
        const last = controls.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }}
      // Esc: let React close it (see the effect above).
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      // A click on the backdrop lands on the dialog element itself.
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
      className="mx-auto mt-[10vh] w-[calc(100%-2rem)] max-w-2xl rounded-xl border border-border bg-background p-0 text-foreground shadow-2xl backdrop:bg-black/50"
    >
      <div className="flex flex-col">
        <div className="flex items-center gap-2 border-b-2 border-border px-4 focus-within:border-accent">
          <input
            ref={inputRef}
            type="search"
            role="combobox"
            aria-label="Search the platform"
            aria-expanded={flat.length > 0}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={
              flat.length > 0 ? optionId(active) : undefined
            }
            autoComplete="off"
            spellCheck={false}
            placeholder="Search, e.g. useState"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onKeyDown}
            // The row's accent underline shows focus instead; the global
            // :focus-visible outline isn't layered, so it is overridden here.
            style={{ outline: "none" }}
            className="min-w-0 flex-1 bg-transparent py-4 text-lg"
          />
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border px-2 py-1 text-xs text-muted hover:bg-foreground/5"
          >
            Esc
            <span className="sr-only"> (close search)</span>
          </button>
        </div>

        <p role="status" className="px-4 py-2 text-sm text-muted">
          {status}
        </p>

        <div
          id={listId}
          role="listbox"
          aria-label="Search results"
          className="max-h-[60vh] overflow-y-auto px-2 pb-2"
        >
          {groups.map((group, g) => {
            const headingId = `${listId}-${group.type}`;
            return (
              <div key={group.type} role="group" aria-labelledby={headingId}>
                <p
                  id={headingId}
                  className="px-2 pt-3 pb-1 text-xs font-semibold uppercase tracking-wide text-muted"
                >
                  {group.label}
                  {group.total > group.results.length &&
                    ` (top ${group.results.length} of ${group.total})`}
                </p>
                {group.results.map((result, r) => {
                  const i = starts[g]! + r;
                  const selected = i === active;
                  return (
                    <div
                      key={result.id}
                      id={optionId(i)}
                      role="option"
                      aria-selected={selected}
                      onMouseMove={() => setActive(i)}
                      onClick={() => go(result)}
                      className={`cursor-pointer rounded-md px-2 py-2 ${
                        selected ? "bg-accent/10" : ""
                      }`}
                    >
                      <span
                        className={`block font-medium [overflow-wrap:anywhere] ${
                          selected ? "text-accent" : ""
                        }`}
                      >
                        {result.title}
                      </span>
                      <span className="block text-sm text-muted">
                        <RichText text={result.text} />
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </dialog>
  );
}
