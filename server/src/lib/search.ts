import type {
  SearchResponse,
  SearchResult,
  SearchResultType,
} from "@fsl/shared";
import { buildSteps } from "../content/build-steps/index.js";
import { concepts } from "../content/concepts/index.js";
import { flows } from "../content/flows/index.js";
import { glossary } from "../content/glossary/index.js";
import { topicPaths } from "../content/paths/index.js";
import { relationships } from "../content/relationships.js";
import { symbols } from "../content/symbols.js";
import { glossaryUsage } from "./guided-learning.js";
import { getAllTopics } from "./learning-tree.js";
import { getAllFiles, readSourceSync } from "./project-files.js";
import { getSymbol, withLine } from "./project-graph.js";

/**
 * Global search over the same registries every page uses (no copy of the
 * content, no search library). Each entry has a title and a longer text;
 * a query matches an entry when every query word is found in one of them.
 */
export type SearchEntry = SearchResult & {
  /** Lowercase words of the title and of the text, for matching. */
  titleWords: string[];
  textWords: string[];
};

/** Group order and labels, as in spec §20. */
export const SEARCH_GROUPS: { type: SearchResultType; label: string }[] = [
  { type: "concept", label: "Concepts" },
  { type: "term", label: "Terms" },
  { type: "file", label: "Files" },
  { type: "function", label: "Functions" },
  { type: "component", label: "Components" },
  { type: "build-step", label: "Build steps" },
  { type: "connection", label: "Connections" },
  { type: "flow", label: "Flows" },
];

export const MIN_QUERY_LENGTH = 2;
const MAX_PER_GROUP = 10;
const SNIPPET_LENGTH = 160;

/**
 * Lowercase words: letters and digits, with camelCase and dotted names also
 * kept whole ("notesApi.createNote" → notesapi.createnote, notesapi,
 * createnote; "useState" → usestate).
 */
export function words(text: string): string[] {
  const found = new Set<string>();
  for (const raw of text.match(/[A-Za-z0-9_.$-]+/g) ?? []) {
    const whole = raw.replace(/^[.$-]+|[.$-]+$/g, "").toLowerCase();
    if (whole) found.add(whole);
    for (const part of raw.split(/[.$_-]+/)) {
      if (part) found.add(part.toLowerCase());
    }
  }
  return [...found];
}

