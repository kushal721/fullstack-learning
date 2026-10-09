import type { Concept } from "@fsl/shared";

export const reactWhy: Concept = {
  id: "react-why",
  slug: "react-why",
  title: "Why React?",
  topicId: "react",
  summary:
    "React is a JavaScript library for building user interfaces where you describe what the page should look like for the current data and React keeps the page in sync for you.",
  basics: [
    "When a browser loads a web page, it turns the HTML into a tree of objects called the DOM (Document Object Model). What you see on screen is drawn from that tree, and JavaScript can change the page by changing the tree.",
    "Changing the DOM by hand means two steps: find the element (for example with `document.getElementById`) and then update it (for example by setting its `textContent` or adding a new child element).",
    "The data of an app is the information it works with, such as the list of notes. Whenever the data changes, every part of the page that shows it must change too — the list, a counter in the heading, an empty-state message.",
    "A library is ready-made code you add to your project and call from your own code. React is a library made by Meta, written in and used from JavaScript.",
  ],
  what: [
    "React is a JavaScript library for building the visible part of an app — the user interface (UI). You write functions called components that take data and return a description of what should appear on the screen.",
    "This style is called declarative: you declare what the result should be for the current data, and React works out which DOM changes are needed. The opposite, imperative, is writing every step yourself: find this element, change that text, add this item.",
  ],
  why: [
    "Updating the DOM by hand works for one or two elements, but it gets error-prone fast. After adding a note you must remember to add the list item, update the counter and hide the empty message — forget one and the page shows something different from the data.",
    "With React you only change the data. React calls your components again with the new data and updates the page to match, so the screen and the data cannot drift apart. Splitting the UI into components also lets you reuse pieces, like one note card for every note.",
  ],
  howItWorks: [
    "You split the page into components, such as a navigation bar, a form and a note card. Each component is a function that returns JSX, an HTML-like description of its part of the page.",
    "React calls your components and builds the page from what they return. It also remembers that result.",
    "When data changes (for example a new note is added to state, the data React remembers for a component), React calls the affected components again, compares the new result with the previous one, and changes only the DOM elements that are actually different.",
  ],
  basicExample: {
    language: "jsx",
    code: `// Imperative (plain JavaScript): you do every step yourself
const list = document.getElementById("notes");
const item = document.createElement("li");
item.textContent = newNote;
list.appendChild(item);
document.getElementById("count").textContent = notes.length;

// Declarative (React): describe the result for the current data
function NoteList({ notes }) {
  return (
    <>
      <p>{notes.length} notes</p>
      <ul>
        {notes.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
    </>
  );
}`,
    caption:
      "The plain JavaScript version must be repeated, step by step, for every change; the React version only describes the result, and React updates the page whenever notes changes.",
    highlightLines: [12, 14],
  },
  internals: [
    "React keeps a lightweight copy of what your components returned last time — plain JavaScript objects describing elements, often called the virtual DOM. Creating these objects is much cheaper than touching the real DOM.",
    "After a change, React compares the new description with the old one (this is called reconciliation) and applies only the differences to the real DOM. Elements that did not change are left alone, so an input keeps its focus and typed text.",
    "React only handles the UI in the browser. It does not run a server, store data permanently or talk to a database. In the Notes App those jobs belong to the Express backend and the database; React asks for data with `fetch` and shows it.",
  ],
  howToCreate: [
    {
      text: "Create a React project with Vite in a terminal, then start it. Vite is a tool that serves your project during development and bundles it for production.",
      code: {
        language: "bash",
        code: `npm create vite@latest my-notes -- --template react
cd my-notes
npm install
npm run dev`,
      },
    },
    {
      text: "Replace the contents of `src/App.jsx` with a component that only describes what to show for a list of notes. There is no `getElementById` anywhere.",
      code: {
        language: "jsx",
        fileName: "src/App.jsx",
        code: `import { useState } from "react";

export default function App() {
  const [notes, setNotes] = useState(["Buy milk"]);

  return (
    <main>
      <p>{notes.length} notes</p>
      <ul>
        {notes.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => setNotes([...notes, "Note " + (notes.length + 1)])}
      >
        Add note
      </button>
    </main>
  );
}`,
      },
    },
    {
      text: "Open http://localhost:5173 and click Add note a few times. Both the counter and the list update, although your code only changed the data.",
    },
    {
      text: "Open the developer tools (F12 or Cmd+Opt+I), go to the Elements panel and click Add note again. Only the new list item and the counter text flash as changed — React left everything else untouched.",
    },
  ],
  whereUsed: [
    "Interactive web apps where the page changes a lot while people use it: dashboards, editors, chat apps, and the Notes App frontend.",
    "Mostly static pages, such as a simple blog post, do not need React; plain HTML and CSS are enough there.",
    "React Native uses the same ideas to build mobile apps, so what you learn here carries over.",
  ],
  connectsTo: [
    "Components and JSX, the building blocks you write in every React app.",
    "State (`useState`), the data that, when changed, makes React update the page.",
    "Vite, which runs the React project during development and builds it for production.",
    "The backend API, which React calls with `fetch` to load and save data it cannot store itself.",
  ],
  projectUsage: [
    {
      explanation:
        "The whole Notes App frontend in `frontend/` is a React app. `src/main.jsx` tells React to draw the `App` component inside the `#root` element of `index.html`.",
    },
    {
      explanation:
        "When a note is saved, `useNotes` only adds it to the `notes` state. The Dashboard re-renders and a new `NoteCard` appears — no code ever searches the page for the list.",
    },
    {
      explanation:
        "Storing notes permanently is not React's job: `notesApi.js` sends requests like `POST /api/notes` to the Express API, which saves them in the database.",
    },
  ],
  commonMistakes: [
    "Changing the DOM directly inside a React app, e.g. with `document.getElementById(...).textContent = ...`. React does not know about it and may overwrite it on the next render. Change state instead and let React update the page.",
    "Expecting React to save data. Reloading the page clears all state; keep permanent data on the backend and load it with `fetch`.",
    "Thinking React is a whole framework that does everything. It only builds the UI; routing, data loading and the server are separate tools or your own code.",
    "Reaching for React for a page that never changes. Plain HTML is simpler and loads faster when there is nothing to keep in sync.",
  ],
  relatedConcepts: ["react-component", "jsx", "react-state", "vite"],
  relatedFiles: [],
  relatedBuildSteps: [],
};
