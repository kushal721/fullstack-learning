import type { CodeSymbol, FlowStep } from "@fsl/shared";
import { Link } from "react-router";
import { CodeExample } from "../concept-explorer/CodeExample.tsx";
import {
  explorerFileHref,
  explorerSymbolHref,
} from "../connection-graph/links.ts";
import { Badge } from "../ui/Badge.tsx";
import { RichText } from "../ui/RichText.tsx";
import { LANES } from "./layout.ts";

type Props = {
  step: FlowStep;
  index: number;
  total: number;
  symbol?: CodeSymbol;
};

/** What happens at one step, the data there, and where to see the code. */
export function FlowDetails({ step, index, total, symbol }: Props) {
  const lane = LANES.find((l) => l.layer === step.layer)?.label ?? step.layer;
  return (
    <article aria-labelledby="flow-step-title" className="flex flex-col gap-3">
      <p className="flex flex-wrap items-center gap-2 text-sm text-muted">
        Step {index + 1} of {total} <Badge tone="info">{lane}</Badge>
      </p>
      <h2 id="flow-step-title" className="text-xl font-semibold">
        {step.title}
      </h2>
      <p className="leading-7">
        <RichText text={step.explanation} />
      </p>
      {step.dataShape && (
        <section
          aria-label="The data at this step"
          className="flex flex-col gap-2"
        >
          <h3 className="text-sm font-semibold">The data here</h3>
          <CodeExample example={step.dataShape} />
        </section>
      )}
      {symbol && (
        <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <Link
            to={explorerSymbolHref(symbol)}
            className="inline-flex min-h-6 items-center text-accent hover:underline"
          >
            Connections of <code className="font-mono">{symbol.name}</code>
          </Link>
          {symbol.fileId && (
            <Link
              to={explorerFileHref({
                id: symbol.fileId,
                path: symbol.fileId,
                layer: "root",
                purpose: "",
                line: symbol.line,
              })}
              className="inline-flex min-h-6 items-center text-accent hover:underline"
            >
              Open {symbol.fileId.split("/").at(-1)}
              {symbol.line ? ` at line ${symbol.line}` : ""}
            </Link>
          )}
        </p>
      )}
    </article>
  );
}
