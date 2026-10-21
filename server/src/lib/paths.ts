import type {
  Block,
  CheckResult,
  CourseMapResponse,
  GlossaryEntry,
  GlossaryEntryResponse,
  GlossaryEntrySummary,
  LevelSummary,
  PathResponse,
  PublicBlock,
  StepLink,
  StepResponse,
  StepSummary,
  TopicPath,
} from "@fsl/shared";
import { glossary } from "../content/glossary/index.js";
import { topicPaths } from "../content/paths/index.js";
import { getConcept, toConceptSummary } from "./concepts.js";
import {
  LEVELS,
  type NumberedStep,
  type StepRef,
  glossaryUsage,
  numberSteps,
  stepLinks,
  termLinks,
} from "./guided-learning.js";
import { getAllTopics, getTree, toTopicSummary } from "./learning-tree.js";
import { getExercise, toPublic } from "./practice.js";

// Guided paths and the glossary as the API serves them. Content never
// changes while the server runs, so everything derived is computed once.

const pathByTopic = new Map(topicPaths.map((path) => [path.topicId, path]));
const numbered = new Map(
  topicPaths.map((path) => [path.topicId, numberSteps(path)]),
);
const entryById = new Map(glossary.map((entry) => [entry.id, entry]));
const usage = glossaryUsage(topicPaths, glossary);
const topicById = new Map(getAllTopics().map((topic) => [topic.id, topic]));

const topicSummary = (topicId: string) => {
  const topic = topicById.get(topicId);
  // Validation guarantees every path and entry belongs to a known topic.
  if (!topic) throw new Error(`Unknown topic "${topicId}".`);
  return toTopicSummary(topic);
};

export function getPath(topicId: string): TopicPath | undefined {
  return pathByTopic.get(topicId);
}

function toStepSummary({ number, level, step }: NumberedStep): StepSummary {
  const { id, kind, title, minutes } = step;
  return { id, number, level, kind, title, minutes };
}

function levelsOf(path: TopicPath): LevelSummary[] {
  const steps = numbered.get(path.topicId)!;
  return LEVELS.map((level) => {
    const own = steps.filter((s) => s.level === level);
    return {
      level,
      outcome: path.levels[level].outcome,
      firstNumber: own[0]?.number ?? 0,
      lastNumber: own.at(-1)?.number ?? 0,
      minutes: own.reduce((total, s) => total + s.step.minutes, 0),
      steps: own.map(toStepSummary),
    };
  });
}

/** GET /api/paths/:topic */
export function getPathView(topicId: string): PathResponse | undefined {
  const path = pathByTopic.get(topicId);
  if (!path) return undefined;
  return {
    topic: topicSummary(topicId),
    summary: path.summary,
    overviewScene: path.scenes.find((s) => s.id === path.overviewSceneId)!,
    levels: levelsOf(path),
  };
}

/** A quick check loses its answer and explanation until it is checked. */
export function toPublicBlock(block: Block): PublicBlock {
  if (block.type !== "check") return block;
  const { correctChoiceId: _answer, explanation: _why, ...rest } = block;
  return rest;
}

const toEntrySummary = ({
  id,
  topicId,
  term,
  aliases,
  kind,
  short,
}: GlossaryEntry): GlossaryEntrySummary => ({
  id,
  topicId,
  term,
  ...(aliases ? { aliases } : {}),
  kind,
  short,
});

/** GET /api/paths/:topic/steps/:step */
export function getStepView(
  topicId: string,
  stepId: string,
): StepResponse | undefined {
  const path = pathByTopic.get(topicId);
  const steps = numbered.get(topicId) ?? [];
  const index = steps.findIndex((s) => s.step.id === stepId);
  if (!path || index < 0) return undefined;
  const current = steps[index]!;
  const { step } = current;

  const sceneIds = step.blocks.flatMap((b) =>
    b.type === "scene" ? [b.sceneId] : [],
  );
  const view: StepResponse = {
    topic: topicSummary(topicId),
    step: toStepSummary(current),
    blocks: step.blocks.map(toPublicBlock),
    scenes: Object.fromEntries(
      path.scenes
        .filter((scene) => sceneIds.includes(scene.id))
        .map((scene) => [scene.id, scene]),
    ),
    glossary: stepLinks(step)
      .map((id) => entryById.get(id))
      .filter((entry) => entry !== undefined)
      .map(toEntrySummary),
  };
  if (step.kind === "check") {
    view.questions = step.questions.map((question) => {
      const tested = steps.find((s) => s.step.id === question.stepId)!;
      return {
        exercise: toPublic(getExercise(question.exerciseId)!),
        step: toStepSummary(tested),
      };
    });
  }
  if (index > 0) view.previous = toStepSummary(steps[index - 1]!);
  if (index < steps.length - 1) view.next = toStepSummary(steps[index + 1]!);
  return view;
}

/**
 * Checks a quick-check answer. Undefined when the step doesn't exist; an
 * error message when the block isn't a quick check or the choice is unknown.
 */
export function checkQuickAnswer(
  topicId: string,
  stepId: string,
  blockIndex: number,
  choiceId: string,
): CheckResult | string | undefined {
  const step = numbered.get(topicId)?.find((s) => s.step.id === stepId)?.step;
  if (!step) return undefined;
  const block = step.blocks[blockIndex];
  if (block?.type !== "check") {
    return `Block ${blockIndex} of step "${stepId}" is not a quick check.`;
  }
  if (!block.choices.some((choice) => choice.id === choiceId)) {
    return `"${choiceId}" is not one of this quick check's choices.`;
  }
  return {
    correct: choiceId === block.correctChoiceId,
    explanation: block.explanation,
    expected: { choiceId: block.correctChoiceId },
  };
}

/** GET /api/glossary: small enough for the panel to search in the browser. */
export function getGlossaryIndex(): GlossaryEntrySummary[] {
  return [...glossary]
    .sort((a, b) => a.term.localeCompare(b.term))
    .map(toEntrySummary);
}

function toStepLink(ref: StepRef): StepLink {
  const step = numbered
    .get(ref.topicId)!
    .find((s) => s.step.id === ref.stepId)!;
  return { ...toStepSummary(step), topic: topicSummary(ref.topicId) };
}

/** GET /api/glossary/:id */
export function getGlossaryEntryView(
  id: string,
): GlossaryEntryResponse | undefined {
  const entry = entryById.get(id);
  if (!entry) return undefined;
  const { introducedIn, usedIn } = usage.get(id)!;
  const related = [...new Set(termLinks(entry.body).map((link) => link.id))]
    .filter((other) => other !== id)
    .map((other) => entryById.get(other))
    .filter((other) => other !== undefined)
    .map(toEntrySummary);
  const concept = entry.conceptPageId
    ? getConcept(entry.conceptPageId)
    : undefined;
  return {
    entry,
    ...(introducedIn ? { introducedIn: toStepLink(introducedIn) } : {}),
    usedIn: usedIn.map(toStepLink),
    related,
    ...(concept ? { conceptPage: toConceptSummary(concept) } : {}),
  };
}

/** GET /api/course-map: every top-level topic, with or without a path. */
export function getCourseMap(): CourseMapResponse {
  return {
    topics: getTree().children.map((topic) => {
      const path = pathByTopic.get(topic.id);
      return {
        topic: toTopicSummary(topic),
        status: path ? "ready" : "planned",
        levels: path
          ? levelsOf(path).map((level) => ({
              ...level,
              stepCount: level.steps.length,
              covers: level.steps
                .filter((s) => s.kind === "lesson")
                .map((s) => s.title),
            }))
          : [],
      };
    }),
  };
}
