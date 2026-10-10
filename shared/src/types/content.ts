// Shapes of the learning content. The server stores content in these shapes
// and the API returns them, so client and server always agree.

/** One node of the Learning Tree (spec §4.1). */
export type Topic = {
  /** Stable identifier used by other content to reference this topic. */
  id: string;
  /** URL segment: /learn/<slug>. */
  slug: string;
  /** Position among its siblings, starting at 1. */
  order: number;
  title: string;
  /** One sentence: what this topic is about. */
  summary: string;
  /** Short paragraphs explaining the topic from the basics. */
  overview: string[];
  /** Tells a beginner exactly where to begin (root and first topic). */
  whereToStart?: string;
  children: Topic[];
  /** Concepts taught in this topic (ids into the concept registry). */
  conceptIds: string[];
  /** Build steps where this topic is applied (ids into the build steps). */
  buildStepIds: string[];
};

/** A piece of example code shown with an explanation. */
export type CodeExample = {
  language:
    | "html"
    | "css"
    | "js"
    | "jsx"
    | "ts"
    | "tsx"
    | "json"
    | "sql"
    | "bash"
    | "http";
  code: string;
  /** Where this code lives, e.g. "frontend/src/components/NoteForm.jsx". */
  fileName?: string;
  caption?: string;
  /** 1-based line numbers to highlight. */
  highlightLines?: number[];
};

/** One step of "how do I create this?". */
export type Instruction = { text: string; code?: CodeExample };

/**
 * One concept, always explained in the same structure (spec §5) and from the
 * basics (spec §2). Text may use `backticks` for inline code.
 */
export type Concept = {
  id: string;
  /** URL segment: /concepts/<slug>. */
  slug: string;
  title: string;
  /** The learning-tree topic this concept belongs to. */
  topicId: string;
  /** One sentence: what this concept is. */
  summary: string;
  /** What you need to know first, explained for someone starting from zero. */
  basics: string[];
  /** What is it? */
  what: string[];
  /** Why do we need it? */
  why: string[];
  /** How does it work? */
  howItWorks: string[];
  /** The smallest example that shows it. */
  basicExample: CodeExample;
  /** What happens internally? */
  internals: string[];
  /** How do I create/use it myself, from scratch? */
  howToCreate: Instruction[];
  /** Where is it used? */
  whereUsed: string[];
  /** What does it connect to? */
  connectsTo: string[];
  /** Where the Notes App uses it. File/symbol ids are linked in later milestones. */
  projectUsage: { explanation: string; fileId?: string; symbolId?: string }[];
  commonMistakes: string[];
  /** Concept ids; links back from those concepts are added automatically. */
  relatedConcepts: string[];
  /** Example-project file ids (filled once file data exists, M4). */
  relatedFiles: string[];
  /** Build step ids (filled once build steps exist, M5). */
  relatedBuildSteps: string[];
};

/** Which part of the Notes App a file belongs to. */
export type ProjectLayer = "frontend" | "backend" | "database" | "root";

/** One file of the example Notes App (`example-project/`). */
export type ProjectFile = {
  /** Path relative to `example-project/`, e.g. "frontend/src/App.jsx". */
  id: string;
  path: string;
  layer: ProjectLayer;
  /** How to highlight the file. */
  language: CodeExample["language"];
  /** One sentence: what the file does. */
  purpose: string;
  /** Why the project needs this file, in 2–3 sentences (spec §42). */
  whyItExists: string;
  /** Concepts a learner meets in this file. */
  conceptIds: string[];
};

/** A file in the project tree: just what a file list needs. */
export type FileTreeFile = {
  type: "file";
  name: string;
  path: string;
  layer: ProjectLayer;
  purpose: string;
};

/** A folder in the project tree, with its folders first, then its files. */
export type FileTreeFolder = {
  type: "folder";
  name: string;
  /** "" for the project root. */
  path: string;
  children: FileTreeNode[];
};

export type FileTreeNode = FileTreeFolder | FileTreeFile;
