import type { Concept } from "@fsl/shared";

export const reactCustomHook: Concept = {
  id: "react-custom-hook",
  slug: "react-custom-hook",
  title: "Custom hooks (useNotes)",
  topicId: "react",
  summary:
    "A function you write yourself, whose name starts with `use`, that bundles state and effects so components can reuse that logic with one line.",
  basics: [
    "Hooks are functions from React, such as `useState` and `useEffect`, that give a component memory and the ability to run code after it renders. They must be called at the top level of a component, in the same order on every render.",
    "As a component grows, it collects a lot of this logic: several pieces of state, an effect that loads data, and functions that change the data. The part that actually describes the screen gets buried underneath.",
    "In JavaScript you move repeated or bulky code into a function. Hooks can be moved the same way, as long as the new function follows the rules of hooks.",
  ],
  what: [
    "A custom hook is an ordinary JavaScript function whose name starts with `use` and that calls other hooks inside it. `useNotes` is one: it calls `useState` and `useEffect` and returns what a component needs.",
    "It usually returns an object of values and functions, for example `{ notes, isLoading, error, addNote, removeNote }`, which the component unpacks with destructuring: `const { notes, addNote } = useNotes();`.",
  ],
  why: [
    "It keeps components short and readable. The Dashboard can focus on what to show, while the details of loading, adding and removing notes live in one named place.",
    "It makes stateful logic reusable and easy to change. Any component that needs notes can call `useNotes()`, and if the way notes are loaded changes, you update one file instead of every component.",
  ],
  howItWorks: [
    "When a component calls `useNotes()`, the hooks inside `useNotes` run as if they were written directly in that component. Their state is added to that component's own hook list.",
    "So a custom hook shares logic, not data. If two components each call `useNotes()`, each gets its own separate `notes` state and each loads the notes on its own.",
    "When a setter inside the hook is called, the component that called the hook re-renders, the hook runs again, and it returns the new values.",
    "To share the same data between components, call the hook once in their closest common parent and pass the values down as props.",
  ],
  basicExample: {
    language: "jsx",
    code: `import { useState } from "react";

function useToggle(initial = false) {
  const [isOn, setIsOn] = useState(initial);

  function toggle() {
    setIsOn((current) => !current);
  }

  return { isOn, toggle };
}

function Menu() {
  const { isOn, toggle } = useToggle();

  return (
    <button type="button" onClick={toggle}>
      {isOn ? "Close menu" : "Open menu"}
    </button>
  );
}`,
    caption:
      "useToggle holds the state and the function that changes it; Menu just calls it and uses the returned object.",
    highlightLines: [3, 10, 14],
  },
  internals: [
    "React does not know custom hooks exist. At runtime `useNotes()` is a plain function call; only the `useState` and `useEffect` calls inside it are real hooks, stored in the calling component's list.",
    "The `use` prefix is a convention that tools depend on. It tells linters (oxlint in the Vite template, or `eslint-plugin-react-hooks`) to apply the rules of hooks inside the function, and tells readers that it must be called at the top level of a component.",
    "Inside the hook, updates use the function form, e.g. `setNotes((current) => [...current, note])`. The function receives the latest state, so it stays correct even if several updates happen before the next render.",
    "A function that does not call any hooks should not start with `use`. A plain helper such as `formatDate()` can be called anywhere, even inside conditions.",
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
      text: "Start with the state inside a component: replace the contents of `src/App.jsx` with a component that keeps the notes logic inside itself.",
      code: {
        language: "jsx",
        fileName: "src/App.jsx",
        code: `import { useEffect, useState } from "react";

export default function App() {
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setNotes([{ id: 1, title: "Welcome note" }]); // pretend this came from an API
    setIsLoading(false);
  }, []);

  function addNote(note) {
    setNotes((current) => [...current, note]);
  }

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      <button type="button" onClick={() => addNote({ id: Date.now(), title: "New note" })}>
        Add note
      </button>
      <ul>
        {notes.map((note) => (
          <li key={note.id}>{note.title}</li>
        ))}
      </ul>
    </div>
  );
}`,
      },
    },
    {
      text: "Create the folder `src/hooks` and a file `useNotes.js` in it. Move the state, the effect and `addNote` into a function named `useNotes`, and return them in an object.",
      code: {
        language: "js",
        fileName: "src/hooks/useNotes.js",
        code: `import { useEffect, useState } from "react";

export function useNotes() {
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setNotes([{ id: 1, title: "Welcome note" }]); // later: await getNotes()
    setIsLoading(false);
  }, []);

  function addNote(note) {
    setNotes((current) => [...current, note]);
  }

  function removeNote(id) {
    setNotes((current) => current.filter((n) => n.id !== id));
  }

  return { notes, isLoading, addNote, removeNote };
}`,
      },
    },
    {
      text: "Back in `src/App.jsx`, delete the moved code and call the hook instead. The component is now only about what to show.",
      code: {
        language: "jsx",
        fileName: "src/App.jsx",
        code: `import { useNotes } from "./hooks/useNotes";

export default function App() {
  const { notes, isLoading, addNote, removeNote } = useNotes();

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      <button type="button" onClick={() => addNote({ id: Date.now(), title: "New note" })}>
        Add note
      </button>
      <ul>
        {notes.map((note) => (
          <li key={note.id}>
            {note.title}{" "}
            <button type="button" onClick={() => removeNote(note.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}`,
      },
    },
    {
      text: "Open http://localhost:5173. You see the Welcome note and Add note works exactly as before: the logic only moved into `useNotes`. The new Delete buttons use `removeNote`, which the hook now offers to any component that calls it.",
    },
  ],
  whereUsed: [
    "Loading and managing a list of records from an API, together with its loading and error state, like `useNotes`.",
    "Small reusable behaviours: toggling something open and closed, tracking a form's fields, reading the window size.",
    "Any component whose hook code has grown so long that it hides what the component shows.",
  ],
  connectsTo: [
    "`useState` and `useEffect`, the built-in hooks a custom hook is made from.",
    "How hooks work: a custom hook's hooks are added to the calling component's hook list and follow the same rules.",
    "Props and callbacks: the component that calls the hook passes its values and functions down, e.g. `addNote` as `onSaved`.",
    "JavaScript modules: the hook lives in its own file and is shared with `export` and `import`.",
  ],
  projectUsage: [
    {
      explanation:
        "`src/hooks/useNotes.js` keeps `notes`, `isLoading` and `error` in `useState`, loads the notes once with `useEffect(() => { ... getNotes() ... }, [])`, and returns `{ notes, isLoading, error, addNote, removeNote }`.",
    },
    {
      explanation:
        "`addNote(note)` uses `setNotes((current) => [...current, note])`, and `removeNote(id)` first awaits `deleteNote(id)` from `notesApi.js`, then filters the note out of state.",
    },
    {
      explanation:
        "`Dashboard` calls `useNotes()` once and passes the results down: `addNote` becomes the `onSaved` prop of `NoteForm`, and `removeNote` becomes the `onDelete` prop of each `NoteCard`. Calling the hook once in the common parent is what lets all of them share one list.",
    },
  ],
  commonMistakes: [
    "Expecting two components that both call `useNotes()` to share the same notes. Each call has its own state. Call it once in the closest common parent and pass the values down as props.",
    "Naming the function without `use`, e.g. `notesLogic()`. The linter then reports the hooks inside it as errors and readers cannot tell it holds state. Start the name with `use`.",
    "Calling the custom hook conditionally or inside an event handler, e.g. in an `onClick`. It contains hooks, so it must be called at the top level of a component, every render.",
    "Returning values in an array of many items, e.g. `return [notes, isLoading, addNote, removeNote]`. The caller must remember the order. Return an object so values are picked by name.",
  ],
  relatedConcepts: [
    "react-how-hooks-work",
    "react-usestate",
    "react-useeffect",
    "react-state",
    "react-component-communication",
    "js-module-import-export",
  ],
  relatedFiles: [],
  relatedBuildSteps: [],
};
