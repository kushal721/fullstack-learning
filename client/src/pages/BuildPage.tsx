import { Badge } from "../components/ui/Badge.tsx";
import { PageHeader } from "../components/ui/PageHeader.tsx";

export default function BuildPage() {
  return (
    <>
      <title>Build · Full-Stack Learning</title>
      <PageHeader
        title="Build"
        description="Build the Notes App step by step, from an empty folder to a deployed application."
        eyebrow={<Badge tone="info">Coming soon</Badge>}
      />
    </>
  );
}
