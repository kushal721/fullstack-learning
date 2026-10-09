import type { ConceptSummary } from "@fsl/shared";
import { Card } from "../ui/Card.tsx";

/**
 * Concepts connected to the current one. The API already includes links
 * written on either side, so this only displays them.
 */
export function RelatedConcepts({ concepts }: { concepts: ConceptSummary[] }) {
  if (concepts.length === 0) {
    return <p className="text-muted">No related concepts yet.</p>;
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {concepts.map((concept) => (
        <li key={concept.id}>
          <Card title={concept.title} to={`/concepts/${concept.slug}`}>
            {concept.summary}
          </Card>
        </li>
      ))}
    </ul>
  );
}
