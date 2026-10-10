import type { FileTreeFolder, FileTreeNode as Node } from "@fsl/shared";
import { useCallback, useMemo, useState } from "react";
import {
  type TreeKeyboardItem,
  useTreeKeyboard,
} from "../../hooks/useTreeKeyboard.ts";
import { FileTreeNode } from "./FileTreeNode.tsx";

type Props = {
  tree: FileTreeFolder;
  selectedPath: string | null;
  onSelect: (path: string) => void;
};

/** Folder paths above a file: "a/b/c.js" → ["a", "a/b"]. */
function ancestorFolders(path: string): string[] {
  const parts = path.split("/").slice(0, -1);
  return parts.map((_, index) => parts.slice(0, index + 1).join("/"));
}

/** Top-level folders start open, plus the folders above the selected file. */
function initiallyExpanded(tree: FileTreeFolder, selectedPath: string | null) {
  const top = tree.children
    .filter((node) => node.type === "folder")
    .map((node) => node.path);
  return new Set([
    ...top,
    ...(selectedPath ? ancestorFolders(selectedPath) : []),
  ]);
}

function visibleItems(
  nodes: Node[],
  expanded: Set<string>,
  parentId: string | null = null,
): TreeKeyboardItem[] {
  return nodes.flatMap((node) => {
    const isFolder = node.type === "folder";
    const isExpanded = isFolder && expanded.has(node.path);
    const item: TreeKeyboardItem = {
      id: node.path,
      parentId,
      hasChildren: isFolder && node.children.length > 0,
      expanded: isExpanded,
    };
    return isFolder && isExpanded
      ? [item, ...visibleItems(node.children, expanded, node.path)]
      : [item];
  });
}

/**
 * The Notes App's files as a tree. Keyboard support comes from the same
 * useTreeKeyboard hook as the learning tree.
 */
export function FileTree({ tree, selectedPath, onSelect }: Props) {
  const [expanded, setExpanded] = useState(() =>
    initiallyExpanded(tree, selectedPath),
  );

  const setFolderExpanded = useCallback((path: string, open: boolean) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (open) next.add(path);
      else next.delete(path);
      return next;
    });
  }, []);

  const toggle = useCallback(
    (path: string) => setFolderExpanded(path, !expanded.has(path)),
    [expanded, setFolderExpanded],
  );

  const items = useMemo(
    () => visibleItems(tree.children, expanded),
    [tree, expanded],
  );
  const { getItemProps } = useTreeKeyboard({
    items,
    onExpandedChange: setFolderExpanded,
    defaultFocusId: selectedPath ?? undefined,
  });

  return (
    <ul role="tree" aria-label="Notes App files" className="flex flex-col">
      {tree.children.map((node, index) => (
        <FileTreeNode
          key={node.path}
          node={node}
          level={1}
          position={index + 1}
          siblingCount={tree.children.length}
          expanded={expanded}
          selectedPath={selectedPath}
          onToggle={toggle}
          onSelect={onSelect}
          getItemProps={getItemProps}
        />
      ))}
    </ul>
  );
}
