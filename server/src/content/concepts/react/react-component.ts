import type { Concept } from "@fsl/shared";

export const reactComponent: Concept = {
  id: "react-component",
  slug: "react-component",
  title: "Components",
  topicId: "react",
  summary:
    "A component is a JavaScript function that returns a piece of the user interface, which you can then use like your own HTML tag.",
  basics: [
    "A function is a named block of code you can run again and again. It can take inputs and give back a value with `return`.",
    "JSX is the HTML-like syntax React uses inside JavaScript, such as `<h1>Notes</h1>`. A function can return JSX just like it can return a number or a string.",
    "A module is a JavaScript file that shares code with other files. `export` makes something in the file available, and `import` brings it into another file.",
  ],
  what: [
    "A React component is a function whose name starts with a capital letter and that returns JSX. For example, `function NoteCard() { return <article>...</article>; }` describes how one note looks.",
    "Once defined, you use a component as a tag in other JSX: `<NoteCard />`. React calls the function and puts what it returns in that place on the page.",
  ],
  why: [
    "A real page has many parts. Writing it as one huge piece of HTML makes it hard to read and impossible to reuse. Components let you split the page into small named pieces, each with one job.",
    "Because a component is a function, you can use it as often as you like. Write `NoteCard` once and show it for every note; fix a bug in it once and every note card is fixed.",
  ],
  howItWorks: [
    "You define a component as a function that returns JSX, and export it from its own file.",
    "Another component imports it and writes it as a tag, like `<Navbar />`. When React renders the parent, it sees that tag, calls the `Navbar` function and uses the JSX it returns.",
    "Components can contain other components, so the page becomes a tree: `App` renders `Navbar` and `Dashboard`, `Dashboard` renders `NoteForm` and many `NoteCard`s.",
    "At the very top, `createRoot(...).render(<App />)` in `main.jsx` tells React which DOM element to draw the whole tree into.",
  ],
  basicExample: {
    language: "jsx",
    code: `function Greeting() {
  return <h1>Welcome to Notes</h1>;
}

export default function App() {
  return (
    <main>
      <Greeting />
      <p>Write your first note below.</p>
    </main>
  );
}`,
    caption:
      "Greeting is a component; App uses it as a tag, and React puts its heading inside the main element.",
    highlightLines: [1, 8],
  },
  internals: [
    "JSX tags are checked by their first letter. A lowercase tag like `<main>` becomes a real HTML element; a capitalised tag like `<Greeting />` tells React to call your `Greeting` function. That is why component names must start with a capital letter.",
    "When React renders, it calls each component function, collects the JSX it returns and builds the tree of elements. You never call a component yourself; you write it as a tag and React decides when to call it.",
    "A component may be called many times — on every re-render. It should only calculate and return JSX, without side effects like changing the DOM directly, so calling it again always gives the same result for the same data.",
    '`createRoot(document.getElementById("root"))` connects React to one real DOM element. From then on React owns everything inside it and keeps it in sync with your components.',
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
      text: "Create a folder `src/components` and a file `NoteCard.jsx` inside it with one component. One component per file keeps things easy to find.",
      code: {
        language: "jsx",
        fileName: "src/components/NoteCard.jsx",
        code: `export default function NoteCard() {
  return (
    <article>
      <h2>Shopping</h2>
      <p>Milk, bread and eggs.</p>
    </article>
  );
}`,
      },
    },
    {
      text: "Replace the contents of `src/App.jsx` so it imports `NoteCard` and uses it twice.",
      code: {
        language: "jsx",
        fileName: "src/App.jsx",
        code: `import NoteCard from "./components/NoteCard.jsx";

export default function App() {
  return (
    <main>
      <h1>My notes</h1>
      <NoteCard />
      <NoteCard />
    </main>
  );
}`,
      },
    },
    {
      text: 'Look at `src/main.jsx`: Vite already wrote `createRoot(document.getElementById("root")).render(...)`, which draws `App` into the `#root` element of `index.html`. Open http://localhost:5173 and you see the heading and two identical note cards.',
    },
  ],
  whereUsed: [
    "Every part of a React app's UI is a component: whole pages, layout parts like a navigation bar, and small reusable pieces like buttons and inputs.",
    "A good time to make a new component is when a piece of UI repeats, or when one component grows so long that it is hard to read.",
  ],
  connectsTo: [
    "JSX, the syntax a component returns.",
    "Props, which let a parent pass different data to each copy of a component.",
    "State and hooks like `useState`, which give a component its own memory.",
    "Modules with `import` and `export`, which let each component live in its own file.",
  ],
  projectUsage: [
    {
      explanation:
        '`frontend/src/main.jsx` calls `createRoot(document.getElementById("root")).render(<App />)`, drawing the whole app into the `div` with id `root` in `index.html`.',
    },
    {
      explanation:
        "The Notes App splits its UI into one component per file: small reusable pieces in `src/components` (`Button`, `Input`, `NoteCard`, `NoteForm`, `Navbar`) and whole pages in `src/pages` (`Login`, `Register`, `Dashboard`).",
    },
    {
      explanation:
        "`App.jsx` renders `Navbar` and the current page; `Dashboard` renders one `NoteForm` and one `NoteCard` per note, forming a tree of components.",
    },
  ],
  commonMistakes: [
    "Starting a component name with a lowercase letter, like `function noteCard()`. React then treats `<noteCard />` as an unknown HTML tag. Always capitalise component names.",
    "Calling a component like a normal function, e.g. `{NoteCard()}`. Write it as a tag, `<NoteCard />`, so React can manage it and its hooks correctly.",
    "Forgetting the `return`, or putting the JSX on the line after a bare `return`. The function then returns `undefined`. Write `return (` and open the parenthesis on the same line.",
    "Defining a component inside another component. It is re-created on every render and loses its state. Define every component at the top level of its file.",
  ],
  relatedConcepts: [
    "jsx",
    "react-props",
    "js-function",
    "js-module-import-export",
  ],
  relatedFiles: [],
  relatedBuildSteps: [],
};
