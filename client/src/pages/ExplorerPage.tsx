import { Badge } from "../components/ui/Badge.tsx";
import { PageHeader } from "../components/ui/PageHeader.tsx";

export default function ExplorerPage() {
  return (
    <>
      <title>Explorer · Full-Stack Learning</title>
      <PageHeader
        title="Explorer"
        description="Browse the Notes App files, read the code and trace how everything connects."
        eyebrow={<Badge tone="info">Coming soon</Badge>}
      />
    </>
  );
}
