import { type KeyboardEvent, useCallback, useRef, useState } from "react";

/** One currently visible row of a tree, in display order. */
export type TreeKeyboardItem = {
  id: string;
  parentId: string | null;
  hasChildren: boolean;
  expanded: boolean;
};

type Options = {
  /** Visible items, top to bottom (children of collapsed items left out). */
  items: TreeKeyboardItem[];
  /** Expand (`true`) or collapse (`false`) an item. */
  onExpandedChange: (id: string, expanded: boolean) => void;
};

/**
 * Keyboard support for a WAI-ARIA tree (https://www.w3.org/WAI/ARIA/apg/patterns/treeview/):
 * only one item is in the Tab order ("roving tabindex"); arrow keys, Home and
 * End move between items; → / ← expand, collapse, or move to a child/parent.
 * Enter is left to the item itself (e.g. a link follows its href).
 *
 * The hook knows nothing about what the tree shows, so any tree can use it.
 */
export function useTreeKeyboard({ items, onExpandedChange }: Options) {
  const elements = useRef(new Map<string, HTMLElement>());
  const [focusedId, setFocusedId] = useState<string | null>(null);

  // If the focused item was hidden (its parent collapsed), fall back to the first.
  const tabStopId =
    focusedId !== null && items.some((item) => item.id === focusedId)
      ? focusedId
      : (items[0]?.id ?? null);

  const moveFocus = useCallback((id: string | undefined) => {
    if (id === undefined) return;
    setFocusedId(id);
    elements.current.get(id)?.focus();
  }, []);

  const onKeyDown = useCallback(
    (event: KeyboardEvent, id: string) => {
      const index = items.findIndex((item) => item.id === id);
      const item = items[index];
      if (!item) return;

      switch (event.key) {
        case "ArrowDown":
          moveFocus(items[index + 1]?.id);
          break;
        case "ArrowUp":
          moveFocus(items[index - 1]?.id);
          break;
        case "Home":
          moveFocus(items[0]?.id);
          break;
        case "End":
          moveFocus(items.at(-1)?.id);
          break;
        case "ArrowRight":
          if (!item.hasChildren) return;
          if (item.expanded) moveFocus(items[index + 1]?.id);
          else onExpandedChange(id, true);
          break;
        case "ArrowLeft":
          if (item.hasChildren && item.expanded) onExpandedChange(id, false);
          else moveFocus(item.parentId ?? undefined);
          break;
        default:
          return;
      }
      event.preventDefault();
    },
    [items, moveFocus, onExpandedChange],
  );

  /** Props to spread on each tree item element. */
  const getItemProps = useCallback(
    (id: string) => ({
      tabIndex: id === tabStopId ? 0 : -1,
      onKeyDown: (event: KeyboardEvent) => onKeyDown(event, id),
      onFocus: () => setFocusedId(id),
      ref: (element: HTMLElement | null) => {
        if (element) elements.current.set(id, element);
        else elements.current.delete(id);
      },
    }),
    [onKeyDown, tabStopId],
  );

  return { getItemProps };
}
