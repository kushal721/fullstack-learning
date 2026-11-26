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

// Custom hooks: repeated logic, a hook taken apart, extracting one, shared
// logic but separate state (step by step), the rules for hooks, useful
// hooks to write, what a hook returns, the Notes App, mistakes, practice
// and a recap.
export const customHooksModule = moduleLesson(
  "custom-hooks",
  "Custom hooks: reusing logic",
  45,
  [
    "Spot state and effect logic that's repeated or crowding a component.",
    "Extract it into a custom hook whose name starts with use.",
    "Explain that each component calling a hook gets its own state.",
    "Decide what a hook should take and return.",
    "Read the Notes App's useNotes hook and say what each part does.",
  ],

  part(
    "why",
    "When components grow logic",
    explain(
      "A component that loads notes needs state for the notes, for loading and for errors, an effect with cleanup, and functions to add and remove. Put all that in the component and the JSX gets lost; need it in two components and you copy it. A [[react-custom-hook|custom hook]] moves the logic into a function of its own.",
    ),
    keyPoints(
      "Components: decide what to show.",
      "Custom hooks: hold the state and effects behind it.",
      "One hook, used by any component that needs it.",
    ),
  ),

  part(
    "anatomy",
    "A custom hook, taken apart",
    explain(
      "A custom hook is an ordinary function whose name starts with `use` and which calls other hooks. It can take arguments and return whatever its callers need.",
    ),
    anatomy(
      "useToggle",
      [
        "function useToggle(start = false) {",
        "  const [on, setOn] = useState(start);",
        "  return [on, () => setOn(!on)];",
        "}",
      ],
      [
        [
          "useToggle",
          "the name",
          "Starts with use: React's tools then check the rules of hooks.",
        ],
        [
          "start = false",
          "argument",
          "Like any function: the caller can configure it.",
        ],
        [
          "useState(start)",
          "other hooks",
          "A hook can call useState, useEffect or other custom hooks.",
        ],
        [
          "return [on, () => setOn(!on)]",
          "returns",
          "What callers need: the value and a way to flip it.",
        ],
      ],
    ),
  ),

  part(
    "extract",
    "Extracting a hook",
    explain(
      "Take the state and effects out of the component, put them in a `use…` function, and return what the component used. The component then reads like a description of the screen.",
    ),
    code(
      "jsx",
      "After: the component only shows things",
      [
        "function useNote(id) {",
        "  const [note, setNote] = useState(null);",
        "  useEffect(() => {",
        "    getNote(id).then(setNote);",
        "  }, [id]);",
        "  return note;",
        "}",
        "",
        "function NoteView({ id }) {",
        "  const note = useNote(id);",
        "  return note ? <h1>{note.title}</h1> : <p>Loading…</p>;",
        "}",
      ],
      {
        1: "the logic, in one place",
        6: "return just what callers need",
        10: "one line replaces the state and the effect",
      },
    ),
  ),

  part(
    "separate-state",
    "Shared logic, separate state",
    explain(
      "Two components calling the same hook don't share data. Each call is like writing that `useState` in the component itself, so each gets its own. Step through two toggles:",
    ),
    trace(
      "Two menus, one hook",
      [
        "function useToggle(start = false) {",
        "  const [on, setOn] = useState(start);",
        "  return [on, () => setOn(!on)];",
        "}",
        "function Menu({ label }) {",
        "  const [open, toggle] = useToggle();",
        "  return (",
        "    <button onClick={toggle}>",
        '      {label}: {open ? "open" : "shut"}',
        "    </button>",
        "  );",
        "}",
        '<Menu label="File" />',
        '<Menu label="Edit" />',
      ],
      [
        {
          line: 6,
          note: "File's Menu calls `useToggle`, and its `useState` gets a slot belonging to File.",
          vars: [
            ["File: on", "false"],
            ["Edit: on", "–"],
          ],
        },
        {
          line: 6,
          note: "Edit's Menu calls the same function, but its `useState` is Edit's own.",
          vars: [
            ["File: on", "false"],
            ["Edit: on", "false"],
          ],
          output: "[File: shut] [Edit: shut]",
        },
        {
          line: 3,
          note: "Click File. Its toggle sets File's state only.",
          vars: [
            ["File: on", "true"],
            ["Edit: on", "false"],
          ],
        },
        {
          line: 9,
          note: "Only File re-renders. Same hook, separate state. To share state, lift it up or use context.",
          output: "[File: open] [Edit: shut]",
        },
      ],
    ),
  ),

  part(
    "rules",
    "The rules still apply",
    explain(
      "A custom hook runs inside the component that calls it, so the [[react-how-hooks-work|rules of hooks]] apply to it too: call it at the top level of a component or of another hook, never in a condition or a loop, and never from an ordinary function. The `use` prefix is what lets the linter check this.",
    ),
    quickCheck(
      "Two components both call `useNotes()`. One adds a note. Does the other see it?",
      [
        "Yes, they share the hook's state",
        "No: each call has its own state",
        "Only if they're siblings",
      ],
      1,
      "Hooks share logic, not state. For shared data, lift the hook's call up to a common parent, or put it in context.",
    ),
  ),

  part(
    "examples",
    "Hooks worth writing",
    explain(
      "Good custom hooks have a clear job and a name that says it. Many apps grow a few like these; React Router's `useParams` and `useNavigate` are custom hooks too.",
    ),
    reference("Typical custom hooks", [
      [
        "useNotes()",
        "Load, add, change and remove notes.",
        "{ notes, isLoading, addNote }",
      ],
      ["useToggle(start)", "A true/false with a flip.", "[open, toggle]"],
      [
        "useLocalStorage(key, start)",
        "State saved in the browser.",
        "[theme, setTheme]",
      ],
      [
        "useDebounce(value, ms)",
        "A value that waits for typing to pause.",
        "search after 300 ms",
      ],
      ["useOnlineStatus()", "Whether the browser is online.", "true / false"],
      ["useAuth()", "The current user, from context.", "{ user, logout }"],
    ]),
  ),

  part(
    "returning",
    "What should a hook return?",
    explain(
      "Return an array, like `useState`, when there are two things and callers will name them: `const [open, toggle] = useToggle()`. Return an object when there are more, so callers take what they need by name: `const { notes, isLoading } = useNotes()`.",
    ),
    code(
      "jsx",
      "Array or object",
      [
        "const [isOpen, toggleMenu] = useToggle();",
        "const [isDark, toggleTheme] = useToggle(true);",
        "",
        "const { notes, error, addNote } = useNotes();",
      ],
      {
        1: "an array: the caller picks the names",
        4: "an object: take only what you need",
      },
    ),
  ),

  part(
    "notes-app",
    "The Notes App's useNotes",
    explain(
      "`useNotes` owns the list: `notes`, `isLoading` and `error` in state, an effect that loads once and ignores a late response, and `addNote`, `replaceNote` and `removeNote`, which all set new arrays. `Dashboard` calls it once and passes the pieces down, so the component is almost all JSX.",
    ),
    inTheNotesApp(
      "`useNotes` holds the notes' state, the loading effect and the functions that change the list.",
      { fileId: "frontend/src/hooks/useNotes.js" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "A name without use",
      language: "jsx",
      wrong: [
        "function getNotes() {",
        "  const [notes, setNotes] = useState([]);",
      ],
      problem:
        "It's a hook, but nothing says so: the linter can't check it's called correctly, and readers expect a plain function.",
      right: [
        "function useNotes() {",
        "  const [notes, setNotes] = useState([]);",
      ],
      why: "Any function that calls hooks must start with use.",
    }),
    mistake({
      title: "Calling a hook conditionally",
      language: "jsx",
      wrong: ["if (isLoggedIn) {", "  const { notes } = useNotes();", "}"],
      problem:
        "The hooks' order changes between renders, so React mixes up their state.",
      right: [
        "const { notes } = useNotes();",
        "if (!isLoggedIn) return <Login />;",
      ],
      why: "Call every hook, every render, before any early return.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "Write useToggle",
      task: "The starter has a tiny stand-in for React's `useState` and `render`. Write `useToggle(start = false)` to return `[on, toggle]`, where calling `toggle` flips the stored value.",
      starter: [
        "const slots = [];",
        "let next = 0;",
        "function useState(start) {",
        "  const n = next++;",
        "  if (!(n in slots)) slots[n] = start;",
        "  return [slots[n], (value) => (slots[n] = value)];",
        "}",
        "const render = (component) => ((next = 0), component());",
        "",
        "function useToggle(start = false) {",
        "",
        "}",
      ],
      tests: [
        [
          "(() => { slots.length = 0; return render(() => useToggle()[0]); })()",
          "false",
        ],
        [
          "(() => { slots.length = 0; return render(() => useToggle(true)[0]); })()",
          "true",
        ],
        [
          "(() => { slots.length = 0; render(() => useToggle()[1]()); return render(() => useToggle()[0]); })()",
          "true",
        ],
        [
          "(() => { slots.length = 0; render(() => useToggle()[1]()); render(() => useToggle()[1]()); return render(() => useToggle()[0]); })()",
          "false",
        ],
      ],
      hint: "`const [on, setOn] = useState(start);` then `return [on, () => setOn(!on)];`",
      solution: [
        "const slots = [];",
        "let next = 0;",
        "function useState(start) {",
        "  const n = next++;",
        "  if (!(n in slots)) slots[n] = start;",
        "  return [slots[n], (value) => (slots[n] = value)];",
        "}",
        "const render = (component) => ((next = 0), component());",
        "",
        "function useToggle(start = false) {",
        "  const [on, setOn] = useState(start);",
        "  return [on, () => setOn(!on)];",
        "}",
      ],
    }),
    pageYourTurn({
      title: "Same logic, own state",
      task: "`useCounter(button)` is called for two buttons. Give each call its own count: on each click add one and show it in that button's `span`.",
      starter: [
        '<button id="a">A: <span>0</span></button>',
        '<button id="b">B: <span>0</span></button>',
        "<script>",
        "  function useCounter(button) {",
        "",
        "  }",
        '  useCounter(document.querySelector("#a"));',
        '  useCounter(document.querySelector("#b"));',
        "</script>",
      ],
      checks: [
        { kind: "click", label: "Click A", selector: "#a" },
        { kind: "click", label: "Click A again", selector: "#a" },
        { kind: "click", label: "Click B", selector: "#b" },
        { kind: "text", label: "A counted 2", selector: "#a span", text: "2" },
        { kind: "text", label: "B counted 1", selector: "#b span", text: "1" },
      ],
      hint: 'Inside: `let count = 0;` then a click listener on `button` that does `count++` and sets `button.querySelector("span").textContent`.',
      solution: [
        '<button id="a">A: <span>0</span></button>',
        '<button id="b">B: <span>0</span></button>',
        "<script>",
        "  function useCounter(button) {",
        "    let count = 0;",
        '    button.addEventListener("click", () => {',
        '      button.querySelector("span").textContent = ++count;',
        "    });",
        "  }",
        '  useCounter(document.querySelector("#a"));',
        '  useCounter(document.querySelector("#b"));',
        "</script>",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Custom hooks cheat sheet", [
      [
        "Custom hook",
        "A use… function that calls hooks.",
        "function useNotes() { … }",
      ],
      [
        "Why",
        "Reuse logic; keep components about the screen.",
        "const note = useNote(id)",
      ],
      ["Separate state", "Each call has its own.", "two useToggle() calls"],
      ["Share state", "Lift it up, or use context.", "call it in the parent"],
      ["Rules", "Top level, every render.", "no hooks in if or loops"],
      ["Return an array", "Two things the caller names.", "[open, toggle]"],
      [
        "Return an object",
        "Several things, taken by name.",
        "{ notes, error }",
      ],
    ]),
    quickCheck(
      "What makes a function a custom hook?",
      [
        "It's in a file called hooks.js",
        "Its name starts with use and it calls other hooks",
        "It returns JSX",
      ],
      1,
      "A custom hook is a plain function that calls hooks, named use… so React's tools apply the rules of hooks. Functions that return JSX are components.",
    ),
  ),
);
