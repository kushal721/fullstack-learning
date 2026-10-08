import { useParams } from "react-router";
import { Badge } from "../components/ui/Badge.tsx";
import { PageHeader } from "../components/ui/PageHeader.tsx";

export default function ConceptPage() {
  const { concept } = useParams();
  return (
    <>
      <title>Concept · Full-Stack Learning</title>
      <PageHeader
        title={`Concept: ${concept}`}
        description="One concept, explained from the basics and connected to the Notes App."
        eyebrow={<Badge tone="info">Coming soon</Badge>}
      />
    </>
  );
}
