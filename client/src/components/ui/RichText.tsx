import { Fragment } from "react";

type Props = { text: string };

/**
 * Renders plain text where `backtick` spans become inline code.
 * Learning content is stored as plain strings; this keeps it readable without
 * pulling in a Markdown library or rendering raw HTML.
 */
export function RichText({ text }: Props) {
  const parts = text.split(/(`[^`]+`)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("`") && part.endsWith("`") && part.length > 2 ? (
          <code
            key={i}
            className="rounded bg-foreground/5 px-1.5 py-0.5 font-mono text-[0.9em]"
          >
            {part.slice(1, -1)}
          </code>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}
