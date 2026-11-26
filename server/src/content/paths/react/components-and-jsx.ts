import {
  anatomy,
  code,
  diagram,
  explain,
  inTheNotesApp,
  mistake,
  moduleLesson,
  pageYourTurn,
  part,
  quickCheck,
  reference,
  trace,
  yourTurn,
} from "../blocks.js";

// Components and JSX: splitting a screen into components, defining and
// using one, a JSX element taken apart, JSX's rules, curly braces and
// conditions, fragments, a render of a component tree step by step, the
// Notes App, mistakes, practice and a recap.
export const componentsAndJsxModule = moduleLesson(
  "components-and-jsx",
  "Components and JSX",
  45,
  [
    "Split a screen into components, and build bigger ones from smaller ones.",
    "Write a component, export it from its file and use it like a tag.",
    "Write JSX correctly: className, camelCase, closed tags and one parent.",
    "Put values and conditions in JSX with curly braces, && and the ternary.",
    "Follow how React renders a tree of components into HTML.",
  ],

  part(
    "split",
    "A screen made of components",
    explain(
      "Look at any app and you'll see repeated, nameable pieces: a navigation bar, a form, a card per note. Each becomes a [[react-component|component]]. Big components are made of small ones, so the whole screen is a tree with `App` at the top. You build and fix one piece at a time, and reuse pieces like a button everywhere.",
    ),
    diagram([
      ["App", "the whole screen"],
      ["Navbar · Dashboard", "its children"],
      ["NoteForm · NoteCard", "inside Dashboard"],
      ["Button · Input", "used by all of them"],
    ]),
  ),

  part(
    "define-and-use",
    "Writing and using a component",
    explain(
      "A component is a function whose name starts with a capital letter and returns [[jsx|JSX]]. Each usually gets its own file and is exported, so others can import it. You use it like a tag: `<NoteCard />`. React sees the capital letter and calls your function to find out what to draw.",
    ),
    code(
      "jsx",
      "Two files: define, then use",
      [
        "// NoteCard.jsx",
        "export default function NoteCard() {",
        "  return <article>A note</article>;",
        "}",
        "",
        "// Dashboard.jsx",
        'import NoteCard from "./NoteCard.jsx";',
        "",
        "export default function Dashboard() {",
        "  return <NoteCard />;",
        "}",
      ],
      {
        2: "capital letter, returns JSX, exported",
        7: "bring it into the file that uses it",
        10: "used like a tag; React calls NoteCard()",
      },
    ),
  ),

  part(
    "jsx-element",
    "A JSX element, taken apart",
    explain(
      "JSX looks like HTML but is JavaScript underneath, so a few things change. `class` is a JavaScript word, so it's `className`. Values that aren't plain text go in curly braces. And every tag must be closed, including ones HTML lets you leave open.",
    ),
    anatomy(
      "One element",
      [
        '<img className="avatar"',
        "  src={user.photoUrl}",
        "  alt={user.name} />",
      ],
      [
        [
          "className",
          "class",
          "`class` is reserved in JavaScript, so JSX uses className.",
        ],
        ['"avatar"', "text value", "Plain text goes in quotes, like HTML."],
        ["{user.photoUrl}", "JS value", "Anything else goes in curly braces."],
        ["/>", "closed", "Every tag must be closed, even `img` and `input`."],
      ],
    ),
  ),

  part(
    "rules",
    "JSX's rules",
    explain(
      "Most of JSX's rules come from it being JavaScript. A component returns one value, so it needs one parent element (or a [[react-fragment|fragment]]). Attribute names are camelCase. Comments go inside curly braces.",
    ),
    reference("JSX compared with HTML", [
      ["className", "Instead of class.", '<p className="error">'],
      ["htmlFor", "Instead of for, on a label.", '<label htmlFor="title">'],
      [
        "camelCase",
        "Events and most attributes.",
        "onClick, maxLength, tabIndex",
      ],
      ["Closed tags", "Every element, even empty ones.", "<input />, <br />"],
      ["One parent", "Return one element or a fragment.", "<>…</>"],
      ["style", "An object, not a string.", 'style={{ color: "red" }}'],
      ["Comments", "Inside curly braces.", "{/* like this */}"],
    ]),
  ),

  part(
    "curly-braces",
    "Curly braces and conditions",
    explain(
      "Curly braces hold any JavaScript *expression*: a variable, `note.title.toUpperCase()`, a sum. Statements like `if` don't fit, so showing something only sometimes, [[conditional-rendering|conditional rendering]], uses `&&` (“show this if…”) or the ternary `? :` (“this or that”).",
    ),
    code(
      "jsx",
      "Three ways to decide what to show",
      [
        "<p>{notes.length} notes</p>",
        "",
        '{error && <p className="error">{error}</p>}',
        "",
        "{isSaving ? <p>Saving…</p> : <button>Save</button>}",
      ],
      {
        1: "a value",
        3: "only when error is set: otherwise nothing",
        5: "one or the other, never both",
      },
    ),
    quickCheck(
      "`notes` is empty. What does `{notes.length && <p>You have notes</p>}` show?",
      ["Nothing", "A `0`", "“You have notes”"],
      1,
      "`0 && …` is `0`, and React shows numbers. Write a real true-or-false test: `notes.length > 0 && …`.",
    ),
  ),

  part(
    "fragments",
    "One parent, or a fragment",
    explain(
      "A component can't return two siblings side by side, any more than a function can return two values. Wrap them in a parent. If an extra `<div>` would break your layout or HTML, use a [[react-fragment|fragment]], `<>…</>`: it groups them without adding an element to the page.",
    ),
    code(
      "jsx",
      "Two siblings, no extra element",
      [
        "function App() {",
        "  return (",
        "    <>",
        "      <Navbar />",
        "      <Dashboard />",
        "    </>",
        "  );",
        "}",
      ],
      {
        2: "brackets let JSX span several lines",
        3: "a fragment: grouped, but not in the page",
      },
    ),
  ),

  part(
    "tree",
    "Rendering a tree, step by step",
    explain(
      "When React renders `App`, it calls `App`, finds more components in what it returned, calls those too, and keeps going until only HTML elements are left. Step through it:",
    ),
    trace(
      "React renders <App />",
      [
        "function Title() {",
        "  return <h1>Notes</h1>;",
        "}",
        "function NoteCard({ title }) {",
        "  return <article>{title}</article>;",
        "}",
        "function App() {",
        "  return (",
        "    <main>",
        "      <Title />",
        '      <NoteCard title="Milk" />',
        '      <NoteCard title="Eggs" />',
        "    </main>",
        "  );",
        "}",
      ],
      [
        {
          line: 7,
          note: "React calls `App`. It returns a `<main>` containing three components it hasn't drawn yet.",
          vars: [
            ["calling", "App"],
            ["still to draw", "Title, NoteCard ×2"],
          ],
        },
        {
          line: 2,
          note: "Capital T: `Title` is a component, so React calls it. It returns plain HTML, an `<h1>`.",
          vars: [
            ["calling", "Title"],
            ["still to draw", "NoteCard ×2"],
          ],
        },
        {
          line: 5,
          note: 'React calls `NoteCard` with `{ title: "Milk" }`, which gives an `<article>` saying Milk.',
          vars: [
            ["calling", "NoteCard"],
            ["title", '"Milk"'],
          ],
        },
        {
          line: 5,
          note: "The same function again, with different props. Same component, different result.",
          vars: [
            ["calling", "NoteCard"],
            ["title", '"Eggs"'],
          ],
        },
        {
          line: 13,
          note: "Only HTML elements are left, so React puts them in the page.",
          vars: [["still to draw", "nothing"]],
          output:
            "<main><h1>Notes</h1><article>Milk</article><article>Eggs</article></main>",
        },
      ],
    ),
  ),

  part(
    "notes-app",
    "Components in the Notes App",
    explain(
      "`Dashboard.jsx` is built from other components: a `NoteForm` at the top and a `NoteCard` for each note. Both use the shared `Button` and `Input`. It shows conditional rendering too: “Loading notes…” only while loading, an error only when there is one, and “No notes yet” only for an empty list.",
    ),
    inTheNotesApp(
      "`Dashboard` puts `NoteForm` and the `NoteCard`s together, and uses `&&` to show messages only when they apply.",
      { fileId: "frontend/src/pages/Dashboard.jsx" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "A lowercase component name",
      language: "jsx",
      wrong: ["function noteCard() { … }", "<noteCard />"],
      problem:
        "React treats lowercase tags as HTML elements, so it puts an unknown `<notecard>` element in the page and never calls your function.",
      right: ["function NoteCard() { … }", "<NoteCard />"],
      why: "Components always start with a capital letter.",
    }),
    mistake({
      title: "Two elements side by side",
      language: "jsx",
      wrong: ["return (", "  <h1>Notes</h1>", "  <p>3 notes</p>", ");"],
      problem: "A syntax error: the function would be returning two values.",
      right: [
        "return (",
        "  <>",
        "    <h1>Notes</h1>",
        "    <p>3 notes</p>",
        "  </>",
        ");",
      ],
      why: "Wrap siblings in one parent, or a fragment if you don't want an extra element.",
    }),
    mistake({
      title: "A number before &&",
      language: "jsx",
      wrong: ["{notes.length && <NoteList notes={notes} />}"],
      problem: "With no notes, `0` is shown on the page.",
      right: ["{notes.length > 0 && <NoteList notes={notes} />}"],
      why: "Put a real true-or-false test before `&&`.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "This or that",
      task: 'Components choose what to return. Write `SaveButton({ isSaving })` to return the text `"Saving…"` while `isSaving` is true and `"Save"` otherwise. Use the ternary operator.',
      starter: ["function SaveButton({ isSaving }) {", "", "}"],
      tests: [
        ["SaveButton({ isSaving: true })", '"Saving…"'],
        ["SaveButton({ isSaving: false })", '"Save"'],
      ],
      hint: '`return isSaving ? "Saving…" : "Save";`',
      solution: [
        "function SaveButton({ isSaving }) {",
        '  return isSaving ? "Saving…" : "Save";',
        "}",
      ],
    }),
    pageYourTurn({
      title: "Build the screen from parts",
      task: 'Here components are plain functions returning HTML text. Make `NoteCard(note)` return `<article class="note-card"><h2>…</h2></article>` with the note\'s title in the `h2`. `App` already uses it once per note.',
      starter: [
        '<div id="root"></div>',
        "<script>",
        '  const notes = [{ title: "Milk" }, { title: "Call Sam" }];',
        "  function NoteCard(note) {",
        '    return "";',
        "  }",
        "  function App() {",
        '    return "<h1>Notes</h1>" + notes.map(NoteCard).join("");',
        "  }",
        '  document.querySelector("#root").innerHTML = App();',
        "</script>",
      ],
      checks: [
        {
          kind: "count",
          label: "Two cards",
          selector: "#root .note-card",
          count: 2,
        },
        {
          kind: "text",
          label: "The first is Milk",
          selector: ".note-card h2",
          text: "Milk",
        },
        {
          kind: "text",
          label: "The last is Call Sam",
          selector: ".note-card:last-child h2",
          text: "Call Sam",
        },
      ],
      hint: 'Use a template literal: return `` `<article class="note-card"><h2>${note.title}</h2></article>` ``.',
      solution: [
        '<div id="root"></div>',
        "<script>",
        '  const notes = [{ title: "Milk" }, { title: "Call Sam" }];',
        "  function NoteCard(note) {",
        '    return `<article class="note-card"><h2>${note.title}</h2></article>`;',
        "  }",
        "  function App() {",
        '    return "<h1>Notes</h1>" + notes.map(NoteCard).join("");',
        "  }",
        '  document.querySelector("#root").innerHTML = App();',
        "</script>",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Components and JSX cheat sheet", [
      [
        "Component",
        "Capitalised function returning JSX.",
        "function NoteCard() { … }",
      ],
      ["Use it", "Like a tag.", "<NoteCard />"],
      [
        "Export, import",
        "One component per file.",
        'import NoteCard from "./NoteCard.jsx"',
      ],
      ["{ }", "Any JavaScript expression.", "{note.title}"],
      ["&&", "Show only if true.", "{error && <p>{error}</p>}"],
      ["? :", "One or the other.", "{ok ? <Done /> : <Retry />}"],
      ["Fragment", "Group without an element.", "<>…</>"],
      ["className", "The class attribute.", '<p className="error">'],
    ]),
    quickCheck(
      "Which of these does React call as a component?",
      ["`<section />`", "`<NoteList />`", "`<notelist />`"],
      1,
      "Only names starting with a capital letter are components. Lowercase tags are treated as HTML elements.",
    ),
  ),
);
