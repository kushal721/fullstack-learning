import {
  anatomy,
  code,
  diagram,
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

// Memo and performance: what makes a component render, measuring first,
// keeping state close, memo taken apart, why a new function defeats memo
// (step by step), useMemo and useCallback, the React Compiler, long lists,
// the Notes App, mistakes, practice and a recap.
export const memoAndPerformanceModule = moduleLesson(
  "memo-and-performance",
  "Memo and performance",
  50,
  [
    "List what makes a component re-render, and measure before optimising.",
    "Keep state close to where it's used, so fewer components re-render.",
    "Skip re-rendering a child with memo when its props haven't changed.",
    "Keep values and functions the same between renders with useMemo and useCallback.",
    "Explain what the React Compiler does, and handle very long lists.",
  ],

  part(
    "renders",
    "What makes a component render",
    explain(
      "A component re-renders when its state changes, when its parent re-renders, or when a context it reads changes. Re-rendering is usually fast: React only touches the page where the result differs. Slowness comes from heavy work during rendering, or thousands of components rendering on every key press.",
    ),
    reference("Why a component renders", [
      ["Its state changed", "It set state.", "setOpen(true)"],
      ["Its parent rendered", "Even if its props are the same.", "the default"],
      [
        "A context changed",
        "A context it reads has a new value.",
        "useContext(Theme)",
      ],
      [
        "Not: props alone",
        "New props only arrive when the parent renders.",
        "–",
      ],
    ]),
  ),

  part(
    "measure",
    "Measure first",
    explain(
      "Don't guess. The React DevTools Profiler records an interaction and shows which components rendered, how often and how long each took. Fix the slow one you can see, and measure again. Most apps need no optimisation at all.",
    ),
    diagram([
      ["feels slow", "typing lags"],
      ["record it", "React DevTools → Profiler"],
      ["find the cause", "what rendered, and how long"],
      ["fix, re-measure", "one change at a time"],
    ]),
  ),

  part(
    "colocate",
    "Keep state close",
    explain(
      "The cheapest render is the one that doesn't happen. If a search box's text lives in the page component, every key press re-renders the whole page. Move the state down into the component that uses it, and only that component re-renders.",
    ),
    code(
      "jsx",
      "State where it's used",
      [
        "function Dashboard() {",
        "  return (",
        "    <>",
        "      <NoteForm />",
        "      <NoteList />",
        "    </>",
        "  );",
        "}",
        "function NoteForm() {",
        '  const [title, setTitle] = useState("");',
        "  // typing re-renders NoteForm only",
        "}",
      ],
      { 10: "the form's text lives in the form, not in Dashboard" },
    ),
  ),

  part(
    "memo",
    "memo, taken apart",
    explain(
      "Wrap a component in [[react-memo|memo]] and React skips re-rendering it when its parent renders, *if* every prop is the same as last time. It compares each prop with `Object.is`: numbers and text by value, objects, arrays and functions by identity.",
    ),
    anatomy(
      "A memoized component",
      [
        "const NoteCard = memo(function NoteCard({",
        "  note, onDelete }) {",
        "  return <article>{note.title}</article>;",
        "});",
      ],
      [
        ["memo(", "the wrapper", "Remembers the last props and the result."],
        ["function NoteCard", "the component", "Unchanged inside."],
        [
          "note, onDelete",
          "props compared",
          "All the same? Skip. One different? Render.",
        ],
      ],
    ),
  ),

  part(
    "new-function",
    "Why memo sometimes does nothing",
    explain(
      "Functions and objects created during a render are *new* every render, even if they look identical. Pass one to a memoized child and its props always look different. Step through it:",
    ),
    trace(
      "A memo child and an arrow prop",
      [
        "const NoteCard = memo(function NoteCard({",
        "  note, onDelete }) {",
        "  const remove = () => onDelete(note.id);",
        "  return <button onClick={remove}>Delete</button>;",
        "});",
        "function Dashboard({ notes }) {",
        '  const [query, setQuery] = useState("");',
        "  const handleDelete = useCallback((id) => {",
        "    deleteNote(id);",
        "  }, []);",
        "  return notes.map((n) => (",
        "    <NoteCard key={n.id} note={n}",
        "      onDelete={handleDelete} />",
        "  ));",
        "}",
      ],
      [
        {
          line: 7,
          note: "You type in a search box, so `query` changes and `Dashboard` re-renders.",
          vars: [["query", '"m"']],
        },
        {
          line: 13,
          note: "Imagine `onDelete={(id) => deleteNote(id)}` here: a new arrow each render. memo compares it with last render's: different, so every card re-renders anyway.",
          vars: [["onDelete same?", "no"]],
        },
        {
          line: 8,
          note: "`useCallback` returns the *same* function as last render, because its dependency array, `[]`, hasn't changed.",
          vars: [["handleDelete same?", "yes"]],
        },
        {
          line: 12,
          note: "Now `note` is the same object and `onDelete` the same function, so memo skips every card. Only what changed renders.",
          vars: [["cards rendered", "0"]],
        },
      ],
    ),
  ),

  part(
    "use-memo",
    "useMemo and useCallback",
    explain(
      "[[use-memo|useMemo]] keeps a calculated value between renders and recalculates only when its dependencies change: for slow calculations, or objects passed to memo children. [[use-callback|useCallback]] does the same for a function. Both cost a little themselves, so use them where they help.",
    ),
    code(
      "jsx",
      "Remember a value, remember a function",
      [
        "const shown = useMemo(",
        "  () => notes.filter((n) => matches(n, query)),",
        "  [notes, query],",
        ");",
        "",
        "const handleDelete = useCallback(",
        '  (id) => dispatch({ type: "deleted", id }),',
        "  [],",
        ");",
      ],
      {
        2: "only re-run when notes or query change",
        7: "the same function every render",
      },
    ),
    quickCheck(
      'A memoized child gets `style={{ color: "red" }}` from its parent. Does memo skip it when the parent renders?',
      [
        "Yes, the style is the same",
        "No: the object is new each render, so the prop looks changed",
        "Only in production",
      ],
      1,
      '`{ color: "red" }` creates a new object every render. Move it outside the component, or keep it with useMemo.',
    ),
  ),

  part(
    "compiler",
    "The React Compiler",
    explain(
      "The React Compiler is a build step that adds this memoization for you: it works out which values and JSX can be reused and remembers them, without `memo`, `useMemo` or `useCallback` in your code. Where it's set up, write plain components first. It relies on your components following the rules: pure renders and hooks at the top level.",
    ),
  ),

  part(
    "long-lists",
    "Very long lists",
    explain(
      "Ten thousand rows are slow to render and slow to scroll, memo or not. Show fewer: paginate, or load more as the user scrolls. Or use *virtualisation*: only the rows visible on screen are rendered, and they're swapped as you scroll. Libraries like TanStack Virtual do the maths.",
    ),
  ),

  part(
    "notes-app",
    "Performance in the Notes App",
    explain(
      "The Notes App needs no `memo`: it's small, and its state is already close to where it's used. `NoteForm` keeps the title and content itself, so typing a new note re-renders only the form, not `Dashboard` and its cards. Each card keeps its own editing state for the same reason.",
    ),
    inTheNotesApp(
      "`NoteForm` holds its own input state, so typing never re-renders the list of cards.",
      { fileId: "frontend/src/components/NoteForm.jsx" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "memo everywhere, just in case",
      language: "jsx",
      wrong: [
        "export default memo(Button);",
        "export default memo(Input);",
        "// …every component",
      ],
      problem:
        "Extra comparisons on every render, harder code, and new functions or objects as props still defeat it.",
      right: ["// measure, then memo the one slow part"],
      why: "Optimise what the Profiler shows is slow.",
    }),
    mistake({
      title: "Defining a component inside another",
      language: "jsx",
      wrong: [
        "function NoteList() {",
        "  function Row({ note }) { … }",
        "  return notes.map((n) => <Row note={n} />);",
      ],
      problem:
        "Row is a new component on every render, so React throws away the rows and rebuilds them, losing their state and focus.",
      right: ["function Row({ note }) { … }", "function NoteList() { … }"],
      why: "Define components at the top level of a file.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "Did the props change?",
      task: "Write `sameProps(prev, next)` the way memo compares: `true` only if both objects have the same keys and every value is equal by `Object.is`.",
      starter: ["function sameProps(prev, next) {", "", "}"],
      tests: [
        ['sameProps({ a: 1, b: "x" }, { a: 1, b: "x" })', "true"],
        ["sameProps({ a: 1 }, { a: 2 })", "false"],
        ["sameProps({ a: 1 }, { a: 1, b: 2 })", "false"],
        ["sameProps({ onClick: () => {} }, { onClick: () => {} })", "false"],
      ],
      hint: "Compare `Object.keys(prev).length` with next's, then check `Object.keys(prev).every((k) => Object.is(prev[k], next[k]))`.",
      solution: [
        "function sameProps(prev, next) {",
        "  const keys = Object.keys(prev);",
        "  if (keys.length !== Object.keys(next).length) return false;",
        "  return keys.every((k) => Object.is(prev[k], next[k]));",
        "}",
      ],
    }),
    yourTurn({
      title: "Remember the last result",
      task: "Write `memoizeOne(fn)`, which returns a function that calls `fn(x)` but, when called with the same `x` as last time, returns the remembered result instead. That's what `useMemo` does with its dependencies.",
      starter: ["function memoizeOne(fn) {", "", "}"],
      tests: [
        ["memoizeOne((x) => x * 2)(4)", "8"],
        [
          "(() => { let calls = 0; const f = memoizeOne((x) => { calls++; return x; }); f(1); f(1); f(2); return calls; })()",
          "2",
        ],
      ],
      hint: "Keep `hasResult`, `lastX` and `lastResult` outside the returned function. If `hasResult && Object.is(x, lastX)`, return `lastResult`.",
      solution: [
        "function memoizeOne(fn) {",
        "  let hasResult = false, lastX, lastResult;",
        "  return (x) => {",
        "    if (hasResult && Object.is(x, lastX)) return lastResult;",
        "    lastX = x;",
        "    lastResult = fn(x);",
        "    hasResult = true;",
        "    return lastResult;",
        "  };",
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Performance cheat sheet", [
      ["Re-renders", "Own state, parent render, context.", "usually cheap"],
      ["Measure", "React DevTools Profiler.", "before changing anything"],
      [
        "Colocate",
        "State in the component that uses it.",
        "the form owns its text",
      ],
      ["memo", "Skip if props are the same.", "memo(NoteCard)"],
      [
        "useMemo",
        "Remember a calculated value.",
        "useMemo(() => filter(…), [notes, query])",
      ],
      ["useCallback", "Remember a function.", "useCallback(fn, [])"],
      ["New objects", "Defeat memo.", "style={{ … }}, () => …"],
      ["React Compiler", "Memoizes for you.", "a build step"],
      ["Long lists", "Paginate or virtualise.", "render only what's visible"],
    ]),
    quickCheck(
      "Typing in a search box makes the whole page lag. What do you do first?",
      [
        "Wrap every component in memo",
        "Record it in the Profiler and see what renders and how long it takes",
        "Switch to useReducer",
      ],
      1,
      "Measure first. The Profiler often shows a fix like moving state down, or memoizing one expensive part, rather than memo everywhere.",
    ),
  ),
);
