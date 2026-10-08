import type { Topic } from "@fsl/shared";
import { learningTree } from "../content/learning-tree.js";

/** All content that is checked. Later registries (concepts, build steps…) are added here. */
export type Content = {
  tree: Topic;
};

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function allTopics(topic: Topic): Topic[] {
  return [topic, ...topic.children.flatMap(allTopics)];
}

/** Errors for every value that appears more than once. */
function duplicates(values: string[], describe: (value: string) => string) {
  const seen = new Set<string>();
  const reported = new Set<string>();
  const errors: string[] = [];
  for (const value of values) {
    if (seen.has(value) && !reported.has(value)) {
      errors.push(describe(value));
      reported.add(value);
    }
    seen.add(value);
  }
  return errors;
}

function validateTopics(tree: Topic): string[] {
  const topics = allTopics(tree);
  const errors = [
    ...duplicates(
      topics.map((topic) => topic.id),
      (id) => `Topic id "${id}" is used more than once.`,
    ),
    ...duplicates(
      topics.map((topic) => topic.slug),
      (slug) => `Topic slug "${slug}" is used more than once.`,
    ),
  ];

  for (const topic of topics) {
    if (!SLUG_PATTERN.test(topic.slug)) {
      errors.push(
        `Topic "${topic.id}" has slug "${topic.slug}"; use lowercase letters, numbers and single hyphens.`,
      );
    }
    if (!topic.title.trim() || !topic.summary.trim()) {
      errors.push(`Topic "${topic.id}" needs a title and a summary.`);
    }
    const orders = topic.children.map((child) => child.order);
    const expected = orders.map((_, index) => index + 1);
    if (orders.join() !== expected.join()) {
      errors.push(
        `Children of topic "${topic.id}" must be ordered 1..${orders.length} (found ${orders.join(", ")}).`,
      );
    }
  }

  // Resolution checks for conceptIds / buildStepIds are added by the issues
  // that create the concept and build-step registries (M03.1.1, M05.1.1).
  return errors;
}

/**
 * Checks that the learning content is consistent: ids are unique and every
 * reference points at something that exists. Returns readable error
 * messages; an empty list means the content is valid.
 *
 * Every issue that adds a kind of content data extends this function.
 */
export function validateContent(
  content: Content = { tree: learningTree },
): string[] {
  return [...validateTopics(content.tree)];
}
