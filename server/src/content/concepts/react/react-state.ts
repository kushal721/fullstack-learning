import type { Concept } from "@fsl/shared";

export const reactState: Concept = {
  id: "react-state",
  slug: "react-state",
  title: "State",
  topicId: "react",
  summary:
    "The data a component remembers between renders, which changes over time and decides what appears on the screen.",
  basics: [
    "A React component is a JavaScript function that returns what should appear on the screen. React calls that function to draw the component; calling it again later to draw it with new data is called a re-render.",
    "Components get data in two main ways. Props are values a parent component passes in, like arguments to a function; the component reads them but does not change them. State is data the component owns and keeps for itself.",
    "An ordinary variable declared inside a component (for example `let count = 0`) is created fresh every time the function runs, so it forgets its value on each render. Changing it also does not tell React that anything happened, so the screen stays the same.",
  ],
  what: [
    "State is any piece of data that changes while the user is on the page and affects what they see: the list of notes, the text typed into an input, whether a menu is open, whether data is still loading.",
    "State belongs to one component. React stores it outside the function so it survives re-renders, and when the state changes, React re-renders that component (and the children inside it) so the screen matches the new data. The tool you use to create state is the `useState` hook.",
  ],
  why: [
    "Without state, a component could only show the same thing every time. Interfaces react to people: clicking Save adds a note, typing fills an input, clicking Delete removes a card. Something has to remember those changes.",
    "State gives React one clear source of truth. You describe how the screen should look for a given state, change the state when something happens, and React works out what to update. You never have to find elements and edit them by hand, which keeps the screen and the data from getting out of sync.",
  ],
  howItWorks: [
    "On the first render, the component creates its state with a starting value, for example an empty list of notes. React stores that value for this component.",
    "When something happens, such as a click or a response from the server, your code asks React to change the state by calling a setter function.",
    "React then re-renders the component: it calls the function again, the function reads the new state, and returns new output. React compares it with what is on the page and updates only the parts that changed.",
    "Props and state work together: a parent can pass its state down to children as props. When the parent's state changes, the children receive new props and re-render too.",
  ],
  basicExample: {
    language: "jsx",
    code: `import { useState } from "react";

function NoteList() {
  let clicks = 0; // ordinary variable: reset on every render
  const [notes, setNotes] = useState(["Buy milk"]); // state: remembered

  const count = notes.length; // derived value: calculated, not stored

  function handleAdd() {
    clicks = clicks + 1; // changes, but React does not re-render
    setNotes([...notes, "New note"]); // React re-renders with the new list
  }

  return (
    <div>
      <p>{count} notes</p>
      <button type="button" onClick={handleAdd}>Add</button>
    </div>
  );
}`,
    caption:
      "Only the state change makes the screen update; the ordinary variable is forgotten, and the count is calculated from state on every render.",
    highlightLines: [4, 5, 7],
  },
  internals: [
    "React keeps the state of every component that is currently on the page. The memory belongs to that place in the page, not to the function: if the same component appears twice, each copy has its own separate state.",
    "When a component is removed from the page (for example you switch from the Dashboard to the Login page), React throws its state away. If it appears again later, it starts from the initial value.",
    "State updates are not instant. Calling a setter schedules a re-render; inside the current render, the variable still holds the old value. React may also group several updates from the same event into one re-render.",
    "React decides whether something changed by comparing the old and new value. For arrays and objects it checks whether it is the same object, so you must always give it a new array or object instead of changing the old one in place.",
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
      text: "Replace the contents of `src/App.jsx` with a component that compares an ordinary variable with state. Both are increased by the same button.",
      code: {
        language: "jsx",
        fileName: "src/App.jsx",
        code: `import { useState } from "react";

export default function App() {
  let plain = 0;
  const [notes, setNotes] = useState([]);

  function handleAdd() {
    plain = plain + 1;
    console.log("plain is now", plain);
    setNotes([...notes, "Note " + (notes.length + 1)]);
  }

  return (
    <div>
      <button type="button" onClick={handleAdd}>Add note</button>
      <p>Plain variable: {plain}</p>
      <p>Notes in state: {notes.length}</p>
      <ul>
        {notes.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
    </div>
  );
}`,
      },
    },
    {
      text: "Open http://localhost:5173 and the browser console, then click Add note a few times. The list and the state count grow, but the plain variable on screen stays 0 and the console always logs 1, because the variable is recreated on every render.",
    },
    {
      text: "Still in the browser, check that the Notes in state number always matches the number of items in the list. That is because `notes.length` is never stored in its own state: it is calculated from `notes` during render, so it can never be out of date.",
    },
  ],
  whereUsed: [
    "Data the user changes while on the page: lists of items, form inputs, selected tabs, open or closed menus.",
    "Data that arrives later, such as notes loaded from an API, together with loading and error flags.",
    "Not for values you can calculate from props or other state (a filtered list, a count, a full name). Compute those during render instead of storing a copy.",
  ],
  connectsTo: [
    "`useState`, the hook that creates a piece of state and its setter.",
    "Props: a parent passes its state down to children, and passes setter-based callbacks so children can ask for changes.",
    "Event handlers such as `onClick` and `onSubmit`, which are where most state changes start.",
    "Custom hooks such as `useNotes`, which group related state and the functions that change it.",
  ],
  projectUsage: [
    {
      explanation:
        "`NoteForm.jsx` keeps the `title` and `content` being typed in state, because they change on every keystroke and the inputs must show them.",
      fileId: "frontend/src/components/NoteForm.jsx",
      match: 'const [title, setTitle] = useState("");',
    },
    {
      explanation:
        "The list of notes, plus `isLoading` and `error`, live in the `useNotes` hook called by the Dashboard. Dashboard is the closest common parent of `NoteForm` and every `NoteCard`, so the shared state lives there and flows down as props.",
      fileId: "frontend/src/hooks/useNotes.js",
      match: "const [notes, setNotes] = useState([]);",
    },
    {
      explanation:
        "`NoteCard` also has state of its own: `useState` for `isEditing`, `title`, `content` and `error`, because only that card needs to know it is being edited; the `note` itself still comes from its parent as a prop.",
      fileId: "frontend/src/components/NoteCard.jsx",
      match: "function NoteCard({ note, onUpdated, onDelete })",
    },
  ],
  commonMistakes: [
    "Using an ordinary variable for data that changes, e.g. `let notes = []`. It is reset on every render and does not update the screen. Use `useState` instead.",
    "Storing derived values in state, e.g. a separate `count` state next to `notes`. The two can drift apart. Calculate `notes.length` during render.",
    "Copying props into state, e.g. `useState(props.note)`. The state keeps the first value and ignores later props. Read the prop directly.",
    "Keeping shared state too low in the tree, so two sibling components cannot both see it. Move the state up to their closest common parent and pass it down as props.",
  ],
  relatedConcepts: [
    "react-usestate",
    "react-props",
    "react-component",
    "react-custom-hook",
    "react-component-communication",
  ],
  relatedFiles: [],
  relatedBuildSteps: [],
};
