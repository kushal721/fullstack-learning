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
import { PageMeta } from "../components/ui/PageMeta.tsx";

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
        <PageMeta
          title="Concept not found"
          description="This concept doesn't exist."
          noIndex
        />
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
      <PageMeta title={data.concept.title} description={data.concept.summary} />
      <ConceptHeader concept={data.concept} topic={data.topic} />
      <ConceptExplanation
        concept={data.concept}
        related={data.related}
        usedIn={data.usedIn}
        introducedIn={data.introducedIn}
      />
    </article>
  );
}
