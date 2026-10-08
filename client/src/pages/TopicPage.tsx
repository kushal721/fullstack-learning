import type { TopicResponse, TopicTreeResponse } from "@fsl/shared";
import { type ReactNode, useEffect } from "react";
import { useParams } from "react-router";
import { LearningTree } from "../components/learning-tree/LearningTree.tsx";
import { TopicNav } from "../components/learning-tree/TopicNav.tsx";
import { Card } from "../components/ui/Card.tsx";
import { ErrorState } from "../components/ui/ErrorState.tsx";
import { Loading } from "../components/ui/Loading.tsx";
import { NotFoundState } from "../components/ui/NotFoundState.tsx";
import { PageHeader } from "../components/ui/PageHeader.tsx";
import { RichText } from "../components/ui/RichText.tsx";
import { type ApiState, useApi } from "../hooks/useApi.ts";
import { apiPaths } from "../services/api.ts";

export default function TopicPage() {
  const { topic: slug = "" } = useParams();
  const page = useApi<TopicResponse>(apiPaths.topic(slug));
  // Already cached if the learner came from /learn.
  const tree = useApi<TopicTreeResponse>(apiPaths.topicTree());

  // Moving to the next topic should start at the top of the page.
  useEffect(() => window.scrollTo(0, 0), [slug]);

  return (
    <div className="grid gap-10 lg:grid-cols-[17rem_minmax(0,1fr)]">
      <aside
        aria-label="All topics"
        className="hidden lg:block lg:self-start lg:sticky lg:top-6"
      >
        {tree.data && (
          <LearningTree
            // Remount when the topic changes so its ancestors expand.
            key={page.data?.topic.id}
            root={tree.data.tree}
            currentId={page.data?.topic.id}
            compact
          />
        )}
      </aside>

      <article className="min-w-0 max-w-3xl">
        <TopicContent slug={slug} page={page} />
      </article>
    </div>
  );
}

function TopicContent({
  slug,
  page,
}: {
  slug: string;
  page: ApiState<TopicResponse>;
}) {
  const { data, error, isLoading, reload } = page;

  if (isLoading) return <Loading label="Loading topic…" />;
  if (error?.status === 404 || error?.status === 400) {
    return (
      <>
        <title>Topic not found · Full-Stack Learning</title>
        <NotFoundState
          title="Topic not found"
          message={`There is no topic called "${slug}".`}
        />
      </>
    );
  }
  if (error || !data) {
    return (
      <>
        <PageHeader title="Couldn't load this topic" />
        <ErrorState
          message={error?.message ?? "No data received."}
          onRetry={reload}
        />
      </>
    );
  }

  const { topic, previous, next, concepts, buildSteps } = data;

  return (
    <>
      <title>{`${topic.title} · Full-Stack Learning`}</title>
      <PageHeader
        eyebrow={`Topic ${topic.order}`}
        title={topic.title}
        description={topic.summary}
      />

      {topic.whereToStart && (
        <p className="mb-8 rounded-lg border border-accent/30 bg-accent/5 p-4">
          <span className="font-medium">Where to start: </span>
          <RichText text={topic.whereToStart} />
        </p>
      )}

      <div className="flex flex-col gap-4 text-base leading-7">
        {topic.overview.map((paragraph, index) => (
          <p key={index}>
            <RichText text={paragraph} />
          </p>
        ))}
      </div>

      {topic.children.length > 0 && (
        <TopicSection title="Sub-topics">
          {topic.children.map((child) => (
            <li key={child.id}>
              <Card title={child.title} to={`/learn/${child.slug}`}>
                {child.summary}
              </Card>
            </li>
          ))}
        </TopicSection>
      )}

      {concepts.length > 0 && (
        <TopicSection title="Concepts in this topic">
          {concepts.map((concept) => (
            <li key={concept.id}>
              <Card title={concept.title} to={`/concepts/${concept.slug}`}>
                {concept.summary}
              </Card>
            </li>
          ))}
        </TopicSection>
      )}

      {buildSteps.length > 0 && (
        <TopicSection title="Where you build it">
          {buildSteps.map((step) => (
            <li key={step.id}>
              <Card
                title={`Step ${step.order}: ${step.title}`}
                to={`/build/${step.slug}`}
              >
                {step.goal}
              </Card>
            </li>
          ))}
        </TopicSection>
      )}

      <TopicNav previous={previous} next={next} />
    </>
  );
}

/** A titled list of cards; callers render the <li> items. */
function TopicSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-10">
      <h2 className="mb-3 text-xl font-semibold">{title}</h2>
      <ul className="grid gap-3 sm:grid-cols-2">{children}</ul>
    </section>
  );
}
