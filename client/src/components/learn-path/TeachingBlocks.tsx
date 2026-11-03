import type { GlossaryEntrySummary, PublicBlock } from "@fsl/shared";
import { useId, useRef, useState } from "react";
import {
  type FrameMessage,
  useFrameMessages,
} from "../../hooks/useFrameMessages.ts";
import { CodeBlock } from "../code-viewer/CodeBlock.tsx";
import { Badge } from "../ui/Badge.tsx";
import { playgroundSrc } from "./levels.ts";
import { StepText } from "./StepText.tsx";

// The blocks that teach a module's core idea in depth: labelled code, a
// step-through of running code, practice checked by tests, and mistakes.

type Of<T extends PublicBlock["type"]> = Extract<PublicBlock, { type: T }>;
type Glossary = { glossary: GlossaryEntrySummary[] };

const buttonClass =
  "inline-flex items-center justify-center rounded-md border border-border px-3 py-1.5 text-sm font-medium transition hover:bg-foreground/5 disabled:opacity-50";
const primaryClass =
  "inline-flex items-center justify-center rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white transition hover:opacity-90 dark:text-black";

function Header({ badge, title }: { badge: string; title: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border bg-foreground/5 px-4 py-2 text-sm">
      <Badge tone="info">{badge}</Badge>
      <span className="font-medium">{title}</span>
    </div>
  );
}

/** Splits code into plain runs and the labelled parts, in order. */
function anatomyPieces(block: Of<"anatomy">) {
  const pieces: { text: string; part?: number }[] = [];
  let from = 0;
  block.parts.forEach((part, i) => {
    const at = block.code.indexOf(part.text, from);
    if (at < 0) return; // validation guarantees every part is found
    if (at > from) pieces.push({ text: block.code.slice(from, at) });
    pieces.push({ text: part.text, part: i });
    from = at + part.text.length;
  });
  if (from < block.code.length) pieces.push({ text: block.code.slice(from) });
  return pieces;
}

/** Code with each part numbered; the list below says what each part is. */
export function AnatomyBlock({
  block,
  glossary,
}: { block: Of<"anatomy"> } & Glossary) {
  const [active, setActive] = useState<number | null>(null);
  return (
    <figure className="overflow-hidden rounded-lg border border-border">
      <Header badge="Anatomy" title={block.caption} />
      <pre className="overflow-x-auto bg-[var(--code-bg)] px-4 py-4 font-mono text-base leading-9 text-[var(--code-fg)]">
        <code>
          {anatomyPieces(block).map((piece, i) =>
            piece.part === undefined ? (
              <span key={i}>{piece.text}</span>
            ) : (
              <mark
                key={i}
                className={`rounded px-0.5 text-inherit transition-colors ${
                  active === piece.part ? "bg-accent/40" : "bg-accent/15"
                }`}
              >
                {piece.text}
                <sup
                  aria-hidden="true"
                  className="ml-0.5 font-sans text-[0.65em] font-semibold text-accent"
                >
                  {piece.part + 1}
                </sup>
              </mark>
            ),
          )}
        </code>
      </pre>
      <ol className="flex flex-col divide-y divide-border border-t border-border">
        {block.parts.map((part, i) => (
          <li
            key={i}
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
            className="flex gap-3 px-4 py-2 text-sm leading-6"
          >
            <span
              aria-hidden="true"
              className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs font-semibold text-accent"
            >
              {i + 1}
            </span>
            <span>
              <code className="rounded bg-foreground/5 px-1.5 font-mono">
                {part.text}
              </code>{" "}
              <span className="font-medium">{part.label}</span>:{" "}
              <StepText text={part.note} glossary={glossary} />
            </span>
          </li>
        ))}
      </ol>
    </figure>
  );
}

/**
 * Code run one move at a time: the line being run, the variables of the
 * function running now, the call stack and what has been printed.
 */
