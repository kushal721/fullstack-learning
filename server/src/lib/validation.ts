import type {
  BuildStep,
  CodeSymbol,
  Concept,
  Flow,
  ProjectFile,
  Relationship,
  SymbolKind,
  Topic,
} from "@fsl/shared";
import { readFileSync } from "node:fs";
import path from "node:path";
import { config } from "../config.js";
import { buildSteps } from "../content/build-steps/index.js";
import { concepts } from "../content/concepts/index.js";
import { projectFiles } from "../content/files.js";
import { flows } from "../content/flows/index.js";
import { learningTree } from "../content/learning-tree.js";
import { relationships } from "../content/relationships.js";
import { symbols } from "../content/symbols.js";
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
  /** Reads an example file's source (for checking `match` texts). */
  readSource?: (fileId: string) => string | undefined;
  symbols?: CodeSymbol[];
  relationships?: Relationship[];
  flows?: Flow[];
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
  relationships: Relationship[],
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

  // Every code connection (not file imports) is created by exactly one step.
  if (relationships.length > 0 && steps.length > 0) {
    const byId = new Map(relationships.map((rel) => [rel.id, rel]));
    const claimed = new Map<string, string>();
    for (const step of steps) {
      for (const relId of step.relationshipIds) {
        const rel = byId.get(relId);
        if (!rel) {
          errors.push(
            `Build step "${step.id}" lists unknown relationship "${relId}".`,
          );
        } else if (rel.type === "imports") {
          errors.push(
            `Build step "${step.id}" lists file import "${relId}"; imports show in the file changes instead.`,
          );
        } else if (claimed.has(relId)) {
          errors.push(
            `Relationship "${relId}" is created by both "${claimed.get(relId)}" and "${step.id}".`,
          );
        } else {
          claimed.set(relId, step.id);
        }
      }
    }
    for (const rel of relationships) {
      if (rel.type !== "imports" && !claimed.has(rel.id)) {
        errors.push(
          `Relationship "${rel.id}" isn't created by any build step.`,
        );
      }
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

function validateConceptLinks(
  concepts: Concept[],
  files: ProjectFile[],
  steps: BuildStep[],
  readSource: (fileId: string) => string | undefined,
): string[] {
  const fileIds = new Set(files.map((file) => file.id));
  const stepIds = new Set(steps.map((step) => step.id));
  const errors: string[] = [];
  for (const concept of concepts) {
    const name = `Concept "${concept.id}"`;
    for (const fileId of concept.relatedFiles) {
      if (!fileIds.has(fileId)) {
        errors.push(`${name} lists unknown related file "${fileId}".`);
      }
    }
    for (const stepId of concept.relatedBuildSteps) {
      if (!stepIds.has(stepId)) {
        errors.push(`${name} lists unknown build step "${stepId}".`);
      }
    }
    concept.projectUsage.forEach((usage, index) => {
      const where = `${name} projectUsage[${index}]`;
      if (usage.match !== undefined && usage.fileId === undefined) {
        errors.push(`${where} has a match but no fileId.`);
      }
      if (usage.fileId === undefined) return;
      if (!fileIds.has(usage.fileId)) {
        errors.push(`${where} points at unknown file "${usage.fileId}".`);
        return;
      }
      if (usage.match === undefined) return;
      const lines = readSource(usage.fileId)?.split("\n") ?? [];
      if (!lines.some((line) => line.includes(usage.match!))) {
        errors.push(
          `${where}: "${usage.match}" is not on any line of ${usage.fileId}.`,
        );
      }
    });
  }
  return errors;
}

/** The id prefix each symbol kind uses (docs/NOTES_APP.md "Symbol ids"). */
const SYMBOL_PREFIX: Record<SymbolKind, string> = {
  function: "fn",
  component: "component",
  hook: "hook",
  event: "event",
  route: "route",
  middleware: "middleware",
  controller: "controller",
  query: "query",
  table: "table",
  "http-request": "http-request",
  external: "external",
};

function validateGraph(
  symbols: CodeSymbol[],
  relationships: Relationship[],
  concepts: Concept[],
  files: ProjectFile[],
  readSource: (fileId: string) => string | undefined,
): string[] {
  const symbolIds = new Set(symbols.map((symbol) => symbol.id));
  const conceptIds = new Set(concepts.map((concept) => concept.id));
  const fileIds = new Set(files.map((file) => file.id));
  const errors = [
    ...duplicates(
      symbols.map((symbol) => symbol.id),
      (id) => `Symbol id "${id}" is used more than once.`,
    ),
    ...duplicates(
      relationships.map((rel) => rel.id),
      (id) => `Relationship "${id}" is listed more than once.`,
    ),
  ];

  for (const symbol of symbols) {
    const name = `Symbol "${symbol.id}"`;
    const prefix = `${SYMBOL_PREFIX[symbol.kind]}:`;
    if (!symbol.id.startsWith(prefix) || symbol.id === prefix) {
      errors.push(
        `${name} is a ${symbol.kind}, so its id must start with "${prefix}".`,
      );
    }
    // The tracer answers "what data does it handle?" for every symbol.
    if (
      !symbol.name.trim() ||
      !symbol.summary.trim() ||
      !symbol.dataHandled?.trim()
    ) {
      errors.push(`${name} needs a name, a summary and dataHandled.`);
    }
    for (const conceptId of symbol.conceptIds) {
      if (!conceptIds.has(conceptId)) {
        errors.push(`${name} links to unknown concept "${conceptId}".`);
      }
    }
    if (symbol.fileId === undefined) {
      if (symbol.match !== undefined || symbol.line !== undefined) {
        errors.push(`${name} has a match or line but no fileId.`);
      }
      continue;
    }
    if (!fileIds.has(symbol.fileId)) {
      errors.push(`${name} is in unknown file "${symbol.fileId}".`);
      continue;
    }
    const lines = readSource(symbol.fileId)?.split("\n") ?? [];
    if (
      symbol.match !== undefined &&
      !lines.some((l) => l.includes(symbol.match!))
    ) {
      errors.push(
        `${name}: "${symbol.match}" is not on any line of ${symbol.fileId}.`,
      );
    }
    if (
      symbol.line !== undefined &&
      (symbol.line < 1 || symbol.line > lines.length)
    ) {
      errors.push(
        `${name} points at line ${symbol.line}, but ${symbol.fileId} has ${lines.length} lines.`,
      );
    }
  }

  for (const rel of relationships) {
    const name = `Relationship "${rel.id}"`;
    const expectedId = `${rel.source}->${rel.type}->${rel.target}`;
    if (rel.id !== expectedId) {
      errors.push(`${name} must have the id "${expectedId}".`);
    }
    // `imports` connects files; every other type connects symbols.
    for (const end of [rel.source, rel.target]) {
      if (rel.type === "imports" ? !fileIds.has(end) : !symbolIds.has(end)) {
        errors.push(
          `${name} connects unknown ${rel.type === "imports" ? "file" : "symbol"} "${end}".`,
        );
      }
    }
    if (rel.source === rel.target) {
      errors.push(`${name} connects a symbol to itself.`);
    }
    if (!rel.explanation.trim()) {
      errors.push(`${name} needs an explanation.`);
    }
  }
  return errors;
}

function validateFlows(
  flows: Flow[],
  symbols: CodeSymbol[],
  relationships: Relationship[],
): string[] {
  const symbolIds = new Set(symbols.map((symbol) => symbol.id));
  const relationshipIds = new Set(relationships.map((rel) => rel.id));
  const errors = duplicates(
    flows.map((flow) => flow.id),
    (id) => `Flow id "${id}" is used more than once.`,
  );
  for (const flow of flows) {
    const name = `Flow "${flow.id}"`;
    if (!SLUG_PATTERN.test(flow.id)) {
      errors.push(
        `${name} needs an id of lowercase letters, numbers and single hyphens.`,
      );
    }
    if (!flow.title.trim() || !flow.summary.trim()) {
      errors.push(`${name} needs a title and a summary.`);
    }
    errors.push(
      ...duplicates(
        flow.steps.map((step) => step.id),
        (id) => `${name} has step id "${id}" more than once.`,
      ),
    );
    for (const step of flow.steps) {
      const where = `${name} step "${step.id}"`;
      if (!symbolIds.has(step.symbolId)) {
        errors.push(`${where} is at unknown symbol "${step.symbolId}".`);
      }
      if (
        step.relationshipId !== undefined &&
        !relationshipIds.has(step.relationshipId)
      ) {
        errors.push(
          `${where} follows unknown relationship "${step.relationshipId}".`,
        );
      }
      if (!step.title.trim() || !step.explanation.trim()) {
        errors.push(`${where} needs a title and an explanation.`);
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
    readSource: (fileId) =>
      readFileSync(path.join(config.exampleProjectDir, fileId), "utf8"),
    symbols,
    relationships,
    flows,
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
      content.relationships ?? [],
    ),
    ...(content.files
      ? validateConceptLinks(
          content.concepts,
          content.files,
          content.buildSteps ?? [],
          content.readSource ?? (() => undefined),
        )
      : []),
    ...validateGraph(
      content.symbols ?? [],
      content.relationships ?? [],
      content.concepts,
      content.files ?? [],
      content.readSource ?? (() => undefined),
    ),
    ...validateFlows(
      content.flows ?? [],
      content.symbols ?? [],
      content.relationships ?? [],
    ),
  ];
}
