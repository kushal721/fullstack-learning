import type { BuildStep, StepConnection } from "@fsl/shared";
import { Link } from "react-router";
import { explorerSymbolHref } from "../connection-graph/links.ts";
import { RichText } from "../ui/RichText.tsx";

const kindLabel = (kind: string) =>
  kind === "http-request" ? "request" : kind;

/**
 * The connections between pieces of code a step creates (spec §8): source,
 * relationship and target, why, and links that open each end in the tracer.
 */
export function StepConnections({
  step,
  connections,
}: {
  step: Pick<BuildStep, "filesCreated" | "filesModified">;
  connections: StepConnection[];
}) {
  if (connections.length === 0) {
    return (
      <p className="text-muted">
        {step.filesCreated.length === 0 && step.filesModified.length === 0
          ? "No new connections: this step is about understanding, not code."
          : step.filesCreated.length === 0
            ? "No new connections: this step changes how existing code behaves."
            : "No new connections between pieces of code: this step adds files and setup."}
      </p>
    );
  }
  const end = (symbol: StepConnection["source"]) => (
    <Link
      to={explorerSymbolHref(symbol)}
      className="inline-flex min-h-6 items-center font-mono text-accent [overflow-wrap:anywhere] hover:underline"
    >
      <span className="font-sans text-xs text-muted">
        {kindLabel(symbol.kind)}
      </span>{" "}
      {symbol.name}
    </Link>
  );
  return (
    <ul className="flex flex-col gap-4">
      {connections.map((connection) => (
        <li key={connection.id} className="flex flex-col gap-1">
          <p className="flex flex-wrap items-baseline gap-x-2">
            {end(connection.source)}
            <span className="text-sm text-muted">
              <span aria-hidden="true">→ </span>
              {connection.type}
              <span aria-hidden="true"> →</span>
            </span>
            {end(connection.target)}
          </p>
          <p className="text-sm text-muted">
            <RichText text={connection.explanation} />
          </p>
        </li>
      ))}
    </ul>
  );
}
