import type {
  Block,
  CodeExample,
  LevelCheckQuestion,
  Step,
  TryItWidget,
} from "@fsl/shared";

// Short ways to write a guided path's steps and blocks, so the step files
// read like the lesson itself. `npm run validate` checks every rule.

export const explain = (text: string): Block => ({ type: "explain", text });
export const analogy = (text: string): Block => ({ type: "analogy", text });
export const keyPoints = (...items: string[]): Block => ({
  type: "keyPoints",
  items,
});
/** Boxes left to right; `twoWay` draws ⇄ instead of →. */
export const diagram = (
  nodes: [label: string, sub?: string][],
  twoWay = false,
): Block => ({
  type: "diagram",
  nodes: nodes.map(([label, sub]) => (sub ? { label, sub } : { label })),
  ...(twoWay ? { twoWay } : {}),
});
export const scene = (sceneId: string): Block => ({ type: "scene", sceneId });
export const tryIt = (widget: TryItWidget): Block => ({
  type: "tryIt",
  widget,
});
/** Code with notes on 1-based lines. */
export const code = (
  language: CodeExample["language"],
  caption: string,
  lines: string[],
  notes: Record<number, string> = {},
): Block => ({
  type: "code",
  example: { language, caption, code: lines.join("\n") },
  notes: Object.entries(notes).map(([line, text]) => ({
    line: Number(line),
    text,
  })),
});
/** A quick check; the choices get ids a, b, c, d and `correct` is an index. */
export const quickCheck = (
  question: string,
  choices: string[],
  correct: number,
  explanation: string,
): Block => ({
  type: "check",
  question,
  choices: choices.map((text, i) => ({ id: "abcd"[i]!, text })),
  correctChoiceId: "abcd"[correct]!,
  explanation,
});
export const inTheNotesApp = (
  text: string,
  link: { fileId?: string; symbolId?: string; flowId?: string },
): Block => ({ type: "inTheNotesApp", text, ...link });

export const lesson = (
  id: string,
  title: string,
  minutes: number,
  ...blocks: Block[]
): Step => ({ kind: "lesson", id, title, minutes, blocks });

/** The level check: [exercise id, the step it tests] pairs. */
export const levelCheck = (
  id: string,
  title: string,
  questions: [exerciseId: string, stepId: string][],
): Step => ({
  kind: "check",
  id,
  title,
  minutes: 5,
  blocks: [],
  questions: questions.map(([exerciseId, stepId]): LevelCheckQuestion => ({
    exerciseId,
    stepId,
  })),
});

/** A reference table: [name, what it's for, example?] rows. */
export const reference = (
  caption: string,
  rows: [name: string, text: string, example?: string][],
): Block => ({
  type: "reference",
  caption,
  rows: rows.map(([name, text, example]) =>
    example === undefined ? { name, text } : { name, text, example },
  ),
});

/** Editable HTML (and CSS) with a live preview. */
export const playground = (caption: string, lines: string[]): Block => ({
  type: "playground",
  caption,
  code: lines.join("\n"),
});
