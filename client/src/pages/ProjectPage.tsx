import { Badge } from "../components/ui/Badge.tsx";
import { PageHeader } from "../components/ui/PageHeader.tsx";

export default function ProjectPage() {
  return (
    <>
      <title>Project · Full-Stack Learning</title>
      <PageHeader
        title="Project"
        description="Watch the project grow: see which files each step adds and changes."
        eyebrow={<Badge tone="info">Coming soon</Badge>}
      />
    </>
  );
}
