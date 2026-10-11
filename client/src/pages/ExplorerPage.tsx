import type {
  FileResponse,
  FileTreeFile,
  FileTreeNode,
  FileTreeResponse,
} from "@fsl/shared";
import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router";
import { CodeViewer } from "../components/code-viewer/CodeViewer.tsx";
import { FileMetadata } from "../components/file-explorer/FileMetadata.tsx";
import { FileTree } from "../components/file-explorer/FileTree.tsx";
import { ErrorState } from "../components/ui/ErrorState.tsx";
import { Loading } from "../components/ui/Loading.tsx";
import { PageHeader } from "../components/ui/PageHeader.tsx";
import { useApi } from "../hooks/useApi.ts";
import { apiPaths } from "../services/api.ts";

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
      <title>Explorer · Full-Stack Learning</title>
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
          <div ref={detailsRef} className="min-w-0 scroll-mt-4">
            {!selectedPath && (
              <p className="text-muted">
                Choose a file to see what it does and why it exists.
              </p>
            )}
            {selectedPath && !selected && (
              <p role="alert">
                There is no file &ldquo;{selectedPath}&rdquo; in the Notes App.
              </p>
            )}
            {selected && file.isLoading && (
              <Loading label="Loading the file…" />
            )}
            {selected && file.error && (
              <ErrorState message={file.error.message} onRetry={file.reload} />
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
