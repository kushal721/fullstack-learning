import type {
  CheckAnswerResponse,
  PathResponse,
  StepResponse,
} from "@fsl/shared";
import { Router } from "express";
import { notFoundError, validationError } from "../lib/http-error.js";
import { getTopicBySlug } from "../lib/learning-tree.js";
import { checkQuickAnswer, getPathView, getStepView } from "../lib/paths.js";
import { isSlug } from "../lib/slug.js";

export const pathsRouter = Router();

// Quick-check answers never leave the server before checking: steps are
// sent with toPublicBlock(), and only POST …/check reveals the answer.

function topicWithPath(slug: string) {
  if (!isSlug(slug)) {
    throw validationError(
      "A topic slug may only contain lowercase letters, numbers and hyphens.",
    );
  }
  const topic = getTopicBySlug(slug);
  if (!topic) throw notFoundError(`No topic named "${slug}".`);
  const path = getPathView(topic.id);
  if (!path) throw notFoundError(`"${topic.title}" has no guided path yet.`);
  return { topic, path };
}

function findStep(topicSlug: string, stepId: string) {
  const { topic } = topicWithPath(topicSlug);
  if (!isSlug(stepId)) {
    throw validationError(
      "A step id may only contain lowercase letters, numbers and hyphens.",
    );
  }
  const step = getStepView(topic.id, stepId);
  if (!step) throw notFoundError(`No step "${stepId}" in "${topic.title}".`);
  return { topic, step };
}

// GET /api/paths/:topic — summary, overview scene and the numbered steps of
// every level.
pathsRouter.get("/:topic", (req, res) => {
  const body: PathResponse = topicWithPath(req.params.topic).path;
  res.json(body);
});

// GET /api/paths/:topic/steps/:step — one step's blocks, the scenes and
// glossary entries it uses, and its neighbours.
pathsRouter.get("/:topic/steps/:step", (req, res) => {
  const body: StepResponse = findStep(req.params.topic, req.params.step).step;
  res.json(body);
});

// POST /api/paths/:topic/steps/:step/check — body { block, choiceId }:
// checks one quick check of the step.
pathsRouter.post("/:topic/steps/:step/check", (req, res) => {
  const { topic } = findStep(req.params.topic, req.params.step);
  const { block, choiceId } = (req.body ?? {}) as Record<string, unknown>;
  if (!Number.isInteger(block) || (block as number) < 0) {
    throw validationError("block must be the quick check's position, from 0.");
  }
  if (typeof choiceId !== "string" || !choiceId) {
    throw validationError("choiceId must be the id of the chosen answer.");
  }
  const result = checkQuickAnswer(
    topic.id,
    req.params.step,
    block as number,
    choiceId,
  );
  if (typeof result === "string") throw validationError(result);
  const body: CheckAnswerResponse = result!;
  res.json(body);
});
