import type { TopicResponse, TopicTreeResponse } from "@fsl/shared";
import { Router } from "express";
import { getStepsForTopic, toBuildStepSummary } from "../lib/build-journey.js";
import { getConcept, toConceptSummary } from "../lib/concepts.js";
import { notFoundError, validationError } from "../lib/http-error.js";
import {
  getAdjacentTopics,
  getTopicBySlug,
  getTopicTree,
  getTree,
  toTopicSummary,
} from "../lib/learning-tree.js";
import { isSlug } from "../lib/slug.js";

export const topicsRouter = Router();

// GET /api/topics — the whole learning tree (titles and summaries only)
// and where a beginner should start.
topicsRouter.get("/", (_req, res) => {
  const body: TopicTreeResponse = {
    tree: getTopicTree(),
    whereToStart: getTree().whereToStart,
  };
  res.json(body);
});

// GET /api/topics/:slug — one topic with its neighbours and related content.
topicsRouter.get("/:slug", (req, res) => {
  const { slug } = req.params;
  if (!isSlug(slug)) {
    throw validationError(
      "A topic slug may only contain lowercase letters, numbers and hyphens.",
    );
  }

  const topic = getTopicBySlug(slug);
  if (!topic) throw notFoundError(`No topic named "${slug}".`);

  const { previous, next } = getAdjacentTopics(topic.id);
  const body: TopicResponse = {
    topic,
    previous: previous && toTopicSummary(previous),
    next: next && toTopicSummary(next),
    concepts: topic.conceptIds
      .map((id) => getConcept(id))
      .filter((concept) => concept !== undefined)
      .map(toConceptSummary),
    buildSteps: getStepsForTopic(topic).map(toBuildStepSummary),
  };
  res.json(body);
});
