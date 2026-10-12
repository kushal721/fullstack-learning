import type { FileResponse, SymbolSummary } from "@fsl/shared";
import { useEffect, useMemo, useState } from "react";
import { LayerBadge } from "../file-explorer/LayerBadge.tsx";
import { CodeBlock } from "./CodeBlock.tsx";

/** Files longer than this (the generated lockfiles) start shortened. */
const PREVIEW_LINES = 400;

type Props = {
  /** The loaded file (GET /api/files/<path>). */
  file: FileResponse["file"];
  source: string;
  /** Line to highlight and scroll to (from ?line=). */
  line: number | null;
  /** Called when a line number is clicked, to put it in the URL. */
  onSelectLine: (line: number) => void;
  /**
   * Scroll the line into view (default). Off when the learner is walking
   * the connection graph, so the graph stays on screen; the line is still
   * highlighted.
   */
  scrollToLine?: boolean;
  /** Symbols defined in this file; their lines get a marker button. */
  symbols?: SymbolSummary[];
  /** The symbol whose connections are open (its marker shows as pressed). */
  selectedSymbolId?: string | null;
  /** Called when a symbol's marker is clicked or activated with Enter/Space. */
  onSelectSymbol?: (symbol: SymbolSummary) => void;
};

const KIND_LABEL: Partial<Record<SymbolSummary["kind"], string>> = {
  "http-request": "request",
};

/**
 * Shows one example-project file with line numbers. Read-only on purpose:
 * learners read and trace this code, they don't edit it here.
 */
export function CodeViewer({
  file,
  source,
  line,
  onSelectLine,
  scrollToLine = true,
  symbols = [],
  selectedSymbolId = null,
  onSelectSymbol,
}: Props) {
  const [showAll, setShowAll] = useState(false);

  // Marker positions come from the symbol data only; the code isn't parsed.
  const symbolsByLine = useMemo(() => {
    const byLine = new Map<number, SymbolSummary[]>();
    for (const symbol of symbols) {
      if (!symbol.line) continue;
      byLine.set(symbol.line, [...(byLine.get(symbol.line) ?? []), symbol]);
    }
    return byLine;
  }, [symbols]);

  // Bring the requested line into view once the code is on the page.
  useEffect(() => {
    if (line && scrollToLine) {
      document
        .getElementById(`L${line}`)
        ?.scrollIntoView?.({ block: "center" });
    }
  }, [file.path, line, scrollToLine]);
  const allLines = source.replace(/\n$/, "").split("\n");
  // Show everything if asked to, or if the wanted line is past the preview.
  const shortened =
    !showAll &&
    allLines.length > PREVIEW_LINES &&
    !(line && line > PREVIEW_LINES);
  const code = shortened
    ? allLines.slice(0, PREVIEW_LINES).join("\n")
    : allLines.join("\n");

  return (
    <section
      aria-label={`Code of ${file.path}`}
      className="overflow-hidden rounded-lg border border-border"
    >
      <header className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-border bg-foreground/5 px-4 py-2 text-sm">
        <h2 className="min-w-0 break-all font-mono font-medium">{file.path}</h2>
        <LayerBadge layer={file.layer} />
        <span className="ml-auto text-muted">{allLines.length} lines</span>
      </header>
      <CodeBlock
        example={{
          code,
          language: file.language,
          highlightLines: line ? [line] : [],
        }}
        showLineNumbers
        lineId={(n) => `L${n}`}
        renderMarker={
          symbolsByLine.size > 0 && onSelectSymbol
            ? (n) =>
                symbolsByLine.get(n)?.map((symbol) => (
                  <button
                    key={symbol.id}
                    type="button"
                    aria-label={`Show connections of ${KIND_LABEL[symbol.kind] ?? symbol.kind} ${symbol.name}`}
                    aria-pressed={symbol.id === selectedSymbolId}
                    title={`${symbol.kind} ${symbol.name}: show its connections`}
                    onClick={() => onSelectSymbol(symbol)}
                    className={`flex size-6 items-center justify-center rounded-sm text-[0.7rem] leading-none outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                      symbol.id === selectedSymbolId
                        ? "bg-accent text-background"
                        : "text-accent hover:bg-accent/15"
                    }`}
                  >
                    ◆
                  </button>
                ))
            : undefined
        }
        renderLineNumber={(n) => (
          // Mouse shortcut to share a line; keyboard users can use ?line=.
          <a
            href={`?file=${encodeURIComponent(file.path)}&line=${n}`}
            tabIndex={-1}
            onClick={(event) => {
              event.preventDefault();
              onSelectLine(n);
            }}
            className="hover:text-accent hover:underline"
          >
            {n}
          </a>
        )}
      />
      {shortened && (
        <div className="border-t border-border px-4 py-3 text-sm">
          <p className="text-muted">
            Showing the first {PREVIEW_LINES} of {allLines.length} lines. This
            file is generated by a tool, so you rarely need to read it all.
          </p>
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="mt-2 rounded-md border border-border px-3 py-1.5 font-medium hover:bg-foreground/5"
          >
            Show all {allLines.length} lines
          </button>
        </div>
      )}
    </section>
  );
}
