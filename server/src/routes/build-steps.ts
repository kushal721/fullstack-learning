import type { BuildStepListResponse, BuildStepResponse } from "@fsl/shared";
import { Router } from "express";
import {
  getAdjacentSteps,
  getOrderedSteps,
  getStepBySlug,
  toBuildStepSummary,
} from "../lib/build-journey.js";
import { getConcept, toConceptSummary } from "../lib/concepts.js";
import { notFoundError, validationError } from "../lib/http-error.js";
import { diffSnapshots } from "../lib/project-evolution.js";
import { isSlug } from "../lib/slug.js";

export const buildStepsRouter = Router();

// GET /api/build-steps — the build journey in order, without the lessons.
buildStepsRouter.get("/", (_req, res) => {
  const body: BuildStepListResponse = {
    buildSteps: getOrderedSteps().map(toBuildStepSummary),
  };
  res.json(body);
});

// GET /api/build-steps/:slug — one step with its concepts, neighbours and
// the files it changes.
buildStepsRouter.get("/:slug", (req, res) => {
  const { slug } = req.params;
  if (!isSlug(slug)) {
    throw validationError(
      "A build step slug may only contain lowercase letters, numbers and hyphens.",
    );
  }

  const step = getStepBySlug(slug);
  if (!step) throw notFoundError(`No build step named "${slug}".`);

  const { previous, next } = getAdjacentSteps(step.id);
  const body: BuildStepResponse = {
    step,
    concepts: step.conceptIds
      .map((id) => getConcept(id))
      .filter((concept) => concept !== undefined)
      .map(toConceptSummary),
    previous: previous && toBuildStepSummary(previous),
    next: next && toBuildStepSummary(next),
    diff: diffSnapshots(step.order - 1, step.order),
  };
  res.json(body);
});
