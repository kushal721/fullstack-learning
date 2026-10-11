import type { BuildStepSummary } from "@fsl/shared";

type Props = {
  steps: BuildStepSummary[];
  value: number;
  onChange: (step: number) => void;
};

const buttonClass =
  "rounded-md border border-border px-3 py-1.5 text-sm hover:bg-foreground/5 disabled:cursor-not-allowed disabled:opacity-50";

/** Picks a point of the journey: 0 (empty project) to the last step. */
export function StepSelector({ steps, value, onChange }: Props) {
  const last = steps.at(-1)?.order ?? 0;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <label htmlFor="project-step" className="text-sm font-medium">
        Step
      </label>
      <select
        id="project-step"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="min-w-0 max-w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
      >
        <option value={0}>0. Empty project</option>
        {steps.map((step) => (
          <option key={step.id} value={step.order}>
            {step.order}. {step.title}
          </option>
        ))}
      </select>
      <button
        type="button"
        className={buttonClass}
        disabled={value <= 0}
        onClick={() => onChange(value - 1)}
      >
        ← Previous
      </button>
      <button
        type="button"
        className={buttonClass}
        disabled={value >= last}
        onClick={() => onChange(value + 1)}
      >
        Next →
      </button>
    </div>
  );
}
