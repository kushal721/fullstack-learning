import {
  anatomy,
  code,
  explain,
  inTheNotesApp,
  mistake,
  moduleLesson,
  part,
  quickCheck,
  reference,
  trace,
  yourTurn,
} from "../blocks.js";

// Reducers: scattered state updates, a reducer taken apart, useReducer,
// actions dispatched step by step, naming actions, keeping reducers pure,
// testing them, reducers with context, choosing useState or useReducer,
// the Notes App, mistakes, practice and a recap.
export const reducersModule = moduleLesson(
  "reducers",
  "Reducers: state updates in one place",
  50,
  [
    "Recognise when state updates are scattered and hard to follow.",
    "Write a reducer: a pure function from the current state and an action to the next state.",
    "Use useReducer and dispatch actions that describe what happened.",
    "Keep reducers pure, and test them without React.",
    "Choose between useState and useReducer, and combine a reducer with context.",
  ],

  part(
    "why",
    "When updates are everywhere",
    explain(
      "A notes screen adds, renames, deletes and reorders notes. With `useState`, each handler builds the next array itself, so the rules for changing notes are spread across many functions. A [[react-reducer|reducer]] puts every way the state can change into one function. Handlers just say *what happened*.",
    ),
    code(
      "jsx",
      "Before: the logic lives in each handler",
      [
        "function handleAdd(note) {",
        "  setNotes([note, ...notes]);",
        "}",
        "function handleRename(id, title) {",
        "  setNotes(notes.map((n) => (n.id === id ? { ...n, title } : n)));",
        "}",
        "function handleDelete(id) {",
        "  setNotes(notes.filter((n) => n.id !== id));",
        "}",
      ],
      { 5: "each handler knows how to build the next array" },
    ),
  ),

  part(
    "anatomy",
    "A reducer, taken apart",
    explain(
      "A reducer takes the current state and an *action*, an object describing what happened, and returns the next state. It usually switches on the action's `type`. It never changes the state it's given: it returns a new one.",
    ),
    anatomy(
      "notesReducer",
      [
        "function notesReducer(notes, action) {",
        '  if (action.type === "added")',
        "    return [action.note, ...notes];",
        "  throw new Error(action.type);",
      ],
      [
        ["notes, action", "inputs", "The current state, and what happened."],
        [
          "action.type",
          "which change",
          "A name for the event, like added or deleted. Real reducers usually switch on it.",
        ],
        [
          "return [action.note, ...notes]",
          "next state",
          "A new array, built from the old one and the action.",
        ],
        [
          "throw new Error(action.type)",
          "unknown",
          "A typo in an action type fails loudly.",
        ],
      ],
    ),
  ),

  part(
    "use-reducer",
    "useReducer",
    explain(
      "[[react-usereducer|useReducer]] is like `useState`, but you pass the reducer and a starting state, and get back the state and a `dispatch` function. Handlers call `dispatch` with an action; React runs the reducer and re-renders with what it returns.",
    ),
    code(
      "jsx",
      "Handlers only describe events",
      [
        "const [notes, dispatch] = useReducer(notesReducer, []);",
        "",
        "function handleAdd(note) {",
        '  dispatch({ type: "added", note });',
        "}",
        "function handleDelete(id) {",
        '  dispatch({ type: "deleted", id });',
        "}",
      ],
      {
        1: "the reducer and the starting state",
        4: "what happened, plus the data it needs",
      },
    ),
  ),

  part(
    "step-by-step",
    "Actions, step by step",
    explain(
      "Step through three actions. Each time, React calls the reducer with the latest state and the action, and the result becomes the state for the next render.",
    ),
    trace(
      "Three dispatches",
      [
        "function notesReducer(notes, action) {",
        "  switch (action.type) {",
        '    case "added":',
        "      return [action.note, ...notes];",
        '    case "deleted":',
        "      return notes.filter(",
        "        (n) => n.id !== action.id,",
        "      );",
        '    case "cleared":',
        "      return [];",
        "    default:",
        "      throw new Error(action.type);",
        "  }",
        "}",
      ],
      [
        {
          line: 4,
          note: '`dispatch({ type: "added", note: Milk })`. The reducer returns a new array with Milk first.',
          vars: [
            ["before", "[Eggs]"],
            ["after", "[Milk, Eggs]"],
          ],
        },
        {
          line: 7,
          note: '`dispatch({ type: "deleted", id: 2 })`. Filter keeps every note except Eggs, in a new array.',
          vars: [
            ["before", "[Milk, Eggs]"],
            ["after", "[Milk]"],
          ],
        },
        {
          line: 10,
          note: '`dispatch({ type: "cleared" })`. No data needed: the next state is an empty array.',
          vars: [
            ["before", "[Milk]"],
            ["after", "[]"],
          ],
        },
        {
          line: 12,
          note: '`dispatch({ type: "clear" })`: a typo. No case matches, so the reducer throws and you find the bug at once.',
          vars: [["action.type", '"clear"']],
          output: "Error: clear",
        },
      ],
    ),
  ),

  part(
    "actions",
    "Naming actions",
    explain(
      "Name actions after what happened, not what to do with the state: `added`, `renamed`, `deleted`, not `setNotes`. Carry only the data the reducer needs. Then reading a list of actions tells the story of what the user did.",
    ),
    reference("Actions", [
      ["type", "What happened, past tense.", '"added", "deleted"'],
      ["Data", "Only what the reducer needs.", '{ type: "deleted", id: 7 }'],
      ["Not", "Instructions about state.", '{ type: "setNotes", notes } ✗'],
      [
        "One event",
        "One action, even if lots changes.",
        '"loggedOut" clears user and notes',
      ],
    ]),
  ),

  part(
    "pure",
    "Reducers must be pure",
    explain(
      "Like rendering, a reducer is a [[pure-function|pure function]]: same state and action in, same result out, and nothing else happens. No requests, no timers, no random ids, no changing the old state. Do the side effect in the handler, then dispatch what happened.",
    ),
    code(
      "jsx",
      "Request first, then dispatch",
      [
        "async function handleAdd(title) {",
        "  const note = await createNote({ title });",
        '  dispatch({ type: "added", note });',
        "}",
      ],
      {
        2: "the side effect, in the handler",
        3: "the reducer gets the finished note, with its id",
      },
    ),
    quickCheck(
      "Where should the request that saves a note to the server go?",
      [
        "Inside the reducer's added case",
        "In the event handler, before dispatching",
        "In the action object",
      ],
      1,
      "Reducers must be pure, and React may call them more than once. Do the request in the handler, then dispatch an action with the result.",
    ),
  ),

  part(
    "testing",
    "Easy to test",
    explain(
      "A reducer is a plain function with no React in it, so testing it needs no rendering: give it a state and an action, and check what comes back. All the rules about how state changes get tested in one place.",
    ),
    code(
      "js",
      "notesReducer.test.js",
      [
        'it("deletes a note", () => {',
        "  const notes = [{ id: 1 }, { id: 2 }];",
        '  const next = notesReducer(notes, { type: "deleted", id: 1 });',
        "  expect(next).toEqual([{ id: 2 }]);",
        "  expect(notes).toHaveLength(2);",
        "});",
      ],
      {
        3: "call it like any function",
        5: "and the old state wasn't changed",
      },
    ),
  ),

  part(
    "choosing",
    "useState or useReducer?",
    explain(
      "Both hold state; pick the one that keeps the code clearer. A reducer can also be shared with deep components by putting `dispatch` in [[react-context|context]]: it never changes, so passing it around is cheap.",
    ),
    reference("Choosing", [
      ["useState", "Independent, simple values.", "isOpen, query"],
      [
        "useReducer",
        "Several ways to change related data.",
        "a list: add, edit, delete",
      ],
      [
        "useReducer",
        "Next state depends on several pieces.",
        "a multi-step form",
      ],
      [
        "Reducer + context",
        "Deep components dispatch.",
        "useContext(NotesDispatch)",
      ],
    ]),
  ),

  part(
    "notes-app",
    "A reducer for the Notes App?",
    explain(
      "`useNotes` uses `useState` with `addNote`, `replaceNote` and `removeNote`, each building the next array. That's three ways to change one list: exactly where a reducer helps. Its cases would be `added`, `replaced` and `removed`, and the request in `removeNote` would stay in the function, before the dispatch.",
    ),
    inTheNotesApp(
      "`useNotes` has three functions that each build the next notes array: a natural fit for a reducer.",
      { fileId: "frontend/src/hooks/useNotes.js" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Changing the state in the reducer",
      wrong: ['case "added":', "  notes.push(action.note);", "  return notes;"],
      problem:
        "The same array comes back, so React sees no change, and the old state was quietly altered.",
      right: ['case "added":', "  return [action.note, ...notes];"],
      why: "Always return a new value built from the old one.",
    }),
    mistake({
      title: "Forgetting the default case",
      wrong: ["switch (action.type) {", '  case "added": …', "}"],
      problem:
        "A misspelled action makes the reducer return undefined, and the error shows up later, somewhere else.",
      right: [
        "  default:",
        "    throw new Error(`Unknown action: ${action.type}`);",
      ],
      why: "Fail loudly on actions you don't know.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "A notes reducer",
      task: "Write `notesReducer(notes, action)` for three actions: `added` (put `action.note` first), `deleted` (remove the note with `action.id`) and `cleared` (no notes). Return new arrays; throw for anything else.",
      starter: ["function notesReducer(notes, action) {", "", "}"],
      tests: [
        [
          'notesReducer([{ id: 1 }], { type: "added", note: { id: 2 } })',
          "[{ id: 2 }, { id: 1 }]",
        ],
        [
          'notesReducer([{ id: 1 }, { id: 2 }], { type: "deleted", id: 1 })',
          "[{ id: 2 }]",
        ],
        ['notesReducer([{ id: 1 }], { type: "cleared" })', "[]"],
        [
          '(() => { try { notesReducer([], { type: "oops" }); return "no error"; } catch { return "threw"; } })()',
          '"threw"',
        ],
      ],
      hint: "Use `switch (action.type)` with a `case` for each, and `default: throw new Error(action.type);`.",
      solution: [
        "function notesReducer(notes, action) {",
        "  switch (action.type) {",
        '    case "added":',
        "      return [action.note, ...notes];",
        '    case "deleted":',
        "      return notes.filter((n) => n.id !== action.id);",
        '    case "cleared":',
        "      return [];",
        "    default:",
        "      throw new Error(`Unknown action: ${action.type}`);",
        "  }",
        "}",
      ],
    }),
    yourTurn({
      title: "A form reducer",
      task: 'Write `formReducer(form, action)`. For `changed`, return a new object with `action.field` set to `action.value`. For `reset`, return `{ title: "", content: "" }`.',
      starter: ["function formReducer(form, action) {", "", "}"],
      tests: [
        [
          'formReducer({ title: "", content: "x" }, { type: "changed", field: "title", value: "Milk" })',
          '{ title: "Milk", content: "x" }',
        ],
        [
          'formReducer({ title: "a", content: "b" }, { type: "reset" })',
          '{ title: "", content: "" }',
        ],
        [
          '(() => { const old = { title: "" }; formReducer(old, { type: "changed", field: "title", value: "y" }); return old.title; })()',
          '""',
        ],
      ],
      hint: "`changed`: `return { ...form, [action.field]: action.value };` (a computed key).",
      solution: [
        "function formReducer(form, action) {",
        "  switch (action.type) {",
        '    case "changed":',
        "      return { ...form, [action.field]: action.value };",
        '    case "reset":',
        '      return { title: "", content: "" };',
        "    default:",
        "      throw new Error(`Unknown action: ${action.type}`);",
        "  }",
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Reducers cheat sheet", [
      [
        "Reducer",
        "(state, action) → next state.",
        "function notesReducer(notes, action)",
      ],
      ["Action", "What happened, with its data.", '{ type: "deleted", id: 7 }'],
      [
        "useReducer",
        "State and dispatch.",
        "const [notes, dispatch] = useReducer(r, [])",
      ],
      ["dispatch", "Send an action.", 'dispatch({ type: "added", note })'],
      [
        "Pure",
        "No requests, no changing state.",
        "side effects go in handlers",
      ],
      ["default", "Throw on unknown actions.", "throw new Error(action.type)"],
      [
        "Testing",
        "Call it like any function.",
        "expect(reducer(s, a)).toEqual(…)",
      ],
      [
        "With context",
        "Share dispatch with deep components.",
        "useContext(NotesDispatch)",
      ],
    ]),
    quickCheck(
      'What should a reducer do when it gets `{ type: "deleted", id: 3 }`?',
      [
        "Remove note 3 from the array it was given and return that array",
        "Return a new array without note 3",
        "Send a DELETE request to the server",
      ],
      1,
      "Reducers return new state without changing the old, and do nothing else. The request belongs in the handler that dispatched the action.",
    ),
  ),
);
