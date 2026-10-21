import type { PathResponse, TopicTreeResponse } from "@fsl/shared";
import { Link } from "react-router";
import { navItems } from "../components/layout/nav-items.ts";
import { ButtonLink } from "../components/ui/ButtonLink.tsx";
import { Card } from "../components/ui/Card.tsx";
import { ErrorState } from "../components/ui/ErrorState.tsx";
import { Loading } from "../components/ui/Loading.tsx";
import { RichText } from "../components/ui/RichText.tsx";
import { useApi } from "../hooks/useApi.ts";
import { useLatestProgress } from "../hooks/usePathProgress.ts";
import { apiPaths } from "../services/api.ts";
import { PageMeta } from "../components/ui/PageMeta.tsx";

export default function HomePage() {
  const { data, error, isLoading, reload } = useApi<TopicTreeResponse>(
    apiPaths.topicTree(),
  );
  const topics = data?.tree.children ?? [];
  const firstTopic = topics[0];
  const resume = useResume(topics);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-12 py-12">
      <PageMeta description="Learn how a real web application works by building one, from an empty project to a deployed app." />

      <section className="flex flex-col gap-6">
        <h1 className="text-4xl font-semibold tracking-tight">
          Full-Stack Learning
        </h1>
        <p className="text-lg leading-8 text-muted">
          Learn how a real web application works by building one — from an empty
          project to a deployed app.
        </p>
        <blockquote className="border-l-4 border-border pl-4 text-lg italic">
          Don&apos;t just learn what to write. Understand what happens when you
          write it.
        </blockquote>
      </section>

      <section
        aria-labelledby="start-heading"
        className="rounded-xl border border-accent/30 bg-accent/5 p-6"
      >
        <h2 id="start-heading" className="text-xl font-semibold">
          Where to start
        </h2>
        {isLoading && <Loading />}
        {error && <ErrorState message={error.message} onRetry={reload} />}
        {data && (
          <>
            {data.whereToStart && (
              <p className="mt-2 leading-7">
                <RichText text={data.whereToStart} />
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-3">
              {resume && (
                <ButtonLink to={resume.href}>{resume.label}</ButtonLink>
              )}
              {firstTopic && (
                <ButtonLink
                  to={`/learn/${firstTopic.slug}`}
                  variant={resume ? "secondary" : "primary"}
                >
                  Start with {firstTopic.title}
                </ButtonLink>
              )}
              <ButtonLink to="/build" variant="secondary">
                Build the Notes App
              </ButtonLink>
            </div>
          </>
        )}
      </section>

      <section aria-labelledby="how-heading">
        <h2 id="how-heading" className="mb-4 text-xl font-semibold">
          How this works
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {navItems.map((item) => (
            <li key={item.to}>
              <Card title={item.label} to={item.to}>
                {item.description}
              </Card>
            </li>
          ))}
        </ul>
      </section>

      {topics.length > 0 && (
        <section aria-labelledby="topics-heading">
          <h2 id="topics-heading" className="mb-4 text-xl font-semibold">
            The {topics.length} topics
          </h2>
          <ol className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
            {topics.map((topic) => (
              <li key={topic.id}>
                <Link
                  to={`/learn/${topic.slug}`}
                  className="flex gap-3 rounded-md px-2 py-1.5 hover:bg-foreground/5"
                >
                  <span
                    aria-hidden="true"
                    className="w-6 text-right text-muted"
                  >
                    {topic.order}.
                  </span>
                  <span>{topic.title}</span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}

/**
 * "Continue: How the Web Works, step 7": the step the learner was last on,
 * in the topic they worked on most recently. None if that step is gone.
 */
function useResume(topics: TopicTreeResponse["tree"]["children"]) {
  const latest = useLatestProgress();
  const topic = topics.find((t) => t.id === latest?.topicId && t.hasPath);
  const path = useApi<PathResponse>(topic ? apiPaths.path(topic.slug) : null);
  const step = path.data?.levels
    .flatMap((level) => level.steps)
    .find((s) => s.id === latest?.stepId);
  if (!topic || !step) return undefined;
  return {
    href: `/learn/${topic.slug}/${step.id}`,
    label: `Continue: ${topic.title}, step ${step.number} →`,
  };
}
