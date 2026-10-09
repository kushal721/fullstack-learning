import type { CodeExample as CodeExampleData } from "@fsl/shared";
import { useEffect, useState } from "react";
import { CodeBlock } from "../code-viewer/CodeBlock.tsx";
import { RichText } from "../ui/RichText.tsx";

const LANGUAGE_LABEL: Record<CodeExampleData["language"], string> = {
  html: "HTML",
  css: "CSS",
  js: "JavaScript",
  jsx: "JSX",
  ts: "TypeScript",
  tsx: "TSX",
  json: "JSON",
  sql: "SQL",
  bash: "Terminal",
  http: "HTTP",
};

type CopyState = "idle" | "copied" | "failed";

/** A highlighted code example with its file name, a copy button and a caption. */
export function CodeExample({ example }: { example: CodeExampleData }) {
  const [copyState, setCopyState] = useState<CopyState>("idle");

  // Return the button to "Copy" a moment after copying.
  useEffect(() => {
    if (copyState === "idle") return;
    const timer = setTimeout(() => setCopyState("idle"), 2000);
    return () => clearTimeout(timer);
  }, [copyState]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(example.code);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  }

  return (
    <figure className="overflow-hidden rounded-lg border border-border">
      <div className="flex items-center justify-between gap-3 border-b border-border bg-foreground/5 px-4 py-1.5 text-xs">
        <span className="truncate font-mono text-muted">
          {example.fileName ?? LANGUAGE_LABEL[example.language]}
        </span>
        <button
          type="button"
          onClick={copy}
          className="shrink-0 rounded px-2 py-1 font-medium text-muted hover:bg-foreground/10 hover:text-foreground"
        >
          {copyState === "copied" ? "Copied" : "Copy"}
        </button>
      </div>
      <CodeBlock example={example} />
      {example.caption && (
        <figcaption className="border-t border-border px-4 py-2 text-sm text-muted">
          <RichText text={example.caption} />
        </figcaption>
      )}
      {/* Announces the result of copying to screen-reader users. */}
      <span role="status" className="sr-only">
        {copyState === "copied"
          ? "Code copied to clipboard"
          : copyState === "failed"
            ? "Could not copy the code"
            : ""}
      </span>
    </figure>
  );
}
