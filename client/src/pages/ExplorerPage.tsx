import type {
  FileResponse,
  FileSymbolsResponse,
  FileTreeFile,
  FileTreeNode,
  FileTreeResponse,
} from "@fsl/shared";
import { useEffect, useRef } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import { CodeViewer } from "../components/code-viewer/CodeViewer.tsx";
import {
  ConnectionsPanel,
  FileSymbolList,
} from "../components/connection-graph/ConnectionsPanel.tsx";
import { explorerSymbolHref } from "../components/connection-graph/links.ts";
import { FileMetadata } from "../components/file-explorer/FileMetadata.tsx";
import { FileTree } from "../components/file-explorer/FileTree.tsx";
import { ProjectEvolution } from "../components/project-evolution/ProjectEvolution.tsx";
import { ErrorState } from "../components/ui/ErrorState.tsx";
import { Loading } from "../components/ui/Loading.tsx";
import { PageHeader } from "../components/ui/PageHeader.tsx";
import { useApi } from "../hooks/useApi.ts";
import { apiPaths } from "../services/api.ts";
import { PageMeta } from "../components/ui/PageMeta.tsx";

function findFile(nodes: FileTreeNode[], path: string): FileTreeFile | null {
  for (const node of nodes) {
    if (node.type === "file" && node.path === path) return node;
    if (node.type === "folder") {
      const found = findFile(node.children, path);
      if (found) return found;
    }
  }
  return null;
}

export default function ExplorerPage() {
  // The selected file lives in the URL (?file=…), so a link opens the same
  // file and a reload keeps it.
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedPath = searchParams.get("file");
  // ?symbol=fn:handleSave shows that symbol's connections.
  const symbolId = searchParams.get("symbol");
  // Walking the graph opens each symbol's file at its line; keep the graph
  // on screen instead of jumping down to the code.
  const navState = useLocation().state as {
    fromGraph?: boolean;
    fromCode?: boolean;
  } | null;
  const fromGraph = Boolean(navState?.fromGraph);
  // Clicking a symbol's marker in the code opens its connections above.
  const fromCode = Boolean(navState?.fromCode);
  const navigate = useNavigate();
  const lineParam = Number(searchParams.get("line"));
  const line = Number.isInteger(lineParam) && lineParam > 0 ? lineParam : null;
  const { data, error, isLoading, reload } = useApi<FileTreeResponse>(
    apiPaths.fileTree(),
  );

  const selected =
    data && selectedPath ? findFile(data.tree.children, selectedPath) : null;
  // One request per file, shared by the code viewer and the metadata panel.
  const file = useApi<FileResponse>(
    selected ? apiPaths.file(selected.path) : null,
  );
  // Symbols defined in the file, marked in the code viewer's gutter.
  const fileSymbols = useApi<FileSymbolsResponse>(
    selected ? apiPaths.fileSymbols(selected.path) : null,
  );

  // After picking a symbol in the code, bring its connections into view.
  useEffect(() => {
    if (fromCode && symbolId) {
      document
        .getElementById("connections-heading")
        ?.scrollIntoView?.({ block: "start" });
    }
  }, [fromCode, symbolId]);

  // On phones the tree is above the file, so after choosing a file bring
  // its details into view (unless a ?line= link scrolls to a line instead).
  const detailsRef = useRef<HTMLDivElement>(null);
  const fileLoaded = Boolean(file.data);
  useEffect(() => {
    if (
      fileLoaded &&
      !line &&
      window.matchMedia?.("(max-width: 767px)").matches
    ) {
      detailsRef.current?.scrollIntoView?.({ block: "start" });
    }
  }, [fileLoaded, selected?.path, line]);

  return (
    <>
      <PageMeta
        title="Explorer"
        description="Read the Notes App's code file by file and trace how every piece connects."
      />
      <PageHeader
        title="Explorer"
        description="Browse the Notes App: every file, why it exists and how it connects."
      />
      {isLoading && <Loading label="Loading the project files…" />}
      {error && <ErrorState message={error.message} onRetry={reload} />}
      {data && (
        <div className="grid gap-6 md:grid-cols-[16rem_minmax(0,1fr)]">
          <nav
            aria-label="Project files"
            className="self-start rounded-lg border border-border p-2"
          >
            <FileTree
              tree={data.tree}
              selectedPath={selectedPath}
              onSelect={(path) => setSearchParams({ file: path })}
            />
          </nav>
          <div
            ref={detailsRef}
            className="flex min-w-0 scroll-mt-4 flex-col gap-6"
          >
            {symbolId && (
              <ConnectionsPanel
                // A new symbol starts with a fresh graph.
                key={symbolId}
                symbolId={symbolId}
                file={selected ? selected.path : null}
              />
            )}
            {/* The start screen: the project as it grows, step by step. */}
            {!selectedPath && !symbolId && <ProjectEvolution />}
            {selected && !symbolId && <FileSymbolList path={selected.path} />}
            {selectedPath && !selected && (
              <p role="alert">
                There is no file &ldquo;{selectedPath}&rdquo; in the Notes App.
              </p>
            )}
            {selected && file.isLoading && (
              <Loading label="Loading the file…" />
            )}
            {selected && file.error && (
              <ErrorState
                message={file.error.message}
                onRetry={file.reload}
                homeLink={false}
              />
            )}
            {selected && file.data && (
              // Metadata comes first in the page (read "why" before the code);
              // on wide screens it moves to a column on the right.
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_18rem]">
                <div className="xl:order-2">
                  <FileMetadata {...file.data} />
                </div>
                <div className="min-w-0 xl:order-1">
                  <CodeViewer
                    // A new file starts fresh (e.g. shortened again).
                    key={selected.path}
                    file={file.data.file}
                    source={file.data.source}
                    line={line}
                    scrollToLine={!fromGraph && !fromCode}
                    symbols={fileSymbols.data?.defined}
                    selectedSymbolId={symbolId}
                    onSelectSymbol={(symbol) =>
                      navigate(explorerSymbolHref(symbol), {
                        state: { fromCode: true },
                      })
                    }
                    onSelectLine={(n) =>
                      setSearchParams({ file: selected.path, line: String(n) })
                    }
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
