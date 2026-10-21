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

/** One place the Notes App uses a concept. */
export type ProjectUsage = {
  explanation: string;
  /** The example-project file it is about. */
  fileId?: string;
  /**
   * Exact text on one line of that file, so the platform can link to the
   * line. Text instead of a line number keeps working when lines move;
   * `npm run validate` fails if the text disappears.
   */
  match?: string;
  symbolId?: string;
};

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
  /** Where the Notes App uses it. */
  projectUsage: ProjectUsage[];
  commonMistakes: string[];
  /** Concept ids; links back from those concepts are added automatically. */
  relatedConcepts: string[];
  /**
   * Extra example-project files to show under "Used in". Files from
   * `projectUsage` and files whose `conceptIds` list this concept are added
   * automatically.
   */
  relatedFiles: string[];
  /**
   * Extra build steps to show under "Introduced in". Steps whose
   * `conceptIds` list this concept are added automatically.
   */
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

/**
 * One step of the Build Journey (spec §6–7): an interactive lesson that
 * builds part of the Notes App and answers what, why, how to create it,
 * how to do it from scratch, what changed and what comes next (spec §3).
 */
export type BuildStep = {
  id: string;
  /** URL segment: /build/<slug>. */
  slug: string;
  /** Position in the journey, starting at 1. */
  order: number;
  title: string;
  /** What are we doing? (one sentence) */
  goal: string;
  /** Why are we doing it? */
  why: string;
  /** What problem does this solve? */
  problemSolved: string;
  /** Build step ids that must come first. */
  prerequisites: string[];
  explanation: string[];
  /** How do I create it? Exact commands, files and code, in order. */
  howToCreate: Instruction[];
  /** How do I do this in a brand-new project, without the platform? */
  fromScratch: string[];
  /** Example-project file ids this step adds, changes or deletes. */
  filesCreated: string[];
  filesModified: string[];
  filesRemoved: string[];
  /** Concepts introduced in this step. */
  conceptIds: string[];
  codeExamples: CodeExample[];
  /** Connections this step creates (filled once relationship data exists). */
  relationshipIds: string[];
  /** "You are now able to …" */
  enables: string;
  commonMistakes: string[];
  nextStepId?: string;
  /** Why the next step comes next. */
  nextWhy?: string;
  /** Flows that show this step's code at work, e.g. the security flows. */
  flowIds?: string[];
};

/** What kind of code a symbol is; the id starts with the same word. */
export type SymbolKind =
  | "function"
  | "component"
  | "hook"
  | "event"
  | "route"
  | "middleware"
  | "controller"
  | "query"
  | "table"
  | "http-request"
  | "external";

/**
 * One named piece of the Notes App (spec §13, docs/NOTES_APP.md "Symbol
 * ids"): a component, a function, a route, a table… Ids look like
 * `fn:handleSave` or `route:POST /api/notes`.
 */
export type CodeSymbol = {
  id: string;
  kind: SymbolKind;
  /** Display name, e.g. `handleSave` or `POST /api/notes`. */
  name: string;
  /** The example-project file it is defined in (none for externals). */
  fileId?: string;
  /**
   * Exact text on the line that defines it. Content writes this; the
   * server turns it into `line`, so links survive code moving.
   */
  match?: string;
  /** 1-based line, resolved from `match` when served. */
  line?: number;
  summary: string;
  /** The data it reads or produces, e.g. "the note's title and content". */
  dataHandled?: string;
  conceptIds: string[];
};

export type RelationshipType =
  | "calls"
  | "imports"
  | "renders"
  | "sends"
  | "receives"
  | "queries"
  | "returns"
  | "uses"
  | "handles";

/**
 * A directed connection: `source` <type> `target`, e.g.
 * `fn:handleSave` calls `fn:notesApi.createNote`. The id is always
 * `${source}->${type}->${target}`.
 */
export type Relationship = {
  id: string;
  source: string;
  target: string;
  type: RelationshipType;
  /** One or two sentences of cause and effect. */
  explanation: string;
};

/** Where a flow step happens. */
export type FlowLayer =
  "user" | "frontend" | "network" | "backend" | "database";

/**
 * One step of a request or response flow: what happens at one symbol, why,
 * and what the data looks like there (spec §11, §14).
 */
export type FlowStep = {
  /** Unique within its flow, e.g. "submit". */
  id: string;
  symbolId: string;
  layer: FlowLayer;
  title: string;
  explanation: string;
  /** The data at this point, e.g. the React state or the JSON body. */
  dataShape?: CodeExample;
  /**
   * The relationship that leads to this step from an earlier one. Not
   * always the step just before: Express runs express.json before it
   * matches the route, yet the route is what uses it.
   */
  relationshipId?: string;
  /**
   * Security flows only: the attack this step defends against and how,
   * shown as a "Why this protects you" callout.
   */
  protects?: { risk: string; defence: string };
};

