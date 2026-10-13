import type {
  BuildStep,
  CheckResult,
  CodeSymbol,
  Concept,
  ExerciseAnswer,
  FileTreeFolder,
  Flow,
  PublicExercise,
  LayerOverview,
  ProjectFile,
  Relationship,
  SymbolKind,
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
  /** Only on "How everything connects": why each layer exists, linked. */
  layers?: LayerView[];
};

/** A layer overview with its links resolved for display. */
export type LayerView = Pick<LayerOverview, "layer" | "title" | "why"> & {
  concepts: ConceptSummary[];
  buildSteps: BuildStepSummary[];
  files: FileSummary[];
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
  /** Connections between pieces of code this step creates. */
  connections: StepConnection[];
  /** Flows in the flow tracer that show this step's code at work. */
  flows: FlowSummary[];
};

/** A relationship a build step creates, with both ends resolved. */
export type StepConnection = {
  id: string;
  type: Relationship["type"];
  explanation: string;
  source: SymbolSummary;
  target: SymbolSummary;
};

/** GET /api/project/snapshots/:order — the project after a step (0 = empty). */
export type SnapshotResponse = { order: number; tree: FileTreeFolder };

/** GET /api/project/diff?from=&to= */
export type DiffResponse = SnapshotDiff;

/** A file in a list, optionally with the line something is on. */
export type FileSummary = Pick<
  ProjectFile,
  "id" | "path" | "layer" | "purpose"
> & {
  line?: number;
};

/** A symbol in a list: enough to show and link it. */
export type SymbolSummary = {
  id: string;
  kind: SymbolKind;
  name: string;
  fileId?: string;
  /** 1-based line it is defined on, when it lives in the project. */
  line?: number;
};

/** A relationship seen from one symbol: the type, why, and the other end. */
export type RelationshipView = {
  id: string;
  type: Relationship["type"];
  /**
   * "in": the other symbol is the relationship's source (it points here);
   * "out": this symbol is the source.
   */
  direction: "in" | "out";
  explanation: string;
  symbol: SymbolSummary;
};

/** GET /api/symbols/:id */
export type SymbolResponse = {
  /** The symbol with its line resolved. */
  symbol: CodeSymbol;
  definedIn?: FileSummary;
  /** Symbols that call this one, with why. */
  calledBy: RelationshipView[];
  /** Symbols this one calls, with why. */
  calls: RelationshipView[];
  /** Files involved: its own first, then its neighbours'. */
  files: FileSummary[];
  /**
   * What comes before it and uses it: relationships pointing at it, plus
   * the event that triggers a handler and the request that reaches a route.
   */
  usedBy: RelationshipView[];
  /** What it calls, renders, uses, queries… (not imports). */
  uses: RelationshipView[];
  /** What happens next, in the order it happens; empty for dead ends. */
  next: RelationshipView[];
};

/** GET /api/symbols/:id/graph?depth=1..3 */
export type SymbolGraphResponse = {
  nodes: CodeSymbol[];
  edges: Relationship[];
};

/** GET /api/files/<path>/symbols */
export type FileSymbolsResponse = {
  file: FileSummary;
  /** Symbols defined in this file, by line. */
  defined: SymbolSummary[];
  /** Symbols elsewhere that this file's symbols connect to. */
  referenced: SymbolSummary[];
  /** Files this file imports, and files that import it. */
  imports: FileSummary[];
  importedBy: FileSummary[];
};

/** A flow in a list, without its steps. */
export type FlowSummary = Pick<
  Flow,
  "id" | "title" | "summary" | "group" | "direction"
> & {
  stepCount: number;
};

/** GET /api/flows?group=request|security */
export type FlowListResponse = { flows: FlowSummary[] };

/** GET /api/flows/:id */
export type FlowResponse = {
  flow: Flow;
  /** Every symbol the steps are at, with lines resolved, by id. */
  symbols: Record<string, CodeSymbol>;
};

/** GET /api/exercises?mode=predict|trace|find|fix|build (answers left out) */
export type ExerciseListResponse = { exercises: PublicExercise[] };

/** GET /api/exercises/:id (answers left out) */
export type ExerciseResponse = { exercise: PublicExercise };

/** POST /api/exercises/:id/check */
export type CheckAnswerRequest = { answer: ExerciseAnswer };

/** The result, with the right answer revealed. */
export type CheckAnswerResponse = CheckResult;