export function TraceBlock({
  block,
  glossary,
}: { block: Of<"trace"> } & Glossary) {
  const [at, setAt] = useState(0);
  const move = block.steps[at]!;
  const last = block.steps.length - 1;
  const printed = block.steps
    .slice(0, at + 1)
    .flatMap((s) => (s.output === undefined ? [] : [s.output]));
  const stack = [...(move.stack ?? [])].reverse();
  return (
    <figure className="overflow-hidden rounded-lg border border-border">
      <Header badge="Step through" title={block.caption} />
      <div className="grid md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="min-w-0">
          <CodeBlock
            example={{
              language: block.language ?? "js",
              code: block.code,
              highlightLines: [move.line],
            }}
            showLineNumbers
          />
        </div>
        <div className="flex min-w-0 flex-col gap-3 border-t border-border p-4 text-sm md:border-l md:border-t-0">
          <p className="text-xs font-medium text-muted">
            Move {at + 1} of {block.steps.length} · line {move.line}
          </p>
          <p aria-live="polite" className="text-base leading-7">
            <StepText text={move.note} glossary={glossary} />
          </p>
          {move.vars && move.vars.length > 0 && (
            <table className="w-full text-left">
              <caption className="mb-1 text-left text-xs font-medium text-muted">
                Variables
              </caption>
              <tbody>
                {move.vars.map(([name, value]) => (
                  <tr key={name} className="border-t border-border">
                    <th scope="row" className="py-1 pr-3 font-mono font-medium">
                      {name}
                    </th>
                    <td className="py-1 font-mono [overflow-wrap:anywhere]">
                      {value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {stack.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-medium text-muted">
                Call stack (running now at the top)
              </p>
              <ol className="flex flex-col gap-1">
                {stack.map((frame, i) => (
                  <li
                    key={i}
                    className={`rounded border px-2 py-1 font-mono ${
                      i === 0
                        ? "border-accent bg-accent/10"
                        : "border-border text-muted"
                    }`}
                  >
                    {frame}
                  </li>
                ))}
              </ol>
            </div>
          )}
          <div>
            <p className="mb-1 text-xs font-medium text-muted">Output</p>
            <pre className="min-h-8 rounded bg-[var(--code-bg)] px-2 py-1 font-mono text-[var(--code-fg)]">
              {printed.length > 0 ? printed.join("\n") : " "}
            </pre>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 border-t border-border px-4 py-2">
        <button
          type="button"
          onClick={() => setAt(at - 1)}
          disabled={at === 0}
          className={buttonClass}
        >
          ← Back
        </button>
        {at < last ? (
          <button
            type="button"
            onClick={() => setAt(at + 1)}
            className={primaryClass}
          >
            Next move →
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setAt(0)}
            className={primaryClass}
          >
            ↺ Start again
          </button>
        )}
      </div>
    </figure>
  );
}

type RunResult = Omit<
  Extract<FrameMessage, { source: "fsl-runner" }>,
  "source"
>;

/**
 * An exercise: write code, then Check runs it in a sandboxed runner. For
 * JavaScript the tests run after the code; for a page (HTML, CSS and
 * scripts) the checks run on the page once it has loaded. The runner
 * reports how many passed (and, for a page, each check's result).
 */
export function YourTurnBlock({
  block,
  glossary,
}: { block: Of<"yourTurn"> } & Glossary) {
  const id = useId();
  const isPage = block.language === "page";
  const [code, setCode] = useState(block.starter);
  // The code that was checked, and a key that re-runs the frame.
  const [checked, setChecked] = useState<string | null>(null);
  const [runs, setRuns] = useState(0);
  const [result, setResult] = useState<RunResult | null>(null);
  const frame = useRef<HTMLIFrameElement>(null);

  useFrameMessages(frame, (message) => {
    if (message.source !== "fsl-runner") return;
    setResult({
      passed: message.passed,
      total: message.total,
      results: message.results,
    });
  });

  function check() {
    setResult(null);
    setChecked(code);
    setRuns((n) => n + 1);
  }

  const solved = result !== null && result.passed === result.total;
  const what = isPage ? "checks" : "tests";
  return (
    <section
      aria-label={`Your turn: ${block.title}`}
      className={`overflow-hidden rounded-lg border ${
        solved ? "border-green-600/60" : "border-border"
      }`}
    >
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-foreground/5 px-4 py-2 text-sm">
        <Badge tone={solved ? "success" : "warning"}>
          {solved ? "✓ Solved" : "Your turn"}
        </Badge>
        <span className="font-medium">{block.title}</span>
      </div>
      <div className="flex flex-col gap-3 p-4">
        <p className="leading-7">
          <StepText text={block.task} glossary={glossary} />
        </p>
        <div className="text-sm">
          <p className="mb-1 text-muted">Check will run:</p>
          {isPage ? (
            <ol className="list-decimal pl-5 leading-6">
              {(block.checks ?? []).map((c, i) => (
                <li key={i}>{c.label}</li>
              ))}
            </ol>
          ) : (
            <ul className="flex flex-wrap gap-1.5">
              {block.tests.map((test) => (
                <li
                  key={test.call}
                  className="rounded bg-foreground/5 px-2 py-0.5 font-mono"
                >
                  {test.call} → {test.expect}
                </li>
              ))}
            </ul>
          )}
        </div>
        <label htmlFor={id} className="text-xs font-medium text-muted">
          Your code
        </label>
        <textarea
          id={id}
          value={code}
          onChange={(event) => setCode(event.target.value)}
          spellCheck={false}
          rows={Math.min(18, Math.max(5, code.split("\n").length + 1))}
          className="w-full resize-y rounded-md bg-[var(--code-bg)] px-3 py-2 font-mono text-sm leading-6 text-[var(--code-fg)]"
        />
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={check} className={primaryClass}>
            ▶ Check my code
          </button>
          <button
            type="button"
            onClick={() => setCode(block.starter)}
            disabled={code === block.starter}
            className={buttonClass}
          >
            Reset
          </button>
        </div>
        <p role="status" className="text-sm font-medium">
          {result &&
            (solved
              ? `All ${result.total} ${what} pass. Well done!`
              : `${result.passed} of ${result.total} ${what} pass. Read the ✗ lines, change your code and check again.`)}
        </p>
        {result?.results && (
          <ul className="flex flex-col gap-1 text-sm">
            {result.results.map((r, i) => (
              <li
                key={i}
                className={
                  r.pass
                    ? "text-green-800 dark:text-green-400"
                    : "text-red-700 dark:text-red-400"
                }
              >
                {r.pass ? "✓" : "✗"} {r.label}
                {!r.pass && (
                  <span className="text-muted"> (got: {r.detail})</span>
                )}
              </li>
            ))}
          </ul>
        )}
        {checked !== null && (
          <iframe
            ref={frame}
            key={runs}
            title={`${isPage ? "Your page" : "Test results"}: ${block.title}`}
            sandbox={isPage ? "allow-scripts allow-forms" : "allow-scripts"}
            src={
              isPage
                ? playgroundSrc(checked, "page", block.checks ?? [])
                : playgroundSrc(checked, "js", block.tests)
            }
            className={`${isPage ? "min-h-48" : "min-h-32"} w-full rounded-md border border-border bg-white`}
          />
        )}
        <details className="text-sm">
          <summary className="cursor-pointer font-medium text-accent">
            Show a hint
          </summary>
          <p className="mt-1 leading-6">
            <StepText text={block.hint} glossary={glossary} />
          </p>
        </details>
        <details className="text-sm">
          <summary className="cursor-pointer font-medium text-accent">
            Show a solution
          </summary>
          <div className="mt-2 overflow-hidden rounded-md border border-border">
            <CodeBlock
              example={{
                language: isPage ? "html" : "js",
                code: block.solution,
              }}
            />
          </div>
        </details>
      </div>
    </section>
  );
}

/** A common mistake: the wrong code and why it fails, then the fix. */
export function MistakeBlock({
  block,
  glossary,
}: { block: Of<"mistake"> } & Glossary) {
  return (
    <figure className="overflow-hidden rounded-lg border border-border">
      <Header badge="Common mistake" title={block.title} />
      <div className="grid md:grid-cols-2">
        <div className="min-w-0 border-l-4 border-l-red-600/70">
          <p className="px-4 pt-2 text-sm font-semibold text-red-700 dark:text-red-400">
            ✗ Wrong
          </p>
          <CodeBlock
            example={{ language: block.language ?? "js", code: block.wrong }}
          />
          <p className="px-4 pb-3 text-sm leading-6">
            <StepText text={block.problem} glossary={glossary} />
          </p>
        </div>
        <div className="min-w-0 border-l-4 border-t border-l-green-600/70 border-t-border md:border-t-0">
          <p className="px-4 pt-2 text-sm font-semibold text-green-800 dark:text-green-400">
            ✓ Right
          </p>
          <CodeBlock
            example={{ language: block.language ?? "js", code: block.right }}
          />
          <p className="px-4 pb-3 text-sm leading-6">
            <StepText text={block.why} glossary={glossary} />
          </p>
        </div>
      </div>
    </figure>
  );
}