/** One HTTP request and its answer, as it travels over the network. */
export type HttpExchange = {
  method: string;
  path: string;
  purpose: string;
  headers: Record<string, string>;
  body?: string;
  status: number;
  response: string;
  errorCases: { status: number; when: string; body: string }[];
};

/**
 * A path through the Notes App, step by step: a request from the click to
 * the database, the response back, or a security flow.
 */
export type Flow = {
  /** URL segment: /flow/<id>. */
  id: string;
  title: string;
  summary: string;
  group: "request" | "security";
  direction: "request" | "response" | "round-trip";
  steps: FlowStep[];
  http?: HttpExchange;
};

/** Why one layer of the app exists, for the "How everything connects" topic. */
export type LayerOverview = {
  layer: FlowLayer;
  title: string;
  /** Why this layer exists, in a few short paragraphs. */
  why: string[];
  conceptIds: string[];
  buildStepIds: string[];
  fileIds: string[];
};

// --- Practice ---------------------------------------------------------------

/** The five kinds of practice, each training a different skill. */
export type ExerciseMode = "predict" | "trace" | "find" | "fix" | "build";

/** One answer option of a predict or fix exercise. */
export type ExerciseChoice = { id: string; text: string };

/** One item a build exercise asks the learner to tick or leave. */
export type BuildChecklistItem = {
  id: string;
  kind: "file" | "layer" | "relationship";
  text: string;
  /** The file id, layer or relationship id this item is about. */
  ref: string;
  /** Answer: true if the task needs this item. */
  required: boolean;
};

type ExerciseBase = {
  /** URL segment: /practice/<id>. */
  id: string;
  title: string;
  /** The question or task, shown first. */
  prompt: string;
  conceptIds: string[];
  /** The build step this exercise practises, if any. */
  buildStepId?: string;
  /** Shown one at a time when the learner asks. */
  hints: string[];
  /** Why the answer is right, shown after checking. */
  explanation: string;
};

/** What happens when…? Pick one of several outcomes. */
export type PredictExercise = ExerciseBase & {
  mode: "predict";
  /** Code the question is about, if any. */
  code?: CodeExample;
  choices: ExerciseChoice[];
  correctChoiceId: string;
};

/** Follow the data: put the symbols on a path in order. */
export type TraceExercise = ExerciseBase & {
  mode: "trace";
  /** The answer: symbol ids from start to end, each linked to the next. */
  symbolIds: string[];
  /** Symbols offered that are not on the path. */
  distractorIds: string[];
};

/** Where is it? Pick the file or symbol. */
export type FindExercise = ExerciseBase & {
  mode: "find";
  target: "file" | "symbol";
  /** File or symbol ids that count as right (usually one). */
  acceptedIds: string[];
};

/** What is wrong with this code? Pick the fix. */
export type FixExercise = ExerciseBase & {
  mode: "fix";
  snippet: CodeExample;
  choices: ExerciseChoice[];
  correctChoiceId: string;
};

/** Plan a feature: tick what it needs, then compare with a model answer. */
export type BuildExercise = ExerciseBase & {
  mode: "build";
  task: string;
  checklist: BuildChecklistItem[];
  /** One way to build it, step by step. */
  modelAnswer: string[];
};

export type Exercise =
  PredictExercise | TraceExercise | FindExercise | FixExercise | BuildExercise;

/** An exercise as the browser sees it: everything except the answers. */
export type PublicExercise =
  | Omit<PredictExercise, "correctChoiceId" | "explanation">
  | (Omit<TraceExercise, "symbolIds" | "distractorIds" | "explanation"> & {
      startSymbolId: string;
      endSymbolId: string;
      /** How many symbols the path has, start and end included. */
      length: number;
      /** Every symbol offered, path and distractors, sorted by id. */
      candidateIds: string[];
    })
  | Omit<FindExercise, "acceptedIds" | "explanation">
  | Omit<FixExercise, "correctChoiceId" | "explanation">
  | (Omit<BuildExercise, "checklist" | "modelAnswer" | "explanation"> & {
      checklist: Omit<BuildChecklistItem, "required">[];
    });

/** What a learner submits, by mode. */
export type ExerciseAnswer =
  | { choiceId: string } // predict, fix
  | { symbolIds: string[] } // trace
  | { id: string } // find
  | { itemIds: string[] }; // build

