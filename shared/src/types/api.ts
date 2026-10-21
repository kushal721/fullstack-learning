import type {
  Block,
  BuildStep,
  CheckResult,
  CodeSymbol,
  Concept,
  ExerciseAnswer,
  FileTreeFolder,
  Flow,
  GlossaryEntry,
  Level,
  PathSummary,
  PublicExercise,
  LayerOverview,
  ProjectFile,
  Relationship,
  Scene,
  Step,
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
export type TopicTreeNode = TopicSummary & {
  children: TopicTreeNode[];
  /** True when the topic has a guided path (GET /api/paths/:topic). */
  hasPath: boolean;
};

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

/** What a search result is, in the order results are grouped (spec §20). */
export type SearchResultType =
  | "concept"
  | "term"
  | "file"
  | "function"
  | "component"
  | "build-step"
  | "connection"
  | "flow";

export type SearchResult = {
  type: SearchResultType;
  id: string;
  title: string;
  /** A short piece of text explaining the result. */
  text: string;
  /** Where the result opens in the platform. */
  href: string;
};

/** GET /api/search?q= — results grouped by type, best first. */
export type SearchResponse = {
  query: string;
  groups: {
    type: SearchResultType;
    label: string;
    /** At most 10; `total` says how many matched. */
    results: SearchResult[];
    total: number;
  }[];
};

// --- Guided learning --------------------------------------------------------

/** A step in a list: enough for the step nav and links. */
export type StepSummary = {
  id: string;
  /** The number the learner sees; Intermediate continues Basic's count. */
  number: number;
  level: Level;
  kind: Step["kind"];
  title: string;
  minutes: number;
};

/** One level of a topic's path, with its numbered steps. */
export type LevelSummary = {
  level: Level;
  outcome: string;
  /** Step numbers of the level's first and last step, e.g. 19 and 30. */
  firstNumber: number;
  lastNumber: number;
  minutes: number;
  steps: StepSummary[];
};

/** GET /api/paths/:topic */
export type PathResponse = {
  topic: TopicSummary;
  summary: PathSummary;
  overviewScene: Scene;
  /** Basic, Intermediate, Advanced. */
  levels: LevelSummary[];
};

/** A block as sent to the browser: quick checks without their answer. */
export type PublicBlock =
  | Exclude<Block, { type: "check" }>
  | Omit<Extract<Block, { type: "check" }>, "correctChoiceId" | "explanation">;

/** A glossary entry in a list or search index: its one-line answer. */
export type GlossaryEntrySummary = Pick<
  GlossaryEntry,
  "id" | "topicId" | "term" | "aliases" | "kind" | "short"
>;

/** A level-check question: the exercise (no answer) and the step it tests. */
export type LevelCheckQuestionView = {
  exercise: PublicExercise;
  step: StepSummary;
};

/** GET /api/paths/:topic/steps/:step */
export type StepResponse = {
  topic: TopicSummary;
  step: StepSummary;
  blocks: PublicBlock[];
  /** The scenes the step's scene blocks show, by id. */
  scenes: Record<string, Scene>;
  /** Every glossary entry the step links, in reading order. */
  glossary: GlossaryEntrySummary[];
  /** Level checks only. */
  questions?: LevelCheckQuestionView[];
  /** The steps before and after, across levels. */
  previous?: StepSummary;
  next?: StepSummary;
};

/** POST /api/paths/:topic/steps/:step/check — a quick check's answer. */
export type QuickCheckRequest = {
  /** Position of the check among the step's blocks, from 0. */
  block: number;
  choiceId: string;
};

/** GET /api/glossary — everything the glossary panel searches. */
export type GlossaryIndexResponse = { entries: GlossaryEntrySummary[] };

/** A step somewhere in the course, for "introduced in" and "used in". */
export type StepLink = StepSummary & { topic: TopicSummary };

/** GET /api/glossary/:id */
export type GlossaryEntryResponse = {
  entry: GlossaryEntry;
  /** The first step of its own topic that links it, once one does. */
  introducedIn?: StepLink;
  /** Every step that links it, in reading order. */
  usedIn: StepLink[];
  /** Entries its body links. */
  related: GlossaryEntrySummary[];
  /** The long concept page, when it has one. */
  conceptPage?: ConceptSummary;
};

/** One level of a topic on the course map. */
export type CourseMapLevel = LevelSummary & {
  stepCount: number;
  /** What the level covers: its lesson titles. */
  covers: string[];
};

/** A topic on the course map; "planned" topics have no path yet. */
export type CourseMapTopic = {
  topic: TopicSummary;
  status: "ready" | "planned";
  /** Empty while the topic is planned. */
  levels: CourseMapLevel[];
};

/** GET /api/course-map — every topic in reading order. */
export type CourseMapResponse = { topics: CourseMapTopic[] };
