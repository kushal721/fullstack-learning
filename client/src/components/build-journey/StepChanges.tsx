import type { FileTreeFolder, SnapshotDiff } from "@fsl/shared";
import { useNavigate } from "react-router";
import { ProjectDiff } from "../project-evolution/ProjectDiff.tsx";
import { ErrorState } from "../ui/ErrorState.tsx";
import { Loading } from "../ui/Loading.tsx";

type Props = {
  order: number;
  diff: SnapshotDiff;
  before?: FileTreeFolder;
  after?: FileTreeFolder;
  error?: { message: string; retry: () => void } | null;
  newConcepts?: number;
  newConnections?: number;
};

/** "What changed?": the project before and after this step. */
export function StepChanges({
  order,
  diff,
  before,
  after,
  error,
  newConcepts,
  newConnections,
}: Props) {
  const navigate = useNavigate();
  if (error)
    return <ErrorState message={error.message} onRetry={error.retry} />;
  if (!before || !after) return <Loading label="Loading the project files…" />;
  return (
    <ProjectDiff
      step={order}
      before={before}
      after={after}
      diff={diff}
      headingLevel={3}
      title="Files changed in this step"
      newConcepts={newConcepts}
      newConnections={newConnections}
      onOpenFile={(path) =>
        navigate(`/explorer?file=${encodeURIComponent(path)}`)
      }
    />
  );
}
