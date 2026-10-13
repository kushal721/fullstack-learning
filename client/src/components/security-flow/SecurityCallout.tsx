import type { FlowStep } from "@fsl/shared";
import { useId } from "react";
import { RichText } from "../ui/RichText.tsx";

/**
 * "Why this protects you" for one step of a security flow: the attack it
 * stops and how. Shown below the step in the flow tracer.
 */
export function SecurityCallout({
  protects,
}: {
  protects: NonNullable<FlowStep["protects"]>;
}) {
  const titleId = useId();
  return (
    <aside
      aria-labelledby={titleId}
      className="flex flex-col gap-3 rounded-lg border border-green-600/30 border-l-4 border-l-green-600 bg-green-600/5 p-4"
    >
      <h3
        id={titleId}
        className="flex items-center gap-2 font-semibold text-green-700 dark:text-green-400"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="size-5 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
        Why this protects you
      </h3>
      <dl className="grid gap-3 text-sm leading-6 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-x-4">
        <dt className="font-semibold">The risk</dt>
        <dd>
          <RichText text={protects.risk} />
        </dd>
        <dt className="font-semibold">How this step stops it</dt>
        <dd>
          <RichText text={protects.defence} />
        </dd>
      </dl>
    </aside>
  );
}
