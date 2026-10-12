import type { BuildStep } from "@fsl/shared";

export const addStateStep: BuildStep = {
  id: "add-state",
  slug: "add-state",
  order: 6,
  title: "Add state",
  goal: "Keep the notes in state, add the NoteForm, and move the logic into a useNotes custom hook.",
  why: "The screen must change when the user adds or deletes a note. State is how React remembers data between renders and redraws the page when it changes; a custom hook keeps that logic out of the page so it stays readable and reusable.",
  problemSolved:
    "A page that cannot change after it first appears: deleting does nothing and there is no way to add a note.",
  prerequisites: ["create-page"],
  explanation: [
    "**State** is data a component remembers between renders. A normal variable is recreated every time the component function runs, so changing it never shows on screen. `useState(initialValue)` returns the current value and a **setter**; calling the setter stores a new value and makes React render the component again with it.",
    "State must be replaced, not changed: `setNotes([note, ...current])` creates a new array. If you `push` into the old array, React sees the same array and does not re-render.",
    'The form uses **controlled inputs**: each input\'s `value` comes from state and every keystroke calls `setTitle`/`setContent`. The text always lives in React, so on save we can read it and clear the fields by setting them back to `""`.',
    "Who owns the notes? Both NoteForm (adds) and NoteCard (deletes) need them, so the state lives in their closest common parent, Dashboard. The form reports a new note with `onSaved`, a card reports a delete with `onDelete`, and Dashboard updates the array. This is called *lifting state up*.",
    "**Hooks** are functions whose names start with `use` (`useState`, `useEffect`…). React remembers each hook's value by the **order** in which they are called, so hooks must always be called at the top level of a component, in the same order — never inside `if` statements or loops.",
    "A **custom hook** is your own function that calls hooks. Moving the notes state and its functions into `useNotes()` leaves Dashboard with one line of logic and lots of layout. In step 7 the hook also loads and saves notes through the API — and Dashboard won't need to change for that.",
  ],
  howToCreate: [
    {
      text: "Create `src/components/Input.jsx`: a labelled form field. Its `multiline` prop switches between `<input>` and `<textarea>`.",
      code: {
        language: "jsx",
        code: '// A labelled form field. The label\'s htmlFor matches the input\'s id, so\n// clicking the label focuses the input and screen readers announce it.\nexport default function Input({ label, id, multiline = false, ...props }) {\n  const Field = multiline ? "textarea" : "input";\n  return (\n    <div className="form-field">\n      <label htmlFor={id}>{label}</label>\n      <Field id={id} {...props} />\n    </div>\n  );\n}',
        fileName: "frontend/src/components/Input.jsx",
        caption: "Final version of the file.",
      },
    },
    {
      text: "Create `src/components/NoteForm.jsx` with two controlled inputs. On submit it sends the new note to its parent through `onSaved` and clears the fields.",
      code: {
        language: "jsx",
        code: 'import { useState } from "react";\nimport Button from "./Button.jsx";\nimport Input from "./Input.jsx";\n\nexport default function NoteForm({ onSaved }) {\n  // Controlled inputs: the text lives in state, so we can read it on save\n  // and clear it afterwards.\n  const [title, setTitle] = useState("");\n  const [content, setContent] = useState("");\n\n  function handleSave(event) {\n    // Stop the browser from reloading the page; we handle the data ourselves.\n    event.preventDefault();\n    // For now the note only lives in the browser. Date.now() is a simple\n    // unique id until step 7, when the server creates real ids.\n    onSaved({ id: Date.now(), title, content });\n    setTitle("");\n    setContent("");\n  }\n\n  return (\n    <form className="note-form" onSubmit={handleSave}>\n      <Input\n        id="note-title"\n        label="Title"\n        value={title}\n        onChange={(event) => setTitle(event.target.value)}\n        maxLength={100}\n        required\n      />\n      <Input\n        id="note-content"\n        label="Note"\n        multiline\n        rows={4}\n        value={content}\n        onChange={(event) => setContent(event.target.value)}\n      />\n      <Button type="submit">Save</Button>\n    </form>\n  );\n}',
        fileName: "frontend/src/components/NoteForm.jsx",
        caption:
          "First version. Step 7 sends the note to the API, shows *Saving…* and shows errors.",
      },
    },
    {
      text: "Replace `src/pages/Dashboard.jsx` to keep the notes in state with `useState`, and pass `addNote` to the form and `removeNote` to the cards.",
      code: {
        language: "jsx",
        code: 'import { useState } from "react";\nimport NoteCard from "../components/NoteCard.jsx";\nimport NoteForm from "../components/NoteForm.jsx";\n\nconst sampleNotes = [\n  { id: 1, title: "Shopping", content: "Milk\\nBread\\nApples" },\n  { id: 2, title: "Ideas", content: "Learn how React state works." },\n  { id: 3, title: "Reminder", content: "Call the dentist on Friday." },\n];\n\nexport default function Dashboard() {\n  const [notes, setNotes] = useState(sampleNotes);\n\n  function addNote(note) {\n    setNotes((current) => [note, ...current]);\n  }\n\n  function removeNote(id) {\n    setNotes((current) => current.filter((note) => note.id !== id));\n  }\n\n  return (\n    <main className="dashboard">\n      <h1>Your notes</h1>\n      <NoteForm onSaved={addNote} />\n      <section className="notes-grid" aria-label="Notes">\n        {notes.map((note) => (\n          <NoteCard key={note.id} note={note} onDelete={removeNote} />\n        ))}\n      </section>\n    </main>\n  );\n}',
        fileName: "frontend/src/pages/Dashboard.jsx",
        caption:
          "It works — but the page now mixes data logic with layout. The next two instructions move the logic into a custom hook.",
      },
    },
    {
      text: "Create the hooks folder and `src/hooks/useNotes.js`. It is the same state and functions, moved into a function whose name starts with `use` and which returns what the page needs.",
      code: {
        language: "bash",
        code: "mkdir src/hooks",
      },
    },
    {
      text: "Write the hook.",
      code: {
        language: "js",
        code: 'import { useState } from "react";\n\n// Sample data until step 7 loads the notes from the API.\nconst sampleNotes = [\n  { id: 1, title: "Shopping", content: "Milk\\nBread\\nApples" },\n  { id: 2, title: "Ideas", content: "Learn how React state works." },\n  { id: 3, title: "Reminder", content: "Call the dentist on Friday." },\n];\n\n// Owns the list of notes so components only decide what to show.\nexport function useNotes() {\n  const [notes, setNotes] = useState(sampleNotes);\n\n  // New arrays every time: React only re-renders when state is a new value.\n  function addNote(note) {\n    setNotes((current) => [note, ...current]);\n  }\n\n  function removeNote(id) {\n    setNotes((current) => current.filter((note) => note.id !== id));\n  }\n\n  return { notes, addNote, removeNote };\n}',
        fileName: "frontend/src/hooks/useNotes.js",
        caption:
          "First version. Step 7 replaces the sample data with notes loaded from the API.",
      },
    },
    {
      text: "Replace `src/pages/Dashboard.jsx` once more so it gets everything from the hook. It also shows a message when there are no notes.",
      code: {
        language: "jsx",
        code: 'import NoteCard from "../components/NoteCard.jsx";\nimport NoteForm from "../components/NoteForm.jsx";\nimport { useNotes } from "../hooks/useNotes.js";\n\n// The closest common parent of the form and the cards: it holds the shared\n// notes (through useNotes) and passes data down and callbacks down to them.\nexport default function Dashboard() {\n  const { notes, addNote, removeNote } = useNotes();\n\n  return (\n    <main className="dashboard">\n      <h1>Your notes</h1>\n      <NoteForm onSaved={addNote} />\n      {notes.length === 0 && <p>No notes yet. Write your first one above.</p>}\n      <section className="notes-grid" aria-label="Notes">\n        {notes.map((note) => (\n          <NoteCard key={note.id} note={note} onDelete={removeNote} />\n        ))}\n      </section>\n    </main>\n  );\n}',
        fileName: "frontend/src/pages/Dashboard.jsx",
        caption: "Step 7 adds loading and error messages.",
      },
    },
    {
      text: "Add the form styles to the end of `src/index.css`.",
      code: {
        language: "css",
        code: "/* Forms: label above input, the same spacing everywhere. */\n.form-field {\n  display: flex;\n  flex-direction: column;\n  gap: 0.25rem;\n  margin-bottom: 1rem;\n}\n\n.form-field input,\n.form-field textarea {\n  padding: 0.5rem;\n  font: inherit;\n  border: 1px solid var(--color-border);\n  border-radius: 0.375rem;\n}\n\n.form-error {\n  color: var(--color-danger);\n}\n\n.note-form {\n  padding: 1rem;\n  margin-bottom: 1.5rem;\n  background: white;\n  border: 1px solid var(--color-border);\n  border-radius: 0.5rem;\n}",
        fileName: "frontend/src/index.css",
      },
    },
    {
      text: "Check it worked: type a title and some text and press **Save** — the note appears first in the list and the fields are cleared. Click **Delete** on a card — it disappears. Delete all notes to see *No notes yet*. Reload the page: the sample notes are back and your notes are gone, because state lives only in the browser's memory.",
    },
  ],
  fromScratch: [
    "Start by keeping data in `useState` in the component that shows it.",
    "When two components need the same data, move the state up to their closest common parent and pass data down and callbacks (`onSaved`, `onDelete`) down too.",
    "Build forms with controlled inputs: `value={x}` plus `onChange={(e) => setX(e.target.value)}`, and call `event.preventDefault()` in `onSubmit`.",
    "Once a component's state logic grows, move it into a `useSomething` function in `src/hooks/` that returns the data and functions the component needs.",
    "Always update arrays and objects in state with new copies (`[...current]`, `.map`, `.filter`), never by changing them in place.",
  ],
  filesCreated: [
    "frontend/src/hooks/useNotes.js",
    "frontend/src/components/NoteForm.jsx",
    "frontend/src/components/Input.jsx",
  ],
  filesModified: ["frontend/src/pages/Dashboard.jsx", "frontend/src/index.css"],
  filesRemoved: [],
  conceptIds: [
    "react-state",
    "react-usestate",
    "react-controlled-form",
    "react-custom-hook",
    "react-how-hooks-work",
  ],
  codeExamples: [
    {
      language: "jsx",
      code: "const [notes, setNotes] = useState(sampleNotes);\n\nfunction addNote(note) {\n  setNotes((current) => [note, ...current]);\n}",
      fileName: "frontend/src/hooks/useNotes.js",
      caption:
        "`useState` gives the current notes and a setter. The setter receives a function, so it always starts from the latest list.",
    },
    {
      language: "jsx",
      code: '<Input\n  id="note-title"\n  label="Title"\n  value={title}\n  onChange={(event) => setTitle(event.target.value)}\n/>',
      fileName: "frontend/src/components/NoteForm.jsx",
      caption:
        "A controlled input: React state is the single source of truth for what the field shows.",
    },
  ],
  relationshipIds: [
    "fn:handleSave->handles->event:noteForm.submit",
    "fn:useNotes.removeNote->handles->event:noteCard.deleteClick",
    "component:Dashboard->renders->component:NoteForm",
    "component:NoteForm->renders->component:Button",
    "component:NoteForm->renders->component:Input",
    "component:Dashboard->uses->hook:useNotes",
    "hook:useNotes->uses->external:useState",
    "hook:useNotes->returns->fn:useNotes.addNote",
    "hook:useNotes->returns->fn:useNotes.removeNote",
    "fn:handleSave->calls->fn:useNotes.addNote",
    "component:NoteForm->uses->external:useState",
  ],
  enables:
    "Add and delete notes in the browser and see the list update immediately.",
  commonMistakes: [
    "Changing state in place, e.g. `notes.push(note)` then `setNotes(notes)`. It is the same array, so React doesn't re-render. Create a new array instead.",
    "Forgetting `event.preventDefault()` in the form's submit handler. The browser reloads the page and all state is lost.",
    "Calling a hook inside an `if` or a loop. React matches hooks by call order, so the order must never change between renders.",
    "Setting `value` on an input without an `onChange`. The field becomes read-only and React warns in the console.",
    "Naming a custom hook without `use` (e.g. `notesState()`). React's rules and tools then don't treat it as a hook.",
  ],
  nextStepId: "add-api-communication",
  nextWhy:
    "Notes vanish on reload because they only live in the browser's memory. Next we load and save them through an API with `fetch`, so a server can keep them.",
};
