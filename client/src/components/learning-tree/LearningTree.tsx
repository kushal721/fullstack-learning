import type { TopicTreeNode } from "@fsl/shared";
import { useCallback, useMemo, useState } from "react";
import {
  type TreeKeyboardItem,
  useTreeKeyboard,
} from "../../hooks/useTreeKeyboard.ts";
import { LearningNode } from "./LearningNode.tsx";

type Props = {
  /** The root topic; its children are shown as the first level. */
  root: TopicTreeNode;
};

/** Top-level topics that have children start expanded. */
function initiallyExpanded(root: TopicTreeNode) {
  return new Set(
    root.children
      .filter((topic) => topic.children.length > 0)
      .map((topic) => topic.id),
  );
}

/** The rows a learner can currently see, in display order. */
function visibleItems(
  topics: TopicTreeNode[],
  expanded: Set<string>,
  parentId: string | null = null,
): TreeKeyboardItem[] {
  return topics.flatMap((topic) => {
    const isExpanded = expanded.has(topic.id);
    const item: TreeKeyboardItem = {
      id: topic.id,
      parentId,
      hasChildren: topic.children.length > 0,
      expanded: isExpanded,
    };
    return isExpanded
      ? [item, ...visibleItems(topic.children, expanded, topic.id)]
      : [item];
  });
}

/**
 * The Learning Tree (spec §4.1). It renders whatever tree the API sends, so
 * adding or reordering topics never requires changing this component.
 */
export function LearningTree({ root }: Props) {
  const [expanded, setExpanded] = useState(() => initiallyExpanded(root));

  const setTopicExpanded = useCallback((id: string, isExpanded: boolean) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (isExpanded) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const items = useMemo(
    () => visibleItems(root.children, expanded),
    [root, expanded],
  );
  const { getItemProps } = useTreeKeyboard({
    items,
    onExpandedChange: setTopicExpanded,
  });

  return (
    <ul role="tree" aria-label={root.title} className="flex flex-col gap-1">
      {root.children.map((topic, index) => (
        <LearningNode
          key={topic.id}
          topic={topic}
          level={1}
          position={index + 1}
          siblingCount={root.children.length}
          expanded={expanded}
          onExpandedChange={setTopicExpanded}
          getItemProps={getItemProps}
        />
      ))}
    </ul>
  );
}
