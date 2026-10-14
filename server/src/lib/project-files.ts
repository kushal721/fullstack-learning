import type { FileTreeFolder, FileTreeNode, ProjectFile } from "@fsl/shared";
import { readdirSync, readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { config } from "../config.js";
import { projectFiles } from "../content/files.js";

const byId = new Map(projectFiles.map((file) => [file.id, file]));
const sourceCache = new Map<string, string>();

export function getAllFiles(): ProjectFile[] {
  return projectFiles;
}

export function getFile(id: string): ProjectFile | undefined {
  return byId.get(id);
}

/**
 * Turns a flat list of files into nested folders. Within each folder,
 * subfolders come first, then files, each in alphabetical order.
 */
export function buildFileTree(files: ProjectFile[]): FileTreeFolder {
  const root: FileTreeFolder = {
    type: "folder",
    name: "",
    path: "",
    children: [],
  };

  for (const file of files) {
    const parts = file.path.split("/");
    let folder = root;
    for (const [index, name] of parts.slice(0, -1).entries()) {
      let next = folder.children.find(
        (child): child is FileTreeFolder =>
          child.type === "folder" && child.name === name,
      );
      if (!next) {
        next = {
          type: "folder",
          name,
          path: parts.slice(0, index + 1).join("/"),
          children: [],
        };
        folder.children.push(next);
      }
      folder = next;
    }
    folder.children.push({
      type: "file",
      name: parts.at(-1) ?? file.path,
      path: file.path,
      layer: file.layer,
      purpose: file.purpose,
    });
  }

  sortTree(root);
  return root;
}

function sortTree(folder: FileTreeFolder) {
  folder.children.sort(compareNodes);
  for (const child of folder.children) {
    if (child.type === "folder") sortTree(child);
  }
}

function compareNodes(a: FileTreeNode, b: FileTreeNode) {
  if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
  return a.name.localeCompare(b.name);
}

/**
 * Reads a file's source code. Only ids from the file list are accepted, so
 * a request can never read anything outside the example project.
 */
export async function readFileSource(id: string): Promise<string | undefined> {
  const file = byId.get(id);
  if (!file) return undefined;
  // The example files never change while the server runs, so each one is
  // read from disk once and then served from memory.
  let source = sourceCache.get(id);
  if (source === undefined) {
    source = await readFile(
      path.join(config.exampleProjectDir, file.path),
      "utf8",
    );
    sourceCache.set(id, source);
  }
  return source;
}

/**
 * The 1-based line of the first line containing `text`, or undefined when
 * the file or the text doesn't exist. Content uses text instead of line
 * numbers so links keep working when code moves.
 */
export function findLine(id: string, text: string): number | undefined {
  const source = readSourceSync(id);
  if (source === undefined) return undefined;
  const index = source.split("\n").findIndex((line) => line.includes(text));
  return index === -1 ? undefined : index + 1;
}

/** Like readFileSource, but synchronous (for indexes built at startup). */
export function readSourceSync(id: string): string | undefined {
  const file = byId.get(id);
  if (!file) return undefined;
  let source = sourceCache.get(id);
  if (source === undefined) {
    source = readFileSync(
      path.join(config.exampleProjectDir, file.path),
      "utf8",
    );
    sourceCache.set(id, source);
  }
  return source;
}

/** Generated or local-only files that are never part of the example. */
const IGNORED = new Set([
  "node_modules",
  "dist",
  "coverage",
  ".env",
  ".DS_Store",
]);

/** Every file in the example project folder, as paths relative to it. */
export function listExampleProjectFiles(
  dir = config.exampleProjectDir,
): string[] {
  const results: string[] = [];
  const walk = (current: string) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      if (IGNORED.has(entry.name)) continue;
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) walk(full);
      else results.push(path.relative(dir, full).split(path.sep).join("/"));
    }
  };
  walk(dir);
  return results.sort();
}
