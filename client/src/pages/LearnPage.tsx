import { Badge } from "../components/ui/Badge.tsx";
import { PageHeader } from "../components/ui/PageHeader.tsx";

export default function LearnPage() {
  return (
    <>
      <title>Learn · Full-Stack Learning</title>
      <PageHeader
        title="Learn"
        description="The learning tree: a map of everything you need to understand full-stack development."
        eyebrow={<Badge tone="info">Coming soon</Badge>}
      />
    </>
  );
}
