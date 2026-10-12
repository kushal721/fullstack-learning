import type {
  CodeSymbol,
  FileSummary,
  ProjectFile,
  Relationship,
  RelationshipView,
  SymbolSummary,
} from "@fsl/shared";
import { relationships } from "../content/relationships.js";
import { symbols } from "../content/symbols.js";
import { findLine, getFile } from "./project-files.js";

/**
 * The Notes App as a graph: symbols are the nodes, relationships the
 * directed edges (source <type> target). Every helper takes the graph as
 * an optional last argument so tests can use small sample graphs.
 *
 * `imports` relationships are the one exception: their ends are file ids
 * (e.g. "frontend/src/App.jsx"), one per local import statement, so the
 * graph also answers "which files depend on which" (fileDependencies,
 * fileDependents). Symbol ids always contain ":", file ids never do.
 */
export type ProjectGraph = {
  symbols: CodeSymbol[];
  relationships: Relationship[];
};

const defaultGraph: ProjectGraph = { symbols, relationships };

export function getSymbol(
  id: string,
  graph: ProjectGraph = defaultGraph,
): CodeSymbol | undefined {
  return graph.symbols.find((symbol) => symbol.id === id);
}

/** The file and line a symbol is defined on, if it lives in the project. */
export function definedIn(
  id: string,
  graph: ProjectGraph = defaultGraph,
): { file: ProjectFile; line?: number } | undefined {
  const symbol = getSymbol(id, graph);
  const file = symbol?.fileId ? getFile(symbol.fileId) : undefined;
  if (!symbol || !file) return undefined;
  const line = symbol.match ? findLine(file.id, symbol.match) : symbol.line;
  return line ? { file, line } : { file };
}

function symbolsFor(ids: string[], graph: ProjectGraph): CodeSymbol[] {
  return [...new Set(ids)]
    .map((id) => getSymbol(id, graph))
    .filter((symbol): symbol is CodeSymbol => symbol !== undefined);
}

/** Symbols that call this one. */
export function calledBy(
  id: string,
  graph: ProjectGraph = defaultGraph,
): CodeSymbol[] {
  return symbolsFor(
    graph.relationships
      .filter((rel) => rel.type === "calls" && rel.target === id)
      .map((rel) => rel.source),
    graph,
  );
}

/** Symbols this one calls. */
export function calls(
  id: string,
  graph: ProjectGraph = defaultGraph,
): CodeSymbol[] {
  return symbolsFor(
    graph.relationships
      .filter((rel) => rel.type === "calls" && rel.source === id)
      .map((rel) => rel.target),
    graph,
  );
}

/**
 * Files involved with a symbol: its own file first, then the files of every
 * symbol directly connected to it (in either direction), each once.
 */
export function connectedFiles(
  id: string,
  graph: ProjectGraph = defaultGraph,
): ProjectFile[] {
  const neighbours = graph.relationships.flatMap((rel) =>
    rel.source === id ? [rel.target] : rel.target === id ? [rel.source] : [],
  );
  const fileIds = symbolsFor([id, ...neighbours], graph)
    .map((symbol) => symbol.fileId)
    .filter((fileId): fileId is string => fileId !== undefined);
  return [...new Set(fileIds)]
    .map((fileId) => getFile(fileId))
    .filter((file): file is ProjectFile => file !== undefined);
}

/**
 * Everything within `depth` steps of a symbol, following relationships in
 * both directions: the symbols (start first, then by distance) and the
 * relationships between them.
 */
export function neighborhood(
  id: string,
  depth = 1,
  graph: ProjectGraph = defaultGraph,
): ProjectGraph {
  if (!getSymbol(id, graph)) return { symbols: [], relationships: [] };
  const seen = new Set([id]);
  let frontier = [id];
  for (let step = 0; step < depth && frontier.length > 0; step++) {
    const next: string[] = [];
    for (const rel of graph.relationships) {
      for (const [from, to] of [
        [rel.source, rel.target],
        [rel.target, rel.source],
      ] as const) {
        if (frontier.includes(from) && !seen.has(to)) {
          seen.add(to);
          next.push(to);
        }
      }
    }
    frontier = next;
  }
  return {
    symbols: symbolsFor([...seen], graph),
    relationships: graph.relationships.filter(
      (rel) => seen.has(rel.source) && seen.has(rel.target),
    ),
  };
}

function filesFor(ids: string[]): ProjectFile[] {
  return [...new Set(ids)]
    .map((fileId) => getFile(fileId))
    .filter((file): file is ProjectFile => file !== undefined);
}

/** Files this file imports, in the order they are imported. */
export function fileDependencies(
  fileId: string,
  graph: ProjectGraph = defaultGraph,
): ProjectFile[] {
  return filesFor(
    graph.relationships
      .filter((rel) => rel.type === "imports" && rel.source === fileId)
      .map((rel) => rel.target),
  );
}

