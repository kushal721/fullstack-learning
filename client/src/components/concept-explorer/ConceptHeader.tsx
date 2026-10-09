import type { Concept, TopicSummary } from "@fsl/shared";
import { Link } from "react-router";
import { PageHeader } from "../ui/PageHeader.tsx";

/** Title and summary, with a link back to the concept's learning-tree topic. */
export function ConceptHeader({
  concept,
  topic,
}: {
  concept: Concept;
  topic: TopicSummary;
}) {
  return (
    <PageHeader
      eyebrow={
        <>
          Concept in{" "}
          <Link to={`/learn/${topic.slug}`} className="text-accent underline">
            {topic.order}. {topic.title}
          </Link>
        </>
      }
      title={concept.title}
      description={concept.summary}
    />
  );
}
