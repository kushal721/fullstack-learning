import type { ConceptResponse } from "@fsl/shared";
import { CodeExample } from "./CodeExample.tsx";
import { ConceptConnections } from "./ConceptConnections.tsx";
import { BulletList, ConceptSection, Paragraphs } from "./ConceptSection.tsx";
import { HowToCreate } from "./HowToCreate.tsx";
import { RelatedConcepts } from "./RelatedConcepts.tsx";

/**
 * Every section of a concept, always in the same order (spec §5), so a
 * learner knows where to find "why" or "how do I create it" on any concept.
 */
export function ConceptExplanation({
  concept,
  related,
  usedIn,
  introducedIn,
}: Pick<ConceptResponse, "concept" | "related" | "usedIn" | "introducedIn">) {
  return (
    <div className="flex flex-col gap-10">
      <ConceptSection id="basics" title="Start from the basics">
        <Paragraphs items={concept.basics} />
      </ConceptSection>
      <ConceptSection id="what" title="What is it?">
        <Paragraphs items={concept.what} />
      </ConceptSection>
      <ConceptSection id="why" title="Why do we need it?">
        <Paragraphs items={concept.why} />
      </ConceptSection>
      <ConceptSection id="how-it-works" title="How does it work?">
        <Paragraphs items={concept.howItWorks} />
      </ConceptSection>
      <ConceptSection id="example" title="Basic example">
        <CodeExample example={concept.basicExample} />
      </ConceptSection>
      <ConceptSection id="internals" title="What happens internally?">
        <Paragraphs items={concept.internals} />
      </ConceptSection>
      <ConceptSection
        id="how-to-create"
        title="How do I create it from scratch?"
      >
        <HowToCreate steps={concept.howToCreate} />
      </ConceptSection>
      <ConceptSection id="where-used" title="Where is it used?">
        <BulletList items={concept.whereUsed} />
      </ConceptSection>
      <ConceptSection id="connects-to" title="What does it connect to?">
        <BulletList items={concept.connectsTo} />
      </ConceptSection>
      <ConceptSection id="notes-app" title="In the Notes App">
        <BulletList
          items={concept.projectUsage.map((usage) => usage.explanation)}
        />
      </ConceptSection>
      <ConceptSection id="where-to-find-it" title="Where to find it">
        <ConceptConnections usedIn={usedIn} introducedIn={introducedIn} />
      </ConceptSection>
      <ConceptSection id="mistakes" title="Common mistakes">
        <BulletList items={concept.commonMistakes} />
      </ConceptSection>
      <ConceptSection id="related" title="Related">
        <RelatedConcepts concepts={related} />
      </ConceptSection>
    </div>
  );
}
