import type { GlossaryEntrySummary, PublicBlock } from "@fsl/shared";
import { useEffect, useId, useRef, useState } from "react";
import { useFrameMessages } from "../../hooks/useFrameMessages.ts";
import { Badge } from "../ui/Badge.tsx";
import { playgroundSrc } from "./levels.ts";
import { StepText } from "./StepText.tsx";

type Reference = Extract<PublicBlock, { type: "reference" }>;
type Playground = Extract<PublicBlock, { type: "playground" }>;

const exampleClass =
  "block whitespace-pre-wrap rounded bg-[var(--code-bg)] px-2 py-1 font-mono text-[0.85em] text-[var(--code-fg)] [overflow-wrap:anywhere]";

/**
 * A small reference: each row a name (a tag, an attribute…), what it's for
 * and a short example. A table on wide screens, cards on phones.
 */
export function ReferenceTable({
  block,
  glossary,
}: {
  block: Reference;
  glossary: GlossaryEntrySummary[];
}) {
  const hasExamples = block.rows.some((row) => row.example);
  return (
    <figure className="overflow-hidden rounded-lg border border-border">
      <figcaption className="border-b border-border bg-foreground/5 px-4 py-2 text-sm font-medium">
        {block.caption}
      </figcaption>
      <table className="hidden w-full text-left text-sm sm:table">
        <thead className="bg-foreground/[0.03] text-muted">
          <tr>
            <th scope="col" className="px-4 py-2 font-medium">
              Name
            </th>
            <th scope="col" className="px-4 py-2 font-medium">
              What it's for
            </th>
            {hasExamples && (
              <th scope="col" className="px-4 py-2 font-medium">
                Example
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row) => (
            <tr key={row.name} className="border-t border-border align-top">
              <th
                scope="row"
                className="whitespace-nowrap px-4 py-2 font-mono font-medium"
              >
                {row.name}
              </th>
              <td className="px-4 py-2 leading-6">
                <StepText text={row.text} glossary={glossary} />
              </td>
              {hasExamples && (
                <td className="px-4 py-2">
                  {row.example && (
                    <code className={exampleClass}>{row.example}</code>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <dl className="flex flex-col sm:hidden">
        {block.rows.map((row) => (
          <div
            key={row.name}
            className="flex flex-col gap-1 border-t border-border px-4 py-3 first:border-t-0"
          >
            <dt className="font-mono text-sm font-medium">{row.name}</dt>
            <dd className="text-sm leading-6">
              <StepText text={row.text} glossary={glossary} />
            </dd>
            {row.example && (
              <dd>
                <code className={exampleClass}>{row.example}</code>
              </dd>
            )}
          </div>
        ))}
      </dl>
    </figure>
  );
}

/**
 * Editable code and its result. HTML (with any `<style>`) is shown as a page
 * in a sandboxed frame that allows styles but no scripts. JavaScript runs in
 * a frame that allows only scripts, as a unique origin with no network or
 * storage, inside a worker stopped after 2 seconds; its console is shown.
 * A page (HTML, CSS and scripts) runs in a frame that allows scripts and
 * forms but no network; the page is shown with its console under it.
 */
export function PlaygroundBlock({ block }: { block: Playground }) {
  const id = useId();
  const language = block.language ?? "html";
  const isJs = language === "js";
  const isPage = language === "page";
  const frame = useRef<HTMLIFrameElement>(null);
  const [code, setCode] = useState(block.code);
  // Update the result shortly after typing stops, not on every key.
  const [shown, setShown] = useState(block.code);
  const [runs, setRuns] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => setShown(code), isJs || isPage ? 700 : 400);
    return () => clearTimeout(timer);
  }, [code, isJs, isPage]);
  // A page's console, kept only for the run that's showing.
  const run = `${runs}:${shown}`;
  const [logs, setLogs] = useState<{
    run: string;
    lines: { kind: string; text: string }[];
  }>({ run, lines: [] });
  useFrameMessages(frame, (message) => {
    if (message.source !== "fsl-page") return;
    setLogs((current) => ({
      run,
      lines: [...(current.run === run ? current.lines : []), message],
    }));
  });
  const consoleLines = logs.run === run ? logs.lines : [];

  return (
    <section
      aria-label={`Try it: ${block.caption}`}
      className="overflow-hidden rounded-lg border border-border"
    >
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-foreground/5 px-4 py-2 text-sm">
        <Badge tone="warning">Try it</Badge>
        <span className="font-medium">{block.caption}</span>
        <span className="ml-auto flex gap-2">
          {(isJs || isPage) && (
            <button
              type="button"
              onClick={() => {
                setShown(code);
                setRuns((n) => n + 1);
              }}
              className="rounded-md bg-accent px-2.5 py-1 text-xs font-medium text-white hover:opacity-90 dark:text-black"
            >
              ▶ Run
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setCode(block.code);
              setShown(block.code);
            }}
            disabled={code === block.code}
            className="rounded-md border border-border px-2.5 py-1 text-xs font-medium hover:bg-foreground/5 disabled:opacity-50"
          >
            Reset
          </button>
        </span>
      </div>
      <div className="grid md:grid-cols-2">
        <div className="flex flex-col">
          <label
            htmlFor={id}
            className="px-4 pt-2 text-xs font-medium text-muted"
          >
            Your code (edit it)
          </label>
          <textarea
            id={id}
            value={code}
            onChange={(event) => setCode(event.target.value)}
            spellCheck={false}
            rows={Math.min(14, Math.max(6, code.split("\n").length + 1))}
            className="w-full flex-1 resize-y bg-[var(--code-bg)] px-4 py-2 font-mono text-sm leading-6 text-[var(--code-fg)]"
          />
        </div>
        <div className="flex flex-col border-t border-border md:border-l md:border-t-0">
          <span
            className="px-4 pt-2 text-xs font-medium text-muted"
            aria-hidden="true"
          >
            {isJs ? "Console output" : "What the browser shows"}
          </span>
          <iframe
            ref={frame}
            // A new key re-runs the same code when Run is pressed.
            key={runs}
            title={`${isJs ? "Output" : "Preview"}: ${block.caption}`}
            sandbox={
              isJs ? "allow-scripts" : isPage ? "allow-scripts allow-forms" : ""
            }
            src={playgroundSrc(shown, language)}
            className="min-h-56 w-full flex-1 bg-white"
          />
          {isPage && (
            <div className="border-t border-border">
              <p className="px-4 pt-2 text-xs font-medium text-muted">
                Console
              </p>
              <pre
                aria-live="polite"
                className="max-h-40 overflow-auto whitespace-pre-wrap break-words px-4 pb-2 font-mono text-xs leading-5"
              >
                {consoleLines.length === 0 ? (
                  <span className="text-muted">(nothing logged)</span>
                ) : (
                  consoleLines.map((line, i) => (
                    <span
                      key={i}
                      className={
                        line.kind === "error"
                          ? "block text-red-700 dark:text-red-400"
                          : line.kind === "warn"
                            ? "block text-amber-700 dark:text-amber-400"
                            : "block"
                      }
                    >
                      {line.text}
                    </span>
                  ))
                )}
              </pre>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
