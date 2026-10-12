import type { BuildStep } from "@fsl/shared";

export const createPageStep: BuildStep = {
  id: "create-page",
  slug: "create-page",
  order: 5,
  title: "Create a page",
  goal: "Build the Dashboard page that shows a list of NoteCards.",
  why: "A page combines components into one screen. Rendering a list teaches how React turns an array of data into many components, which is how almost every app shows its content.",
  problemSolved:
    "Showing a changing number of notes without writing a NoteCard by hand for each one.",
  prerequisites: ["create-first-component"],
  explanation: [
    "A **page** is a component that represents a whole screen. The Notes App has three: Dashboard (your notes), Login and Register. Pages live in `src/pages/` and are made of smaller components from `src/components/`.",
    "To show a list, we keep the notes in an **array** and call `.map()` on it. `map` runs a function for every item and returns a new array — here an array of `<NoteCard>` elements, which React shows one after another.",
    "Every item in a list needs a **key**: a value that is unique among its siblings and stays the same for the same item. React uses keys to tell which card is which when the list changes, so it updates only what changed. A note's `id` is the perfect key.",
    "The page now owns the data (the array) and passes each note down to a NoteCard. The parent → child flow is how components communicate: data goes down as props, and events (like *Delete*) come back up through functions.",
    "A CSS grid lays the cards out: one column on phones and more columns on wider screens, using media queries.",
  ],
  howToCreate: [
    {
      text: "In `notes-app/frontend`, create the folder for pages.",
      code: {
        language: "bash",
        code: "mkdir src/pages",
      },
    },
    {
      text: "Create `src/pages/Dashboard.jsx`. It holds three sample notes and turns each one into a NoteCard with `.map()`. The `key` tells React which card belongs to which note.",
      code: {
        language: "jsx",
        code: 'import NoteCard from "../components/NoteCard.jsx";\n\n// Fake notes for now: step 6 keeps them in state and step 7 loads real\n// ones from the API.\nconst sampleNotes = [\n  { id: 1, title: "Shopping", content: "Milk\\nBread\\nApples" },\n  { id: 2, title: "Ideas", content: "Learn how React state works." },\n  { id: 3, title: "Reminder", content: "Call the dentist on Friday." },\n];\n\nexport default function Dashboard() {\n  return (\n    <main className="dashboard">\n      <h1>Your notes</h1>\n      <section className="notes-grid" aria-label="Notes">\n        {sampleNotes.map((note) => (\n          <NoteCard\n            key={note.id}\n            note={note}\n            onDelete={(id) => console.log("Delete note", id)}\n          />\n        ))}\n      </section>\n    </main>\n  );\n}',
        fileName: "frontend/src/pages/Dashboard.jsx",
        caption:
          "First version with fake data. Step 6 keeps the notes in state and adds the form.",
      },
    },
    {
      text: "Replace `src/App.jsx`: the sample card from step 4 moves into the Dashboard, so App only places the Navbar and the page.",
      code: {
        language: "jsx",
        code: 'import Navbar from "./components/Navbar.jsx";\nimport Dashboard from "./pages/Dashboard.jsx";\n\nexport default function App() {\n  return (\n    <>\n      <Navbar />\n      <Dashboard />\n    </>\n  );\n}',
        fileName: "frontend/src/App.jsx",
        caption:
          "Step 11 makes App switch between Login, Register and Dashboard.",
      },
    },
    {
      text: 'Add the notes grid styles to the end of `src/index.css`. `1fr` means "one equal share of the free space", so `repeat(3, 1fr)` makes three equal columns.',
      code: {
        language: "css",
        code: "/* Notes: one column on phones, more as the screen gets wider. */\n.notes-grid {\n  display: grid;\n  grid-template-columns: 1fr;\n  gap: 1rem;\n}\n\n@media (min-width: 40rem) {\n  .notes-grid {\n    grid-template-columns: repeat(2, 1fr);\n  }\n}\n\n@media (min-width: 64rem) {\n  .notes-grid {\n    grid-template-columns: repeat(3, 1fr);\n  }\n}",
        fileName: "frontend/src/index.css",
      },
    },
    {
      text: "Check it worked: the page shows the heading **Your notes** and three cards. Make the browser window narrow and wide: the cards go from one column to two to three. Clicking Delete still only logs a message — nothing disappears yet, because nothing can change. That is the problem step 6 solves.",
    },
  ],
  fromScratch: [
    "Create `src/pages/` and add one component per screen; keep reusable pieces in `src/components/`.",
    "Start a page with hard-coded sample data shaped like the real data (here: `id`, `title`, `content`), so you can build the layout before any API exists.",
    "Render lists with `array.map(item => <Item key={item.id} … />)`, using a stable unique id as the key — never the array index if items can be added or removed.",
    "Lay out lists with CSS grid and media queries, starting with one column for small screens.",
  ],
  filesCreated: ["frontend/src/pages/Dashboard.jsx"],
  filesModified: ["frontend/src/App.jsx", "frontend/src/index.css"],
  filesRemoved: [],
  conceptIds: ["react-component-communication", "react-lists-keys"],
  codeExamples: [
    {
      language: "jsx",
      code: "{sampleNotes.map((note) => (\n  <NoteCard key={note.id} note={note} onDelete={…} />\n))}",
      fileName: "frontend/src/pages/Dashboard.jsx",
      caption:
        'One NoteCard per note. Without `key`, React warns in the console: "Each child in a list should have a unique key prop".',
    },
  ],
  relationshipIds: [
    "component:App->renders->component:Dashboard",
    "component:Dashboard->renders->component:NoteCard",
  ],
  enables:
    "Show a whole page of notes from an array, laid out in a responsive grid.",
  commonMistakes: [
    "Forgetting the `key` prop, or using the array index as the key. React warns, and when notes are added or deleted it can show the wrong data in the wrong card.",
    "Using curly braces in the arrow function, `notes.map((note) => { <NoteCard … /> })`, without `return`. The function returns nothing, so no cards appear. Use parentheses `=> ( … )` or write `return`.",
    "Importing with the wrong relative path from a page: Dashboard is in `src/pages/`, so components are at `../components/NoteCard.jsx`, not `./components/…`.",
  ],
  nextStepId: "add-state",
  nextWhy:
    "The notes are fixed in the code, so nothing on the page can change. Next we keep them in state and let the user add notes with a form.",
};
