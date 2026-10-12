import type { Concept } from "@fsl/shared";

export const jsObjectArray: Concept = {
  id: "js-object-array",
  slug: "js-object-array",
  title: "Objects and arrays",
  topicId: "javascript",
  summary:
    "The two ways JavaScript groups data: objects hold named values and arrays hold ordered lists.",
  basics: [
    'A variable holds one value, such as the string `"Buy milk"` or the number `3`. But real data comes in groups: a note has a title, a content and an id, and an app has many notes.',
    "Keeping each piece in its own variable (`noteTitle1`, `noteContent1`, `noteTitle2`...) quickly becomes impossible to manage. JavaScript gives you two containers that keep related values together under one name.",
    "An object is like a form with labelled fields: each value has a name. An array is like a numbered list: each value has a position. Most app data is a mix of both — for example, an array of note objects.",
  ],
  what: [
    'An object is written with curly braces and holds properties, which are name-value pairs: `const note = { id: 1, title: "Buy milk" };`. The name on the left of each colon is the key; the value can be anything, even another object or an array.',
    'An array is written with square brackets and holds values in order: `const tags = ["home", "shopping"];`. Each value has a numbered position called an index, which starts at `0`, and `tags.length` tells you how many items there are.',
  ],
  why: [
    "Grouping keeps related data together, so you can pass a whole note to a function or send it to the server as one value instead of juggling many separate variables.",
    "Arrays come with built-in methods for the jobs every app needs: turning each item into something else (`map`), keeping only some items (`filter`) and finding one item (`find`). That replaces most hand-written loops.",
  ],
  howItWorks: [
    'You read a property with dot access, `note.title`, when you know its name while writing the code. Bracket access, `note["title"]` or `note[key]`, takes the name as a string, so it also works when the name is stored in a variable. Reading a property that does not exist gives `undefined`.',
    "You read an array item by its index: `tags[0]` is the first item, `tags[tags.length - 1]` the last. `map`, `filter` and `find` each take a callback function and call it once per item: `map` returns a new array of the callback's results, `filter` a new array of the items for which it returned `true`, and `find` the first matching item (or `undefined`).",
    'The spread syntax `...` copies the contents of one array or object into a new one: `[...notes, newNote]` is a new array with one more item, and `{ ...note, title: "New" }` is a new object with one property replaced.',
    "Destructuring unpacks values into variables in one line: `const { title, content } = note` reads two properties, and `const [first, second] = tags` reads the first two items.",
  ],
  basicExample: {
    language: "js",
    code: `const notes = [
  { id: 1, title: "Buy milk", done: true },
  { id: 2, title: "Walk dog", done: false },
];

const titles = notes.map((note) => note.title); // ["Buy milk", "Walk dog"]
const open = notes.filter((note) => !note.done); // only Walk dog
const second = notes.find((note) => note.id === 2);

const { title } = second; // destructuring
const more = [...notes, { id: 3, title: "Read", done: false }]; // a new array`,
    caption:
      "An array of objects, transformed with `map`, `filter` and `find`, then unpacked and copied with destructuring and spread.",
    highlightLines: [6, 7, 8, 11],
  },
  internals: [
    "A variable does not contain the object or array itself; it holds a reference — the address where the object lives in memory. `const copy = notes` copies only that address, so both names point to the same array and changing one changes the other.",
    "Some array methods change the existing array (they mutate it): `push`, `pop`, `splice` and `sort`. Others leave it untouched and return a new one: `map`, `filter`, `slice` and spread. Knowing which is which avoids surprise bugs.",
    "React decides whether to re-render by checking if the state value is a different reference. `notes.push(note)` keeps the same array, so React may see no change; `[...notes, note]` creates a new array, so React knows to update the screen. The same goes for objects: use `{ ...note, title }` instead of `note.title = title`.",
    "Spread makes a shallow copy: the outer array or object is new, but objects nested inside it are still shared. If you need to change a nested object, spread that one too.",
  ],
  howToCreate: [
    {
      text: "Create a file called `data.js` with an array of note objects and read values from it with dot access, bracket access and an index.",
      code: {
        language: "js",
        fileName: "data.js",
        code: `const notes = [
  { id: 1, title: "Buy milk", done: true },
  { id: 2, title: "Walk dog", done: false },
];

console.log(notes[0].title); // Buy milk
const field = "done";
console.log(notes[1][field]); // false
console.log(notes.length); // 2`,
      },
    },
    {
      text: "Add lines that use `map`, `filter` and `find`, then destructure the result.",
      code: {
        language: "js",
        fileName: "data.js",
        code: `const titles = notes.map((note) => note.title);
const openNotes = notes.filter((note) => !note.done);
const { id, title } = notes.find((note) => note.title === "Walk dog");

console.log(titles, openNotes.length, id, title);`,
      },
    },
    {
      text: "Add a new note the React way — with spread, creating a new array — and prove the original array was not changed.",
      code: {
        language: "js",
        fileName: "data.js",
        code: `const newNote = { id: 3, title: "Read book", done: false };
const updated = [...notes, newNote];

console.log(notes.length, updated.length); // 2 3
console.log(notes === updated); // false: a different array`,
      },
    },
    {
      text: "Run it with `node data.js`. You should see `Buy milk`, `false`, `2`, the titles array, `1 2 Walk dog`, then `2 3` and `false` — the original list still has two notes because spread built a new one.",
      code: {
        language: "bash",
        code: `node data.js`,
      },
    },
  ],
  whereUsed: [
    "Data from the server: an API usually returns JSON, which becomes objects and arrays in JavaScript, like a list of notes.",
    "React state for lists and forms, where you update with new arrays and objects made with spread, `map` and `filter`.",
    "Rendering lists in React with `map`, and passing several values to a function as a single object, e.g. `createNote({ title, content })`.",
  ],
  connectsTo: [
    "JSON, the text format that looks like JavaScript objects and arrays and is used to send them over the network.",
    "Arrow functions, the usual way to write the callbacks for `map`, `filter` and `find`.",
    "React `useState`, which needs a new array or object to notice a change.",
    "TypeScript, which can describe the exact shape of an object, such as a note.",
  ],
  projectUsage: [
    {
      explanation:
        "`useNotes` (`frontend/src/hooks/useNotes.js`) keeps the notes array in state and adds a saved note with `setNotes([...notes, note])`, creating a new array so React re-renders the Dashboard.",
      fileId: "frontend/src/hooks/useNotes.js",
      match: "setNotes((current) => [note, ...current]);",
    },
    {
      explanation:
        "The Dashboard turns the array into components with `notes.map((note) => <NoteCard key={note.id} note={note} />)`, reading each note's `id` with dot access.",
      fileId: "frontend/src/pages/Dashboard.jsx",
      match: "key={note.id}",
    },
    {
      explanation:
        "`NoteForm` sends the note as one object, `createNote({ title, content })`. That shorthand builds an object whose keys `title` and `content` take the values of the variables with the same names.",
      fileId: "frontend/src/components/NoteForm.jsx",
      match: "const note = await createNote({ title, content });",
    },
  ],
  commonMistakes: [
    "Mutating state, e.g. `notes.push(note); setNotes(notes)`. React gets the same array and may not update. Create a new one: `setNotes([...notes, note])`.",
    "Expecting `const copy = notes` to make a copy. It copies the reference, so both names change together. Use `[...notes]` or `{ ...note }`.",
    "Starting indexes at 1: `tags[1]` is the second item. The first item is `tags[0]` and the last is `tags[tags.length - 1]`.",
    "Using dot access with a name stored in a variable: `note.key` looks for a property literally called `key`. Use brackets: `note[key]`.",
  ],
  relatedConcepts: [
    "js-variable",
    "js-arrow-function",
    "json",
    "react-usestate",
  ],
  relatedFiles: [],
  relatedBuildSteps: [],
};
