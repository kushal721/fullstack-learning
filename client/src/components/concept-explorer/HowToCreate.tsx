import type { Instruction } from "@fsl/shared";
import { RichText } from "../ui/RichText.tsx";
import { CodeExample } from "./CodeExample.tsx";

/** "How do I create it from scratch?" as numbered steps with code. */
export function HowToCreate({ steps }: { steps: Instruction[] }) {
  return (
    <ol className="flex flex-col gap-5">
      {steps.map((step, index) => (
        <li key={index} className="flex gap-4">
          <span
            aria-hidden="true"
            className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm font-semibold text-accent"
          >
            {index + 1}
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <p className="leading-7">
              <span className="sr-only">Step {index + 1}: </span>
              <RichText text={step.text} />
            </p>
            {step.code && <CodeExample example={step.code} />}
          </div>
        </li>
      ))}
    </ol>
  );
}
