import type { BuildChecklistItem } from "@fsl/shared";
import { useState } from "react";
import { RichText } from "../../ui/RichText.tsx";
import type { ModeInputProps } from "../mode-inputs.ts";

type Item = Omit<BuildChecklistItem, "required">;

const GROUPS: { kind: Item["kind"]; title: string }[] = [
  { kind: "file", title: "Files" },
  { kind: "layer", title: "Layers" },
  { kind: "relationship", title: "Connections" },
];

/**
 * Plan a feature: tick every file, layer and connection it needs. After
 * the answer is shown, each item says whether it was needed, and the model
 * answer explains one way to build it.
 */
export function BuildInput({ exercise, onChange, result }: ModeInputProps) {
  const [ticked, setTicked] = useState<string[]>([]);
  if (!("checklist" in exercise)) return null;

  const expected =
    result?.expected && "itemIds" in result.expected ? result.expected : null;

  function toggle(id: string) {
    const next = ticked.includes(id)
      ? ticked.filter((t) => t !== id)
      : [...ticked, id];
    setTicked(next);
    // An empty plan isn't an answer yet.
    onChange(next.length > 0 ? { itemIds: next } : null);
  }

  const verdict = (id: string) => {
    if (!expected) return null;
    const needed = expected.itemIds.includes(id);
    const mine = ticked.includes(id);
    return {
      needed,
      text: needed
        ? mine
          ? "Needed: you ticked it"
          : "Needed: you missed it"
        : mine
          ? "Not needed: you ticked it"
          : "Not needed",
      ok: needed === mine,
    };
  };

  return (
    <div className="flex flex-col gap-6">
      {GROUPS.map(({ kind, title }) => {
        const items = exercise.checklist.filter((item) => item.kind === kind);
        if (items.length === 0) return null;
        return (
          <fieldset key={kind} className="flex flex-col gap-2">
            <legend className="mb-1 font-semibold">{title}</legend>
            {items.map((item) => {
              const v = verdict(item.id);
              return (
                <label
                  key={item.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent ${
                    !v
                      ? "border-border hover:border-accent"
                      : v.ok
                        ? "border-green-600 bg-green-600/5"
                        : "border-amber-500 bg-amber-500/10"
                  } ${result ? "cursor-default" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={ticked.includes(item.id)}
                    disabled={result !== null}
                    onChange={() => toggle(item.id)}
                    className="mt-1 accent-accent"
                  />
                  <span className="flex flex-col gap-1">
                    <span>
                      <RichText text={item.text} />
                    </span>
                    {v && (
                      <span
                        className={`text-sm font-semibold ${
                          v.ok
                            ? "text-green-800 dark:text-green-400"
                            : "text-amber-800 dark:text-amber-300"
                        }`}
                      >
                        {v.text}
                      </span>
                    )}
                  </span>
                </label>
              );
            })}
          </fieldset>
        );
      })}

      {expected && (
        <section
          aria-labelledby={`model-${exercise.id}`}
          className="flex flex-col gap-2"
        >
          <h2 id={`model-${exercise.id}`} className="font-semibold">
            One way to build it
          </h2>
          <ol className="flex list-decimal flex-col gap-2 pl-6 leading-7">
            {expected.modelAnswer.map((step) => (
              <li key={step}>
                <RichText text={step} />
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
