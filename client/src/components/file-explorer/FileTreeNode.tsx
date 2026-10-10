import type { FileTreeNode as Node } from "@fsl/shared";
import type { KeyboardEvent } from "react";
import type { useTreeKeyboard } from "../../hooks/useTreeKeyboard.ts";
import { FileIcon, FolderIcon } from "./icons.tsx";
import { LayerBadge } from "./LayerBadge.tsx";

type Props = {
  node: Node;
  level: number;
  position: number;
  siblingCount: number;
  expanded: Set<string>;
  selectedPath: string | null;
  onToggle: (path: string) => void;
  onSelect: (path: string) => void;
  getItemProps: ReturnType<typeof useTreeKeyboard>["getItemProps"];
};

export function FileTreeNode({
  node,
  level,
  position,
  siblingCount,
  expanded,
  selectedPath,
  onToggle,
  onSelect,
  getItemProps,
}: Props) {
  const isFolder = node.type === "folder";
  const isExpanded = isFolder && expanded.has(node.path);
  const isSelected = !isFolder && node.path === selectedPath;
  const itemProps = getItemProps(node.path);

  // Arrow keys belong to the tree; Enter and Space act on this item.
  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (isFolder) onToggle(node.path);
      else onSelect(node.path);
      return;
    }
    itemProps.onKeyDown(event);
  }

  return (
    <li role="none">
      <div
        role="treeitem"
        aria-level={level}
        aria-posinset={position}
        aria-setsize={siblingCount}
        aria-expanded={isFolder ? isExpanded : undefined}
        aria-selected={isFolder ? undefined : isSelected}
        {...itemProps}
        onKeyDown={handleKeyDown}
        onClick={() => (isFolder ? onToggle(node.path) : onSelect(node.path))}
        // Indent by depth so the nesting is visible.
        style={{ paddingLeft: `${(level - 1) * 1}rem` }}
        className={`flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm ${
          isSelected
            ? "bg-accent/10 font-medium text-accent"
            : "hover:bg-foreground/5"
        }`}
      >
        <span className="text-muted">
          {isFolder ? <FolderIcon open={isExpanded} /> : <FileIcon />}
        </span>
        <span className="truncate">{node.name}</span>
        {isFolder && level === 1 && (
          // The folder name already says the layer; the badge only adds the
          // colour, so screen readers skip it instead of reading it twice.
          <span className="ml-auto" aria-hidden="true">
            <LayerBadge
              layer={
                node.name === "frontend" ||
                node.name === "backend" ||
                node.name === "database"
                  ? node.name
                  : "root"
              }
            />
          </span>
        )}
      </div>
      {isExpanded && (
        <ul role="group">
          {node.children.map((child, index) => (
            <FileTreeNode
              key={child.path}
              node={child}
              level={level + 1}
              position={index + 1}
              siblingCount={node.children.length}
              expanded={expanded}
              selectedPath={selectedPath}
              onToggle={onToggle}
              onSelect={onSelect}
              getItemProps={getItemProps}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
