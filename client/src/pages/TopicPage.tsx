import { useParams } from "react-router";
import { Badge } from "../components/ui/Badge.tsx";
import { PageHeader } from "../components/ui/PageHeader.tsx";

export default function TopicPage() {
  const { topic } = useParams();
  return (
    <>
      <title>Topic · Full-Stack Learning</title>
      <PageHeader
        title={`Topic: ${topic}`}
        description="What this topic is, why it matters and where it fits in the whole application."
        eyebrow={<Badge tone="info">Coming soon</Badge>}
      />
    </>
  );
}
