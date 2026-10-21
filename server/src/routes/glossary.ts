import type { GlossaryEntryResponse, GlossaryIndexResponse } from "@fsl/shared";
import { Router } from "express";
import { notFoundError, validationError } from "../lib/http-error.js";
import { getGlossaryEntryView, getGlossaryIndex } from "../lib/paths.js";
import { isSlug } from "../lib/slug.js";

export const glossaryRouter = Router();

// GET /api/glossary — every term and concept with its one-line answer, for
// the glossary panel to list and search.
glossaryRouter.get("/", (_req, res) => {
  const body: GlossaryIndexResponse = { entries: getGlossaryIndex() };
  res.json(body);
});

// GET /api/glossary/:id — one entry, where it is taught and used, the
// entries it links and its concept page.
glossaryRouter.get("/:id", (req, res) => {
  const { id } = req.params;
  if (!isSlug(id)) {
    throw validationError(
      "A glossary id may only contain lowercase letters, numbers and hyphens.",
    );
  }
  const view = getGlossaryEntryView(id);
  if (!view) throw notFoundError(`No glossary entry "${id}".`);
  const body: GlossaryEntryResponse = view;
  res.json(body);
});
