import type { TopicTreeNode } from "@fsl/shared";
import { LearningNode } from "./LearningNode.tsx";

type Props = {
  /** The root topic; its children are shown as the first level. */
  root: TopicTreeNode;
};

/**
 * The Learning Tree (spec §4.1). It renders whatever tree the API sends, so
 * adding or reordering topics never requires changing this component.
 */
export function LearningTree({ root }: Props) {
  return (
    <ul role="tree" aria-label={root.title} className="flex flex-col gap-1">
      {root.children.map((topic, index) => (
        <LearningNode
          key={topic.id}
          topic={topic}
          level={1}
          position={index + 1}
          siblingCount={root.children.length}
        />
      ))}
    </ul>
  );
}
