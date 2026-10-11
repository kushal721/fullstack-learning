import type { FileTreeFolder } from "@fsl/shared";
import { FileTree, type FileMarker } from "../file-explorer/FileTree.tsx";

type Props = {
  tree: FileTreeFolder;
  label: string;
  markers: Record<string, FileMarker>;
  onOpenFile: (path: string) => void;
};

/** The project's files at one step, with + / ~ / − next to changed files. */
export function ProjectTree({ tree, label, markers, onOpenFile }: Props) {
  if (tree.children.length === 0) {
    return (
      <p className="px-2 py-1 text-sm text-muted">
        <span className="font-mono">notes-app/</span> is empty: no files yet.
      </p>
    );
  }
  return (
    <FileTree
      tree={tree}
      label={label}
      markers={markers}
      selectedPath={null}
      onSelect={onOpenFile}
    />
  );
}
