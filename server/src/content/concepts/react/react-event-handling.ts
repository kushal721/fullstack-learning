import type { Concept } from "@fsl/shared";

export const reactEventHandling: Concept = {
  id: "react-event-handling",
  slug: "react-event-handling",
  title: "Handling events in React",
  topicId: "react",
  summary:
    "Event handling in React means passing a function to a JSX attribute like `onClick` so React runs it when the user clicks, types or submits a form.",
  basics: [
    "An event is something that happens on the page, usually caused by the user: a click, a key press, typing in an input, or submitting a form. The browser announces each event so code can react to it.",
    'A function that runs in response to an event is called an event handler. In plain JavaScript you attach one with `element.addEventListener("click", handleClick)`.',
    "In JavaScript a function is a value. `handleClick` (without parentheses) is the function itself, which you can hand to someone else; `handleClick()` (with parentheses) runs it right now and gives back its result.",
  ],
  what: [
    "In React you attach handlers as JSX attributes whose names start with `on` and use camelCase: `onClick`, `onChange`, `onSubmit`. The value is a function, written in curly braces: `onClick={handleClick}`.",
    "When the event happens, React calls your function and passes it an event object with details, such as `event.target.value` (the text in an input) and methods like `event.preventDefault()`.",
  ],
  why: [
    "Interfaces are interactive: buttons delete notes, inputs take titles, forms save data. Handlers are where you decide what happens next — usually updating state or calling an API.",
    "Writing the handler right on the element keeps what the element is and what it does together, and React attaches and removes the listeners for you, so you never have to find elements with `getElementById` or clean up listeners yourself.",
  ],
  howItWorks: [
    "You write `onClick={handleClick}`. React stores the function with that element but does not run it yet.",
    "When the user clicks, React calls `handleClick(event)`. Inside, you typically call a state setter or another function, and React re-renders with the new data.",
    "To pass your own arguments, wrap the call in an arrow function: `onClick={() => onDelete(note.id)}`. The arrow function is what React stores; only when clicked does it run and call `onDelete` with the id.",
    "For forms, `onSubmit` runs when the form is submitted (by a submit button or Enter). Calling `event.preventDefault()` first stops the browser's default page reload.",
  ],
  basicExample: {
    language: "jsx",
    code: `function DeleteButton({ noteId, onDelete }) {
  function handleClick() {
    onDelete(noteId);
  }

  return (
    <>
      <button type="button" onClick={handleClick}>
        Delete
      </button>
      <button type="button" onClick={() => onDelete(noteId)}>
        Delete (arrow)
      </button>
    </>
  );
}`,
    caption:
      "Both buttons pass a function without calling it: a named handler, or an inline arrow function that calls onDelete with the id when clicked.",
    highlightLines: [8, 11],
  },
  internals: [
    "React does not add a listener to every button. It attaches one listener per event type to the root element and, when an event bubbles up there, looks up which of your handlers belongs to the element that was clicked. This is called event delegation.",
    "The `event` your handler receives is a React wrapper around the browser's event with the same properties (`target`, `preventDefault()`, `stopPropagation()`), so it behaves the same in every browser.",
    "`onClick={handleClick()}` calls the function during render, while React is building the page, and passes its return value (usually `undefined`) as the handler. If that function updates state, it triggers another render, which calls it again — often an endless loop that React stops with a `Too many re-renders` error.",
    "In React, `onChange` on an input fires on every keystroke, not only when the input loses focus as in plain HTML. That is what makes controlled inputs possible: each key press updates state.",
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
      text: "Replace the contents of `src/App.jsx` with a small form that uses `onChange`, `onSubmit` and `onClick`.",
      code: {
        language: "jsx",
        fileName: "src/App.jsx",
        code: `import { useState } from "react";

export default function App() {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState([]);

  function handleSubmit(event) {
    event.preventDefault(); // stop the page reload
    setNotes([...notes, { id: Date.now(), title }]);
    setTitle("");
  }

  function handleDelete(id) {
    setNotes(notes.filter((note) => note.id !== id));
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={title} onChange={(event) => setTitle(event.target.value)} />
      <button type="submit">Save</button>
      <ul>
        {notes.map((note) => (
          <li key={note.id}>
            {note.title}
            <button type="button" onClick={() => handleDelete(note.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </form>
  );
}`,
      },
    },
    {
      text: "Open http://localhost:5173, type a title and press Save or Enter. The note appears and the page does not reload. Click Delete next to a note to remove just that one.",
    },
    {
      text: "To see the classic mistake, change one delete button to `onClick={handleDelete(note.id)}` and save. The notes disappear as soon as they are added, because the function now runs during render instead of on click. Change it back.",
    },
  ],
  whereUsed: [
    "Buttons with `onClick`: deleting a note, logging out, opening a menu.",
    "Inputs with `onChange` that keep their text in state, and forms with `onSubmit` that save data.",
    "Callback props like `onDelete` and `onSaved`, which let a child report an event to its parent.",
  ],
  connectsTo: [
    "State setters, which handlers call to change data and trigger a re-render.",
    "Props, through which a parent passes handler functions down to children.",
    "Arrow functions, used to pass arguments to a handler.",
    "Browser events and `preventDefault()`, which React's event object wraps.",
  ],
  projectUsage: [
    {
      explanation:
        "`NoteForm.jsx` uses `onSubmit={handleSave}`. `handleSave(event)` calls `event.preventDefault()`, then `createNote({ title, content })`, then `onSaved(note)` and clears the fields.",
    },
    {
      explanation:
        "The title and content inputs in `NoteForm.jsx` use `onChange` to copy `event.target.value` into state on every keystroke.",
    },
    {
      explanation:
        "`NoteCard.jsx` gives its Delete `Button` `onClick={() => onDelete(note.id)}`, so the click passes the right note's id up to `removeNote` in `useNotes`.",
    },
  ],
  commonMistakes: [
    "Calling the handler instead of passing it: `onClick={handleClick()}` runs during render. Pass the function, `onClick={handleClick}`, or wrap it: `onClick={() => handleClick(id)}`.",
    "Forgetting `event.preventDefault()` in an `onSubmit` handler. The browser reloads the page and your state and requests are lost. Call it first.",
    "Writing the event name in lowercase like HTML, `onclick`. React only knows camelCase: `onClick`, `onChange`, `onSubmit`.",
    "Putting `onClick` on the submit button to save a form. Pressing Enter in an input then does nothing. Put the save logic in the form's `onSubmit` instead.",
  ],
  relatedConcepts: [
    "react-props",
    "react-usestate",
    "react-controlled-form",
    "js-event",
    "js-arrow-function",
    "html-button",
  ],
  relatedFiles: [],
  relatedBuildSteps: [],
};
