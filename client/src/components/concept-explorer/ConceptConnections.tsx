import type { BuildStepSummary, ConceptFileUse } from "@fsl/shared";
import { Link } from "react-router";
import { LayerBadge } from "../file-explorer/LayerBadge.tsx";
import { Card } from "../ui/Card.tsx";
import { RichText } from "../ui/RichText.tsx";

type Props = {
  usedIn: ConceptFileUse[];
  introducedIn: BuildStepSummary[];
};

function explorerLink({ fileId, line }: ConceptFileUse) {
  const params = new URLSearchParams({ file: fileId });
  if (line) params.set("line", String(line));
  return `/explorer?${params}`;
}

/**
 * Where a concept lives in the Notes App: the files that use it (opening
 * the Explorer at the right line) and the build steps that introduce it.
 */
export function ConceptConnections({ usedIn, introducedIn }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="mb-2 font-semibold">Used in</h3>
        {usedIn.length === 0 ? (
          <p className="text-muted">
            The Notes App's code doesn't use this directly.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {usedIn.map((use) => (
              <li
                key={use.fileId}
                className="flex flex-wrap items-baseline gap-x-2 gap-y-1"
              >
                <Link
                  to={explorerLink(use)}
                  className="inline-flex min-h-6 items-center font-mono text-sm [overflow-wrap:anywhere] text-accent hover:underline"
                >
                  {use.fileId}
                  {use.line && `:${use.line}`}
                </Link>
                <LayerBadge layer={use.layer} />
                <span className="w-full text-sm text-muted">
                  <RichText text={use.purpose} />
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <h3 className="mb-2 font-semibold">Introduced in</h3>
        {introducedIn.length === 0 ? (
          <p className="text-muted">
            No build step introduces this yet; it is background knowledge.
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {introducedIn.map((step) => (
              <li key={step.id}>
                <Card
                  title={`Step ${step.order}: ${step.title}`}
                  to={`/build/${step.slug}`}
                >
                  {step.goal}
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
