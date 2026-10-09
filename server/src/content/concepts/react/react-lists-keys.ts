import type { Concept } from "@fsl/shared";

export const reactListsKeys: Concept = {
  id: "react-lists-keys",
  slug: "react-lists-keys",
  title: "Lists and keys",
  topicId: "react",
  summary:
    "How React turns an array of data into a list on the screen, and why every item in that list needs a stable, unique `key`.",
  basics: [
    'An array is an ordered list of values in JavaScript, written with square brackets: `["Milk", "Eggs", "Bread"]`. Apps keep most of their data in arrays, for example all the notes a user has written.',
    "Arrays have a method called `map`. It runs a function once for every item and returns a new array with the results: `[1, 2, 3].map((n) => n * 2)` gives `[2, 4, 6]`. The original array is not changed.",
    "In JSX (the HTML-like syntax React components return), anything inside curly braces is plain JavaScript. If that JavaScript produces an array of elements, React draws every element in it, one after another.",
    "Every time state changes, React re-renders: it calls the component again, gets a new description of the screen, and compares it with the previous one to work out the smallest set of changes to make on the real page.",
  ],
  what: [
    "Rendering a list means using `map` to turn each data item into a piece of JSX, such as `notes.map((note) => <NoteCard note={note} />)`, and placing the result inside the component's output.",
    "A `key` is a special prop you give each item in that list, like `key={note.id}`. It is not passed to the component; React keeps it for itself to tell the items apart.",
  ],
  why: [
    "You rarely know in advance how many items there will be. A user may have zero notes or three hundred. With `map`, one line of JSX works for any number of items, and the list updates automatically when the array in state changes.",
    "When the array changes between renders, React has to decide which old item became which new item. Without a key, it can only match them by position, so after an insert or a delete it may update the wrong element, keep the wrong typed text, or redo work it could have skipped. The key tells React exactly which item is which.",
  ],
  howItWorks: [
    "On each render, `map` produces a fresh array of elements. Each element carries its `key`.",
    "React compares the new list with the previous one key by key. An element whose key existed before is treated as the same item: React keeps its DOM element and its state, and only updates what changed.",
    "A key that is new means a new item: React creates it. A key that disappeared means a removed item: React removes its element and throws its state away.",
    "Because of this matching, a key must be unique among its siblings and stable: the same item must get the same key on every render. An id that comes from the database, such as `note.id`, fits both rules.",
  ],
  basicExample: {
    language: "jsx",
    code: `const notes = [
  { id: 7, title: "Buy milk" },
  { id: 12, title: "Call Sam" },
];

function NoteList() {
  return (
    <ul>
      {notes.map((note) => (
        <li key={note.id}>{note.title}</li>
      ))}
    </ul>
  );
}`,
    caption:
      "`map` turns each note object into a list item, and `key={note.id}` lets React recognise each item on later renders.",
    highlightLines: [9, 10],
  },
  internals: [
    "React stores the rendered list as a set of internal records, one per element, each remembering its key, its type and its state. On the next render it builds a lookup from key to record, then walks the new list and reuses the record with the same key.",
    "If you use the array index as the key (`key={i}`), the key describes a position, not an item. Delete the first item and every item below moves up one place, so each one now has the key that used to belong to its neighbour. React reuses the old record for that key, including any state or typed text inside it, and attaches it to the wrong data.",
    "Index keys are only safe when the list never changes order, never has items inserted or removed except at the end, and its items keep no state. Most real lists break at least one of these rules.",
    "If you forget the key entirely, React falls back to using the index and prints a warning in the browser console: each child in a list should have a unique key prop. If two siblings share the same key, React warns too and may drop or duplicate one of them.",
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
      text: "Replace `src/App.jsx` with a list where each row has its own input, and deliberately use the array index as the key. The Remove first button deletes the first item.",
      code: {
        language: "jsx",
        fileName: "src/App.jsx",
        code: `import { useState } from "react";

const startNotes = [
  { id: 1, title: "Buy milk" },
  { id: 2, title: "Call Sam" },
  { id: 3, title: "Water plants" },
];

export default function App() {
  const [notes, setNotes] = useState(startNotes);

  return (
    <div>
      <button type="button" onClick={() => setNotes(notes.slice(1))}>
        Remove first
      </button>
      <ul>
        {notes.map((note, i) => (
          <li key={i}>
            {note.title} <input placeholder="comment" />
          </li>
        ))}
      </ul>
    </div>
  );
}`,
      },
    },
    {
      text: "Open http://localhost:5173, type a comment into the Buy milk row only, then press Remove first. Buy milk disappears, but your comment is now next to Call Sam. React kept the input that had key 0 and gave it to the item that is now at position 0.",
    },
    {
      text: "Change the key to the note's id and save the file.",
      code: {
        language: "jsx",
        fileName: "src/App.jsx",
        code: `{notes.map((note) => (
  <li key={note.id}>
    {note.title} <input placeholder="comment" />
  </li>
))}`,
        highlightLines: [2],
      },
    },
    {
      text: "Reload the page and repeat the test. This time the comment disappears together with Buy milk, and Call Sam keeps its own empty input, because each key now follows its item instead of its position.",
    },
  ],
  whereUsed: [
    "Anywhere data comes in an array: lists of notes, comments, search results, table rows, menu items and dropdown options.",
    "Lists that change while the user is on the page, such as items being added, deleted, sorted or filtered. These are exactly the lists where a stable key matters most.",
  ],
  connectsTo: [
    "JavaScript arrays and their `map` and `filter` methods, which create the new arrays you render.",
    "`useState`, which holds the array; calling its setter with a new array triggers the re-render that React matches by key.",
    "Props: each list item is usually a component that receives one item as a prop, like `note={note}`.",
    "The backend and database, which create the unique ids you use as keys.",
  ],
  projectUsage: [
    {
      explanation:
        "`Dashboard.jsx` renders the notes with `notes.map((note) => <NoteCard key={note.id} note={note} onDelete={removeNote} />)`. The `id` comes from the database, so it is unique and never changes.",
    },
    {
      explanation:
        "When a note is deleted, `useNotes` calls `setNotes((current) => current.filter((n) => n.id !== id))`. React sees that one key is missing and removes only that `NoteCard`; the other cards are left as they are.",
    },
    {
      explanation:
        "When a note is saved, `addNote` puts it first with `[note, ...current]`, so the newest note is at the top, matching the order the API returns. Its new id is a key React has not seen before, so React creates exactly one new `NoteCard` at the end.",
    },
  ],
  commonMistakes: [
    "Forgetting the key, which makes React warn in the console and match items by position. Add `key={item.id}` to the outermost element returned from `map`.",
    "Using the array index as the key in a list that can change, so typed text or other state ends up next to the wrong item after a delete or reorder. Use an id that belongs to the item.",
    "Generating keys during render, such as `key={Math.random()}` or `key={crypto.randomUUID()}`. The key changes on every render, so React throws away and recreates every item each time. Create ids once, when the data is created, and store them with the data.",
    "Putting the key on the wrong element, for example on the `li` inside `NoteCard` instead of on `NoteCard` in the `map`. The key belongs on the element that `map` returns directly.",
  ],
  relatedConcepts: [
    "react-usestate",
    "react-props",
    "react-component",
    "js-object-array",
  ],
  relatedFiles: [],
  relatedBuildSteps: [],
};
