import type { GlossaryEntrySummary } from "@fsl/shared";
import { Fragment, type ReactNode } from "react";
import { Link, useLocation } from "react-router";
import { termHref } from "./levels.ts";

type Props = {
  text: string;
  /** The entries the step links, to name a `[[id]]` without a label. */
  glossary?: GlossaryEntrySummary[];
};

// `code`, **bold**, *italic* and glossary links: [[id]] or [[id|shown text]].
const TOKEN = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[\[[^\]|]+(?:\|[^\]]+)?\]\])/g;

const termClass =
  "rounded-sm underline decoration-accent decoration-dotted decoration-2 underline-offset-4 hover:bg-accent/10";

/**
 * Step text as React elements (never raw HTML). A glossary word is a link
 * that opens its explanation in the side panel without leaving the step.
 */
export function StepText({ text, glossary = [] }: Props) {
  const { search } = useLocation();
  return (
    <>
      {text.split(TOKEN).map((part, i): ReactNode => {
        if (part.startsWith("[[") && part.endsWith("]]")) {
          const [id, label] = part.slice(2, -2).split("|") as [string, string?];
          const entry = glossary.find((g) => g.id === id);
          return (
            <Link
              key={i}
              to={termHref(search, id)}
              title={entry?.short}
              className={termClass}
            >
              {label ?? entry?.term ?? id}
            </Link>
          );
        }
        if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
          return (
            <code
              key={i}
              className="rounded bg-foreground/5 px-1.5 py-0.5 font-mono text-[0.9em] [overflow-wrap:anywhere]"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
          return (
            <strong key={i} className="font-semibold">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
          return <em key={i}>{part.slice(1, -1)}</em>;
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}
