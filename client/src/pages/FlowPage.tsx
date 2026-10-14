import type { FlowListResponse, FlowResponse, FlowSummary } from "@fsl/shared";
import {
  type KeyboardEvent,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Link, useSearchParams } from "react-router";
import { FlowDetails } from "../components/flow-tracer/FlowDetails.tsx";
import { HttpDetails } from "../components/flow-tracer/HttpDetails.tsx";
import { SecurityCallout } from "../components/security-flow/SecurityCallout.tsx";
import { ErrorState } from "../components/ui/ErrorState.tsx";
import { Loading } from "../components/ui/Loading.tsx";
import { PageHeader } from "../components/ui/PageHeader.tsx";
import { useApi } from "../hooks/useApi.ts";
import { apiPaths } from "../services/api.ts";

// React Flow is large; it is only downloaded when a flow is shown.
const FlowCanvas = lazy(
  () => import("../components/flow-tracer/FlowCanvas.tsx"),
);

const PLAY_INTERVAL_MS = 2500;
const GROUP_LABEL: Record<FlowSummary["group"], string> = {
  request: "Requests",
  security: "Security",
};

function prefersReducedMotion() {
  return Boolean(
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
  );
}

export default function FlowPage() {
  // ?flow=create-note&step=3 (steps count from 1 in the URL).
  const [searchParams, setSearchParams] = useSearchParams();
  const list = useApi<FlowListResponse>(apiPaths.flows());
  const flowId = searchParams.get("flow") ?? list.data?.flows[0]?.id ?? null;
  const detail = useApi<FlowResponse>(flowId ? apiPaths.flow(flowId) : null);
  const steps = detail.data?.flow.steps ?? [];
  const requested = Number(searchParams.get("step"));
  const current =
    Number.isInteger(requested) && requested >= 1 && requested <= steps.length
      ? requested - 1
      : 0;

  // Stepping replaces the history entry, so Back leaves the flow instead of
  // walking back through every step.
  const goTo = useCallback(
    (index: number) => {
      if (!flowId || steps.length === 0) return;
      const clamped = Math.min(Math.max(index, 0), steps.length - 1);
      setSearchParams(
        { flow: flowId, step: String(clamped + 1) },
        { replace: true },
      );
    },
    [flowId, steps.length, setSearchParams],
  );

  const [playing, setPlaying] = useState(false);
  const atEnd = current >= steps.length - 1;
  // Playback simply stops at the last step.
  const isPlaying = playing && !atEnd;
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setTimeout(() => goTo(current + 1), PLAY_INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [isPlaying, current, goTo]);

  // Any manual step stops playback.
  const step = (index: number) => {
    setPlaying(false);
    goTo(index);
  };

  // The URL updates after the key press, so quick presses (or a held key)
  // count from the step they asked for, not the one still on screen.
  const target = useRef(current);
  useEffect(() => {
    target.current = current;
  }, [current]);

  function onKeyDown(event: KeyboardEvent) {
    const from = target.current;
    const keys: Record<string, number> = {
      ArrowRight: from + 1,
      ArrowLeft: from - 1,
      Home: 0,
      End: steps.length - 1,
    };
    if (event.key in keys) {
      event.preventDefault();
      const next = Math.min(Math.max(keys[event.key]!, 0), steps.length - 1);
      target.current = next;
      step(next);
    }
  }

  // An unknown ?flow= is a missing page, not a failure worth retrying.
  const unknownFlow = detail.error?.isNotFound ? flowId : null;
  const failed = list.error ?? (unknownFlow ? null : detail.error);
  const flow = detail.data?.flow;
  const currentStep = flow?.steps[current];
  const buttonClass =
    "rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-foreground/5 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <>
      <title>{`${flow ? `${flow.title} · ` : ""}Flow · Full-Stack Learning`}</title>
      <PageHeader
        title="Flow"
        description="Follow data step by step: from a click in the browser to the database and back to the screen."
      />
      {failed && (
        <ErrorState
          message={failed.message}
          onRetry={() => {
            list.reload();
            detail.reload();
          }}
        />
      )}
      {list.isLoading && <Loading label="Loading the flows…" />}
      {unknownFlow && (
        <p role="alert" className="mb-6">
          There is no flow called &ldquo;{unknownFlow}&rdquo;. Pick one of the
          flows below.
        </p>
      )}

      {list.data && (
        <nav aria-label="Flows" className="mb-6 flex flex-col gap-3">
          {(["request", "security"] as const)
            .map((group) => ({
              group,
              flows: list.data!.flows.filter((f) => f.group === group),
            }))
            .filter(({ flows }) => flows.length > 0)
            .map(({ group, flows }) => (
              <section
                key={group}
                className="flex flex-wrap items-center gap-2"
              >
                <h2 className="mr-1 text-sm font-semibold">
                  {GROUP_LABEL[group]}
                </h2>
                {flows.map((f) => (
                  <Link
                    key={f.id}
                    to={`/flow?flow=${f.id}&step=1`}
                    aria-current={f.id === flowId ? "page" : undefined}
                    onClick={() => setPlaying(false)}
                    className={`rounded-full border px-3 py-1 text-sm ${
                      f.id === flowId
                        ? "border-accent bg-accent/10 font-medium text-accent"
                        : "border-border hover:border-accent"
                    }`}
                  >
                    {f.title}{" "}
                    <span className="text-xs text-muted">
                      ({f.stepCount} steps)
                    </span>
                  </Link>
                ))}
              </section>
            ))}
        </nav>
      )}

      {detail.isLoading && <Loading label="Loading the flow…" />}
      {flow && currentStep && (
        <div className="flex flex-col gap-6">
          <p className="max-w-3xl text-muted">{flow.summary}</p>
          <div
            role="group"
            aria-label={`${flow.title}: use the left and right arrow keys to move between steps`}
            tabIndex={0}
            onKeyDown={onKeyDown}
            className="flex flex-col gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Suspense fallback={<Loading label="Loading the flow canvas…" />}>
              <FlowCanvas
                steps={flow.steps}
                symbols={detail.data!.symbols}
                current={current}
                onSelect={step}
                reducedMotion={prefersReducedMotion()}
              />
            </Suspense>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className={buttonClass}
                disabled={current === 0}
                onClick={() => step(current - 1)}
              >
                ← Previous
              </button>
              <button
                type="button"
                className={buttonClass}
                disabled={atEnd}
                onClick={() => step(current + 1)}
              >
                Next →
              </button>
              <button
                type="button"
                className={buttonClass}
                aria-pressed={isPlaying}
                onClick={() => {
                  if (isPlaying) setPlaying(false);
                  else {
                    if (atEnd) goTo(0);
                    setPlaying(true);
                  }
                }}
              >
                {isPlaying ? "Pause" : atEnd ? "Play again" : "Play"}
              </button>
              <p aria-live="polite" className="ml-auto text-sm text-muted">
                Step {current + 1} of {steps.length}: {currentStep.title}
              </p>
            </div>
          </div>
          <FlowDetails
            step={currentStep}
            index={current}
            total={steps.length}
            symbol={detail.data!.symbols[currentStep.symbolId]}
          />
          {currentStep.protects && (
            <SecurityCallout protects={currentStep.protects} />
          )}
          {flow.http && <HttpDetails exchange={flow.http} />}
        </div>
      )}
    </>
  );
}
