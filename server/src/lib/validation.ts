import type { BuildStep, Concept, ProjectFile, Topic } from "@fsl/shared";
import { buildSteps } from "../content/build-steps/index.js";
import { concepts } from "../content/concepts/index.js";
import { projectFiles } from "../content/files.js";
import { learningTree } from "../content/learning-tree.js";
import { listExampleProjectFiles } from "./project-files.js";
import { SLUG_PATTERN } from "./slug.js";

/** All content that is checked. Later registries (concepts, build steps…) are added here. */
export type Content = {
  tree: Topic;
  concepts: Concept[];
  /** Descriptions of the example project's files (content/files.ts). */
  files?: ProjectFile[];
  /** Paths actually found on disk in example-project/. */
  diskFiles?: string[];
  buildSteps?: BuildStep[];
};

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
function validateFiles(
  files: ProjectFile[],
  diskFiles: string[],
  concepts: Concept[],
): string[] {
  const conceptIds = new Set(concepts.map((concept) => concept.id));
  const described = new Set(files.map((file) => file.id));
  const onDisk = new Set(diskFiles);
  const errors = duplicates(
    files.map((file) => file.id),
    (id) => `File "${id}" is described more than once.`,
  );

  for (const file of files) {
    const name = `File "${file.id}"`;
    if (file.path !== file.id)
      errors.push(`${name} must have path equal to its id.`);
    if (!onDisk.has(file.id)) {
      errors.push(
        `${name} is described but does not exist in example-project/.`,
      );
    }
    if (!file.purpose.trim() || !file.whyItExists.trim()) {
      errors.push(`${name} needs a purpose and a whyItExists text.`);
    }
    for (const conceptId of file.conceptIds) {
      if (!conceptIds.has(conceptId)) {
        errors.push(`${name} links to unknown concept "${conceptId}".`);
      }
    }
  }
  for (const diskFile of diskFiles) {
    if (!described.has(diskFile)) {
      errors.push(
        `File "${diskFile}" exists in example-project/ but has no entry in content/files.ts.`,
      );
    }
  }
  return errors;
}

function validateBuildSteps(
  steps: BuildStep[],
  tree: Topic,
  concepts: Concept[],
  files: ProjectFile[],
): string[] {
  const stepIds = new Set(steps.map((step) => step.id));
  const conceptIds = new Set(concepts.map((concept) => concept.id));
  const fileIds = new Set(files.map((file) => file.id));
  const errors = [
    ...duplicates(
      steps.map((step) => step.id),
      (id) => `Build step id "${id}" is used more than once.`,
    ),
    ...duplicates(
      steps.map((step) => step.slug),
      (slug) => `Build step slug "${slug}" is used more than once.`,
    ),
  ];

  const orders = steps.map((step) => step.order).sort((a, b) => a - b);
  const expected = orders.map((_, index) => index + 1);
  if (orders.join() !== expected.join()) {
    errors.push(
      `Build steps must be ordered 1..${orders.length} with no gaps or repeats (found ${orders.join(", ")}).`,
    );
  }

  for (const step of steps) {
    const name = `Build step "${step.id}"`;
    if (!SLUG_PATTERN.test(step.slug)) {
      errors.push(
        `${name} has slug "${step.slug}"; use lowercase letters, numbers and single hyphens.`,
      );
    }
    if (!step.title.trim() || !step.goal.trim() || !step.why.trim()) {
      errors.push(`${name} needs a title, a goal and a why.`);
    }
    for (const fileId of [
      ...step.filesCreated,
      ...step.filesModified,
      ...step.filesRemoved,
    ]) {
      if (!fileIds.has(fileId)) {
        errors.push(`${name} lists unknown file "${fileId}".`);
      }
    }
    for (const conceptId of step.conceptIds) {
      if (!conceptIds.has(conceptId)) {
        errors.push(`${name} lists unknown concept "${conceptId}".`);
      }
    }
    for (const prerequisite of step.prerequisites) {
      const required = steps.find((other) => other.id === prerequisite);
      if (!required) {
        errors.push(`${name} requires unknown step "${prerequisite}".`);
      } else if (required.order >= step.order) {
        errors.push(
          `${name} requires "${prerequisite}", which does not come before it.`,
        );
      }
    }
    if (step.nextStepId !== undefined) {
      const next = steps.find((other) => other.id === step.nextStepId);
      if (!next) {
        errors.push(`${name} has unknown next step "${step.nextStepId}".`);
      } else if (next.order <= step.order) {
        errors.push(
          `${name} has next step "${step.nextStepId}", which does not come after it.`,
        );
      }
    }
  }

  // Replay the journey: a file must exist before it is changed or removed,
  // and cannot be created while it already exists.
  const existing = new Set<string>();
  for (const step of [...steps].sort((a, b) => a.order - b.order)) {
    const name = `Build step "${step.id}"`;
    for (const fileId of [...step.filesModified, ...step.filesRemoved]) {
      if (fileIds.has(fileId) && !existing.has(fileId)) {
        errors.push(`${name} changes "${fileId}" before any step creates it.`);
      }
    }
    for (const fileId of step.filesRemoved) existing.delete(fileId);
    for (const fileId of step.filesCreated) {
      if (existing.has(fileId)) {
        errors.push(`${name} creates "${fileId}", which already exists.`);
      }
      existing.add(fileId);
    }
  }

  for (const topic of allTopics(tree)) {
    for (const stepId of topic.buildStepIds) {
      if (!stepIds.has(stepId)) {
        errors.push(
          `Topic "${topic.id}" lists unknown build step "${stepId}".`,
        );
      }
    }
  }
  return errors;
}

export function validateContent(
  content: Content = {
    tree: learningTree,
    concepts,
    files: projectFiles,
    diskFiles: listExampleProjectFiles(),
    buildSteps,
  },
): string[] {
  return [
    ...validateTopics(content.tree),
    ...validateConcepts(content.tree, content.concepts),
    ...validateFiles(
      content.files ?? [],
      content.diskFiles ?? [],
      content.concepts,
    ),
    ...validateBuildSteps(
      content.buildSteps ?? [],
      content.tree,
      content.concepts,
      content.files ?? [],
    ),
  ];
}
