import type { ExerciseListResponse, ExerciseResponse } from "@fsl/shared";
import { Link, useParams } from "react-router";
import { ExerciseRunner } from "../components/practice/ExerciseRunner.tsx";
import { modeLabel } from "../components/practice/modes.ts";
import { ErrorState } from "../components/ui/ErrorState.tsx";
import { Loading } from "../components/ui/Loading.tsx";
import { NotFoundState } from "../components/ui/NotFoundState.tsx";
import { PageHeader } from "../components/ui/PageHeader.tsx";
import { useApi } from "../hooks/useApi.ts";
import { useScrollToTop } from "../hooks/useScrollToTop.ts";
import { apiPaths } from "../services/api.ts";

export default function ExercisePage() {
  const { exercise: id = "" } = useParams();
  const { data, error, isLoading, reload } = useApi<ExerciseResponse>(
    apiPaths.exercise(id),
  );
  // The list (usually cached from the Practice page) says what comes next.
  const list = useApi<ExerciseListResponse>(apiPaths.exercises());
  useScrollToTop(id);

  if (isLoading) return <Loading label="Loading the exercise…" />;

  if (error?.status === 404 || error?.status === 400) {
    return (
      <>
        <title>Exercise not found · Full-Stack Learning</title>
        <NotFoundState
          title="Exercise not found"
          message={`There is no exercise called "${id}".`}
        />
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <PageHeader title="Couldn't load this exercise" />
        <ErrorState
          message={error?.message ?? "No data received."}
          onRetry={reload}
        />
      </>
    );
  }

  const { exercise } = data;
  const ids = list.data?.exercises.map((e) => e.id) ?? [];
  const next = ids[ids.indexOf(exercise.id) + 1];

  return (
    <>
      <title>{`${exercise.title} · Practice · Full-Stack Learning`}</title>
      <PageHeader
        eyebrow={
          <>
            <Link to="/practice" className="text-accent underline">
              Practice
            </Link>{" "}
            · {modeLabel(exercise.mode)}
          </>
        }
        title={exercise.title}
      />
      <ExerciseRunner
        key={exercise.id}
        exercise={exercise}
        nextHref={
          ids.indexOf(exercise.id) >= 0 && next
            ? `/practice/${next}`
            : undefined
        }
      />
    </>
  );
}
