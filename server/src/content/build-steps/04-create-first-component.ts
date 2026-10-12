import type { BuildStep } from "@fsl/shared";

export const createFirstComponentStep: BuildStep = {
  id: "create-first-component",
  slug: "create-first-component",
  order: 4,
  title: "Create the first component",
  goal: "Build NoteCard to show one note, using a reusable Button component.",
  why: "Showing a note is the heart of the app. Making Button its own component from the start means every button in the app looks and behaves the same, and a style change happens in one place.",
  problemSolved:
    "Repeating the same HTML and classes for every note and every button, so one design change means editing many places.",
  prerequisites: ["create-frontend-structure"],
  explanation: [
    "Components receive data through **props** (short for properties). `<NoteCard note={note} />` passes a note object to NoteCard, which reads it as `note.title` and `note.content`. Props flow one way: from parent to child.",
    "`Button` is a **reusable component**: it wraps a real `<button>` and adds the app's classes. It takes a `variant` prop (`primary`, `secondary` or `danger`) to pick the colour. `...props` collects every other prop (`type`, `onClick`, `disabled`…) and passes them straight on, so Button works anywhere a normal button would.",
    "`children` is a special prop: whatever you write between `<Button>` and `</Button>` (here the text *Delete*) arrives as `children`.",
    "NoteCard doesn't delete anything itself. It receives an `onDelete` function as a prop and calls it with the note's id when the button is clicked. The component that owns the list of notes decides what deleting means. This pattern — data down, events up — is how React components work together.",
    "Text inside `{note.content}` is **escaped** by React: if a note contains `<script>`, it is shown as text and never runs. That protects users from cross-site scripting (XSS) without extra code.",
  ],
  howToCreate: [
    {
      text: "Create `src/components/Button.jsx`. The template string builds the class name from the variant, e.g. `button button-danger`.",
      code: {
        language: "jsx",
        code: '// One button for the whole app: change the style here and every form,\n// card and menu follows. Any other prop (type, onClick, disabled…) is\n// passed straight to the real <button>.\nexport default function Button({ children, variant = "primary", ...props }) {\n  return (\n    <button className={`button button-${variant}`} {...props}>\n      {children}\n    </button>\n  );\n}',
        fileName: "frontend/src/components/Button.jsx",
        caption:
          "This is the final version of the file; no later step changes it.",
      },
    },
    {
      text: "Create `src/components/NoteCard.jsx`. It shows the title as a heading, the content as a paragraph, and a Delete button that calls `onDelete` with the note's id.",
      code: {
        language: "jsx",
        code: 'import Button from "./Button.jsx";\n\nexport default function NoteCard({ note, onDelete }) {\n  return (\n    <article className="note-card">\n      <h2>{note.title}</h2>\n      {/* React escapes this text, so a note containing HTML is shown as\n          text and can never run as code (no XSS). */}\n      <p>{note.content}</p>\n      <div className="note-actions">\n        <Button\n          type="button"\n          variant="danger"\n          onClick={() => onDelete(note.id)}\n        >\n          Delete\n        </Button>\n      </div>\n    </article>\n  );\n}',
        fileName: "frontend/src/components/NoteCard.jsx",
        caption:
          "First version. Step 7 adds editing a note in place, which needs the Input component (step 6) and the API (step 7).",
      },
    },
    {
      text: "Add the button and note card styles to the end of `src/index.css`. `var(--color-primary)` uses the colours defined at the top of the file in step 2.",
      code: {
        language: "css",
        code: "/* Buttons */\n.button {\n  padding: 0.5rem 1rem;\n  font: inherit;\n  border: 1px solid transparent;\n  border-radius: 0.375rem;\n  cursor: pointer;\n}\n\n.button:disabled {\n  opacity: 0.6;\n  cursor: not-allowed;\n}\n\n.button:focus-visible {\n  outline: 2px solid var(--color-primary);\n  outline-offset: 2px;\n}\n\n.button-primary {\n  color: white;\n  background: var(--color-primary);\n}\n\n.button-secondary {\n  color: var(--color-text);\n  background: white;\n  border-color: var(--color-border);\n}\n\n.button-danger {\n  color: white;\n  background: var(--color-danger);\n}\n\n.button-link {\n  padding: 0;\n  color: var(--color-primary);\n  background: none;\n  text-decoration: underline;\n}\n\n.note-card {\n  padding: 1rem;\n  background: white;\n  border: 1px solid var(--color-border);\n  border-radius: 0.5rem;\n}\n\n.note-card h2 {\n  margin: 0 0 0.5rem;\n  font-size: 1.125rem;\n}\n\n.note-card p {\n  /* Keep the line breaks the user typed. */\n  white-space: pre-wrap;\n}\n\n.note-actions {\n  display: flex;\n  gap: 0.5rem;\n}",
        fileName: "frontend/src/index.css",
      },
    },
    {
      text: "Try the card with a sample note. Replace the `<main>` in `src/App.jsx` so it renders one NoteCard. For now, deleting only writes a message to the browser console.",
      code: {
        language: "jsx",
        code: 'import Navbar from "./components/Navbar.jsx";\nimport NoteCard from "./components/NoteCard.jsx";\n\nconst sampleNote = {\n  id: 1,\n  title: "My first note",\n  content: "Hello from the Notes App.",\n};\n\nexport default function App() {\n  return (\n    <>\n      <Navbar />\n      <main className="page-message">\n        <NoteCard\n          note={sampleNote}\n          onDelete={(id) => console.log("Delete note", id)}\n        />\n      </main>\n    </>\n  );\n}',
        fileName: "frontend/src/App.jsx",
        caption:
          "Temporary test code: step 5 moves the notes into a Dashboard page.",
      },
    },
    {
      text: "Check it worked: the page shows a white card with **My first note**, its text and a red **Delete** button. Open the browser console (F12 → Console) and click Delete: it prints `Delete note 1`. Change the sample note's text and save: the card updates at once.",
    },
  ],
  fromScratch: [
    "Write the component that shows one item first (a card, a row), taking the item as a prop.",
    "As soon as the same element appears twice (buttons, inputs), make it a small reusable component that passes extra props on with `...props`.",
    "Let child components report events through function props (`onDelete`, `onSave`) instead of changing data themselves.",
    "Test a new component with hard-coded sample data before connecting it to real data.",
  ],
  filesCreated: [
    "frontend/src/components/Button.jsx",
    "frontend/src/components/NoteCard.jsx",
  ],
  filesModified: ["frontend/src/App.jsx", "frontend/src/index.css"],
  filesRemoved: [],
  conceptIds: [
    "react-component",
    "jsx",
    "react-props",
    "react-reusable-component",
  ],
  codeExamples: [
    {
      language: "jsx",
      code: '<NoteCard note={sampleNote} onDelete={(id) => console.log("Delete note", id)} />',
      fileName: "frontend/src/App.jsx",
      caption:
        "Data goes down as props (`note`); events come back up through a function prop (`onDelete`).",
    },
    {
      language: "jsx",
      code: '<Button type="button" variant="danger" onClick={() => onDelete(note.id)}>\n  Delete\n</Button>',
      fileName: "frontend/src/components/NoteCard.jsx",
      caption:
        "`variant` picks the colour, `type` and `onClick` pass straight through to the real `<button>`, and *Delete* arrives as `children`.",
    },
  ],
  relationshipIds: ["component:NoteCard->renders->component:Button"],
  enables:
    "Show a note on the screen with a component that receives the note as props and reports clicks back to its parent.",
  commonMistakes: [
    "Writing `onClick={onDelete(note.id)}` instead of `onClick={() => onDelete(note.id)}`. The first calls the function immediately while rendering; the second waits for the click.",
    'Forgetting `type="button"` on buttons. Inside a form a button defaults to `type="submit"` and sends the form when clicked.',
    'Changing a prop inside the child, e.g. `note.title = "…"`. Props are read-only; the parent owns the data and changes it (step 6).',
    "Copying button markup and classes into every component instead of using Button, so the buttons slowly drift apart in style.",
  ],
  nextStepId: "create-page",
  nextWhy:
    "One card is not a page. Next we build the Dashboard page that shows a whole list of notes, one NoteCard each.",
};
