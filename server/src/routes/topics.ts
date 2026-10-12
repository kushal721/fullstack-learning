import type { LayerView, TopicResponse, TopicTreeResponse } from "@fsl/shared";
import { layerOverviews } from "../content/how-everything-connects.js";
import { Router } from "express";
import {
  getStep,
  getStepsForTopic,
  toBuildStepSummary,
} from "../lib/build-journey.js";
import { getFile } from "../lib/project-files.js";
import { toFileSummary } from "../lib/project-graph.js";
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
    ...(topic.id === "how-everything-connects" ? { layers: layerViews() } : {}),
  };
  res.json(body);
});

// The five layers of "How everything connects", with links resolved.
// Validation guarantees every id exists.
function layerViews(): LayerView[] {
  return layerOverviews.map((layer) => ({
    layer: layer.layer,
    title: layer.title,
    why: layer.why,
    concepts: layer.conceptIds
      .map((id) => getConcept(id))
      .filter((c) => c !== undefined)
      .map(toConceptSummary),
    buildSteps: layer.buildStepIds
      .map((id) => getStep(id))
      .filter((s) => s !== undefined)
      .map(toBuildStepSummary),
    files: layer.fileIds
      .map((id) => getFile(id))
      .filter((f) => f !== undefined)
      .map((f) => toFileSummary(f)),
  }));
}
