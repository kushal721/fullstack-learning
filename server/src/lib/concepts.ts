import type {
  BuildStep,
  Concept,
  ConceptFileUse,
  ConceptSummary,
} from "@fsl/shared";
import { buildSteps } from "../content/build-steps/index.js";
import { concepts } from "../content/concepts/index.js";
import { getOrderedSteps } from "./build-journey.js";
import { getAllTopics } from "./learning-tree.js";
import { findLine, getAllFiles, getFile } from "./project-files.js";

const byId = new Map(concepts.map((concept) => [concept.id, concept]));
const bySlug = new Map(concepts.map((concept) => [concept.slug, concept]));

export function getAllConcepts(): Concept[] {
  return concepts;
}

export function getConcept(id: string): Concept | undefined {
  return byId.get(id);
}

export function getConceptBySlug(slug: string): Concept | undefined {
  return bySlug.get(slug);
}

/** Concepts that belong to a topic, in registry order. */
export function getConceptsByTopic(topicId: string): Concept[] {
  return concepts.filter((concept) => concept.topicId === topicId);
}

/**
 * Concepts linked to this one in either direction: the ones it lists, plus
 * the ones that list it. Links only need to be written on one side.
 */
export function getRelatedConcepts(id: string): Concept[] {
  const concept = byId.get(id);
  if (!concept) return [];

  const relatedIds = new Set(concept.relatedConcepts);
  for (const other of concepts) {
    if (other.relatedConcepts.includes(id)) relatedIds.add(other.id);
  }
  relatedIds.delete(id);

  return [...relatedIds]
    .map((relatedId) => byId.get(relatedId))
    .filter((related): related is Concept => related !== undefined);
}

export function toConceptSummary({
  id,
  slug,
  title,
  topicId,
  summary,
}: Concept): ConceptSummary {
  return { id, slug, title, topicId, summary };
}

/**
 * Concepts grouped by topic in learning-tree order; within a topic, in the
 * order the topic lists them (`conceptIds`), then any others.
 */
export function getConceptsInReadingOrder(): Concept[] {
  const topics = getAllTopics();
  const rank = (concept: Concept) => {
    const topicIndex = topics.findIndex((t) => t.id === concept.topicId);
    const listed = topics[topicIndex]?.conceptIds.indexOf(concept.id) ?? -1;
    return [
      topicIndex === -1 ? topics.length : topicIndex,
      listed === -1 ? Number.MAX_SAFE_INTEGER : listed,
    ] as const;
  };
  return concepts
    .map((concept, registryIndex) => ({
      concept,
      registryIndex,
      rank: rank(concept),
    }))
    .sort(
      (a, b) =>
        a.rank[0] - b.rank[0] ||
        a.rank[1] - b.rank[1] ||
        a.registryIndex - b.registryIndex,
    )
    .map(({ concept }) => concept);
}

/**
 * Build steps that introduce a concept: steps whose `conceptIds` list it
 * (written once, on the step) plus any the concept adds itself.
 */
export function getStepsIntroducing(
  concept: Concept,
  steps: BuildStep[] = buildSteps,
): BuildStep[] {
  return getOrderedSteps(steps).filter(
    (step) =>
      step.conceptIds.includes(concept.id) ||
      concept.relatedBuildSteps.includes(step.id),
  );
}

/**
 * Files that use a concept, most specific first: the files its
 * `projectUsage` explains (with the line), then `relatedFiles`, then files
 * whose `conceptIds` list the concept. Each file appears once.
 */
export function getFileUses(concept: Concept): ConceptFileUse[] {
  const uses = new Map<string, ConceptFileUse>();
  const add = (fileId: string, extra: Partial<ConceptFileUse> = {}) => {
    const file = getFile(fileId);
    if (!file || uses.has(fileId)) return;
    uses.set(fileId, {
      fileId,
      layer: file.layer,
      purpose: file.purpose,
      ...extra,
    });
  };

  for (const usage of concept.projectUsage) {
    if (!usage.fileId) continue;
    const line = usage.match ? findLine(usage.fileId, usage.match) : undefined;
    add(usage.fileId, {
      explanation: usage.explanation,
      ...(line ? { line } : {}),
    });
  }
  for (const fileId of concept.relatedFiles) add(fileId);
  for (const file of getAllFiles()) {
    if (file.conceptIds.includes(concept.id)) add(file.id);
  }
  return [...uses.values()];
}
