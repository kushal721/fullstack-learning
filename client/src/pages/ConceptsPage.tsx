import { Badge } from "../components/ui/Badge.tsx";
import { PageHeader } from "../components/ui/PageHeader.tsx";

export default function ConceptsPage() {
  return (
    <>
      <title>Concepts · Full-Stack Learning</title>
      <PageHeader
        title="Concepts"
        description="Every concept explained the same way: what it is, why we need it and how to create it."
        eyebrow={<Badge tone="info">Coming soon</Badge>}
      />
    </>
  );
}
