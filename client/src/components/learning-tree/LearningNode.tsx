import type { TopicTreeNode } from "@fsl/shared";
import { Link } from "react-router";
import type { useTreeKeyboard } from "../../hooks/useTreeKeyboard.ts";

type Props = {
  topic: TopicTreeNode;
  level: number;
  /** Position among siblings and number of siblings, for screen readers. */
  position: number;
  siblingCount: number;
  expanded: Set<string>;
  onExpandedChange: (id: string, expanded: boolean) => void;
  getItemProps: ReturnType<typeof useTreeKeyboard>["getItemProps"];
};

// One topic in the tree. The link is the tree item; its accessible name is
// just the title, and the summary is attached as a description.
export function LearningNode({
  topic,
  level,
  position,
  siblingCount,
  expanded,
  onExpandedChange,
  getItemProps,
}: Props) {
  const titleId = `topic-${topic.id}-title`;
  const summaryId = `topic-${topic.id}-summary`;
  const hasChildren = topic.children.length > 0;
  const isExpanded = hasChildren && expanded.has(topic.id);

  return (
    <li role="none">
      <div className="flex items-start">
        {/* Mouse shortcut only: keyboard and screen-reader users expand with
            the arrow keys, and aria-expanded on the item announces the state. */}
        <span
          aria-hidden="true"
          onClick={
            hasChildren
              ? () => onExpandedChange(topic.id, !isExpanded)
              : undefined
          }
          data-testid={hasChildren ? `toggle-${topic.id}` : undefined}
          className={`mt-4 flex size-6 shrink-0 select-none items-center justify-center rounded text-muted ${
            hasChildren ? "cursor-pointer hover:bg-foreground/5" : ""
          }`}
        >
          {hasChildren ? (isExpanded ? "▾" : "▸") : ""}
        </span>
        <Link
          to={`/learn/${topic.slug}`}
          role="treeitem"
          aria-level={level}
          aria-posinset={position}
          aria-setsize={siblingCount}
          aria-expanded={hasChildren ? isExpanded : undefined}
          aria-labelledby={titleId}
          aria-describedby={summaryId}
          {...getItemProps(topic.id)}
          className="group flex flex-1 gap-4 rounded-lg border border-transparent p-3 transition-colors hover:border-border hover:bg-foreground/5"
        >
          <span
            aria-hidden="true"
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm font-semibold text-accent"
          >
            {topic.order}
          </span>
          <span className="flex flex-col gap-0.5">
            <span id={titleId} className="font-medium group-hover:text-accent">
              {topic.title}
            </span>
            <span id={summaryId} className="text-sm text-muted">
              {topic.summary}
            </span>
          </span>
        </Link>
      </div>
      {isExpanded && (
        <ul role="group" className="ml-9 border-l border-border pl-3">
          {topic.children.map((child, index) => (
            <LearningNode
              key={child.id}
              topic={child}
              level={level + 1}
              position={index + 1}
              siblingCount={topic.children.length}
              expanded={expanded}
              onExpandedChange={onExpandedChange}
              getItemProps={getItemProps}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
