import type { Concept } from "@fsl/shared";

export const jsx: Concept = {
  id: "jsx",
  slug: "jsx",
  title: "JSX",
  topicId: "react",
  summary:
    "JSX is an HTML-like syntax for writing React UI inside JavaScript, which a build tool turns into plain JavaScript function calls.",
  basics: [
    "HTML describes a page with tags such as `<h1>` and `<p>`, and attributes such as `class` or `for` that add extra information to a tag.",
    "An expression is any piece of JavaScript that produces a value: `2 + 2`, `note.title`, `notes.length > 0` or a function call. A statement, like an `if` block or a `for` loop, does something but does not produce a value.",
    "Browsers only understand plain JavaScript. A build tool such as Vite reads your source files and translates them into JavaScript the browser can run before sending them.",
  ],
  what: [
    "JSX lets you write tags directly inside JavaScript, like `const heading = <h1>My notes</h1>;`. It looks like HTML but it is really JavaScript, so you can mix in values and logic.",
    "Anything inside curly braces `{ }` is a JavaScript expression whose result is shown on the page, for example `<h2>{note.title}</h2>` or `<p>{notes.length} notes</p>`.",
  ],
  why: [
    "A component needs to describe structure (which elements, in which order) and logic (which data to show, what to hide). JSX keeps both in one readable place instead of building elements step by step.",
    "Because JSX is JavaScript, you can use everything JavaScript offers — variables, `map` for lists, conditions — and mistakes like a missing closing tag are reported when the code is built, before the user sees them.",
  ],
  howItWorks: [
    'During the build, Vite turns every JSX tag into a function call. `<h1 className="title">Hi</h1>` becomes roughly `jsx("h1", { className: "title", children: "Hi" })` — in older setups `React.createElement(...)`.',
    "Calling that function returns a small plain object describing the element: its type, its attributes (called props) and its children. React uses these objects to build and update the real page.",
    "Expressions in `{ }` are evaluated first, and their values become part of the object. Strings and numbers are shown as text; `null`, `undefined`, `true` and `false` show nothing.",
    "A component must return a single value, so all its JSX needs one parent element. When you don't want an extra `div`, wrap it in a fragment, written `<>` and `</>`, which adds nothing to the page.",
  ],
  basicExample: {
    language: "jsx",
    code: `function NotesHeader({ notes, isLoading }) {
  return (
    <>
      <h1 className="page-title">My notes</h1>
      <label htmlFor="search">Search</label>
      <input id="search" />
      {isLoading && <p>Loading...</p>}
      <p>{notes.length === 0 ? "No notes yet" : notes.length + " notes"}</p>
    </>
  );
}`,
    caption:
      "A fragment wraps several elements; className and htmlFor replace class and for; && shows the loading text only while loading; the ternary picks one of two texts.",
    highlightLines: [3, 4, 5, 7, 8],
  },
  internals: [
    "JSX is not understood by the browser. Vite's React plugin compiles it to calls to the JSX runtime (`jsx()` from `react/jsx-runtime`, imported automatically), which is why you no longer need `import React` at the top of each file.",
    "JSX attributes become keys of a JavaScript object. That is why `class` and `for`, which are reserved words in JavaScript, are written `className` and `htmlFor`, and why attribute names use camelCase like `onClick`.",
    "Each JSX tag is one function call, and a function returns one value. Two sibling tags at the top level would be two values, so they must be wrapped in a parent element or a fragment.",
    "Text inside `{ }` is escaped automatically: if a note's title contains `<script>`, React shows it as text instead of running it, which protects against injected code.",
  ],
  howToCreate: [
    {
      text: "Create a React project with Vite in a terminal, then start it.",
      code: {
        language: "bash",
        code: `npm create vite@latest my-notes -- --template react
cd my-notes
npm install
npm run dev`,
      },
    },
    {
      text: "Replace the contents of `src/App.jsx` with a component that uses expressions, `className`, a self-closing tag and both kinds of conditional rendering.",
      code: {
        language: "jsx",
        fileName: "src/App.jsx",
        code: `const notes = ["Buy milk", "Call Sam"];
const isLoggedIn = true;

export default function App() {
  return (
    <>
      <h1 className="title">My notes</h1>
      <input placeholder="Search notes" />
      {isLoggedIn && <p>Welcome back!</p>}
      <p>{notes.length > 0 ? notes.length + " notes" : "No notes yet"}</p>
      <ul>
        {notes.map((note) => (
          <li key={note}>{note.toUpperCase()}</li>
        ))}
      </ul>
    </>
  );
}`,
      },
    },
    {
      text: "Open http://localhost:5173. You see the heading, the input, the welcome text, the count and both notes in capitals.",
    },
    {
      text: "Change `isLoggedIn` to `false` and `notes` to `[]` and save. The welcome text disappears and the text changes to No notes yet — the page follows the values in the code.",
    },
  ],
  whereUsed: [
    "Every React component returns JSX to describe its part of the page.",
    "Lists are rendered by using `map` inside `{ }` to turn each item of an array into a JSX element.",
    "Conditional UI — loading messages, error messages, empty states — uses `&&` or the ternary operator inside JSX.",
  ],
  connectsTo: [
    "Components, which are functions that return JSX.",
    "Props: the attributes you write on a component tag in JSX become its props.",
    "Event handlers such as `onClick`, written as JSX attributes.",
    "Vite, which compiles JSX into plain JavaScript the browser can run.",
  ],
  projectUsage: [
    {
      explanation:
        '`Button.jsx` uses `className={"button button-" + variant}` to build the CSS class from a prop, and puts `{children}` between the button tags to show its label.',
      fileId: "frontend/src/components/Button.jsx",
      match: "<button className={`button button-${variant}`} {...props}>",
    },
    {
      explanation:
        "`NoteCard.jsx` shows a note with `{note.title}` and `{note.content}` inside an `article` element.",
      fileId: "frontend/src/components/NoteCard.jsx",
      match: "<h2>{note.title}</h2>",
    },
    {
      explanation:
        "`Dashboard.jsx` uses `notes.map((note) => <NoteCard key={note.id} note={note} onDelete={removeNote} />)` inside `{ }` to render one card per note, and conditions with `&&` to show the loading and error messages.",
      fileId: "frontend/src/pages/Dashboard.jsx",
      match: "{notes.map((note) => (",
    },
  ],
  commonMistakes: [
    "Writing `class` and `for` like in HTML. React warns about them; use `className` and `htmlFor`.",
    "Returning two sibling elements without a parent, which is a syntax error. Wrap them in a `div` or a fragment `<>...</>`.",
    "Writing `{notes.length && <List />}`: when the length is `0`, React shows a stray 0 on the page. Use a real true/false value: `{notes.length > 0 && <List />}`.",
    "Putting a statement like `if` or `for` inside `{ }`. Only expressions are allowed; use `&&`, a ternary or `map`, or compute the value in a variable before the `return`.",
  ],
  relatedConcepts: [
    "react-component",
    "react-props",
    "react-lists-keys",
    "html-element",
  ],
  relatedFiles: [],
  relatedBuildSteps: [],
};
