import type { PathResponse, TopicTreeNode } from "@fsl/shared";
import { useEffect } from "react";
import { LearningTree } from "../learning-tree/LearningTree.tsx";
import { TopicNav } from "../learning-tree/TopicNav.tsx";
import { NotFoundState } from "../ui/NotFoundState.tsx";
import { PageHeader } from "../ui/PageHeader.tsx";
import { PageMeta } from "../ui/PageMeta.tsx";
import { Link, useLocation } from "react-router";
import { GlossaryPanel } from "./GlossaryPanel.tsx";
import { useGlossaryView } from "./glossary-view.ts";
import { glossaryHref } from "./levels.ts";
import { LevelSwitcher } from "./LevelSwitcher.tsx";
import { LookUp } from "./LookUp.tsx";
import { PathOverview } from "./PathOverview.tsx";
import { PathSidebar } from "./PathSidebar.tsx";
import { resetProgress, usePathProgress } from "./progress.ts";
import { StepDots } from "./StepDots.tsx";
import { StepPlayer } from "./StepPlayer.tsx";
import { ContinuesNote, StepHeader } from "./StepHeader.tsx";

type Props = {
  path: PathResponse;
  /** The step in the URL; undefined on the overview. */
  stepId?: string;
  tree?: TopicTreeNode;
};

/** The topics before and after this one, from the tree's reading order. */
function adjacent(tree: TopicTreeNode | undefined, id: string) {
  const all: TopicTreeNode[] = [];
  const walk = (node: TopicTreeNode) =>
    node.children.forEach((child) => (all.push(child), walk(child)));
  if (tree) walk(tree);
  const index = all.findIndex((topic) => topic.id === id);
  return index < 0 ? {} : { previous: all[index - 1], next: all[index + 1] };
}

/**
 * A topic with a guided path: three levels of numbered steps. The overview
 * is /learn/<topic>, each step /learn/<topic>/<step>.
 */
export function GuidedTopic({ path, stepId, tree }: Props) {
  const { topic, levels } = path;
  const progress = usePathProgress(topic.id);
  const { search } = useLocation();
  const glossaryOpen = useGlossaryView() !== null;
  const { visit } = progress;

  const allSteps = levels.flatMap((level) => level.steps);
  const step = stepId ? allSteps.find((s) => s.id === stepId) : undefined;
  const level =
    levels.find((l) => l.level === (step?.level ?? progress.level)) ??
    levels[0]!;

  useEffect(() => {
    if (step) visit(step.level, step.id);
  }, [step, visit]);

  const minutes = levels.reduce((total, l) => total + l.minutes, 0);
  const hours = Math.max(0.5, Math.round(minutes / 30) / 2);
  const levelIndex = levels.indexOf(level);
  const below = levels[levelIndex - 1];
  const showContinues =
    step &&
    below &&
    !progress.dismissed.includes(level.level) &&
    below.steps.some((s) => !progress.done.includes(s.id));

  return (
    <div
      // Wide screens: the page makes room for the glossary panel.
      className={`grid gap-10 lg:grid-cols-[17rem_minmax(0,1fr)] ${
        glossaryOpen ? "xl:pr-[26rem]" : ""
      }`}
    >
      <aside
        aria-label="All topics"
        className="hidden lg:sticky lg:top-6 lg:block lg:max-h-[calc(100vh-3rem)] lg:self-start lg:overflow-y-auto"
      >
        <PathSidebar
          topicSlug={topic.slug}
          topicTitle={topic.title}
          levels={levels}
          current={level.level}
          currentStepId={step?.id}
          progress={progress}
        />
        {tree && (
          <LearningTree
            key={topic.id}
            root={tree}
            currentId={topic.id}
            compact
          />
        )}
      </aside>

      <article className="min-w-0 max-w-3xl">
        <PageMeta
          title={step ? `${step.title} · ${topic.title}` : topic.title}
          description={topic.summary}
        />
        <PageHeader
          eyebrow={`Topic ${topic.order} · ${allSteps.length} steps in ${levels.length} levels · about ${hours} h`}
          title={topic.title}
          description={topic.summary}
        />

        <div className="flex flex-wrap items-stretch gap-2">
          <div className="min-w-0 basis-full sm:basis-0 sm:flex-1">
            <LevelSwitcher
              topicSlug={topic.slug}
              levels={levels}
              current={level.level}
              progress={progress}
            />
          </div>
          <Link
            to={glossaryHref(search, { find: "" })}
            className="flex min-h-10 items-center gap-2 rounded-lg border border-border px-3 text-sm font-medium hover:bg-foreground/5"
          >
            Glossary
          </Link>
        </div>
        <StepDots
          topicSlug={topic.slug}
          level={level}
          currentStepId={step?.id}
          done={progress.done}
        />

        <div className="mt-8" data-lookup-area>
          {stepId && !step ? (
            <NotFoundState
              title="Step not found"
              message={`"${topic.title}" has no step called "${stepId}".`}
            />
          ) : step ? (
            <>
              {showContinues && (
                <ContinuesNote
                  topicSlug={topic.slug}
                  level={level}
                  previous={below}
                  done={progress.done}
                  onDismiss={() => progress.dismiss(level.level)}
                />
              )}
              <StepHeader step={step} level={level} />
              <StepPlayer
                key={step.id}
                topicSlug={topic.slug}
                step={step}
                level={level}
                nextLevel={levels[levelIndex + 1]}
                nextTopic={adjacent(tree, topic.id).next}
                onDone={progress.markDone}
              />
            </>
          ) : (
            <PathOverview
              topicSlug={topic.slug}
              path={path}
              progress={progress}
              onReset={() => resetProgress(topic.id)}
            />
          )}
        </div>

        <TopicNav {...adjacent(tree, topic.id)} />
      </article>
      <GlossaryPanel topicSlug={topic.slug} stepId={step?.id} />
      <LookUp />
    </div>
  );
}
