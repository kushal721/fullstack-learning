import type { BuildStep, ConceptSummary } from "@fsl/shared";
import { Link } from "react-router";
import { CodeExample } from "../concept-explorer/CodeExample.tsx";
import {
  BulletList,
  ConceptSection,
  Paragraphs,
} from "../concept-explorer/ConceptSection.tsx";
import { HowToCreate } from "../concept-explorer/HowToCreate.tsx";
import { RelatedConcepts } from "../concept-explorer/RelatedConcepts.tsx";
import { RichText } from "../ui/RichText.tsx";

/** Shown in a section whose lesson text has not been written yet. */
export function NotWrittenYet() {
  return (
    <p className="text-muted italic">
      This part of the lesson is still being written.
    </p>
  );
}

const explorerLink = (path: string) =>
  `/explorer?file=${encodeURIComponent(path)}`;

/** The opening sections: what, why, the problem, how and from scratch. */
export function StepIntro({ step }: { step: BuildStep }) {
  return (
    <>
      <ConceptSection id="what" title="What are we doing?">
        <p>
          <RichText text={step.goal} />
        </p>
        <Paragraphs items={step.explanation} />
      </ConceptSection>
      <ConceptSection id="why" title="Why?">
        <p>
          <RichText text={step.why} />
        </p>
      </ConceptSection>
      <ConceptSection id="problem" title="What problem does this solve?">
        <p>
          <RichText text={step.problemSolved} />
        </p>
      </ConceptSection>
      <ConceptSection id="how-to-create" title="How do I create it?">
        {step.howToCreate.length ? (
          <HowToCreate steps={step.howToCreate} />
        ) : (
          <NotWrittenYet />
        )}
      </ConceptSection>
      <ConceptSection id="from-scratch" title="How do I do this from scratch?">
        {step.fromScratch.length ? (
          <BulletList items={step.fromScratch} />
        ) : (
          <NotWrittenYet />
        )}
      </ConceptSection>
      <ConceptSection id="creating" title="What are we creating?">
        {step.filesCreated.length ? (
          <ul className="flex flex-col gap-1">
            {step.filesCreated.map((path) => (
              <li key={path}>
                <Link
                  to={explorerLink(path)}
                  className="inline-flex min-h-6 items-center font-mono text-sm [overflow-wrap:anywhere] text-accent hover:underline"
                >
                  {path}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted">
            No new files: this step changes or explains what already exists.
          </p>
        )}
      </ConceptSection>
    </>
  );
}

/** The closing sections: code, concepts introduced and common mistakes. */
export function StepDetails({
  step,
  concepts,
}: {
  step: BuildStep;
  concepts: ConceptSummary[];
}) {
  return (
    <>
      <ConceptSection id="code" title="Code">
        {step.codeExamples.length ? (
          step.codeExamples.map((example, index) => (
            <CodeExample key={index} example={example} />
          ))
        ) : (
          <NotWrittenYet />
        )}
      </ConceptSection>
      <ConceptSection id="concepts" title="Concepts introduced">
        <RelatedConcepts concepts={concepts} />
      </ConceptSection>
      <ConceptSection id="mistakes" title="Common mistakes">
        {step.commonMistakes.length ? (
          <BulletList items={step.commonMistakes} />
        ) : (
          <NotWrittenYet />
        )}
      </ConceptSection>
    </>
  );
}
