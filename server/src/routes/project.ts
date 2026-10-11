import type { DiffResponse, SnapshotResponse } from "@fsl/shared";
import { Router } from "express";
import { getOrderedSteps } from "../lib/build-journey.js";
import { notFoundError, validationError } from "../lib/http-error.js";
import { diffSnapshots, getSnapshot } from "../lib/project-evolution.js";

export const projectRouter = Router();

/** Parses a step number: a whole number from 0 (empty project) to the last step. */
function parseOrder(value: unknown, name: string): number {
  if (typeof value !== "string" || !/^\d+$/.test(value)) {
    throw validationError(`"${name}" must be a whole number of 0 or more.`);
  }
  return Number(value);
}

function lastOrder() {
  return getOrderedSteps().at(-1)?.order ?? 0;
}

// GET /api/project/snapshots/:order — the project's files after a step.
projectRouter.get("/snapshots/:order", (req, res) => {
  const order = parseOrder(req.params.order, "order");
  if (order > lastOrder()) {
    throw notFoundError(
      `No build step ${order}; the journey has ${lastOrder()} steps.`,
    );
  }
  const { tree } = getSnapshot(order);
  const body: SnapshotResponse = { order, tree };
  res.json(body);
});

// GET /api/project/diff?from=&to= — files added, removed and modified
// between two steps.
projectRouter.get("/diff", (req, res) => {
  const from = parseOrder(req.query.from, "from");
  const to = parseOrder(req.query.to, "to");
  if (from > to) {
    throw validationError(`"from" (${from}) must not be after "to" (${to}).`);
  }
  if (to > lastOrder()) {
    throw validationError(
      `"to" must be at most ${lastOrder()}, the last build step.`,
    );
  }
  const body: DiffResponse = diffSnapshots(from, to);
  res.json(body);
});