/** The right answer, revealed after checking. */
export type ExpectedAnswer =
  | { choiceId: string }
  | { symbolIds: string[] }
  | { ids: string[] }
  | { itemIds: string[]; modelAnswer: string[] };

export type CheckResult = {
  correct: boolean;
  explanation: string;
  expected?: ExpectedAnswer;
};

// --- Guided learning --------------------------------------------------------
// A topic's guided path: three levels of short, numbered steps. Text in steps
// and glossary entries may link a glossary entry with `[[id]]` or
// `[[id|shown text]]`; the learner clicks it to see the explanation.

export type Level = "basic" | "intermediate" | "advanced";

/** The three questions every topic answers first, one or two sentences each. */
export type PathSummary = { what: string; does: string; how: string };

export type SceneActor = { id: string; label: string; sub?: string };

/** One move of a scene: a message from one actor to another. */
export type SceneStep = {
  from: string;
  to: string;
  /** What travels, e.g. "GET /". */
  message: string;
  /** One sentence shown under the picture. */
  caption: string;
  detail?: string;
};

/** A small animated flowchart, the beginner-sized version of a flow. */
export type Scene = {
  id: string;
  title: string;
  actors: SceneActor[];
  steps: SceneStep[];
};

/** The interactive widgets a `tryIt` block can show. */
export type TryItWidget = "url-anatomy" | "status-codes";

/** The pieces a step is built from; each has one job and a size limit. */
export type Block =
  | { type: "explain"; text: string }
  | { type: "analogy"; text: string }
  | { type: "keyPoints"; items: string[] }
  | {
      type: "diagram";
      nodes: { label: string; sub?: string }[];
      /** Arrows both ways (client ⇄ server) instead of left to right. */
      twoWay?: boolean;
    }
  | { type: "scene"; sceneId: string }
  | {
      type: "code";
      example: CodeExample;
      /** Notes shown next to 1-based lines. */
      notes?: { line: number; text: string }[];
    }
  | { type: "tryIt"; widget: TryItWidget }
  | {
      type: "check";
      question: string;
      choices: ExerciseChoice[];
      correctChoiceId: string;
      explanation: string;
    }
  | {
      type: "inTheNotesApp";
      text: string;
      fileId?: string;
      symbolId?: string;
      flowId?: string;
    }
  | {
      /** A small reference table: each row a name, what it's for, an example. */
      type: "reference";
      caption: string;
      rows: { name: string; text: string; example?: string }[];
    }
  | {
      /** Editable HTML (and CSS) with a live preview beside it. */
      type: "playground";
      caption: string;
      code: string;
    };

/** A question of a level check: a practice exercise and the step it tests. */
export type LevelCheckQuestion = { exerciseId: string; stepId: string };

/**
 * One screen of a guided path. Its number ("Step 19") is not stored: it
 * comes from the order of the levels and steps, so adding a step shifts the
 * numbers and nothing breaks. Progress and links use the id.
 */
export type Step =
  | {
      kind: "lesson";
      /** Unique within the topic; URL segment /learn/<topic>/<id>. */
      id: string;
      title: string;
      minutes: number;
      blocks: Block[];
    }
  | {
      /** The level check, always the last step of a level. */
      kind: "check";
      id: string;
      title: string;
      minutes: number;
      /** Optional short introduction. */
      blocks: Block[];
      questions: LevelCheckQuestion[];
    };

export type LevelPlan = {
  /** "You can …": what the learner can do after the level. */
  outcome: string;
  /** In reading order; the last one is the level check. */
  steps: Step[];
};

/** A topic's guided path (one folder in server/src/content/paths). */
export type TopicPath = {
  topicId: string;
  summary: PathSummary;
  overviewSceneId: string;
  scenes: Scene[];
  levels: Record<Level, LevelPlan>;
};

/**
 * A word (term) or a bigger idea (concept) the glossary panel explains.
 * Where it is introduced and used is computed from the steps that link it.
 */
export type GlossaryEntry = {
  /** Used in links: `[[dns]]`. */
  id: string;
  /** The topic whose steps introduce it. */
  topicId: string;
  term: string;
  /** Other names, found by search and "Look up". */
  aliases?: string[];
  kind: "term" | "concept";
  /** The one-line answer. */
  short: string;
  /** A few sentences; may link other entries. */
  body: string;
  /** "In plain words": an everyday comparison. */
  analogy?: string;
  /** The long concept page, if there is one. */
  conceptPageId?: string;
  /**
   * A name that keeps its capital in mid-sentence, like React or Express.
   * Acronyms (HTML) and names with inner capitals (JavaScript, Node.js)
   * are recognised without it.
   */
  properNoun?: boolean;
};
