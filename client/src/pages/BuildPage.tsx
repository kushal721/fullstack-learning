import type { BuildStepListResponse } from "@fsl/shared";
import { BuildTimeline } from "../components/build-journey/BuildTimeline.tsx";
import { ErrorState } from "../components/ui/ErrorState.tsx";
import { Loading } from "../components/ui/Loading.tsx";
import { PageHeader } from "../components/ui/PageHeader.tsx";
import { useApi } from "../hooks/useApi.ts";
import { apiPaths } from "../services/api.ts";
import { PageMeta } from "../components/ui/PageMeta.tsx";

export default function BuildPage() {
  const { data, error, isLoading, reload } = useApi<BuildStepListResponse>(
    apiPaths.buildSteps(),
  );

  return (
    <>
      <PageMeta
        title="Build"
        description="Build the Notes App step by step, from an empty folder to a deployed full-stack app."
      />
      <PageHeader
        title="Build"
        description="Build the Notes App step by step, from an empty folder to a deployed application. Each step explains what we do, why, and exactly what changes."
      />
      {isLoading && <Loading label="Loading the build steps…" />}
      {error && <ErrorState message={error.message} onRetry={reload} />}
      {data && (
        <nav aria-label="Build steps" className="max-w-3xl">
          <BuildTimeline
            steps={data.buildSteps}
            currentOrder={null}
            showGoals
          />
        </nav>
      )}
    </>
  );
}
