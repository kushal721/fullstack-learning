import type { ConceptResponse } from "@fsl/shared";
import { useParams } from "react-router";
import { ConceptExplanation } from "../components/concept-explorer/ConceptExplanation.tsx";
import { ConceptHeader } from "../components/concept-explorer/ConceptHeader.tsx";
import { ErrorState } from "../components/ui/ErrorState.tsx";
import { Loading } from "../components/ui/Loading.tsx";
import { NotFoundState } from "../components/ui/NotFoundState.tsx";
import { PageHeader } from "../components/ui/PageHeader.tsx";
import { useApi } from "../hooks/useApi.ts";
import { useScrollToTop } from "../hooks/useScrollToTop.ts";
import { apiPaths } from "../services/api.ts";

export default function ConceptPage() {
  const { concept: slug = "" } = useParams();
  const { data, error, isLoading, reload } = useApi<ConceptResponse>(
    apiPaths.concept(slug),
  );

  // Following a "Related" link should start at the top of the new concept.
  useScrollToTop(slug);

  if (isLoading) return <Loading label="Loading concept…" />;

  if (error?.status === 404 || error?.status === 400) {
    return (
      <>
        <title>Concept not found · Full-Stack Learning</title>
        <NotFoundState
          title="Concept not found"
          message={`There is no concept called "${slug}".`}
        />
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <PageHeader title="Couldn't load this concept" />
        <ErrorState
          message={error?.message ?? "No data received."}
          onRetry={reload}
        />
      </>
    );
  }

  return (
    <article className="max-w-3xl">
      <title>{`${data.concept.title} · Full-Stack Learning`}</title>
      <ConceptHeader concept={data.concept} topic={data.topic} />
      <ConceptExplanation concept={data.concept} related={data.related} />
    </article>
  );
}
