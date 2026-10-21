import type {
  FlowResponse,
  LayerView,
  PathResponse,
  TopicResponse,
  TopicTreeNode,
  TopicTreeResponse,
} from "@fsl/shared";
import { lazy, type ReactNode, Suspense } from "react";
import { Link } from "react-router";
import { useParams } from "react-router";
import { GuidedTopic } from "../components/learn-path/GuidedTopic.tsx";
import { LearningTree } from "../components/learning-tree/LearningTree.tsx";
import { TopicNav } from "../components/learning-tree/TopicNav.tsx";
import { explorerFileHref } from "../components/connection-graph/links.ts";
import { Card } from "../components/ui/Card.tsx";
import { FlowStepList } from "../components/flow-tracer/FlowStepList.tsx";
import { ErrorState } from "../components/ui/ErrorState.tsx";
import { Loading } from "../components/ui/Loading.tsx";
import { NotFoundState } from "../components/ui/NotFoundState.tsx";
import { PageHeader } from "../components/ui/PageHeader.tsx";
import { RichText } from "../components/ui/RichText.tsx";
import { type ApiState, useApi } from "../hooks/useApi.ts";
import { useScrollToTop } from "../hooks/useScrollToTop.ts";
import { apiPaths } from "../services/api.ts";
import { PageMeta } from "../components/ui/PageMeta.tsx";

export default function TopicPage() {
  const { topic: slug = "", step } = useParams();
  // Already cached if the learner came from /learn. It says which topics
  // have a guided path, so no request is made for a path that isn't there.
  const tree = useApi<TopicTreeResponse>(apiPaths.topicTree());
  const hasPath = tree.data ? findTopic(tree.data.tree, slug)?.hasPath : false;
  const path = useApi<PathResponse>(hasPath ? apiPaths.path(slug) : null);

  // Moving to another topic or step should start at the top of the page.
  useScrollToTop(`${slug}/${step ?? ""}`);

  if (tree.isLoading || (hasPath && path.isLoading)) {
    return <Loading label="Loading topic…" />;
  }
  if (path.data) {
    return (
      <GuidedTopic path={path.data} stepId={step} tree={tree.data?.tree} />
    );
  }
  // No guided path, or it failed to load: the classic topic page.
  if (step) {
    return (
      <NotFoundState
        title="Step not found"
        message={`This topic has no step called "${step}".`}
      />
    );
  }
  return <ClassicTopic slug={slug} tree={tree.data} />;
}

function findTopic(
  node: TopicTreeNode,
  slug: string,
): TopicTreeNode | undefined {
  if (node.slug === slug) return node;
  for (const child of node.children) {
    const found = findTopic(child, slug);
    if (found) return found;
  }
  return undefined;
}

/** A topic without a guided path: overview, concepts and build steps. */
function ClassicTopic({
  slug,
  tree,
}: {
  slug: string;
  tree?: TopicTreeResponse;
}) {
  const page = useApi<TopicResponse>(apiPaths.topic(slug));

  return (
    <div className="grid gap-10 lg:grid-cols-[17rem_minmax(0,1fr)]">
      <aside
        aria-label="All topics"
        className="hidden lg:block lg:self-start lg:sticky lg:top-6"
      >
        {/* Wait for the topic, so the tree opens with it highlighted. */}
        {tree && page.data && (
          <LearningTree
            // Remount when the topic changes so its ancestors expand.
            key={page.data?.topic.id}
            root={tree.tree}
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
        <PageMeta
          title="Topic not found"
          description="This topic doesn't exist."
          noIndex
        />
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
      <PageMeta title={topic.title} description={topic.summary} />
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

      {data.layers && <HowEverythingConnects layers={data.layers} />}

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

// React Flow is large; it is only downloaded on this topic.
const FlowCanvas = lazy(
  () => import("../components/flow-tracer/FlowCanvas.tsx"),
);

const chip =
  "inline-flex min-h-7 items-center rounded-full border border-border px-2.5 py-0.5 text-sm [overflow-wrap:anywhere] hover:border-accent hover:text-accent";

/**
 * "How everything connects": the whole create-note round trip at a glance,
 * then why each layer exists, with its concepts, build steps and files.
 */
function HowEverythingConnects({ layers }: { layers: LayerView[] }) {
  const flow = useApi<FlowResponse>(apiPaths.flow("create-note"));
  return (
    <section
      aria-labelledby="layers-heading"
      className="mt-10 flex flex-col gap-6"
    >
      <h2 id="layers-heading" className="text-xl font-semibold">
        One note, every layer
      </h2>
      <p className="leading-7">
        Saving a note crosses all five layers and comes back. Each box is one
        step; read it left to right, from the user down to the database and back
        up.{" "}
        <Link
          to="/flow?flow=create-note&step=1"
          className="text-accent underline"
        >
          Step through it on the Flow page
        </Link>
        .
      </p>
      {flow.isLoading && <Loading label="Loading the flow…" />}
      {flow.error && (
        <ErrorState
          message={flow.error.message}
          onRetry={flow.reload}
          homeLink={false}
        />
      )}
      {flow.data && (
        <Suspense fallback={<Loading label="Loading the flow canvas…" />}>
          <div
            role="group"
            aria-label={`The ${flow.data.flow.steps.length} steps of creating a note, from the user through the frontend, network, backend and database and back.`}
          >
            <FlowCanvas
              steps={flow.data.flow.steps}
              symbols={flow.data.symbols}
              current={flow.data.flow.steps.length}
              readOnly
            />
          </div>
        </Suspense>
      )}
      {flow.data && (
        <FlowStepList
          flowId="create-note"
          steps={flow.data.flow.steps}
          symbols={flow.data.symbols}
        />
      )}
      <ol className="flex flex-col gap-6">
        {layers.map((layer) => (
          <li key={layer.layer} className="rounded-lg border border-border p-5">
            <h3 className="text-lg font-semibold">{layer.title}</h3>
            <div className="mt-2 flex flex-col gap-3 leading-7">
              {layer.why.map((paragraph, i) => (
                <p key={i}>
                  <RichText text={paragraph} />
                </p>
              ))}
            </div>
            <dl className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-3 text-sm sm:grid-cols-[8rem_minmax(0,1fr)]">
              <dt className="font-medium">Concepts</dt>
              <dd className="flex flex-wrap gap-2">
                {layer.concepts.map((c) => (
                  <Link key={c.id} to={`/concepts/${c.slug}`} className={chip}>
                    {c.title}
                  </Link>
                ))}
              </dd>
              <dt className="font-medium">Build steps</dt>
              <dd className="flex flex-wrap gap-2">
                {layer.buildSteps.map((s) => (
                  <Link key={s.id} to={`/build/${s.slug}`} className={chip}>
                    {s.order}. {s.title}
                  </Link>
                ))}
              </dd>
              <dt className="font-medium">Files</dt>
              <dd className="flex flex-wrap gap-2">
                {layer.files.map((f) => (
                  <Link
                    key={f.id}
                    to={explorerFileHref(f)}
                    className={`${chip} font-mono`}
                  >
                    {f.path}
                  </Link>
                ))}
              </dd>
            </dl>
          </li>
        ))}
      </ol>
    </section>
  );
}
