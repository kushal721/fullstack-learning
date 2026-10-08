import type { Topic } from "@fsl/shared";
import { learningTree } from "../content/learning-tree.js";

/** Every topic in reading order (depth-first), without the root. */
function flatten(topic: Topic): Topic[] {
  return topic.children.flatMap((child) => [child, ...flatten(child)]);
}

const allTopics = flatten(learningTree);
const bySlug = new Map(allTopics.map((topic) => [topic.slug, topic]));
const indexById = new Map(allTopics.map((topic, index) => [topic.id, index]));

/** The whole tree, starting at the root "Full-Stack Development". */
export function getTree(): Topic {
  return learningTree;
}

/** Every topic in the order a learner reads them. */
export function getAllTopics(): Topic[] {
  return allTopics;
}

export function getTopicBySlug(slug: string): Topic | undefined {
  return bySlug.get(slug);
}

/** The topics before and after this one in reading order. */
export function getAdjacentTopics(id: string): {
  previous?: Topic;
  next?: Topic;
} {
  const index = indexById.get(id);
  if (index === undefined) return {};
  return { previous: allTopics[index - 1], next: allTopics[index + 1] };
}
