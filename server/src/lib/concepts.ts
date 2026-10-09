import type { Concept } from "@fsl/shared";
import { concepts } from "../content/concepts/index.js";

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
