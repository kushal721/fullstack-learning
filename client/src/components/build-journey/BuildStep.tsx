import type { BuildStepResponse, FileTreeFolder } from "@fsl/shared";
import { Link } from "react-router";
import { ConceptSection } from "../concept-explorer/ConceptSection.tsx";
import { PageHeader } from "../ui/PageHeader.tsx";
import { RichText } from "../ui/RichText.tsx";
import { NextStep } from "./NextStep.tsx";
import { StepChanges } from "./StepChanges.tsx";
import { StepConnections } from "./StepConnections.tsx";
import { StepDetails, StepIntro } from "./StepExplanation.tsx";

type Props = BuildStepResponse & {
  totalSteps: number;
  before?: FileTreeFolder;
  after?: FileTreeFolder;
  snapshotError?: { message: string; retry: () => void } | null;
};

/**
 * One lesson of the Build Journey. The sections are always the same and in
 * the same order (spec §6), so every step answers what, why, how and what
 * changed in the same place.
 */
export function BuildStep({
  step,
  concepts,
  diff,
  connections,
  flows,
  previous,
  next,
  totalSteps,
  before,
  after,
  snapshotError,
}: Props) {
  return (
    <article className="flex min-w-0 flex-col gap-10">
      <PageHeader
        eyebrow={
          <>
            <Link to="/build" className="text-accent underline">
              Build
            </Link>{" "}
            · Step {step.order} of {totalSteps}
          </>
        }
        // The goal is the first line of "What are we doing?" just below.
        title={step.title}
      />
      <StepIntro step={step} />
      <ConceptSection id="changes" title="What changed?">
        <StepChanges
          order={step.order}
          diff={diff}
          before={before}
          after={after}
          error={snapshotError}
          newConcepts={concepts.length}
          newConnections={connections.length}
        />
      </ConceptSection>
      <ConceptSection id="connections" title="Connections created">
        <StepConnections step={step} connections={connections} />
      </ConceptSection>
      {flows.length > 0 && (
        <ConceptSection id="flows" title="See it happen">
          <p className="text-muted">
            Step through this code at work in the flow tracer.
          </p>
          <ul className="flex flex-col gap-2">
            {flows.map((flow) => (
              <li key={flow.id}>
                <Link
                  to={`/flow?flow=${flow.id}&step=1`}
                  className="font-medium text-accent hover:underline"
                >
                  {flow.title}
                </Link>{" "}
                <span className="text-sm text-muted">
                  ({flow.stepCount} steps): <RichText text={flow.summary} />
                </span>
              </li>
            ))}
          </ul>
        </ConceptSection>
      )}
      <StepDetails step={step} concepts={concepts} />
      <NextStep
        step={step}
        concepts={concepts}
        previous={previous}
        next={next}
      />
    </article>
  );
}
