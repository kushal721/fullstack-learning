import type { CodeSymbol, ProjectFile, Relationship } from "@fsl/shared";
import { relationships } from "../content/relationships.js";
import { symbols } from "../content/symbols.js";
import { findLine, getFile } from "./project-files.js";

/**
 * The Notes App as a graph: symbols are the nodes, relationships the
 * directed edges (source <type> target). Every helper takes the graph as
 * an optional last argument so tests can use small sample graphs.
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