/** Files that import this file. */
export function fileDependents(
  fileId: string,
  graph: ProjectGraph = defaultGraph,
): ProjectFile[] {
  return filesFor(
    graph.relationships
      .filter((rel) => rel.type === "imports" && rel.target === fileId)
      .map((rel) => rel.source),
  );
}

// --- Views for the API -----------------------------------------------------

/** The symbol with `line` resolved from its `match` text. */
export function withLine(symbol: CodeSymbol): CodeSymbol {
  if (!symbol.fileId || !symbol.match) return symbol;
  const line = findLine(symbol.fileId, symbol.match);
  return line ? { ...symbol, line } : symbol;
}

export function toSymbolSummary(symbol: CodeSymbol): SymbolSummary {
  const { id, kind, name, fileId, line } = withLine(symbol);
  return {
    id,
    kind,
    name,
    ...(fileId ? { fileId } : {}),
    ...(line ? { line } : {}),
  };
}

export function toFileSummary(file: ProjectFile, line?: number): FileSummary {
  const { id, path, layer, purpose } = file;
  return { id, path, layer, purpose, ...(line ? { line } : {}) };
}

/**
 * Relationships of one type that end (`"in"`) or start (`"out"`) at a
 * symbol, each with the symbol at the other end.
 */
export function relationshipViews(
  id: string,
  type: Relationship["type"],
  direction: "in" | "out",
  graph: ProjectGraph = defaultGraph,
): RelationshipView[] {
  return graph.relationships
    .filter(
      (rel) =>
        rel.type === type &&
        (direction === "in" ? rel.target : rel.source) === id,
    )
    .flatMap((rel) => {
      const other = getSymbol(
        direction === "in" ? rel.source : rel.target,
        graph,
      );
      return other
        ? [
            {
              id: rel.id,
              type: rel.type,
              direction,
              explanation: rel.explanation,
              symbol: toSymbolSummary(other),
            },
          ]
        : [];
    });
}

/** Symbols defined in a file (by line) and the symbols they connect to. */
export function fileSymbols(
  fileId: string,
  graph: ProjectGraph = defaultGraph,
): { defined: SymbolSummary[]; referenced: SymbolSummary[] } {
  const defined = graph.symbols
    .filter((symbol) => symbol.fileId === fileId)
    .map(toSymbolSummary)
    .sort((a, b) => (a.line ?? 0) - (b.line ?? 0));
  const here = new Set(defined.map((symbol) => symbol.id));
  const otherIds = graph.relationships.flatMap((rel) =>
    here.has(rel.source) && !here.has(rel.target)
      ? [rel.target]
      : here.has(rel.target) && !here.has(rel.source)
        ? [rel.source]
        : [],
  );
  return {
    defined,
    referenced: symbolsFor(otherIds, graph).map(toSymbolSummary),
  };
}

// `handles` and `receives` point back in time: an event triggers its
// handler, a request reaches its route. Every other type points forward.
const BACKWARD: Relationship["type"][] = ["handles", "receives"];

function viewsOfTypes(
  id: string,
  types: Relationship["type"][],
  direction: "in" | "out",
  graph: ProjectGraph,
): RelationshipView[] {
  return types.flatMap((type) => relationshipViews(id, type, direction, graph));
}

function forwardTypes(graph: ProjectGraph): Relationship["type"][] {
  return [...new Set(graph.relationships.map((rel) => rel.type))].filter(
    (type) => type !== "imports" && !BACKWARD.includes(type),
  );
}

/**
 * What comes before a symbol and uses it: relationships pointing at it,
 * plus the event that triggers it (a handler) or the request that reaches
 * it (a route). File imports are left out.
 */
export function usedByViews(
  id: string,
  graph: ProjectGraph = defaultGraph,
): RelationshipView[] {
  return [
    ...viewsOfTypes(id, BACKWARD, "out", graph),
    ...viewsOfTypes(id, forwardTypes(graph), "in", graph),
  ];
}

/** What a symbol calls, renders, uses, queries… (file imports left out). */
export function usesViews(
  id: string,
  graph: ProjectGraph = defaultGraph,
): RelationshipView[] {
  return viewsOfTypes(id, forwardTypes(graph), "out", graph);
}

// Order steps happen in: middleware runs before the route calls the
// controller, a component renders before…, a controller answers last.
const FLOW_ORDER: Relationship["type"][] = [
  "handles",
  "receives",
  "uses",
  "calls",
  "renders",
  "sends",
  "queries",
  "returns",
];

/**
 * What happens next, following the data: what it calls, uses, sends… plus
 * the handler of an event and the route that receives a request. Empty for
 * dead ends, where control returns to the caller.
 */
export function nextSteps(
  id: string,
  graph: ProjectGraph = defaultGraph,
): RelationshipView[] {
  return [
    ...viewsOfTypes(id, BACKWARD, "in", graph),
    ...usesViews(id, graph),
  ].sort((a, b) => FLOW_ORDER.indexOf(a.type) - FLOW_ORDER.indexOf(b.type));
}
