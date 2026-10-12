import type { SymbolGraphResponse, SymbolResponse } from "@fsl/shared";
import { Router } from "express";
import { notFoundError, validationError } from "../lib/http-error.js";
import {
  connectedFiles,
  definedIn,
  getSymbol,
  neighborhood,
  relationshipViews,
  toFileSummary,
  withLine,
} from "../lib/project-graph.js";

export const symbolsRouter = Router();

// Symbol ids contain ":", spaces and "/" (e.g. "route:POST /api/notes"), so
// clients send them URL-encoded: /api/symbols/route%3APOST%20%2Fapi%2Fnotes

function findSymbol(id: string) {
  const symbol = getSymbol(id);
  if (!symbol) throw notFoundError(`No symbol "${id}".`);
  return symbol;
}

// GET /api/symbols/:id — one symbol, where it is defined, what calls it,
// what it calls and the files involved.
symbolsRouter.get("/:id", (req, res) => {
  const symbol = findSymbol(req.params.id);
  const where = definedIn(symbol.id);
  const body: SymbolResponse = {
    symbol: withLine(symbol),
    ...(where ? { definedIn: toFileSummary(where.file, where.line) } : {}),
    calledBy: relationshipViews(symbol.id, "calls", "in"),
    calls: relationshipViews(symbol.id, "calls", "out"),
    files: connectedFiles(symbol.id).map((file) => toFileSummary(file)),
  };
  res.json(body);
});

// GET /api/symbols/:id/graph?depth=1..3 — the symbols and relationships
// within `depth` steps, in both directions.
symbolsRouter.get("/:id/graph", (req, res) => {
  const { depth: rawDepth = "1" } = req.query;
  if (typeof rawDepth !== "string" || !/^[1-3]$/.test(rawDepth)) {
    throw validationError("depth must be 1, 2 or 3.");
  }
  const symbol = findSymbol(req.params.id);
  const { symbols, relationships } = neighborhood(symbol.id, Number(rawDepth));
  const body: SymbolGraphResponse = {
    nodes: symbols.map(withLine),
    edges: relationships,
  };
  res.json(body);
});
