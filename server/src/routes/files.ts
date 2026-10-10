import type { FileResponse, FileTreeResponse } from "@fsl/shared";
import { Router } from "express";
import { getConcept, toConceptSummary } from "../lib/concepts.js";
import { notFoundError, validationError } from "../lib/http-error.js";
import {
  buildFileTree,
  getAllFiles,
  getFile,
  readFileSource,
} from "../lib/project-files.js";

export const filesRouter = Router();

// GET /api/files — every example-project file as nested folders.
filesRouter.get("/", (_req, res) => {
  const body: FileTreeResponse = { tree: buildFileTree(getAllFiles()) };
  res.json(body);
});

// GET /api/files/frontend/src/App.jsx (or …/frontend%2Fsrc%2FApp.jsx)
// The rest of the URL is the file's path inside example-project/.
filesRouter.get("/*path", async (req, res) => {
  const segments = (req.params as { path: string[] }).path;
  const id = segments.join("/");

  // Only plain relative paths are ever valid file ids. Reject anything that
  // tries to climb out of the project, before even looking it up.
  if (
    id
      .split("/")
      .some((part) => part === "" || part === "." || part === "..") ||
    /[\\\0]/.test(id)
  ) {
    throw validationError(
      "A file path is made of folder and file names separated by /.",
    );
  }

  const file = getFile(id);
  if (!file) throw notFoundError(`No file "${id}" in the example project.`);

  const source = await readFileSource(id);
  if (source === undefined) throw notFoundError(`No file "${id}".`);

  const body: FileResponse = {
    file,
    source,
    concepts: file.conceptIds
      .map((conceptId) => getConcept(conceptId))
      .filter((concept) => concept !== undefined)
      .map(toConceptSummary),
  };
  res.json(body);
});
