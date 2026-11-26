import {
  anatomy,
  code,
  diagram,
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

// Why React: the bookkeeping problem of updating a page by hand, describing
// the screen for the data instead, a first component, a render step by
// step, the pieces of React, a project with Vite, the Notes App, mistakes,
// practice and a recap.
export const whyReactModule = moduleLesson(
  "why-react",
  "Why React: the screen as a function of data",
  40,
  [
    "Explain the problem React solves: keeping a page in step with changing data.",
    "Describe the screen for the current data instead of editing elements by hand.",
    "Read a small component and say what it shows for given data.",
    "Follow what happens, step by step, when state changes and React re-renders.",
    "Start a React project with Vite and find where React takes over the page.",
  ],

  part(
    "by-hand",
    "Updating a page by hand",
    explain(
      "With plain JavaScript you change the page yourself: find the element, change its text, add or remove children. That's fine for one counter. In a real app one change touches many places: delete a note and the list, the count and the “no notes yet” message all need updating. Forget one and the page lies.",
    ),
    code(
      "js",
      "deleting a note, by hand",
      [
        "function deleteNote(id) {",
        "  notes = notes.filter((n) => n.id !== id);",
        "  document.querySelector(`#note-${id}`).remove();",
        "  count.textContent = `${notes.length} notes`;",
        "  if (notes.length === 0) {",
        "    empty.hidden = false;",
        "  }",
        "}",
      ],
      {
        2: "the data changes",
        3: "then every place that shows it, by hand",
        5: "easy to forget one of these",
      },
    ),
  ),

  part(
    "describe",
    "Describe the screen, let React update it",
    explain(
      "React turns this around. You write one function that says *what the screen looks like for these notes*. When the data changes, React calls it again and changes the page to match. You never write “remove this element”: you change the data, and the screen follows. The data that can change is called [[react-state|state]].",
    ),
    diagram([
      ["the data", "notes = [ … ]"],
      ["your component", "a function"],
      ["what to show", "JSX"],
      ["the page", "React updates it"],
    ]),
    keyPoints(
      "You describe the screen for the current data.",
      "When the data changes, React works out what to change.",
      "No more finding elements and editing them by hand.",
    ),
  ),

  part(
    "first-component",
    "A first component",
    explain(
      "A [[react-component|component]] is a function that returns what should be on screen, written in [[jsx|JSX]]: HTML-like tags inside JavaScript. Curly braces put a JavaScript value into the markup. React is the [[react-why|library]] that turns what you return into real elements.",
    ),
    anatomy(
      "A component",
      [
        "function NoteCount({ notes }) {",
        "  return <p>{notes.length} notes</p>;",
        "}",
      ],
      [
        [
          "NoteCount",
          "name",
          "Capital letter: that's how React tells components from HTML tags.",
        ],
        [
          "{ notes }",
          "props",
          "Its input: the notes to count, passed in by whoever uses it.",
        ],
        ["<p>", "JSX", "Looks like HTML; becomes a real <p> element."],
        [
          "{notes.length}",
          "a value",
          "Curly braces: any JavaScript expression, shown as text.",
        ],
      ],
    ),
    quickCheck(
      "`NoteCount` gets three notes. What does it show?",
      [
        "`{notes.length} notes`",
        "`3 notes`",
        "Nothing until you call `render`",
      ],
      1,
      "The curly braces are replaced by the value of the expression inside, so the paragraph reads “3 notes”.",
    ),
  ),

  part(
    "render",
    "What happens when state changes",
    explain(
      "Here's a counter. `useState` gives the component a value it remembers, and a function to change it. Step through one click: the handler doesn't touch the page, it only sets new state, and React does the rest. Calling the component again to get fresh JSX is called a **render**.",
    ),
    trace(
      "A counter, one click",
      [
        'import { useState } from "react";',
        "",
        "function Counter() {",
        "  const [count, setCount] = useState(0);",
        "",
        "  function handleClick() {",
        "    setCount(count + 1);",
        "  }",
        "",
        "  return (",
        "    <button onClick={handleClick}>",
        "      {count}",
        "    </button>",
        "  );",
        "}",
      ],
      [
        {
          line: 4,
          note: "First render. React has no value stored for this component yet, so `useState` returns the starting value, 0.",
          vars: [["count", "0"]],
        },
        {
          line: 11,
          note: "The component returns a button showing 0. React creates the real `<button>` in the page.",
          vars: [["count", "0"]],
          output: "page: [0]",
        },
        {
          line: 7,
          note: "You click. React calls `handleClick`, which asks for count to become 1. Nothing on the page has changed yet.",
          vars: [["count", "0 (1 is queued)"]],
        },
        {
          line: 4,
          note: "State changed, so React calls `Counter` again. This time `useState` returns the stored value: 1.",
          vars: [["count", "1"]],
        },
        {
          line: 12,
          note: "The new JSX says 1. React compares it with last time and changes only the button's text.",
          vars: [["count", "1"]],
          output: "page: [1]",
        },
      ],
    ),
  ),

  part(
    "pieces",
    "The pieces of React",
    explain(
      "Everything in this topic is one of a few ideas. Components build the screen; props pass data into them; state is data they remember; events let the user change it; effects talk to the world outside React, like a server. Hooks are the functions, starting with `use`, that give components these powers.",
    ),
    reference("React's main ideas", [
      [
        "Component",
        "A function that returns part of the screen.",
        "function NoteCard() { … }",
      ],
      ["JSX", "HTML-like tags inside JavaScript.", "<h2>{note.title}</h2>"],
      [
        "Props",
        "Inputs from the parent component.",
        "<NoteCard note={note} />",
      ],
      [
        "State",
        "Data the component remembers; changing it re-renders.",
        "useState([])",
      ],
      [
        "Event handler",
        "A function React runs when the user acts.",
        "onClick={remove}",
      ],
      [
        "Effect",
        "Code that syncs with the outside world.",
        "useEffect(load, [])",
      ],
      [
        "Hook",
        "A `use…` function that gives a component a power.",
        "useState, useEffect",
      ],
    ]),
  ),

  part(
    "project",
    "A React project with Vite",
    explain(
      'React code is written in `.jsx` files, which browsers can\'t read. [[vite|Vite]] is the tool that runs a project while you work and translates JSX to JavaScript. `npm create vite@latest` makes a project; `npm run dev` serves it. React takes over one empty element in `index.html`, usually `<div id="root">`.',
    ),
    code(
      "jsx",
      "src/main.jsx: where React starts",
      [
        'import { createRoot } from "react-dom/client";',
        'import App from "./App.jsx";',
        "",
        'const root = document.getElementById("root");',
        "createRoot(root).render(<App />);",
      ],
      {
        1: "react-dom: the part that talks to the real page",
        4: "the empty div in index.html",
        5: "from here on, React draws everything inside it",
      },
    ),
  ),

  part(
    "notes-app",
    "React in the Notes App",
    explain(
      "The Notes App's frontend is a React app made with Vite. `main.jsx` renders `<App />` into `#root`, wrapped in `StrictMode`, which runs extra checks while you develop. Every screen, from the login form to the cards on the dashboard, is a component in `src/`.",
    ),
    inTheNotesApp(
      "`main.jsx` is where React takes over the page: it renders `App` into the root element.",
      { fileId: "frontend/src/main.jsx" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Editing the page yourself",
      language: "jsx",
      wrong: [
        "function handleClick() {",
        '  document.querySelector("p").textContent = "Saved";',
        "}",
      ],
      problem:
        "React doesn't know about the change. The next render puts back whatever the JSX says, and your edit vanishes.",
      right: [
        'const [status, setStatus] = useState("");',
        'function handleClick() { setStatus("Saved"); }',
        "return <p>{status}</p>;",
      ],
      why: "Change state and let the JSX show it. React owns the elements it creates.",
    }),
    mistake({
      title: "Using a plain variable",
      language: "jsx",
      wrong: [
        "let count = 0;",
        "function handleClick() { count = count + 1; }",
      ],
      problem:
        "The variable changes, but React isn't told, so nothing re-renders. And each render starts again from 0.",
      right: [
        "const [count, setCount] = useState(0);",
        "function handleClick() { setCount(count + 1); }",
      ],
      why: "Data that changes the screen must be state, set with its setter.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "The screen for the data",
      task: 'Write `noteCountText(notes)` to return what a note counter should say: `"No notes yet"` for an empty array, `"1 note"` for one, and `"3 notes"` (with the number) otherwise.',
      starter: ["function noteCountText(notes) {", "", "}"],
      tests: [
        ["noteCountText([])", '"No notes yet"'],
        ['noteCountText(["Milk"])', '"1 note"'],
        ['noteCountText(["Milk", "Eggs", "Tea"])', '"3 notes"'],
      ],
      hint: "Check `notes.length`: return early for 0 and 1, and use a template literal for the rest.",
      solution: [
        "function noteCountText(notes) {",
        '  if (notes.length === 0) return "No notes yet";',
        '  if (notes.length === 1) return "1 note";',
        "  return `${notes.length} notes`;",
        "}",
      ],
    }),
    pageYourTurn({
      title: "State, then render",
      task: "Without React, do it React's way. `render()` should set `#count` from `state.count`. In the click handler, only change `state.count`, then call `render()`.",
      starter: [
        "<button>+1</button>",
        '<p id="count"></p>',
        "<script>",
        "  const state = { count: 0 };",
        "  function render() {",
        "",
        "  }",
        '  document.querySelector("button").addEventListener("click", () => {',
        "",
        "  });",
        "</script>",
      ],
      checks: [
        { kind: "click", label: "Click the button", selector: "button" },
        { kind: "text", label: "It shows 1", selector: "#count", text: "1" },
        { kind: "click", label: "Click again", selector: "button" },
        { kind: "text", label: "It shows 2", selector: "#count", text: "2" },
      ],
      hint: 'In `render`: `document.querySelector("#count").textContent = state.count;`. In the handler: `state.count++;` then `render();`.',
      solution: [
        "<button>+1</button>",
        '<p id="count"></p>',
        "<script>",
        "  const state = { count: 0 };",
        "  function render() {",
        '    document.querySelector("#count").textContent = state.count;',
        "  }",
        '  document.querySelector("button").addEventListener("click", () => {',
        "    state.count++;",
        "    render();",
        "  });",
        "  render();",
        "</script>",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Why React cheat sheet", [
      [
        "By hand",
        "Find each element and change it yourself.",
        "el.textContent = …",
      ],
      [
        "React's way",
        "Describe the screen for the data.",
        "return <p>{count}</p>",
      ],
      [
        "Component",
        "A capitalised function returning JSX.",
        "function App() { … }",
      ],
      ["State", "Remembered data; set it to re-render.", "setCount(count + 1)"],
      [
        "Render",
        "React calling the component for fresh JSX.",
        "after every state change",
      ],
      ["Vite", "Runs the project and translates JSX.", "npm run dev"],
      [
        "createRoot",
        "Where React takes over the page.",
        "createRoot(root).render(<App />)",
      ],
    ]),
    quickCheck(
      "A click handler calls `setCount(5)`. What updates the button's text on the page?",
      [
        "The handler, with `textContent`",
        "React, after calling the component again",
        "The browser, on the next reload",
      ],
      1,
      "Setting state makes React re-render: it calls the component, gets new JSX and changes only the parts of the page that differ.",
    ),
  ),
);
