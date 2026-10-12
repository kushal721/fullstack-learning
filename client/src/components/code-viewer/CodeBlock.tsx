import type { CodeExample } from "@fsl/shared";
import { Highlight } from "prism-react-renderer";
import type { ReactNode } from "react";
import { codeTheme } from "./code-theme.ts";
import "./prism-languages.ts";

/** Our content language names → Prism grammar names. */
const PRISM_LANGUAGE: Record<CodeExample["language"], string> = {
  html: "markup",
  css: "css",
  js: "javascript",
  jsx: "jsx",
  ts: "typescript",
  tsx: "tsx",
  json: "json",
  sql: "sql",
  bash: "bash",
  http: "http",
};

type Props = {
  example: Pick<CodeExample, "code" | "language" | "highlightLines">;
  showLineNumbers?: boolean;
  /** Gives each line an id, so a URL or script can jump to it. */
  lineId?: (lineNumber: number) => string;
  /** Replaces the plain line number, e.g. with a link to that line. */
  renderLineNumber?: (lineNumber: number) => ReactNode;
  /**
   * Content for an extra column before the line numbers (e.g. buttons for
   * the symbols defined on a line). Unlike the line numbers it is visible
   * to screen readers, so it may contain controls.
   */
  renderMarker?: (lineNumber: number) => ReactNode;
};

/**
 * Syntax-highlighted, read-only code. Generic on purpose: concept pages,
 * build steps and the file explorer all render code through this.
 *
 * prism-react-renderer turns the code into React elements, so no HTML string
 * is ever injected into the page.
 */
export function CodeBlock({
  example,
  showLineNumbers = false,
  lineId,
  renderLineNumber,
  renderMarker,
}: Props) {
  const highlighted = new Set(example.highlightLines ?? []);

  return (
    <Highlight
      theme={codeTheme}
      code={example.code.replace(/\n$/, "")}
      language={PRISM_LANGUAGE[example.language]}
    >
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre
          // Focusable so keyboard users can scroll long lines.
          tabIndex={0}
          className={`${className} overflow-x-auto py-3 text-sm leading-6`}
          style={style}
        >
          <code>
            {tokens.map((line, index) => {
              const lineNumber = index + 1;
              const isHighlighted = highlighted.has(lineNumber);
              const lineProps = getLineProps({ line });
              return (
                <div
                  key={index}
                  {...lineProps}
                  id={lineId?.(lineNumber)}
                  data-line={lineNumber}
                  data-highlighted={isHighlighted || undefined}
                  // min-h-6: an empty line still takes one line of height (otherwise
                  // blank lines, like the one between HTTP headers and body, vanish).
                  className={`${lineProps.className} flex min-h-6 border-l-4 pr-4 ${
                    isHighlighted
                      ? "border-accent bg-accent/15"
                      : "border-transparent"
                  }`}
                >
                  {renderMarker && (
                    <span className="flex w-6 shrink-0 items-center justify-center gap-0.5">
                      {renderMarker(lineNumber)}
                    </span>
                  )}
                  {showLineNumbers && (
                    <span
                      aria-hidden="true"
                      className="w-10 shrink-0 select-none pr-3 text-right opacity-50"
                    >
                      {renderLineNumber?.(lineNumber) ?? lineNumber}
                    </span>
                  )}
                  <span className={showLineNumbers ? "" : "pl-4"}>
                    {line.map((token, key) => (
                      <span key={key} {...getTokenProps({ token })} />
                    ))}
                  </span>
                </div>
              );
            })}
          </code>
        </pre>
      )}
    </Highlight>
  );
}
