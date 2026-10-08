import { Badge } from "../components/ui/Badge.tsx";
import { PageHeader } from "../components/ui/PageHeader.tsx";

export default function FlowPage() {
  return (
    <>
      <title>Flow · Full-Stack Learning</title>
      <PageHeader
        title="Flow"
        description="Follow data from a button click to the database and back."
        eyebrow={<Badge tone="info">Coming soon</Badge>}
      />
    </>
  );
}