/** Text without `backticks`, cut to a short snippet. */
function snippet(text: string): string {
  const plain = text.replace(/`/g, "").replace(/\s+/g, " ").trim();
  return plain.length > SNIPPET_LENGTH
    ? `${plain.slice(0, SNIPPET_LENGTH - 1).trimEnd()}…`
    : plain;
}

function entry(result: SearchResult, searchableText: string): SearchEntry {
  return {
    ...result,
    text: snippet(result.text),
    titleWords: words(result.title),
    textWords: words(`${result.text} ${searchableText}`),
  };
}

const explorerSymbol = (id: string) => {
  const symbol = getSymbol(id);
  const params = new URLSearchParams({ symbol: id });
  if (symbol?.fileId) {
    params.set("file", symbol.fileId);
    const line = withLine(symbol).line;
    if (line) params.set("line", String(line));
  }
  return `/explorer?${params}`;
};

// Lock files are generated lists of package versions: they would match
// almost any word and help nobody.
const NOT_INDEXED = /(^|\/)package-lock\.json$/;

/** Every searchable thing in the platform, built once at startup. */
export function buildSearchIndex(): SearchEntry[] {
  const conceptTitle = new Map(concepts.map((c) => [c.id, c.title]));
  const entries: SearchEntry[] = [];

  const shortForm = new Map(
    glossary.flatMap((g) => (g.conceptPageId ? [[g.conceptPageId, g]] : [])),
  );
  for (const concept of concepts) {
    // The glossary's other names find the concept too ("usestate setter").
    const glossaryEntry = shortForm.get(concept.id);
    entries.push(
      entry(
        {
          type: "concept",
          id: concept.id,
          title: concept.title,
          text: concept.summary,
          href: `/concepts/${concept.slug}`,
        },
        [
          concept.id,
          ...(glossaryEntry?.aliases ?? []),
          glossaryEntry?.short ?? "",
          ...concept.what,
          ...concept.basics,
        ].join(" "),
      ),
    );
  }

  // Terms (single words) open where they are taught, with the panel open.
  const usage = glossaryUsage(topicPaths, glossary);
  const topicSlug = new Map(getAllTopics().map((t) => [t.id, t.slug]));
  for (const term of glossary.filter((g) => g.kind === "term")) {
    const step = usage.get(term.id)?.introducedIn?.stepId;
    entries.push(
      entry(
        {
          type: "term",
          id: term.id,
          title: term.term,
          text: term.short,
          href: `/learn/${topicSlug.get(term.topicId)}${step ? `/${step}` : ""}?${new URLSearchParams({ term: term.id })}`,
        },
        [term.id, ...(term.aliases ?? []), term.body].join(" "),
      ),
    );
  }

  for (const file of getAllFiles()) {
    const source = NOT_INDEXED.test(file.path)
      ? ""
      : (readSourceSync(file.id) ?? "");
    entries.push(
      entry(
        {
          type: "file",
          id: file.id,
          title: file.path,
          text: file.purpose,
          href: `/explorer?${new URLSearchParams({ file: file.id })}`,
        },
        [
          file.whyItExists,
          ...file.conceptIds.map((id) => conceptTitle.get(id) ?? id),
          source,
        ].join(" "),
      ),
    );
  }

  for (const symbol of symbols) {
    entries.push(
      entry(
        {
          type: symbol.kind === "component" ? "component" : "function",
          id: symbol.id,
          title: symbol.name,
          // Two symbols can share a name (the frontend's and the backend's
          // createNote), so the text starts with what and where it is.
          text: `${symbol.kind}${
            symbol.fileId ? ` in ${symbol.fileId.split("/").at(-1)}` : ""
          }: ${symbol.summary}`,
          href: explorerSymbol(symbol.id),
        },
        [
          symbol.id,
          symbol.kind,
          symbol.fileId ?? "",
          symbol.dataHandled ?? "",
          ...symbol.conceptIds.map((id) => conceptTitle.get(id) ?? id),
        ].join(" "),
      ),
    );
  }

  for (const step of buildSteps) {
    entries.push(
      entry(
        {
          type: "build-step",
          id: step.id,
          title: `Step ${step.order}: ${step.title}`,
          text: step.goal,
          href: `/build/${step.slug}`,
        },
        [
          step.why,
          ...step.explanation,
          ...step.conceptIds.map((id) => `${id} ${conceptTitle.get(id) ?? ""}`),
        ].join(" "),
      ),
    );
  }

  // Code connections; file imports are found through their files.
  for (const rel of relationships) {
    if (rel.type === "imports") continue;
    const source = getSymbol(rel.source);
    const target = getSymbol(rel.target);
    if (!source || !target) continue;
    entries.push(
      entry(
        {
          type: "connection",
          id: rel.id,
          title: `${source.name} → ${rel.type} → ${target.name}`,
          text: rel.explanation,
          href: explorerSymbol(rel.source),
        },
        `${rel.source} ${rel.target}`,
      ),
    );
  }

  for (const flow of flows) {
    entries.push(
      entry(
        {
          type: "flow",
          id: flow.id,
          title: flow.title,
          text: flow.summary,
          href: `/flow?flow=${flow.id}&step=1`,
        },
        flow.steps.map((step) => `${step.title} ${step.symbolId}`).join(" "),
      ),
    );
  }

  return entries;
}

/**
 * How well an entry matches the query words, or 0 when some word isn't
 * found at all. Whole words count more than prefixes, the title more than
 * the text, and the whole query in the title most.
 */
export function score(entry: SearchEntry, query: string): number {
  const queryWords = words(query);
  if (queryWords.length === 0) return 0;
  let total = 0;
  for (const word of queryWords) {
    const points = entry.titleWords.includes(word)
      ? 10
      : entry.titleWords.some((w) => w.startsWith(word))
        ? 6
        : entry.textWords.includes(word)
          ? 3
          : entry.textWords.some((w) => w.startsWith(word))
            ? 1
            : 0;
    if (points === 0) return 0;
    total += points;
  }
  if (entry.title.toLowerCase().includes(query.trim().toLowerCase())) {
    total += 5;
  }
  return total;
}

let index: SearchEntry[] | undefined;

/** The index, built the first time it is needed and then kept. */
export function getSearchIndex(): SearchEntry[] {
  index ??= buildSearchIndex();
  return index;
}

/** Results for `query`, grouped in spec §20's order, best first. */
export function search(
  query: string,
  entries: SearchEntry[] = getSearchIndex(),
): SearchResponse {
  const scored = entries
    .map((e) => ({ entry: e, score: score(e, query) }))
    .filter((s) => s.score > 0)
    .sort(
      (a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title),
    );
  return {
    query,
    groups: SEARCH_GROUPS.map(({ type, label }) => {
      const matches = scored.filter((s) => s.entry.type === type);
      return {
        type,
        label,
        total: matches.length,
        results: matches.slice(0, MAX_PER_GROUP).map(({ entry: e }) => ({
          type: e.type,
          id: e.id,
          title: e.title,
          text: e.text,
          href: e.href,
        })),
      };
    }).filter((group) => group.total > 0),
  };
}
