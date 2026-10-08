import type { TopicResponse, TopicTreeResponse } from "@fsl/shared";
import { Router } from "express";
import { notFoundError, validationError } from "../lib/http-error.js";
import {
  getAdjacentTopics,
  getTopicBySlug,
  getTopicTree,
  toTopicSummary,
} from "../lib/learning-tree.js";

export const topicsRouter = Router();

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// GET /api/topics — the whole learning tree (titles and summaries only).
topicsRouter.get("/", (_req, res) => {
  const body: TopicTreeResponse = { tree: getTopicTree() };
  res.json(body);
});

// GET /api/topics/:slug — one topic with its neighbours and related content.
topicsRouter.get("/:slug", (req, res) => {
  const { slug } = req.params;
  if (!SLUG_PATTERN.test(slug)) {
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
    concepts: [],
    buildSteps: [],
  };
  res.json(body);
});
