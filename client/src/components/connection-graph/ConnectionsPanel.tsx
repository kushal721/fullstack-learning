import type {
  CodeSymbol,
  FileSymbolsResponse,
  SymbolGraphResponse,
} from "@fsl/shared";
import { lazy, Suspense, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useApi } from "../../hooks/useApi.ts";
import { apiPaths } from "../../services/api.ts";
import { ErrorState } from "../ui/ErrorState.tsx";
import { Loading } from "../ui/Loading.tsx";

// React Flow is large; it is only downloaded when a graph is shown.
const ConnectionGraph = lazy(() => import("./ConnectionGraph.tsx"));

const explorerLink = (file: string | null, symbol?: string) => {
  const params = new URLSearchParams();
  if (file) params.set("file", file);
  if (symbol) params.set("symbol", symbol);
  return `/explorer?${params}`;
};

/** The graph of one symbol's direct connections; pick a node to walk on. */
export function ConnectionsPanel({
  symbolId,
  file,
}: {
  symbolId: string;
  file: string | null;
}) {
  const { data, error, isLoading, reload } = useApi<SymbolGraphResponse>(
    apiPaths.symbolGraph(symbolId),
  );
  const navigate = useNavigate();
  const location = useLocation();
  const cameFromGraph = (location.state as { fromGraph?: boolean } | null)
    ?.fromGraph;

  // Picking a node is a new history entry: the graph re-centres on it, the
  // code viewer opens its file at its line, and Back walks back.
  const select = useCallback(
    (symbol: CodeSymbol) => {
      const params = new URLSearchParams({ symbol: symbol.id });
      if (symbol.fileId) params.set("file", symbol.fileId);
      if (symbol.fileId && symbol.line) params.set("line", String(symbol.line));
      navigate(`/explorer?${params}`, { state: { fromGraph: true } });
    },
    [navigate],
  );
  return (
    <section
      aria-labelledby="connections-heading"
      className="flex flex-col gap-3"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="connections-heading" className="text-lg font-semibold">
          Connections of <code className="font-mono">{symbolId}</code>
        </h2>
        <Link
          to={explorerLink(file)}
          className="text-sm text-accent hover:underline"
        >
          Close
        </Link>
      </div>
      {isLoading && <Loading label="Loading connections…" />}
      {error && <ErrorState message={error.message} onRetry={reload} />}
      {data && (
        <Suspense fallback={<Loading label="Loading the graph…" />}>
          <ConnectionGraph
            {...data}
            centerId={symbolId}
            onSelect={select}
            focusCenter={cameFromGraph}
          />
        </Suspense>
      )}
    </section>
  );
}

/** The symbols defined in a file, each opening its connections. */
export function FileSymbolList({ path }: { path: string }) {
  const { data } = useApi<FileSymbolsResponse>(apiPaths.fileSymbols(path));
  if (!data || data.defined.length === 0) return null;
  return (
    <section
      aria-labelledby="file-symbols-heading"
      className="flex flex-col gap-2"
    >
      <h2 id="file-symbols-heading" className="text-sm font-semibold">
        Connections in this file
      </h2>
      <ul className="flex flex-wrap gap-2">
        {data.defined.map((symbol) => (
          <li key={symbol.id}>
            <Link
              to={explorerLink(path, symbol.id)}
              className="inline-flex items-baseline gap-1.5 rounded-md border border-border px-2 py-1 text-sm hover:border-accent hover:bg-accent/5"
            >
              <span className="text-xs text-muted">{symbol.kind}</span>
              <span className="font-mono">{symbol.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
