import type { Concept, Topic } from "@fsl/shared";
import { concepts } from "../content/concepts/index.js";
import { learningTree } from "../content/learning-tree.js";

/** All content that is checked. Later registries (concepts, build steps…) are added here. */
export type Content = {
  tree: Topic;
  concepts: Concept[];
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

  // buildStepIds are checked once build steps exist (M05.1.1).
  return errors;
}

/** Text fields every concept must fill (relatedFiles/BuildSteps come later). */
const REQUIRED_CONCEPT_LISTS = [
  "basics",
  "what",
  "why",
  "howItWorks",
  "internals",
  "howToCreate",
  "whereUsed",
  "connectsTo",
  "projectUsage",
  "commonMistakes",
] as const;

function validateConcepts(tree: Topic, concepts: Concept[]): string[] {
  const topics = allTopics(tree);
  const topicIds = new Set(topics.map((topic) => topic.id));
  const conceptIds = new Set(concepts.map((concept) => concept.id));
  const errors = [
    ...duplicates(
      concepts.map((concept) => concept.id),
      (id) => `Concept id "${id}" is used more than once.`,
    ),
    ...duplicates(
      concepts.map((concept) => concept.slug),
      (slug) => `Concept slug "${slug}" is used more than once.`,
    ),
  ];

  for (const concept of concepts) {
    const name = `Concept "${concept.id}"`;
    if (!SLUG_PATTERN.test(concept.slug)) {
      errors.push(
        `${name} has slug "${concept.slug}"; use lowercase letters, numbers and single hyphens.`,
      );
    }
    if (!topicIds.has(concept.topicId)) {
      errors.push(`${name} belongs to unknown topic "${concept.topicId}".`);
    }
    if (!concept.title.trim() || !concept.summary.trim()) {
      errors.push(`${name} needs a title and a summary.`);
    }
    if (!concept.basicExample.code.trim()) {
      errors.push(`${name} needs a basic example.`);
    }
    for (const field of REQUIRED_CONCEPT_LISTS) {
      if (concept[field].length === 0) {
        errors.push(`${name} has an empty "${field}" section.`);
      }
    }
    for (const relatedId of concept.relatedConcepts) {
      if (relatedId === concept.id) {
        errors.push(`${name} lists itself as a related concept.`);
      } else if (!conceptIds.has(relatedId)) {
        errors.push(`${name} links to unknown related concept "${relatedId}".`);
      }
    }
  }

  for (const topic of topics) {
    for (const conceptId of topic.conceptIds) {
      const concept = concepts.find((c) => c.id === conceptId);
      if (!concept) {
        errors.push(
          `Topic "${topic.id}" lists unknown concept "${conceptId}".`,
        );
      } else if (concept.topicId !== topic.id) {
        errors.push(
          `Topic "${topic.id}" lists concept "${conceptId}", but that concept belongs to "${concept.topicId}".`,
        );
      }
    }
  }
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
  content: Content = { tree: learningTree, concepts },
): string[] {
  return [
    ...validateTopics(content.tree),
    ...validateConcepts(content.tree, content.concepts),
  ];
}
