import type { FileTreeFolder } from "@fsl/shared";
import type { FileMarker } from "../file-explorer/FileTree.tsx";
import { ProjectTree } from "./ProjectTree.tsx";

type Props = {
  /** "Before" or "After". */
  title: string;
  /** Says which step the files are from, e.g. "after step 5". */
  description: string;
  tree: FileTreeFolder;
  markers?: Record<string, FileMarker>;
  onOpenFile: (path: string) => void;
};

/** One labelled snapshot of the project. */
export function ProjectSnapshot({
  title,
  description,
  tree,
  markers = {},
  onOpenFile,
}: Props) {
  return (
    <section
      aria-label={`${title}: ${description}`}
      className="min-w-0 rounded-lg border border-border p-2"
    >
      <h2 className="px-2 pt-1 text-sm font-semibold uppercase tracking-wide">
        {title}
      </h2>
      <p className="px-2 pb-2 text-xs text-muted">{description}</p>
      <ProjectTree
        tree={tree}
        label={`Files ${description}`}
        markers={markers}
        onOpenFile={onOpenFile}
      />
    </section>
  );
}
