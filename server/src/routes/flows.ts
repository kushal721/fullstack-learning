import type { Flow, FlowListResponse, FlowResponse } from "@fsl/shared";
import { Router } from "express";
import {
  FLOW_GROUPS,
  getFlow,
  getFlows,
  symbolsForFlow,
  toFlowSummary,
} from "../lib/flow-tracer.js";
import { notFoundError, validationError } from "../lib/http-error.js";
import { isSlug } from "../lib/slug.js";

export const flowsRouter = Router();

// GET /api/flows — every flow without its steps.
// GET /api/flows?group=request|security — only that group.
flowsRouter.get("/", (req, res) => {
  const { group } = req.query;
  if (group !== undefined && !FLOW_GROUPS.includes(group as Flow["group"])) {
    throw validationError(`group must be one of: ${FLOW_GROUPS.join(", ")}.`);
  }
  const body: FlowListResponse = {
    flows: getFlows(group as Flow["group"] | undefined).map(toFlowSummary),
  };
  res.json(body);
});

// GET /api/flows/:id — one flow with every symbol its steps are at.
flowsRouter.get("/:id", (req, res) => {
  const { id } = req.params;
  if (!isSlug(id)) {
    throw validationError(
      "A flow id may only contain lowercase letters, numbers and hyphens.",
    );
  }
  const flow = getFlow(id);
  if (!flow) throw notFoundError(`No flow "${id}".`);
  const body: FlowResponse = { flow, symbols: symbolsForFlow(flow) };
  res.json(body);
});
