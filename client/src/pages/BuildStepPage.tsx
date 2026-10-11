import type {
  BuildStepListResponse,
  BuildStepResponse,
  SnapshotResponse,
} from "@fsl/shared";
import { useParams } from "react-router";
import { BuildStep } from "../components/build-journey/BuildStep.tsx";
import { BuildTimeline } from "../components/build-journey/BuildTimeline.tsx";
import { ErrorState } from "../components/ui/ErrorState.tsx";
import { Loading } from "../components/ui/Loading.tsx";
import { NotFoundState } from "../components/ui/NotFoundState.tsx";
import { PageHeader } from "../components/ui/PageHeader.tsx";
import { useApi } from "../hooks/useApi.ts";
import { useScrollToTop } from "../hooks/useScrollToTop.ts";
import { apiPaths } from "../services/api.ts";

export default function BuildStepPage() {
  const { step: slug = "" } = useParams();
  const { data, error, isLoading, reload } = useApi<BuildStepResponse>(
    apiPaths.buildStep(slug),
  );
  const steps = useApi<BuildStepListResponse>(apiPaths.buildSteps());
  const order = data?.step.order;
  const before = useApi<SnapshotResponse>(
    order ? apiPaths.snapshot(order - 1) : null,
  );
  const after = useApi<SnapshotResponse>(
    order ? apiPaths.snapshot(order) : null,
  );

  // Moving to another step should start at the top of its lesson.
  useScrollToTop(slug);

  if (isLoading) return <Loading label="Loading the build step…" />;

  if (error?.status === 404 || error?.status === 400) {
    return (
      <>
        <title>Build step not found · Full-Stack Learning</title>
        <NotFoundState
          title="Build step not found"
          message={`There is no build step called "${slug}".`}
        />
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <PageHeader title="Couldn't load this build step" />
        <ErrorState
          message={error?.message ?? "No data received."}
          onRetry={reload}
        />
      </>
    );
  }

  const snapshotFailure = before.error ?? after.error;
  const list = steps.data?.buildSteps;

  return (
    <div className="grid gap-10 lg:grid-cols-[16rem_minmax(0,1fr)]">
      <title>{`${data.step.order}. ${data.step.title} · Full-Stack Learning`}</title>
      <div className="min-w-0 lg:order-2">
        <BuildStep
          {...data}
          totalSteps={list?.length ?? data.step.order}
          before={before.data?.tree}
          after={after.data?.tree}
          snapshotError={
            snapshotFailure && {
              message: snapshotFailure.message,
              retry: () => {
                before.reload();
                after.reload();
              },
            }
          }
        />
      </div>
      {list && (
        // After the lesson on phones; a sidebar on wide screens.
        <nav aria-label="Build steps" className="lg:order-1 lg:self-start">
          <h2 className="mb-2 px-2 text-sm font-semibold uppercase tracking-wide text-muted">
            All steps
          </h2>
          <BuildTimeline steps={list} currentOrder={data.step.order} />
        </nav>
      )}
    </div>
  );
}
