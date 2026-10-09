import type { CodeExample } from "@fsl/shared";
import { RichText } from "../ui/RichText.tsx";

/**
 * A code example with its file name and caption.
 * Plain text for now; syntax highlighting is added in M03.2.2.
 */
export function CodeSnippet({ example }: { example: CodeExample }) {
  return (
    <figure className="overflow-hidden rounded-lg border border-border">
      {example.fileName && (
        <div className="border-b border-border bg-foreground/5 px-4 py-2 font-mono text-xs text-muted">
          {example.fileName}
        </div>
      )}
      <pre className="overflow-x-auto p-4 text-sm leading-6">
        <code>{example.code}</code>
      </pre>
      {example.caption && (
        <figcaption className="border-t border-border px-4 py-2 text-sm text-muted">
          <RichText text={example.caption} />
        </figcaption>
      )}
    </figure>
  );
}
