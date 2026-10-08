import { useParams } from "react-router";
import { Badge } from "../components/ui/Badge.tsx";
import { PageHeader } from "../components/ui/PageHeader.tsx";

export default function BuildStepPage() {
  const { step } = useParams();
  return (
    <>
      <title>Build step · Full-Stack Learning</title>
      <PageHeader
        title={`Build step: ${step}`}
        description="One step of the build: what we do, why, and what changes in the project."
        eyebrow={<Badge tone="info">Coming soon</Badge>}
      />
    </>
  );
}
