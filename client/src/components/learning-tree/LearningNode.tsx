import type { TopicTreeNode } from "@fsl/shared";
import { Link } from "react-router";

type Props = {
  topic: TopicTreeNode;
  level: number;
  /** Position among siblings and number of siblings, for screen readers. */
  position: number;
  siblingCount: number;
};

// One topic in the tree. The link is the tree item; its accessible name is
// just the title, and the summary is attached as a description.
export function LearningNode({ topic, level, position, siblingCount }: Props) {
  const titleId = `topic-${topic.id}-title`;
  const summaryId = `topic-${topic.id}-summary`;
  const hasChildren = topic.children.length > 0;

  return (
    <li role="none">
      <Link
        to={`/learn/${topic.slug}`}
        role="treeitem"
        aria-level={level}
        aria-posinset={position}
        aria-setsize={siblingCount}
        aria-labelledby={titleId}
        aria-describedby={summaryId}
        className="group flex gap-4 rounded-lg border border-transparent p-3 transition-colors hover:border-border hover:bg-foreground/5"
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
      {hasChildren && (
        <ul role="group" className="ml-7 border-l border-border pl-4">
          {topic.children.map((child, index) => (
            <LearningNode
              key={child.id}
              topic={child}
              level={level + 1}
              position={index + 1}
              siblingCount={topic.children.length}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
