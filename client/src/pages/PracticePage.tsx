import type { ExerciseListResponse } from "@fsl/shared";
import { modeInputs } from "../components/practice/mode-inputs.ts";
import { MODES } from "../components/practice/modes.ts";
import { Badge } from "../components/ui/Badge.tsx";
import { Card } from "../components/ui/Card.tsx";
import { ErrorState } from "../components/ui/ErrorState.tsx";
import { Loading } from "../components/ui/Loading.tsx";
import { PageHeader } from "../components/ui/PageHeader.tsx";
import { RichText } from "../components/ui/RichText.tsx";
import { useApi } from "../hooks/useApi.ts";
import { apiPaths } from "../services/api.ts";
import { PageMeta } from "../components/ui/PageMeta.tsx";

export default function PracticePage() {
  const { data, error, isLoading, reload } = useApi<ExerciseListResponse>(
    apiPaths.exercises(),
  );
  const groups = MODES.map((info) => ({
    ...info,
    exercises: (data?.exercises ?? []).filter((e) => e.mode === info.mode),
  })).filter((group) => group.exercises.length > 0);

  return (
    <>
      <PageMeta
        title="Practice"
        description="Test yourself on the Notes App's real code: predict, trace, find, fix and plan features."
      />
      <PageHeader
        title="Practice"
        description="Test what you've learned on the Notes App's real code. Each kind of exercise trains a different skill for understanding a codebase."
      />
      {error ? (
        <ErrorState message={error.message} onRetry={reload} />
      ) : isLoading ? (
        <Loading label="Loading exercises…" />
      ) : groups.length === 0 ? (
        <p className="text-muted">No exercises yet.</p>
      ) : (
        <div className="flex max-w-4xl flex-col gap-10">
          {groups.map(({ mode, label, skill, exercises }) => (
            <section key={mode} aria-labelledby={`mode-${mode}`}>
              <h2
                id={`mode-${mode}`}
                className="flex flex-wrap items-center gap-2 text-xl font-semibold"
              >
                {label}
                {!modeInputs[mode] && <Badge>Coming soon</Badge>}
              </h2>
              <p className="mb-3 text-muted">{skill}</p>
              <ul className="grid gap-3 sm:grid-cols-2">
                {exercises.map((exercise) => (
                  <li key={exercise.id}>
                    <Card
                      title={exercise.title}
                      to={`/practice/${exercise.id}`}
                    >
                      <RichText text={exercise.prompt} />
                    </Card>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
