import type { GlossaryEntrySummary, PublicBlock } from "@fsl/shared";
import { useEffect, useId, useState } from "react";
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
 * Editable HTML (or HTML with a `<style>`) and its live preview. The
 * preview is a sandboxed frame from the server's playground page, which
 * allows styles but never scripts, so anything typed here is harmless.
 */
export function PlaygroundBlock({ block }: { block: Playground }) {
  const id = useId();
  const [code, setCode] = useState(block.code);
  // Update the preview shortly after typing stops, not on every key.
  const [shown, setShown] = useState(block.code);
  useEffect(() => {
    const timer = setTimeout(() => setShown(code), 400);
    return () => clearTimeout(timer);
  }, [code]);

  return (
    <section
      aria-label={`Try it: ${block.caption}`}
      className="overflow-hidden rounded-lg border border-border"
    >
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-foreground/5 px-4 py-2 text-sm">
        <Badge tone="warning">Try it</Badge>
        <span className="font-medium">{block.caption}</span>
        <button
          type="button"
          onClick={() => {
            setCode(block.code);
            setShown(block.code);
          }}
          disabled={code === block.code}
          className="ml-auto rounded-md border border-border px-2.5 py-1 text-xs font-medium hover:bg-foreground/5 disabled:opacity-50"
        >
          Reset
        </button>
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
            What the browser shows
          </span>
          <iframe
            title={`Preview: ${block.caption}`}
            sandbox=""
            src={playgroundSrc(shown)}
            className="min-h-56 w-full flex-1 bg-white"
          />
        </div>
      </div>
    </section>
  );
}
