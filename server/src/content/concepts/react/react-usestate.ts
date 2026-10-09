import type { Concept } from "@fsl/shared";

export const reactUseState: Concept = {
  id: "react-usestate",
  slug: "react-usestate",
  title: "useState",
  topicId: "react",
  summary:
    "The React hook that lets a component remember a value and update the screen when that value changes.",
  basics: [
    "A React component is a JavaScript function that returns what should appear on the screen. React calls that function to draw the component; calling it again is called a re-render.",
    "A normal variable inside a function is created fresh every time the function runs. So if a component stores the notes in a normal variable, they are lost on the next render — and changing the variable does not tell React to redraw anything.",
    "Functions whose names start with `use` and that come from React are called hooks. They give a component abilities a plain function doesn't have, such as memory.",
  ],
  what: [
    "`useState` is a hook that gives a component a piece of state: a value React keeps for that component between renders.",
    "It returns two things: the current value and a setter function. By convention they are named together, like `const [notes, setNotes] = useState([])`, where `[]` is the starting value.",
  ],
  why: [
    "Interfaces change while people use them: a note is added, an input is typed into, a menu opens. The screen must always match the current data.",
    "With `useState` you only change the data (by calling the setter) and React updates the screen for you. You never have to find an element and change it by hand, which is where many bugs come from.",
  ],
  howItWorks: [
    "On the first render, `useState(initialValue)` stores the initial value and returns it with a setter.",
    "When you call the setter — for example `setNotes([...notes, newNote])` — React stores the new value and schedules a re-render of that component.",
    "On the re-render, the same `useState` call returns the new value. The component builds its output with it, and React updates only the parts of the page that changed.",
  ],
  basicExample: {
    language: "jsx",
    code: `import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button type="button" onClick={() => setCount(count + 1)}>
      Clicked {count} times
    </button>
  );
}`,
    caption:
      "Each click calls setCount; React re-renders Counter and the label shows the new count.",
    highlightLines: [4, 7],
  },
  internals: [
    "React keeps a list of state slots for every component on the page. Each `useState` call takes the next slot in order: the first call gets slot 1, the second slot 2, and so on.",
    "Because slots are matched by order, hooks must be called in the same order on every render. That is why you must never call `useState` inside an `if`, a loop, or after an early `return` — the rules of hooks.",
    "The setter does not change the variable you already have; it asks React for a new render. Inside the current render, `count` keeps its old value until the next render runs.",
    "React compares the new value with the old one. If you pass the same object (for example after changing an array in place with `push`), React may see no change and skip the update. Always create a new array or object.",
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
      text: "Replace the contents of `src/App.jsx` with a component that keeps a list of notes in state.",
      code: {
        language: "jsx",
        fileName: "src/App.jsx",
        code: `import { useState } from "react";

export default function App() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");

  function handleSave(event) {
    event.preventDefault();
    setNotes([...notes, title]); // a new array, never notes.push()
    setTitle("");
  }

  return (
    <form onSubmit={handleSave}>
      <input value={title} onChange={(e) => setTitle(e.target.value)} />
      <button type="submit">Save</button>
      <ul>
        {notes.map((note, i) => (
          <li key={i}>{note}</li>
        ))}
      </ul>
    </form>
  );
}`,
      },
    },
    {
      text: "Open the address Vite printed (usually http://localhost:5173), type a title and press Save. The note appears in the list and the input is cleared — both because state changed.",
    },
    {
      text: "Reload the page: the notes are gone. State lives in the browser's memory only; keeping notes permanently is the job of the backend and database.",
    },
  ],
  whereUsed: [
    "Any value that changes while the user is on the page and affects what they see: lists of items, form inputs, whether a menu is open, loading and error flags.",
    "Not for values you can calculate from other state or props — compute those during render instead of storing a copy.",
  ],
  connectsTo: [
    "Event handlers such as `onClick` and `onSubmit`, which call the setter.",
    "`useEffect`, often used to load data from an API and then store it with a setter.",
    "Props: a parent can pass its state value and its setter down to child components.",
    "Custom hooks: functions like `useNotes` that bundle `useState` with related logic so several components can reuse it.",
  ],
  projectUsage: [
    {
      explanation:
        '`NoteForm.jsx` keeps the title and content being typed in state (`useState("")`) so the inputs always show the current text.',
    },
    {
      explanation:
        "The custom hook `useNotes` (`frontend/src/hooks/useNotes.js`) keeps the list of notes in `useState`. After `createNote()` succeeds, it calls the setter with a new array that includes the saved note, and the Dashboard re-renders with it.",
    },
  ],
  commonMistakes: [
    "Changing state in place, e.g. `notes.push(note); setNotes(notes)`. React receives the same array and may not re-render. Create a new one: `setNotes([...notes, note])`.",
    "Expecting the new value right after calling the setter: `setCount(count + 1); console.log(count)` still logs the old value. It changes on the next render.",
    "Calling hooks conditionally, e.g. inside an `if`. React matches state by call order, so the order must never change.",
    "Storing values that can be calculated, like a filtered list, in their own state. They get out of sync; compute them during render.",
  ],
  relatedConcepts: ["html-button"],
  relatedFiles: [],
  relatedBuildSteps: [],
};
