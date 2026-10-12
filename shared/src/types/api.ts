import type {
  BuildStep,
  Concept,
  FileTreeFolder,
  ProjectFile,
  Topic,
} from "./content.ts";

// Shapes of API requests and responses. The server sends exactly these and
// the client expects exactly these, so a change here is checked on both sides.

/** Every error response from the API has this shape. */
export type ApiError = {
  error: {
    code: string;
    message: string;
  };
};

/** GET /api/health */
export type HealthResponse = {
  status: "ok";
  uptime: number;
  version: string;
};

/** A topic without its long content, for lists and links. */
export type TopicSummary = {
  id: string;
  slug: string;
  order: number;
  title: string;
  summary: string;
};

/** A node of the learning tree as sent to the client (no overview text). */
export type TopicTreeNode = TopicSummary & { children: TopicTreeNode[] };

/** GET /api/topics */
export type TopicTreeResponse = {
  tree: TopicTreeNode;
  /** Tells a beginner where to begin (shown on the home page). */
  whereToStart?: string;
};

/** A concept in a list (full concepts arrive in M3). */
export type ConceptSummary = {
  id: string;
  slug: string;
  title: string;
  topicId: string;
  summary: string;
};

/** A build step in a list, without its lesson. */
export type BuildStepSummary = {
  id: string;
  slug: string;
  order: number;
  title: string;
  goal: string;
};

/** GET /api/topics/:slug */
export type TopicResponse = {
  topic: Topic;
  previous?: TopicSummary;
  next?: TopicSummary;
  /** Concepts taught in this topic (empty until the concept registry exists). */
  concepts: ConceptSummary[];
  /** Build steps that use this topic's concepts, in journey order. */
  buildSteps: BuildStepSummary[];
};

/** GET /api/concepts — grouped by topic, in learning-tree order. */
export type ConceptListResponse = { concepts: ConceptSummary[] };

/** GET /api/concepts/:slug */
export type ConceptResponse = {
  concept: Concept;
  /** The learning-tree topic the concept belongs to. */
  topic: TopicSummary;
  /** Related concepts, including ones that link to this concept. */
  related: ConceptSummary[];
  /** Example-project files that use the concept, with the line when known. */
  usedIn: ConceptFileUse[];
  /** Build steps that introduce the concept, in journey order. */
  introducedIn: BuildStepSummary[];
};

/** A file that uses a concept, for "Used in" links. */
export type ConceptFileUse = {
  fileId: string;
  layer: ProjectFile["layer"];
  purpose: string;
  /** 1-based line the usage points at, when the content names one. */
  line?: number;
  /** What this file does with the concept, when the content says. */
  explanation?: string;
};

/** GET /api/files — the example project as nested folders. */
export type FileTreeResponse = { tree: FileTreeFolder };

/** GET /api/files/<path> — one file with its source code. */
export type FileResponse = {
  file: ProjectFile;
  source: string;
  /** The concepts a learner meets in this file. */
  concepts: ConceptSummary[];
};

/** GET /api/build-steps — the whole journey, in order. */
export type BuildStepListResponse = { buildSteps: BuildStepSummary[] };

/** Files that changed between two points of the build journey. */
export type SnapshotDiff = {
  added: string[];
  removed: string[];
  /** Files that exist on both sides and were changed in between. */
  modified: string[];
};

/** GET /api/build-steps/:slug */
export type BuildStepResponse = {
  step: BuildStep;
  /** The concepts this step introduces. */
  concepts: ConceptSummary[];
  previous?: BuildStepSummary;
  next?: BuildStepSummary;
  /** What this step changes in the project (previous step → this step). */
  diff: SnapshotDiff;
};

/** GET /api/project/snapshots/:order — the project after a step (0 = empty). */
export type SnapshotResponse = { order: number; tree: FileTreeFolder };

/** GET /api/project/diff?from=&to= */
export type DiffResponse = SnapshotDiff;
