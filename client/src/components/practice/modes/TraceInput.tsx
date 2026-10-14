import type { CodeSymbol, SymbolGraphResponse } from "@fsl/shared";
import { lazy, Suspense, useCallback, useState } from "react";
import { useApi } from "../../../hooks/useApi.ts";
import { apiPaths } from "../../../services/api.ts";
import { Loading } from "../../ui/Loading.tsx";
import type { ModeInputProps } from "../mode-inputs.ts";
import { symbolLabel } from "./symbol-label.ts";

// React Flow is large; it is only downloaded when a trace is shown.
const ConnectionGraph = lazy(
  () => import("../../connection-graph/ConnectionGraph.tsx"),
);

function SymbolName({ id }: { id: string }) {
  const { kind, name } = symbolLabel(id);
  return (
    <>
      <span className="text-xs text-muted">{kind}</span>{" "}
      <code className="font-mono [overflow-wrap:anywhere]">{name}</code>
    </>
  );
}

const smallButton =
  "rounded-md border border-border px-3 py-1.5 text-sm hover:bg-foreground/5 disabled:cursor-not-allowed disabled:opacity-50";

/**
 * Build a path step by step: start at the given symbol, then add the next
 * one from the offered pieces until the path has the right length. A graph
 * of what the last step connects to helps, the way you'd trace real code.
 */
export function TraceInput({ exercise, onChange, result }: ModeInputProps) {
  const isTrace = "candidateIds" in exercise;
  const start = isTrace ? exercise.startSymbolId : "";
  const length = isTrace ? exercise.length : 0;
  const [path, setPathState] = useState<string[]>(start ? [start] : []);
  const last = path.at(-1) ?? start;
  const expected =
    result?.expected && "symbolIds" in result.expected
      ? result.expected.symbolIds
      : null;

  // Only a complete path is an answer, so "Check answer" waits for it.
  const setPath = useCallback(
    (next: string[]) => {
      setPathState(next);
      onChange(next.length === length ? { symbolIds: next } : null);
    },
    [onChange, length],
  );
  const canAdd = (id: string) =>
    !result && path.length < length && !path.includes(id);
  const add = useCallback(
    (id: string) => {
      if (!result && path.length < length && !path.includes(id)) {
        setPath([...path, id]);
      }
    },
    [result, path, length, setPath],
  );

  const graph = useApi<SymbolGraphResponse>(
    isTrace && !result ? apiPaths.symbolGraph(last, 1) : null,
  );
  const selectInGraph = useCallback(
    (symbol: CodeSymbol) => {
      if (isTrace && exercise.candidateIds.includes(symbol.id)) add(symbol.id);
    },
    [isTrace, exercise, add],
  );

  if (!isTrace) return null;
  const complete = path.length === length;

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-muted">
        Start: <SymbolName id={exercise.startSymbolId} /> · Goal:{" "}
        <SymbolName id={exercise.endSymbolId} /> · {length} steps in all
      </p>

      <section
        aria-labelledby={`path-${exercise.id}`}
        className="flex flex-col gap-2"
      >
        <h2 id={`path-${exercise.id}`} className="font-semibold">
          Your path ({path.length} of {length})
        </h2>
        <ol className="flex flex-col gap-1">
          {path.map((id, i) => {
            const wrong = expected && expected[i] !== id;
            return (
              <li
                key={id}
                className={`rounded-md border px-3 py-2 ${
                  !expected
                    ? "border-border"
                    : wrong
                      ? "border-amber-500 bg-amber-500/10"
                      : "border-green-600 bg-green-600/5"
                }`}
              >
                <span className="mr-2 text-sm text-muted">{i + 1}.</span>
                <SymbolName id={id} />
                {wrong && expected?.[i] && (
                  <span className="mt-1 block text-sm">
                    Should be: <SymbolName id={expected[i]!} />
                  </span>
                )}
              </li>
            );
          })}
        </ol>
        {!result && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={smallButton}
              disabled={path.length <= 1}
              onClick={() => setPath(path.slice(0, -1))}
            >
              Remove the last step
            </button>
            <button
              type="button"
              className={smallButton}
              disabled={path.length <= 1}
              onClick={() => setPath([start])}
            >
              Start over
            </button>
          </div>
        )}
        {complete && !result && (
          <p className="text-sm text-muted">
            The path is complete. Check it, or change it first.
          </p>
        )}
      </section>

      {!result && (
        <section
          aria-labelledby={`pieces-${exercise.id}`}
          className="flex flex-col gap-2"
        >
          <h2 id={`pieces-${exercise.id}`} className="font-semibold">
            Add the next step
          </h2>
          <ul className="flex flex-wrap gap-2">
            {exercise.candidateIds
              .filter((id) => id !== exercise.startSymbolId)
              .map((id) => (
                <li key={id}>
                  <button
                    type="button"
                    disabled={!canAdd(id)}
                    onClick={() => add(id)}
                    className={`${smallButton} text-left`}
                  >
                    <SymbolName id={id} />
                  </button>
                </li>
              ))}
          </ul>
        </section>
      )}

      {!result && !complete && (
        <section
          aria-labelledby={`look-${exercise.id}`}
          className="flex flex-col gap-2"
        >
          <h2 id={`look-${exercise.id}`} className="font-semibold">
            What does{" "}
            <code className="font-mono">{symbolLabel(last).name}</code> connect
            to?
          </h2>
          <p className="text-sm text-muted">
            Click a node to add it, if it's one of the offered steps.
          </p>
          {graph.data ? (
            <Suspense fallback={<Loading label="Loading the graph…" />}>
              <ConnectionGraph
                {...graph.data}
                centerId={last}
                onSelect={selectInGraph}
              />
            </Suspense>
          ) : graph.isLoading ? (
            <Loading label="Loading the graph…" />
          ) : null}
        </section>
      )}
    </div>
  );
}
