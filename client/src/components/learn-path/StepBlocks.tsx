import type {
  CheckAnswerResponse,
  GlossaryEntrySummary,
  PublicBlock,
  Scene,
} from "@fsl/shared";
import { useId, useState } from "react";
import { Link } from "react-router";
import { ApiRequestError, apiPaths, apiPost } from "../../services/api.ts";
import { CodeBlock } from "../code-viewer/CodeBlock.tsx";
import { Badge } from "../ui/Badge.tsx";
import { ScenePlayer } from "./ScenePlayer.tsx";
import { StepText } from "./StepText.tsx";
import { TryIt } from "./TryItWidgets.tsx";

type Context = {
  topicSlug: string;
  stepId: string;
  glossary: GlossaryEntrySummary[];
  scenes: Record<string, Scene>;
};

type QuickCheckBlock = Extract<PublicBlock, { type: "check" }>;

/** One quick check: pick an answer, it is checked on the server. */
function QuickCheck({
  block,
  index,
  context,
}: {
  block: QuickCheckBlock;
  index: number;
  context: Context;
}) {
  const name = useId();
  const [result, setResult] = useState<CheckAnswerResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function choose(choiceId: string) {
    setError(null);
    try {
      setResult(
        await apiPost<CheckAnswerResponse>(
          apiPaths.checkStep(context.topicSlug, context.stepId),
          { block: index, choiceId },
        ),
      );
    } catch (e) {
      setResult(null);
      setError(
        e instanceof ApiRequestError ? e.message : "Couldn't check the answer.",
      );
    }
  }

  return (
    <fieldset className="rounded-lg border border-border p-4">
      <legend className="sr-only">Quick check</legend>
      <div className="mb-2">
        <Badge tone="info">Quick check</Badge>
      </div>
      <p className="mb-3 text-lg leading-8">
        <StepText text={block.question} glossary={context.glossary} />
      </p>
      <div className="flex flex-col gap-2">
        {block.choices.map((choice) => (
          <label
            key={choice.id}
            className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-foreground/5 has-[:checked]:border-accent has-[:checked]:bg-accent/5"
          >
            <input
              type="radio"
              name={name}
              value={choice.id}
              onChange={() => void choose(choice.id)}
              className="mt-1 accent-[var(--accent)]"
            />
            <span className="leading-6">
              <StepText text={choice.text} glossary={context.glossary} />
            </span>
          </label>
        ))}
      </div>
      <div aria-live="polite">
        {error && (
          <p
            role="alert"
            className="mt-3 text-sm text-red-700 dark:text-red-400"
          >
            {error}
          </p>
        )}
        {result && (
          <div
            className={`mt-3 rounded-lg border-l-4 p-4 leading-7 ${
              result.correct
                ? "border-green-600 bg-green-600/5"
                : "border-amber-500 bg-amber-500/10"
            }`}
          >
            <p className="font-semibold">
              {result.correct ? "Correct" : "Not quite, try another one"}
            </p>
            {result.correct && (
              <p>
                <StepText
                  text={result.explanation}
                  glossary={context.glossary}
                />
              </p>
            )}
          </div>
        )}
      </div>
    </fieldset>
  );
}

const notesAppHref = (
  block: Extract<PublicBlock, { type: "inTheNotesApp" }>,
) =>
  block.flowId
    ? `/flow?flow=${encodeURIComponent(block.flowId)}&step=1`
    : `/explorer?${new URLSearchParams({
        ...(block.symbolId ? { symbol: block.symbolId } : {}),
        ...(block.fileId ? { file: block.fileId } : {}),
      })}`;

/** One block of a step, by type. */
export function StepBlock({
  block,
  index,
  context,
}: {
  block: PublicBlock;
  index: number;
  context: Context;
}) {
  const text = (value: string) => (
    <StepText text={value} glossary={context.glossary} />
  );
  switch (block.type) {
    case "explain":
      return <p className="text-base leading-7">{text(block.text)}</p>;
    case "analogy":
      return (
        <p className="rounded-lg border border-accent/30 bg-accent/5 p-4 leading-7">
          <span className="font-medium">In plain words: </span>
          {text(block.text)}
        </p>
      );
    case "keyPoints":
      return (
        <div>
          <p className="mb-2 text-sm font-medium text-muted">Remember</p>
          <ul className="flex list-disc flex-col gap-1 pl-6 leading-7 marker:text-accent">
            {block.items.map((item, i) => (
              <li key={i}>{text(item)}</li>
            ))}
          </ul>
        </div>
      );
    case "diagram":
      return (
        <div
          role="img"
          aria-label={block.nodes
            .map((n) => (n.sub ? `${n.label} (${n.sub})` : n.label))
            .join(block.twoWay ? " and " : " then ")}
          className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center"
        >
          {block.nodes.map((node, i) => (
            <div key={i} className="contents">
              {i > 0 && (
                <span
                  aria-hidden="true"
                  className="text-center text-lg text-muted"
                >
                  <span className="sm:hidden">{block.twoWay ? "⇅" : "↓"}</span>
                  <span className="hidden sm:inline">
                    {block.twoWay ? "⇄" : "→"}
                  </span>
                </span>
              )}
              <div className="flex-1 rounded-lg border border-border p-3 text-center">
                <p className="font-medium">{node.label}</p>
                {node.sub && <p className="text-sm text-muted">{node.sub}</p>}
              </div>
            </div>
          ))}
        </div>
      );
    case "code":
      return (
        <figure className="overflow-hidden rounded-lg border border-border">
          {block.example.caption && (
            <figcaption className="border-b border-border bg-foreground/5 px-4 py-2 font-mono text-sm font-medium">
              {block.example.caption}
            </figcaption>
          )}
          <CodeBlock
            example={{
              ...block.example,
              highlightLines: [
                ...(block.example.highlightLines ?? []),
                ...(block.notes ?? []).map((note) => note.line),
              ],
            }}
            showLineNumbers
          />
          {block.notes && block.notes.length > 0 && (
            <ul className="flex flex-col gap-1 border-t border-border px-4 py-3 text-sm">
              {block.notes.map((note) => (
                <li key={note.line}>
                  <span className="font-medium">Line {note.line}:</span>{" "}
                  {text(note.text)}
                </li>
              ))}
            </ul>
          )}
        </figure>
      );
    case "check":
      return <QuickCheck block={block} index={index} context={context} />;
    case "inTheNotesApp":
      return (
        <div className="rounded-lg border border-border p-4">
          <div className="mb-2">
            <Badge tone="info">In the Notes App</Badge>
          </div>
          <p className="leading-7">{text(block.text)}</p>
          <Link
            to={notesAppHref(block)}
            className="mt-2 inline-block text-sm text-accent underline"
          >
            {block.flowId
              ? "Follow it on the Flow page"
              : "See it in the Explorer"}{" "}
            →
          </Link>
        </div>
      );
    case "scene": {
      const scene = context.scenes[block.sceneId];
      return scene ? <ScenePlayer scene={scene} compact /> : null;
    }
    case "tryIt":
      return <TryIt widget={block.widget} glossary={context.glossary} />;
  }
}
