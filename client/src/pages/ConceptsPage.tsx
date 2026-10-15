import type { ConceptListResponse, TopicTreeResponse } from "@fsl/shared";
import { Card } from "../components/ui/Card.tsx";
import { ErrorState } from "../components/ui/ErrorState.tsx";
import { Loading } from "../components/ui/Loading.tsx";
import { PageHeader } from "../components/ui/PageHeader.tsx";
import { useApi } from "../hooks/useApi.ts";
import { apiPaths } from "../services/api.ts";
import { PageMeta } from "../components/ui/PageMeta.tsx";

export default function ConceptsPage() {
  const concepts = useApi<ConceptListResponse>(apiPaths.concepts());
  // Topic titles and order for the group headings (usually cached already).
  const tree = useApi<TopicTreeResponse>(apiPaths.topicTree());

  const error = concepts.error ?? tree.error;
  const reload = () => {
    if (concepts.error) concepts.reload();
    if (tree.error) tree.reload();
  };

  // The API already sorts concepts by topic; group them under each topic.
  const list = concepts.data?.concepts;
  const groups =
    list && tree.data
      ? tree.data.tree.children
          .map((topic) => ({
            topic,
            concepts: list.filter((concept) => concept.topicId === topic.id),
          }))
          .filter((group) => group.concepts.length > 0)
      : [];

  return (
    <>
      <PageMeta
        title="Concepts"
        description="Every concept explained the same way, from the basics, and connected to the Notes App's real code."
      />
      <PageHeader
        title="Concepts"
        description="Every concept explained the same way: what it is, why we need it, how it works and how to create it yourself — connected to the Notes App."
      />
      {error ? (
        <ErrorState message={error.message} onRetry={reload} />
      ) : concepts.isLoading || tree.isLoading ? (
        <Loading label="Loading concepts…" />
      ) : groups.length === 0 ? (
        <p className="text-muted">No concepts yet.</p>
      ) : (
        <div className="flex max-w-4xl flex-col gap-10">
          {groups.map(({ topic, concepts: items }) => (
            <section key={topic.id} aria-labelledby={`group-${topic.id}`}>
              <h2
                id={`group-${topic.id}`}
                className="mb-3 text-xl font-semibold"
              >
                <span className="text-muted">{topic.order}.</span> {topic.title}
              </h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {items.map((concept) => (
                  <li key={concept.id}>
                    <Card
                      title={concept.title}
                      to={`/concepts/${concept.slug}`}
                    >
                      {concept.summary}
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
