import type { PathResponse, TopicTreeNode } from "@fsl/shared";
import { useEffect } from "react";
import { Link } from "react-router";
import { LearningTree } from "../learning-tree/LearningTree.tsx";
import { TopicNav } from "../learning-tree/TopicNav.tsx";
import { NotFoundState } from "../ui/NotFoundState.tsx";
import { PageHeader } from "../ui/PageHeader.tsx";
import { PageMeta } from "../ui/PageMeta.tsx";
import { LevelSwitcher } from "./LevelSwitcher.tsx";
import { stepHref } from "./levels.ts";
import { PathOverview } from "./PathOverview.tsx";
import { PathSidebar } from "./PathSidebar.tsx";
import { resetProgress, usePathProgress } from "./progress.ts";
import { StepDots } from "./StepDots.tsx";
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
  const before = step ? allSteps[allSteps.indexOf(step) - 1] : undefined;
  const after = step ? allSteps[allSteps.indexOf(step) + 1] : undefined;

  return (
    <div className="grid gap-10 lg:grid-cols-[17rem_minmax(0,1fr)]">
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

        <LevelSwitcher
          topicSlug={topic.slug}
          levels={levels}
          current={level.level}
          progress={progress}
        />
        <StepDots
          topicSlug={topic.slug}
          level={level}
          currentStepId={step?.id}
          done={progress.done}
        />

        <div className="mt-8">
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
              {/* The step's blocks and its footer come with the step
                  player (#378). */}
              <nav
                aria-label="Steps"
                className="mt-8 flex flex-wrap justify-between gap-3 border-t border-border pt-6 text-sm"
              >
                {before ? (
                  <Link
                    to={stepHref(topic.slug, before.id)}
                    className="text-accent hover:underline"
                  >
                    ← Step {before.number}: {before.title}
                  </Link>
                ) : (
                  <Link
                    to={stepHref(topic.slug)}
                    className="text-accent hover:underline"
                  >
                    ← Overview
                  </Link>
                )}
                {after && (
                  <Link
                    to={stepHref(topic.slug, after.id)}
                    className="text-accent hover:underline"
                  >
                    Step {after.number}: {after.title} →
                  </Link>
                )}
              </nav>
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
    </div>
  );
}
