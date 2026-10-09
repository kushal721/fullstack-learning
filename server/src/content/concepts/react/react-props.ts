import type { Concept } from "@fsl/shared";

export const reactProps: Concept = {
  id: "react-props",
  slug: "react-props",
  title: "Props",
  topicId: "react",
  summary:
    "Props are the inputs a parent component passes to a child component, written like HTML attributes on the child's tag.",
  basics: [
    "A component is a JavaScript function that returns JSX. A component that uses another component as a tag is called the parent; the one being used is the child.",
    "In HTML, attributes give an element extra information, like `src` on an image or `type` on a button. Each one has a name and a value.",
    'A JavaScript object groups values under names, like `{ title: "Shopping", content: "Milk" }`. Destructuring is a short way to pull values out of an object into variables: `const { title } = note;` creates a variable `title`.',
  ],
  what: [
    "Props (short for properties) are the values you write on a component's tag, like `<NoteCard note={note} />`. React collects them into one object and passes it to the component function as its first argument.",
    "Props can be any JavaScript value: strings, numbers, objects, arrays and even functions. The special prop `children` holds whatever you put between a component's opening and closing tags.",
  ],
  why: [
    "Without props, a component would always show the same thing. Props let one `NoteCard` show any note: the parent decides what to pass, the child decides how it looks.",
    "Props are how components talk: data travels down from parent to child as props, and when the child needs to tell the parent something, it calls a function the parent passed in as a prop.",
  ],
  howItWorks: [
    'The parent writes attributes on the child\'s tag: strings in quotes (`variant="danger"`) and any other value in curly braces (`note={note}`, `count={3}`).',
    "React puts them in an object, for example `{ note: {...}, onDelete: removeNote }`, and calls the child with it. Most components destructure it right in the parameter list: `function NoteCard({ note, onDelete })`.",
    "When the parent re-renders with different values, React calls the child again with the new props and the child shows the new data.",
  ],
  basicExample: {
    language: "jsx",
    code: `function Badge({ label, color = "gray" }) {
  return <span className={"badge badge-" + color}>{label}</span>;
}

function Card({ children }) {
  return <div className="card">{children}</div>;
}

export default function App() {
  return (
    <Card>
      <Badge label="New" color="green" />
      <Badge label="Draft" />
    </Card>
  );
}`,
    caption:
      "Badge receives label and color as props, with gray as the default color; Card shows whatever is placed between its tags through children.",
    highlightLines: [1, 5, 12, 13],
  },
  internals: [
    'JSX like `<Badge label="New" />` compiles to a call that includes the object `{ label: "New" }`. When React renders, it calls `Badge` with exactly that object.',
    'A default value in the destructuring, like `color = "gray"`, is plain JavaScript: it is used when the prop is missing (its value is `undefined`).',
    "Props are read-only. The object belongs to the parent's render, and React relies on it not changing so it can tell what is new. To change what a child shows, the parent passes new props; for its own changing values, the child uses state.",
    "Passing a function as a prop passes a reference to it, not a copy. When the child calls `onDelete(note.id)`, the parent's function runs with the parent's data — this is how events flow back up.",
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
      text: "Create `src/components/NoteCard.jsx` with a component that reads a `note` object and an `onDelete` function from its props.",
      code: {
        language: "jsx",
        fileName: "src/components/NoteCard.jsx",
        code: `export default function NoteCard({ note, onDelete }) {
  return (
    <article>
      <h2>{note.title}</h2>
      <p>{note.content}</p>
      <button type="button" onClick={() => onDelete(note.id)}>
        Delete
      </button>
    </article>
  );
}`,
      },
    },
    {
      text: "Replace the contents of `src/App.jsx` so it passes a different note to each card, plus a function to call on delete.",
      code: {
        language: "jsx",
        fileName: "src/App.jsx",
        code: `import NoteCard from "./components/NoteCard.jsx";

const notes = [
  { id: 1, title: "Shopping", content: "Milk and bread" },
  { id: 2, title: "Ideas", content: "Learn React props" },
];

export default function App() {
  function handleDelete(id) {
    alert("Delete note " + id);
  }

  return (
    <main>
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} onDelete={handleDelete} />
      ))}
    </main>
  );
}`,
      },
    },
    {
      text: "Open http://localhost:5173. The same `NoteCard` shows two different notes. Click Delete on the second card: the alert says Delete note 2, because the child called the parent's function with its note's id.",
    },
  ],
  whereUsed: [
    "Any reusable component: buttons that take a label and a style, inputs that take a label, cards that take the item to show.",
    "Passing callbacks such as `onSaved` or `onDelete` so a child can report events to the parent that owns the data.",
    "Wrapper components (cards, layouts, buttons) that show their `children`.",
  ],
  connectsTo: [
    "Components, which receive props as their function argument.",
    "State: a parent often passes its state values down as props, and a function that updates it.",
    "Event handlers, which children call through function props like `onDelete`.",
    "Destructuring and default values from plain JavaScript objects and functions.",
  ],
  projectUsage: [
    {
      explanation:
        '`Button({ children, variant = "primary", ...props })` uses `children` for its label, a default `variant`, and passes all other props (like `type` or `onClick`) on to the real button element.',
    },
    {
      explanation:
        "`Dashboard` renders `<NoteCard key={note.id} note={note} onDelete={removeNote} />` for each note: the note data goes down, and `NoteCard` calls `onDelete(note.id)` to send the delete request back up.",
    },
    {
      explanation:
        "`<NoteForm onSaved={addNote} />` gives the form a callback. After the note is saved, `NoteForm` calls `onSaved(note)` and `useNotes` adds it to the list — props down, callbacks up.",
    },
  ],
  commonMistakes: [
    "Forgetting the curly braces in the parameter, `function NoteCard(note)`. Then `note` is the whole props object and `note.title` is `undefined`. Destructure: `function NoteCard({ note })`.",
    'Changing a prop inside the child, e.g. `note.title = "New"`. Props are read-only; ask the parent to change its data through a callback prop, or keep your own value in state.',
    'Passing numbers or booleans as strings: `count="3"` passes the text 3. Use curly braces for non-string values: `count={3}`.',
    "Misspelling a prop name between parent and child, like `onDeleted` vs `onDelete`. The child receives `undefined` and calling it throws an error. Keep the names identical.",
  ],
  relatedConcepts: [
    "react-component",
    "jsx",
    "react-component-communication",
    "react-reusable-component",
    "js-object-array",
  ],
  relatedFiles: [],
  relatedBuildSteps: [],
};
