import {
  anatomy,
  code,
  explain,
  inTheNotesApp,
  keyPoints,
  mistake,
  moduleLesson,
  pageYourTurn,
  part,
  quickCheck,
  reference,
  trace,
  yourTurn,
} from "../blocks.js";

// Effects: why rendering can't fetch, useEffect taken apart, the
// dependency array, loading data with loading and error states, late
// responses and cleanup (step by step), Strict Mode's double run, when
// you don't need an effect, the Notes App, mistakes, practice and a recap.
export const effectsModule = moduleLesson(
  "effects",
  "Effects: loading data",
  55,
  [
    "Explain why fetching data or starting a timer belongs in an effect, not in rendering.",
    "Write useEffect with the right dependency array, and say when it runs.",
    "Load data from an API with loading and error states.",
    "Clean up after an effect, and ignore responses that arrive too late.",
    "Recognise when you don't need an effect at all.",
  ],

  part(
    "why",
    "Rendering should only describe",
    explain(
      "React may call a component many times, so rendering should only work out the JSX. Anything that reaches outside, like loading notes from the server, starting a timer or listening to the window, is a *side effect*. Put it in [[react-useeffect|useEffect]]: React runs it after the component is on the screen.",
    ),
    keyPoints(
      "Rendering: calculate JSX from props and state, nothing else.",
      "Event handlers: things caused by a click or a key.",
      "Effects: keeping in sync with something outside React.",
    ),
  ),

  part(
    "anatomy",
    "useEffect, taken apart",
    explain(
      "`useEffect` takes a setup function and a list of the values it uses. The setup can return a cleanup function, which React calls before running the effect again and when the component leaves the screen.",
    ),
    anatomy(
      "An effect with cleanup",
      [
        "useEffect(() => {",
        "  const id = setInterval(tick, 1000);",
        "  return () => clearInterval(id);",
        "}, []);",
      ],
      [
        ["() => {", "setup", "Runs after the component appears on screen."],
        [
          "setInterval(tick, 1000)",
          "the effect",
          "Something outside React: a timer.",
        ],
        [
          "return () => clearInterval(id)",
          "cleanup",
          "Undoes the setup when the component goes.",
        ],
        ["[]", "dependencies", "Empty: set up once, clean up once."],
      ],
    ),
  ),

  part(
    "dependencies",
    "The dependency array",
    explain(
      "The second argument says *when* to run again. React compares each value with the last render's using `Object.is`; if any changed, it cleans up and runs the setup again. List every prop, state value or function from the component that the effect reads.",
    ),
    reference("When an effect runs", [
      [
        "useEffect(fn)",
        "After every render. Rarely what you want.",
        "no array at all",
      ],
      [
        "useEffect(fn, [])",
        "Once, after the first render.",
        "load the page's data",
      ],
      [
        "useEffect(fn, [id])",
        "After the first render, and whenever id changes.",
        "load note id",
      ],
      ["Cleanup", "Before the next run, and on unmount.", "return () => …"],
    ]),
    quickCheck(
      "An effect loads one note and is written `useEffect(load, [])`, but `load` reads the `id` prop. What happens when `id` changes?",
      [
        "It loads the new note",
        "Nothing: the old note stays on screen",
        "React throws an error",
      ],
      1,
      "With `[]` the effect never runs again. Add `id` to the array so a new id loads its note.",
    ),
  ),

  part(
    "loading",
    "Loading data",
    explain(
      "Loading data has three states, and the screen should show each one: still loading, failed, or loaded. Keep each in state, start the request in an effect, and set them when the [[js-fetch|response]] arrives.",
    ),
    code(
      "jsx",
      "Notes from the API",
      [
        "const [notes, setNotes] = useState([]);",
        "const [isLoading, setIsLoading] = useState(true);",
        "const [error, setError] = useState(null);",
        "",
        "useEffect(() => {",
        "  getNotes()",
        "    .then(setNotes)",
        "    .catch((err) => setError(err.message))",
        "    .finally(() => setIsLoading(false));",
        "}, []);",
      ],
      {
        2: "true until the request finishes",
        6: "the request starts after the first render",
        9: "success or failure, loading is over",
        10: "once, when the component appears",
      },
    ),
  ),

  part(
    "late-responses",
    "Late responses, step by step",
    explain(
      "Requests take time, and the user doesn't wait. If they open note 1 and then quickly note 2, note 1's response can arrive *after* note 2's and overwrite it. A cleanup that sets an `ignore` flag fixes that. Step through it:",
    ),
    trace(
      "Switching notes quickly",
      [
        "function NoteView({ id }) {",
        "  const [note, setNote] = useState(null);",
        "  useEffect(() => {",
        "    let ignore = false;",
        "    getNote(id).then((loaded) => {",
        "      if (!ignore) setNote(loaded);",
        "    });",
        "    return () => {",
        "      ignore = true;",
        "    };",
        "  }, [id]);",
        "  if (!note) return <p>Loading…</p>;",
        "  return <h2>{note.title}</h2>;",
        "}",
      ],
      [
        {
          line: 12,
          note: "First render with id 1: no note yet, so it shows Loading.",
          vars: [["id", "1"]],
          output: "Loading…",
        },
        {
          line: 5,
          note: "After the render the effect runs: its own `ignore` is false, and the request for note 1 starts.",
          vars: [
            ["id", "1"],
            ["ignore (1)", "false"],
          ],
        },
        {
          line: 9,
          note: "The user picks note 2. `id` changed, so React first runs the old effect's cleanup: note 1's `ignore` becomes true.",
          vars: [["ignore (1)", "true"]],
        },
        {
          line: 5,
          note: "Then the effect runs again for id 2, with a new `ignore` of its own.",
          vars: [
            ["id", "2"],
            ["ignore (2)", "false"],
          ],
        },
        {
          line: 6,
          note: "Note 1's slow response arrives now. Its `ignore` is true, so it's thrown away.",
          vars: [["ignore (1)", "true"]],
        },
        {
          line: 13,
          note: "Note 2's response arrives, `setNote` runs, and the right note is shown.",
          vars: [["note", "note 2"]],
          output: "<h2>Note two</h2>",
        },
      ],
    ),
  ),

  part(
    "cleanup",
    "Cleaning up",
    explain(
      "Whatever an effect starts, its [[effect-cleanup|cleanup]] should stop: clear a timer, remove a listener, close a connection, ignore a response. Without it, a component that's gone keeps working in the background, and running the effect again starts a second copy.",
    ),
    code(
      "jsx",
      "Listen while on screen",
      [
        "useEffect(() => {",
        "  function onKey(event) {",
        '    if (event.key === "Escape") onClose();',
        "  }",
        '  window.addEventListener("keydown", onKey);',
        '  return () => window.removeEventListener("keydown", onKey);',
        "}, [onClose]);",
      ],
      {
        5: "start listening when the dialog appears",
        6: "stop when it goes, or before listening again",
      },
    ),
  ),

  part(
    "strict-mode",
    "Why effects run twice while developing",
    explain(
      "In development, [[react-strict-mode|Strict Mode]] sets up every effect, cleans it up and sets it up again, straight away. It's a test: if your cleanup is right, running twice changes nothing. If you see two intervals, two listeners or duplicated data, the cleanup is missing. In production effects run once.",
    ),
  ),

  part(
    "not-needed",
    "You might not need an effect",
    explain(
      "Effects are for syncing with things outside React. Two common uses don't need one. A value calculated from props or state is a [[derived-state|derived value]]: just calculate it while rendering. And something that happens because the user did something, like sending a form, belongs in that event's handler.",
    ),
    mistake({
      title: "An effect to keep state in step",
      language: "jsx",
      wrong: [
        "const [count, setCount] = useState(0);",
        "useEffect(() => {",
        "  setCount(notes.length);",
        "}, [notes]);",
      ],
      problem:
        "An extra render every time, and for one render the count is wrong.",
      right: ["const count = notes.length;"],
      why: "Calculate derived values while rendering.",
    }),
  ),

  part(
    "notes-app",
    "Effects in the Notes App",
    explain(
      "When the Notes App starts, `App` doesn't know whether you're logged in. An effect with `[]` asks the API once, after the first render shows “Loading…”, and then sets the user and the page. The notes themselves are loaded by an effect too, with the `ignore` cleanup from this module.",
    ),
    inTheNotesApp(
      "`App` uses an effect to ask the API who is logged in, once, when the app starts.",
      { fileId: "frontend/src/App.jsx" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "A missing dependency",
      language: "jsx",
      wrong: ["useEffect(() => {", "  getNote(id).then(setNote);", "}, []);"],
      problem:
        "The effect uses `id` but never re-runs, so changing `id` shows the old note.",
      right: ["useEffect(() => {", "  getNote(id).then(setNote);", "}, [id]);"],
      why: "List every value from the component that the effect reads. The linter can check this.",
    }),
    mistake({
      title: "Setting state with no dependency array",
      language: "jsx",
      wrong: ["useEffect(() => {", "  getNotes().then(setNotes);", "});"],
      problem:
        "Runs after every render. Setting state renders again, which runs it again: an endless loop of requests.",
      right: ["useEffect(() => {", "  getNotes().then(setNotes);", "}, []);"],
      why: "Always give an effect its dependency array.",
    }),
    mistake({
      title: "An async setup function",
      language: "jsx",
      wrong: [
        "useEffect(async () => {",
        "  setNotes(await getNotes());",
        "}, []);",
      ],
      problem:
        "An async function returns a promise, but React expects the cleanup function or nothing.",
      right: [
        "useEffect(() => {",
        "  async function load() { setNotes(await getNotes()); }",
        "  load();",
        "}, []);",
      ],
      why: "Define an async function inside the effect and call it.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "Did a dependency change?",
      task: "Write `depsChanged(prev, next)` the way React checks an effect's array: `true` if any item differs by `Object.is`, otherwise `false`. Both arrays have the same length.",
      starter: ["function depsChanged(prev, next) {", "", "}"],
      tests: [
        ['depsChanged([1, "a"], [1, "a"])', "false"],
        ["depsChanged([1], [2])", "true"],
        ["depsChanged([{}], [{}])", "true"],
      ],
      hint: "`return prev.some((value, i) => !Object.is(value, next[i]));` Two `{}` are different objects, so they count as changed.",
      solution: [
        "function depsChanged(prev, next) {",
        "  return prev.some((value, i) => !Object.is(value, next[i]));",
        "}",
      ],
    }),
    pageYourTurn({
      title: "Set up, then clean up",
      task: "`effect()` adds a click listener, like a `useEffect` setup. Make it return a cleanup function that removes the listener. Close calls it, after which clicks shouldn't count.",
      starter: [
        '<button id="area">Click me</button>',
        '<button id="close">Close</button>',
        '<p id="clicks">0</p>',
        "<script>",
        "  let clicks = 0;",
        "  function handle() {",
        '    document.querySelector("#clicks").textContent = ++clicks;',
        "  }",
        "  function effect() {",
        '    const area = document.querySelector("#area");',
        '    area.addEventListener("click", handle);',
        "  }",
        "  const cleanup = effect();",
        '  document.querySelector("#close").onclick = () => cleanup();',
        "</script>",
      ],
      checks: [
        { kind: "click", label: "Click the area", selector: "#area" },
        {
          kind: "text",
          label: "One click counted",
          selector: "#clicks",
          text: "1",
        },
        { kind: "click", label: "Close", selector: "#close" },
        { kind: "click", label: "Click the area again", selector: "#area" },
        { kind: "text", label: "Still one", selector: "#clicks", text: "1" },
      ],
      hint: 'At the end of `effect`: `return () => area.removeEventListener("click", handle);`',
      solution: [
        '<button id="area">Click me</button>',
        '<button id="close">Close</button>',
        '<p id="clicks">0</p>',
        "<script>",
        "  let clicks = 0;",
        "  function handle() {",
        '    document.querySelector("#clicks").textContent = ++clicks;',
        "  }",
        "  function effect() {",
        '    const area = document.querySelector("#area");',
        '    area.addEventListener("click", handle);',
        '    return () => area.removeEventListener("click", handle);',
        "  }",
        "  const cleanup = effect();",
        '  document.querySelector("#close").onclick = () => cleanup();',
        "</script>",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Effects cheat sheet", [
      [
        "useEffect",
        "Sync with something outside React.",
        "useEffect(setup, deps)",
      ],
      ["[]", "Run once after the first render.", "load the page's data"],
      ["[a, b]", "Run again when a or b changes.", "[id]"],
      ["Cleanup", "Undo the setup.", "return () => clearInterval(id)"],
      ["ignore flag", "Drop late responses.", "if (!ignore) setNote(x)"],
      ["Loading states", "Loading, error, data.", "isLoading, error, notes"],
      [
        "Strict Mode",
        "Runs effects twice in development.",
        "tests your cleanup",
      ],
      [
        "Not needed",
        "Derived values and event work.",
        "calculate, or use the handler",
      ],
    ]),
    quickCheck(
      "Where should the code that sends a new note to the server go?",
      [
        "In an effect that watches the form's state",
        "In the form's submit handler",
        "In the component body, while rendering",
      ],
      1,
      "Sending is caused by the user submitting, so it belongs in that event's handler. Effects are for staying in sync, not for reacting to clicks.",
    ),
  ),
);
