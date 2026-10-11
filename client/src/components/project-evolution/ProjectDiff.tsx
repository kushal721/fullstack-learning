import type { FileTreeFolder, SnapshotDiff } from "@fsl/shared";
import { Link } from "react-router";
import type { FileMarker } from "../file-explorer/FileTree.tsx";
import { ProjectSnapshot } from "./ProjectSnapshot.tsx";

type Props = {
  /** The step being shown (1 or more); "before" is the step before it. */
  step: number;
  before: FileTreeFolder;
  after: FileTreeFolder;
  diff: SnapshotDiff;
  onOpenFile: (path: string) => void;
  /** 3 when the diff sits inside a page section that has its own h2. */
  headingLevel?: 2 | 3;
  /** Heading of the change list (default "What changed in step N"). */
  title?: string;
};

const SYMBOL: Record<FileMarker, string> = {
  added: "+",
  modified: "~",
  removed: "−",
};

const explorerLink = (path: string) =>
  `/explorer?file=${encodeURIComponent(path)}`;

/**
 * BEFORE | AFTER trees for one step (stacked on phones), with a written
 * list of what changed so the answer never depends on scanning the trees.
 */
export function ProjectDiff({
  step,
  before,
  after,
  diff,
  onOpenFile,
  headingLevel = 2,
  title = `What changed in step ${step}`,
}: Props) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const beforeMarkers: Record<string, FileMarker> = {};
  const afterMarkers: Record<string, FileMarker> = {};
  for (const path of diff.removed) beforeMarkers[path] = "removed";
  for (const path of diff.modified) {
    beforeMarkers[path] = "modified";
    afterMarkers[path] = "modified";
  }
  for (const path of diff.added) afterMarkers[path] = "added";

  const changes: [FileMarker, string[]][] = [
    ["added", diff.added],
    ["modified", diff.modified],
    ["removed", diff.removed],
  ];
  const total = diff.added.length + diff.modified.length + diff.removed.length;
  const beforeLabel =
    step === 1 ? "before step 1 (empty project)" : `after step ${step - 1}`;

  return (
    <div className="flex flex-col gap-6">
      <section aria-labelledby="changes-heading">
        <Heading id="changes-heading" className="text-lg font-semibold">
          {title}
        </Heading>
        {total === 0 ? (
          <p className="mt-1 text-muted">
            No files change in this step: it is about understanding, not code.
          </p>
        ) : (
          <>
            <p className="mt-1 text-muted">
              {diff.added.length} added, {diff.modified.length} modified,{" "}
              {diff.removed.length} removed.
            </p>
            <ul className="mt-2 flex flex-col gap-1 text-sm">
              {changes.flatMap(([marker, paths]) =>
                paths.map((path) => (
                  <li key={`${marker}:${path}`} className="flex gap-2">
                    <span aria-hidden="true" className="w-3 font-mono">
                      {SYMBOL[marker]}
                    </span>
                    <span className="w-16 shrink-0 text-muted">{marker}</span>
                    <Link
                      to={explorerLink(path)}
                      className="min-w-0 font-mono [overflow-wrap:anywhere] text-accent hover:underline"
                    >
                      {path}
                    </Link>
                  </li>
                )),
              )}
            </ul>
          </>
        )}
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <ProjectSnapshot
          title="Before"
          description={beforeLabel}
          tree={before}
          markers={beforeMarkers}
          onOpenFile={onOpenFile}
          headingLevel={headingLevel}
        />
        <ProjectSnapshot
          title="After"
          description={`after step ${step}`}
          tree={after}
          markers={afterMarkers}
          onOpenFile={onOpenFile}
          headingLevel={headingLevel}
        />
      </div>
    </div>
  );
}
