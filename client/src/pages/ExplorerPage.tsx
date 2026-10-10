import type { FileTreeFile, FileTreeNode, FileTreeResponse } from "@fsl/shared";
import { useSearchParams } from "react-router";
import { FileTree } from "../components/file-explorer/FileTree.tsx";
import { LayerBadge } from "../components/file-explorer/LayerBadge.tsx";
import { ErrorState } from "../components/ui/ErrorState.tsx";
import { Loading } from "../components/ui/Loading.tsx";
import { PageHeader } from "../components/ui/PageHeader.tsx";
import { RichText } from "../components/ui/RichText.tsx";
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
  const { data, error, isLoading, reload } = useApi<FileTreeResponse>(
    apiPaths.fileTree(),
  );

  const selected =
    data && selectedPath ? findFile(data.tree.children, selectedPath) : null;

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
        <div className="grid gap-6 md:grid-cols-[18rem_minmax(0,1fr)]">
          <nav
            aria-label="Project files"
            className="rounded-lg border border-border p-2"
          >
            <FileTree
              tree={data.tree}
              selectedPath={selectedPath}
              onSelect={(path) => setSearchParams({ file: path })}
            />
          </nav>
          <section aria-live="polite" className="min-w-0">
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
            {selected && (
              <div className="flex flex-col gap-2">
                <h2 className="break-all font-mono text-lg">{selected.path}</h2>
                <div>
                  <LayerBadge layer={selected.layer} />
                </div>
                <p className="leading-7">
                  <RichText text={selected.purpose} />
                </p>
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}
