import type { ConceptListResponse, ConceptResponse } from "@fsl/shared";
import { Router } from "express";
import {
  getConceptBySlug,
  getConceptsInReadingOrder,
  getRelatedConcepts,
  toConceptSummary,
} from "../lib/concepts.js";
import { notFoundError, validationError } from "../lib/http-error.js";
import { getAllTopics, toTopicSummary } from "../lib/learning-tree.js";
import { isSlug } from "../lib/slug.js";

export const conceptsRouter = Router();

// GET /api/concepts — every concept, grouped by topic.
// GET /api/concepts?topic=<topic-id> — only the concepts of one topic.
conceptsRouter.get("/", (req, res) => {
  const { topic: topicId } = req.query;
  let concepts = getConceptsInReadingOrder();

  if (topicId !== undefined) {
    if (!isSlug(topicId)) {
      throw validationError(
        "The topic filter must be one topic id, e.g. ?topic=react.",
      );
    }
    if (!getAllTopics().some((topic) => topic.id === topicId)) {
      throw notFoundError(`No topic with id "${topicId}".`);
    }
    concepts = concepts.filter((concept) => concept.topicId === topicId);
  }

  const body: ConceptListResponse = {
    concepts: concepts.map(toConceptSummary),
  };
  res.json(body);
});

// GET /api/concepts/:slug — one concept with its topic and related concepts.
conceptsRouter.get("/:slug", (req, res) => {
  const { slug } = req.params;
  if (!isSlug(slug)) {
    throw validationError(
      "A concept slug may only contain lowercase letters, numbers and hyphens.",
    );
  }

  const concept = getConceptBySlug(slug);
  if (!concept) throw notFoundError(`No concept named "${slug}".`);

  const topic = getAllTopics().find((t) => t.id === concept.topicId);
  // Validation guarantees every concept's topic exists.
  if (!topic) throw new Error(`Concept "${concept.id}" has no topic.`);

  const body: ConceptResponse = {
    concept,
    topic: toTopicSummary(topic),
    related: getRelatedConcepts(concept.id).map(toConceptSummary),
  };
  res.json(body);
});
