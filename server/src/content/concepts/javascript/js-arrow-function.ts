import type { Concept } from "@fsl/shared";

export const jsArrowFunction: Concept = {
  id: "js-arrow-function",
  slug: "js-arrow-function",
  title: "Arrow functions",
  topicId: "javascript",
  summary:
    "A shorter way to write a function, ideal for small functions you pass to other code.",
  basics: [
    "A function is a reusable block of code: it takes inputs called parameters, runs some steps and can send a value back with `return`. The classic way to write one is `function double(n) { return n * 2; }`.",
    "Functions are values in JavaScript. You can store one in a variable or pass it to another function, which will call it later. A function passed in like this is called a callback.",
    "Callbacks are often tiny — one line that doubles a number or checks a field. Writing the full `function` keyword, braces and `return` for each one adds a lot of noise around very little logic.",
  ],
  what: [
    "An arrow function is a function written with the `=>` arrow instead of the `function` keyword: `(n) => n * 2`. The parameters go in parentheses on the left, and the body goes on the right of the arrow.",
    "Arrow functions have no name of their own. To reuse one you store it in a variable — `const double = (n) => n * 2;` — and call it like any other function: `double(4)` gives `8`.",
  ],
  why: [
    'They keep short callbacks readable. `notes.map((note) => note.title)` fits on one line and reads almost like a sentence: "for each note, take its title".',
    "They are the usual way to write inline event handlers in React, such as `onClick={() => setOpen(true)}`, where you need a small function right there in the markup.",
  ],
  howItWorks: [
    "If the body is a single expression (something that produces a value) without curly braces, its value is returned automatically. This is called implicit return: `(a, b) => a + b` returns the sum without writing `return`.",
    "If you add curly braces, the body becomes a normal block of statements and you must write `return` yourself: `(a, b) => { const sum = a + b; return sum; }`. Without the `return`, the function gives back `undefined`.",
    'With exactly one parameter the parentheses are optional (`n => n * 2`), and with no parameters you write empty parentheses: `() => console.log("hi")`. Many teams keep the parentheses always, for consistency.',
    "To return an object directly you must wrap it in parentheses: `(title) => ({ title })`. Without them, JavaScript reads the `{` as the start of a function body, not as an object.",
  ],
  basicExample: {
    language: "js",
    code: `const prices = [5, 10, 20];

const doubled = prices.map((price) => price * 2);
console.log(doubled); // [10, 20, 40]

const makeNote = (title) => ({ title, done: false });
console.log(makeNote("Buy milk")); // { title: 'Buy milk', done: false }`,
    caption:
      "The arrow function in `map` returns `price * 2` for each item without `return`; the object literal needs parentheses.",
    highlightLines: [3, 6],
  },
  internals: [
    'An arrow function is still a function value. `typeof ((n) => n)` is `"function"`, and you can pass it, store it and call it exactly like a function made with `function`.',
    "Unlike `function`, an arrow function does not get its own `this` (a special keyword that refers to the object a function was called on). It uses the `this` of the code around it. That is why arrow functions are handy inside classes and callbacks, but should not be used as methods that rely on their own `this`.",
    "Arrow functions are not hoisted like `function` declarations. They live in a `const` variable, so you can only call them on lines after the one where they are created.",
    "In React, writing `onClick={() => save(note)}` creates a new small function on every render. That is normal and cheap; it lets you pass arguments to `save` without calling it immediately.",
  ],
  howToCreate: [
    {
      text: "Create a file called `arrows.js` and write the same function twice — once with `function` and once as an arrow — to compare them.",
      code: {
        language: "js",
        fileName: "arrows.js",
        code: `function doubleClassic(n) {
  return n * 2;
}

const doubleArrow = (n) => n * 2;

console.log(doubleClassic(4), doubleArrow(4)); // 8 8`,
      },
    },
    {
      text: "Use arrow functions as callbacks for array methods, including one that returns an object.",
      code: {
        language: "js",
        fileName: "arrows.js",
        code: `const titles = ["Buy milk", "", "Walk dog"];

const notEmpty = titles.filter((title) => title !== "");
const notes = notEmpty.map((title, index) => ({ id: index + 1, title }));

console.log(notes);`,
      },
    },
    {
      text: "Run the file with Node.js.",
      code: {
        language: "bash",
        code: `node arrows.js`,
      },
    },
    {
      text: "Check the output: `8 8`, then an array of two objects, `{ id: 1, title: 'Buy milk' }` and `{ id: 2, title: 'Walk dog' }`. Now remove the parentheses around the object in the `map` callback and run it again — you get an array of `undefined`, because the braces became a function body with no `return`.",
    },
  ],
  whereUsed: [
    "Callbacks for array methods such as `map`, `filter`, `find` and `forEach`.",
    "Event handlers, both in React (`onChange={(e) => setTitle(e.target.value)}`) and in plain JavaScript with `addEventListener`.",
    "Short helper functions stored in a `const`, and the `.then(...)` callbacks of promises.",
  ],
  connectsTo: [
    "Regular functions: an arrow function is the same idea with shorter syntax and no own `this`.",
    "Array methods like `map` and `filter`, which take a function and call it once per item.",
    "Events and React state: handlers such as `() => setCount(count + 1)` connect a click to a state update.",
  ],
  projectUsage: [
    {
      explanation:
        "The Dashboard renders the list with `notes.map((note) => <NoteCard key={note.id} note={note} />)`. The arrow function receives each note and implicitly returns a `NoteCard` for it.",
      fileId: "frontend/src/pages/Dashboard.jsx",
      match: "{notes.map((note) => (",
    },
    {
      explanation:
        "In `NoteForm.jsx`, the inputs update state with inline arrow functions such as `onChange={(event) => setTitle(event.target.value)}`, so every keystroke updates the title.",
      fileId: "frontend/src/components/NoteForm.jsx",
      match: "onChange={(event) => setTitle(event.target.value)}",
    },
  ],
  commonMistakes: [
    "Adding curly braces and forgetting `return`: `(n) => { n * 2 }` returns `undefined`. Either remove the braces or write `return n * 2`.",
    "Returning an object without parentheses: `(t) => { title: t }` returns `undefined`. Wrap it: `(t) => ({ title: t })`.",
    "Calling the handler instead of passing it in React: `onClick={save(note)}` runs `save` during render. Wrap it in an arrow: `onClick={() => save(note)}`.",
    "Using an arrow function as an object method that needs `this`; it gets the surrounding `this` instead of the object. Use a regular method there.",
  ],
  relatedConcepts: [
    "js-function",
    "js-object-array",
    "js-event-listener",
    "react-usestate",
  ],
  relatedFiles: [],
  relatedBuildSteps: [],
};
