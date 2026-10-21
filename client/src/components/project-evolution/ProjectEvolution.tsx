import type {
  BuildStepListResponse,
  BuildStepResponse,
  DiffResponse,
  SnapshotResponse,
} from "@fsl/shared";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useApi } from "../../hooks/useApi.ts";
import { apiPaths } from "../../services/api.ts";
import { ErrorState } from "../ui/ErrorState.tsx";
import { Loading } from "../ui/Loading.tsx";
import { ProjectDiff } from "./ProjectDiff.tsx";
import { ProjectSnapshot } from "./ProjectSnapshot.tsx";
import { StepSelector } from "./StepSelector.tsx";

/** ?step= as a step number, or null when missing or out of range. */
function parseStep(value: string | null, last: number): number | null {
  if (value === null || !/^\d+$/.test(value)) return null;
  const step = Number(value);
  return step <= last ? step : null;
}

/**
 * How the Notes App grows: pick a build step to see the files it adds,
 * changes and removes. The Explorer's start screen.
 */
export function ProjectEvolution() {
  // The chosen step lives in the URL (?step=…), so it can be linked to and
  // survives a reload.
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const steps = useApi<BuildStepListResponse>(apiPaths.buildSteps());

  const list = steps.data?.buildSteps;
  const last = list?.at(-1)?.order ?? 0;
  // Without a valid ?step=, show the finished project's last step.
  const step = list
    ? (parseStep(searchParams.get("step"), last) ?? last)
    : null;

  const after = useApi<SnapshotResponse>(
    step === null ? null : apiPaths.snapshot(step),
  );
  const before = useApi<SnapshotResponse>(
    step ? apiPaths.snapshot(step - 1) : null,
  );
  const diff = useApi<DiffResponse>(
    step ? apiPaths.diff(step - 1, step) : null,
  );

  const openFile = (path: string) =>
    navigate(`/explorer?file=${encodeURIComponent(path)}`);
  const current = list?.find((s) => s.order === step);
  // The step's lesson data, for the "new concepts / connections" counts.
  const stepDetails = useApi<BuildStepResponse>(
    current ? apiPaths.buildStep(current.slug) : null,
  );
  const failed = [steps, after, before, diff].find((state) => state.error);

  return (
    <section
      aria-labelledby="project-evolution"
      className="flex flex-col gap-4"
    >
      <div>
        <h2 id="project-evolution" className="text-xl font-semibold">
          How the Notes App grows
        </h2>
        <p className="mt-1 text-muted">
          Choose a file on the left, or pick a build step to see which files it
          adds, changes and removes.
        </p>
      </div>
      {failed?.error && (
        <ErrorState message={failed.error.message} onRetry={failed.reload} />
      )}
      {steps.isLoading && <Loading label="Loading the build steps…" />}
      {list && step !== null && (
        <div className="flex flex-col gap-6">
          <StepSelector
            steps={list}
            value={step}
            onChange={(next) => setSearchParams({ step: String(next) })}
          />
          {current ? (
            <p className="text-muted">
              <span className="font-medium text-foreground">
                {current.title}:
              </span>{" "}
              {current.goal}{" "}
              <Link
                to={`/build/${current.slug}`}
                className="inline-flex min-h-6 items-center text-accent hover:underline"
              >
                Open this step
              </Link>
            </p>
          ) : (
            <p className="text-muted">
              Before step 1 the project is an empty folder.
            </p>
          )}

          {step === 0
            ? after.data && (
                <ProjectSnapshot
                  title="Start"
                  description="before step 1"
                  tree={after.data.tree}
                  onOpenFile={openFile}
                />
              )
            : after.data &&
              before.data &&
              diff.data && (
                <ProjectDiff
                  // A new step opens the folders of its own changes.
                  key={step}
                  step={step}
                  before={before.data.tree}
                  after={after.data.tree}
                  diff={diff.data}
                  newConcepts={stepDetails.data?.concepts.length}
                  newConnections={stepDetails.data?.connections.length}
                  onOpenFile={openFile}
                />
              )}
          {!failed &&
            (after.isLoading || before.isLoading || diff.isLoading) && (
              <Loading label="Loading the project files…" />
            )}
        </div>
      )}
    </section>
  );
}
