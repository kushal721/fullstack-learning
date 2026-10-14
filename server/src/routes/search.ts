import type { SearchResponse } from "@fsl/shared";
import { Router } from "express";
import { validationError } from "../lib/http-error.js";
import { MIN_QUERY_LENGTH, search } from "../lib/search.js";

export const searchRouter = Router();

const MAX_QUERY_LENGTH = 100;

// GET /api/search?q=useState — concepts, files, functions, components,
// build steps, connections and flows that match, grouped in that order.
searchRouter.get("/", (req, res) => {
  const { q } = req.query;
  const query = typeof q === "string" ? q.trim() : "";
  if (query.length < MIN_QUERY_LENGTH) {
    throw validationError(
      `q must be at least ${MIN_QUERY_LENGTH} characters, e.g. /api/search?q=useState.`,
    );
  }
  if (query.length > MAX_QUERY_LENGTH) {
    throw validationError(`q must be at most ${MAX_QUERY_LENGTH} characters.`);
  }
  const body: SearchResponse = search(query);
  res.json(body);
});
