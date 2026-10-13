import type { ConceptListResponse, PublicExercise } from "@fsl/shared";
import { Link } from "react-router";
import { useApi } from "../../hooks/useApi.ts";
import { apiPaths } from "../../services/api.ts";
import { explorerFileHref } from "../connection-graph/links.ts";

/**
 * Where to read more after answering: the exercise's concepts and the file
 * its code comes from. Concept titles come from the (usually cached) list.
 */
export function LearnMore({ exercise }: { exercise: PublicExercise }) {
  const concepts = useApi<ConceptListResponse>(apiPaths.concepts());
  const code =
    "code" in exercise
      ? exercise.code
      : "snippet" in exercise
        ? exercise.snippet
        : undefined;
  const fileId = code?.fileName;
  const linked = exercise.conceptIds.map((id) => ({
    id,
    concept: concepts.data?.concepts.find((c) => c.id === id),
  }));
  if (linked.length === 0 && !fileId) return null;

  return (
    <section
      aria-labelledby={`learn-more-${exercise.id}`}
      className="flex flex-col gap-2"
    >
      <h2 id={`learn-more-${exercise.id}`} className="font-semibold">
        Learn more
      </h2>
      <ul className="flex flex-wrap gap-2">
        {linked.map(({ id, concept }) => (
          <li key={id}>
            <Link
              to={`/concepts/${concept?.slug ?? id}`}
              className="inline-block rounded-full border border-border px-3 py-1 text-sm hover:border-accent"
            >
              {concept?.title ?? id}
            </Link>
          </li>
        ))}
        {fileId && (
          <li>
            <Link
              to={explorerFileHref({
                id: fileId,
                path: fileId,
                layer: "root",
                purpose: "",
              })}
              className="inline-block rounded-full border border-border px-3 py-1 text-sm hover:border-accent"
            >
              See the code in{" "}
              <code className="font-mono">{fileId.split("/").at(-1)}</code>
            </Link>
          </li>
        )}
      </ul>
    </section>
  );
}
