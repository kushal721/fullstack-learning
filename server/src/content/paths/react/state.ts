import {
  anatomy,
  code,
  explain,
  inTheNotesApp,
  keyPoints,
  mistake,
  moduleLesson,
  part,
  quickCheck,
  reference,
  trace,
  yourTurn,
} from "../blocks.js";

// State: why plain variables aren't enough, useState taken apart, a
// snapshot per render (step by step), updater functions, new arrays and
// objects instead of changed ones, calculating instead of storing, the
// rules of hooks, the Notes App, mistakes, practice and a recap.
export const stateModule = moduleLesson(
  "state",
  "State: data that changes the screen",
  50,
  [
    "Explain why a plain variable can't hold data that changes the screen.",
    "Create state with useState and change it with its setter.",
    "Explain why state is a snapshot, and use an updater function when the next value depends on the last.",
    "Update arrays and objects in state by making new ones, never changing them.",
    "Calculate values from state instead of storing them twice, and follow the rules of hooks.",
  ],

  part(
    "why",
    "Why a variable isn't enough",
    explain(
      "A component is a function, and React calls it again on every render. A local variable starts fresh each time, so it can't remember anything; and changing it doesn't tell React to draw again. [[react-state|State]] solves both: React keeps the value between renders, and changing it triggers a re-render.",
    ),
    keyPoints(
      "Local variables reset on every render.",
      "Changing a variable doesn't re-render.",
      "State is remembered by React, and setting it re-renders.",
    ),
  ),

  part(
    "use-state",
    "useState, taken apart",
    explain(
      "[[react-usestate|useState]] takes a starting value and returns two things in an array, which you destructure and name: the current value, and a function to replace it. By convention the setter is `set` plus the value's name.",
    ),
    anatomy(
      "One piece of state",
      ["const [notes, setNotes] = useState([]);"],
      [
        ["notes", "value", "The current value for this render."],
        [
          "setNotes",
          "setter",
          "Call it with a new value to store it and re-render.",
        ],
        ["useState", "the hook", "Asks React for a remembered value."],
        ["[]", "start", "The value on the very first render only."],
      ],
    ),
    code(
      "jsx",
      "Several pieces of state",
      [
        "function NoteCard({ note }) {",
        "  const [isEditing, setIsEditing] = useState(false);",
        "  const [title, setTitle] = useState(note.title);",
        "  const [error, setError] = useState(null);",
        "  // …",
        "}",
      ],
      {
        2: "a true/false flag",
        3: "text, starting from a prop",
        4: "null until something goes wrong",
      },
    ),
  ),

  part(
    "snapshot",
    "Each render sees a snapshot",
    explain(
      "Setting state doesn't change the variable you already have: it asks React for a re-render, and the *next* render gets the new value. So three `setCount(count + 1)` calls in one click all read the same `count`. When the next value depends on the last, pass an updater function instead: React calls it with the latest value.",
    ),
    trace(
      "Add three, two ways",
      [
        "function Counter() {",
        "  const [count, setCount] = useState(0);",
        "",
        "  function addThree() {",
        "    setCount(count + 1);",
        "    setCount(count + 1);",
        "    setCount(count + 1);",
        "  }",
        "  function addThreeRight() {",
        "    setCount((c) => c + 1);",
        "    setCount((c) => c + 1);",
        "    setCount((c) => c + 1);",
        "  }",
        "  return <p>{count}</p>;",
        "}",
      ],
      [
        {
          line: 2,
          note: "First render: count is 0.",
          vars: [["count", "0"]],
          output: "<p>0</p>",
        },
        {
          line: 5,
          note: "A click runs `addThree`. In this render `count` is 0, so this asks for 0 + 1.",
          vars: [
            ["count", "0"],
            ["queued", "set to 1"],
          ],
        },
        {
          line: 7,
          note: "`count` is still 0 here: setting state didn't change it. All three ask for 1.",
          vars: [
            ["count", "0"],
            ["queued", "set to 1 ×3"],
          ],
        },
        {
          line: 2,
          note: "React re-renders with the last value asked for. One, not three.",
          vars: [["count", "1"]],
          output: "<p>1</p>",
        },
        {
          line: 10,
          note: "Another click, on `addThreeRight`. React calls each function with the latest value: 1 becomes 2.",
          vars: [["c", "1 → 2"]],
        },
        {
          line: 12,
          note: "The second and third get 2 and then 3, so the count really goes up by three.",
          vars: [["c", "3 → 4"]],
        },
        {
          line: 2,
          note: "Next render: count is 4.",
          vars: [["count", "4"]],
          output: "<p>4</p>",
        },
      ],
    ),
  ),

  part(
    "new-values",
    "New arrays and objects, not changed ones",
    explain(
      "React re-renders when you set a *different* value. If you `push` into the array you already have and set it again, it's the same array, so React may skip the update. Always make a new one: an [[immutable-update|immutable update]]. Spread, `filter` and `map` all return new arrays.",
    ),
    reference("Updating arrays and objects in state", [
      ["Add", "Spread into a new array.", "setNotes([note, ...notes])"],
      [
        "Remove",
        "filter returns a new array.",
        "setNotes(notes.filter((n) => n.id !== id))",
      ],
      [
        "Replace one",
        "map, swapping the match.",
        "notes.map((n) => (n.id === u.id ? u : n))",
      ],
      [
        "Change a field",
        "Spread the object, then override.",
        'setForm({ ...form, title: "Milk" })',
      ],
      ["Never", "Changing in place.", "notes.push(note); setNotes(notes)"],
    ]),
    quickCheck(
      "Which line adds `note` to the `notes` state correctly?",
      [
        "`notes.push(note); setNotes(notes);`",
        "`setNotes([...notes, note]);`",
        "`notes[notes.length] = note;`",
      ],
      1,
      "Only the spread makes a new array. The others change the existing one, which React can't see as a change.",
    ),
  ),

  part(
    "calculate",
    "Calculate, don't store twice",
    explain(
      "If a value can be worked out from state or props, work it out while rendering instead of keeping it in more state. [[derived-state|Derived values]] can never get out of step, because they're recalculated every render.",
    ),
    code(
      "jsx",
      "One source of truth",
      [
        "const [notes, setNotes] = useState([]);",
        'const [query, setQuery] = useState("");',
        "",
        "const shown = notes.filter((n) =>",
        "  n.title.includes(query),",
        ");",
        "const count = shown.length;",
      ],
      {
        4: "derived: recalculated on every render",
        7: "no setCount to forget to call",
      },
    ),
  ),

  part(
    "rules",
    "The rules of hooks",
    explain(
      "React remembers each component's state by the order its hooks are called: first `useState`, second `useState`, and so on. So call hooks at the top level of the component, the same ones every render: never inside an `if`, a loop or a nested function. That's the [[react-how-hooks-work|rules of hooks]].",
    ),
    code(
      "jsx",
      "Hooks at the top, every time",
      [
        "function NoteCard({ note }) {",
        "  const [isEditing, setIsEditing] = useState(false);",
        "  if (note.locked) {",
        "    return <p>Locked</p>;",
        "  }",
        "  // ✗ a hook down here is skipped for locked notes",
        "}",
      ],
      {
        2: "every hook before any early return",
        6: "the order would change between renders",
      },
    ),
  ),

  part(
    "notes-app",
    "State in the Notes App",
    explain(
      "`NoteCard` keeps four pieces of state: whether it's being edited, the title and content being typed, and an error. Clicking Edit sets `isEditing` to true and the card renders a form instead of the note; Cancel sets it back. The notes themselves aren't changed by the card: it reports changes to its parent.",
    ),
    inTheNotesApp(
      "`NoteCard` switches between showing and editing a note with one piece of state, `isEditing`.",
      { fileId: "frontend/src/components/NoteCard.jsx" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Changing the array in place",
      language: "jsx",
      wrong: ["notes.push(note);", "setNotes(notes);"],
      problem:
        "It's the same array, so React sees no change and the new note may not appear.",
      right: ["setNotes([note, ...notes]);"],
      why: "Always set a new array or object.",
    }),
    mistake({
      title: "Reading state straight after setting it",
      language: "jsx",
      wrong: ['setTitle("Milk");', "console.log(title); // the old title"],
      problem:
        "`title` is this render's snapshot. The new value arrives on the next render.",
      right: ['const next = "Milk";', "setTitle(next);", "console.log(next);"],
      why: "Keep the new value in a variable if you need it now.",
    }),
    mistake({
      title: "Storing a calculated value",
      language: "jsx",
      wrong: [
        "const [count, setCount] = useState(0);",
        "// must remember to update with notes",
      ],
      problem:
        "Two copies of the truth. Forget one `setCount` and the screen is wrong.",
      right: ["const count = notes.length;"],
      why: "If you can calculate it, calculate it while rendering.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "Add without changing",
      task: "Write `addNote(notes, note)` to return a **new** array with `note` first and the old notes after it. The original array must stay as it was.",
      starter: ["function addNote(notes, note) {", "", "}"],
      tests: [
        ["addNote([{ id: 1 }], { id: 2 })", "[{ id: 2 }, { id: 1 }]"],
        [
          "(() => { const old = [{ id: 1 }]; addNote(old, { id: 2 }); return old.length; })()",
          "1",
        ],
      ],
      hint: "Spread the old array after the new note: `[note, ...notes]`.",
      solution: [
        "function addNote(notes, note) {",
        "  return [note, ...notes];",
        "}",
      ],
    }),
    yourTurn({
      title: "Rename one note",
      task: "Write `renameNote(notes, id, title)` to return a new array where the note with that `id` has the new `title` (and its other fields), and the rest are unchanged.",
      starter: ["function renameNote(notes, id, title) {", "", "}"],
      tests: [
        [
          'renameNote([{ id: 1, title: "a", done: true }, { id: 2, title: "b" }], 1, "Milk")',
          '[{ id: 1, title: "Milk", done: true }, { id: 2, title: "b" }]',
        ],
        [
          'renameNote([{ id: 2, title: "b" }], 5, "x")',
          '[{ id: 2, title: "b" }]',
        ],
      ],
      hint: "`map` the notes. For the match return `{ ...note, title }`; otherwise return the note itself.",
      solution: [
        "function renameNote(notes, id, title) {",
        "  return notes.map((note) =>",
        "    note.id === id ? { ...note, title } : note,",
        "  );",
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("State cheat sheet", [
      [
        "useState",
        "A remembered value and its setter.",
        "const [x, setX] = useState(0)",
      ],
      ["Set", "Store a new value and re-render.", "setX(5)"],
      [
        "Updater",
        "When the next value depends on the last.",
        "setX((x) => x + 1)",
      ],
      [
        "Snapshot",
        "A render's value never changes.",
        "the new value comes next render",
      ],
      ["Add", "New array.", "[item, ...list]"],
      ["Remove", "New array.", "list.filter(…)"],
      ["Change one", "New array, new object.", "list.map(…{ ...item }…)"],
      ["Derived", "Calculate, don't store.", "const count = notes.length"],
      [
        "Rules of hooks",
        "Top level, same order every render.",
        "no hooks in if or loops",
      ],
    ]),
    quickCheck(
      "`count` is 2. A click runs `setCount(count + 1); setCount(count + 1);`. What does the next render show?",
      ["3", "4", "2"],
      0,
      "Both calls read this render's `count`, 2, so both ask for 3. With `setCount((c) => c + 1)` twice, it would be 4.",
    ),
  ),
);
