import type { Concept } from "@fsl/shared";

export const reactComponentCommunication: Concept = {
  id: "react-component-communication",
  slug: "react-component-communication",
  title: "How components communicate",
  topicId: "react",
  summary:
    "The pattern React components use to share data: values flow down as props, events flow up through callback functions, and shared state lives in the closest common parent.",
  basics: [
    "A React app is a tree of components. A component that renders another one is its parent; the one it renders is its child. Components rendered by the same parent are siblings.",
    "Props are the inputs a parent gives a child, written like HTML attributes: `<NoteCard note={note} />`. The child receives them as one object and can read them, but must not change them.",
    "State is data a component remembers with `useState`. Each component's state is private: no other component can read it or change it directly.",
    "In JavaScript a function is a value, just like a number or a string. That means a function can be passed as a prop, and the child can call it later. A function passed this way is called a callback.",
  ],
  what: [
    "Props down, callbacks up: a parent sends data to its children through props, and a child tells its parent that something happened by calling a function the parent passed in as a prop, such as `onSaved(note)` or `onDelete(id)`.",
    "Lifting state up means moving a piece of state out of a child and into the closest parent that contains every component which needs it. That parent owns the data, passes it down, and passes down functions to change it.",
  ],
  why: [
    "Because each component's state is private, two siblings cannot talk to each other directly. When the form saves a note, the list next to it has no way to find out, unless the notes live in a parent that both of them are connected to.",
    "Keeping one owner for each piece of data means there is only one copy and one place that changes it. The screen can never show two different versions of the notes, and when something goes wrong you know exactly which component to look at.",
  ],
  howItWorks: [
    "The parent creates the shared state, for example the list of notes, and writes small functions that change it, such as `addNote` and `removeNote`.",
    "It renders its children and passes them what they need: the data as normal props and the functions as callback props, like `<NoteForm onSaved={addNote} />`.",
    "When something happens inside a child, the child calls the callback with the relevant data. The callback runs in the parent and updates the parent's state.",
    "The state change makes React re-render the parent, which passes the new data down to every child. This is how a sibling learns about a change: it travels up to the parent, then back down.",
  ],
  basicExample: {
    language: "jsx",
    code: `import { useState } from "react";

function Display({ count }) {
  return <p>Count: {count}</p>;
}

function AddButton({ onAdd }) {
  return <button type="button" onClick={onAdd}>Add one</button>;
}

function Parent() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <Display count={count} />
      <AddButton onAdd={() => setCount(count + 1)} />
    </div>
  );
}`,
    caption:
      "The two siblings never talk directly: `AddButton` calls a callback up to `Parent`, and `Parent` sends the new count down to `Display`.",
    highlightLines: [12, 15, 16],
  },
  internals: [
    "Passing a prop does not copy a live connection. The child gets the value as it was during that render. When the parent's state changes, React calls the child again with new props, and that is how the child sees the update.",
    "A callback prop is an ordinary function created inside the parent, so it can see the parent's state and setters. When the child calls it, the code runs with the parent's variables even though the call came from the child. This is called a closure.",
    "When the parent re-renders, React re-renders its children by default. That is usually fast. If the shared state sits much higher than needed, more components re-render than necessary, which is another reason to lift state only to the closest common parent.",
    "When many components deep in the tree need the same data, such as the logged-in user, passing it through every level becomes tedious. React's context lets a parent make a value available to all components below it without threading it through props, but props and callbacks remain the default.",
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
      text: "Create `src/NoteForm.jsx`. It keeps only the text being typed, and when the form is submitted it hands the new note up to its parent with the `onSaved` callback.",
      code: {
        language: "jsx",
        fileName: "src/NoteForm.jsx",
        code: `import { useState } from "react";

export default function NoteForm({ onSaved }) {
  const [title, setTitle] = useState("");

  function handleSave(event) {
    event.preventDefault();
    onSaved({ id: Date.now(), title });
    setTitle("");
  }

  return (
    <form onSubmit={handleSave}>
      <input value={title} onChange={(e) => setTitle(e.target.value)} />
      <button type="submit">Save</button>
    </form>
  );
}`,
      },
    },
    {
      text: "Create `src/NoteCard.jsx`. It shows one note it receives as a prop and reports a delete click upward with `onDelete`.",
      code: {
        language: "jsx",
        fileName: "src/NoteCard.jsx",
        code: `export default function NoteCard({ note, onDelete }) {
  return (
    <article>
      <h3>{note.title}</h3>
      <button type="button" onClick={() => onDelete(note.id)}>
        Delete
      </button>
    </article>
  );
}`,
      },
    },
    {
      text: "Replace `src/App.jsx` so it owns the list of notes, the closest common parent of the form and the cards, and passes the data down and the callbacks in.",
      code: {
        language: "jsx",
        fileName: "src/App.jsx",
        code: `import { useState } from "react";
import NoteForm from "./NoteForm.jsx";
import NoteCard from "./NoteCard.jsx";

export default function App() {
  const [notes, setNotes] = useState([]);

  function addNote(note) {
    setNotes((current) => [...current, note]);
  }

  function removeNote(id) {
    setNotes((current) => current.filter((n) => n.id !== id));
  }

  return (
    <main>
      <NoteForm onSaved={addNote} />
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} onDelete={removeNote} />
      ))}
    </main>
  );
}`,
      },
    },
    {
      text: "Open http://localhost:5173, save a few notes and delete one. The form and the cards never import or call each other, yet saving in the form makes a card appear: the note went up to `App` and came back down as a prop.",
    },
  ],
  whereUsed: [
    "Any time one component's action must change what another component shows: a form adding to a list, a filter box narrowing results, a tab bar choosing which panel is visible.",
    "Reusable components such as buttons, inputs and modals, which take an `onClick`, `onChange` or `onClose` callback so the parent decides what happens.",
  ],
  connectsTo: [
    "Props, the channel through which both data and callbacks travel.",
    "`useState`, which creates the shared state in the parent.",
    "Event handlers inside the child, which call the callback props.",
    "Custom hooks, which can hold the parent's shared state and functions so the parent component stays short.",
  ],
  projectUsage: [
    {
      explanation:
        "`Dashboard.jsx` is the closest common parent of the form and the cards. It gets the shared notes and the functions that change them from `useNotes()`: `const { notes, isLoading, error, addNote, replaceNote, removeNote } = useNotes();`, and passes `addNote` to `NoteForm` and `replaceNote`/`removeNote` to each `NoteCard`.",
      fileId: "frontend/src/pages/Dashboard.jsx",
      match:
        "const { notes, isLoading, error, addNote, replaceNote, removeNote } =",
    },
    {
      explanation:
        "It renders `<NoteForm onSaved={addNote} />`. After `createNote()` succeeds, `NoteForm` calls `onSaved(note)`, which adds the note to the list in `useNotes`, and the Dashboard re-renders with it.",
      fileId: "frontend/src/pages/Dashboard.jsx",
      match: "<NoteForm onSaved={addNote} />",
    },
    {
      explanation:
        "It renders `notes.map((note) => <NoteCard key={note.id} note={note} onDelete={removeNote} />)`. Each `NoteCard` receives its note as a prop and calls `onDelete(note.id)` when its Delete button is pressed; `NoteForm` and `NoteCard` never talk to each other directly.",
      fileId: "frontend/src/pages/Dashboard.jsx",
      match: "{notes.map((note) => (",
    },
  ],
  commonMistakes: [
    "Keeping the same data in two components, for example a copy of the notes in the form and another in the list. They drift apart. Keep one copy in the closest common parent and pass it down.",
    "Calling the callback during render instead of on the event, as in `onClick={onDelete(note.id)}`, which deletes the note immediately while drawing. Wrap it in a function: `onClick={() => onDelete(note.id)}`.",
    'Trying to change a prop inside the child, such as `note.title = "New"`. Props belong to the parent. Call a callback and let the parent update its state.',
    "Lifting state much higher than needed, for instance into `App` when only the Dashboard uses it. Lift it to the closest common parent of the components that need it, no higher.",
  ],
  relatedConcepts: [
    "react-props",
    "react-usestate",
    "react-event-handling",
    "react-custom-hook",
    "react-controlled-form",
  ],
  relatedFiles: [],
  relatedBuildSteps: [],
};
