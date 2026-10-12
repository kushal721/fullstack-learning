import type { Concept } from "@fsl/shared";

export const reactHowHooksWork: Concept = {
  id: "react-how-hooks-work",
  slug: "react-how-hooks-work",
  title: "How hooks work",
  topicId: "react",
  summary:
    "How React remembers each hook between renders by the order the hooks are called, and why that leads to the rules of hooks.",
  basics: [
    "A React component is a JavaScript function that returns what should appear on the screen. React calls it to draw the component, and calls it again whenever its state or props change; each call is a render.",
    "A hook is a function from React whose name starts with `use`, such as `useState` or `useEffect`. Hooks give a plain function abilities it would not have on its own, like remembering values between calls or running code after the screen updates.",
    "Before hooks (added in React 16.8), only class components could have state. Today function components with hooks are the normal way to write React.",
  ],
  what: [
    "Hooks are not magic: React keeps an ordered list of hook data for every component on the page. Each hook call during a render reads the next item in that list.",
    "Because React finds a hook's data by its position in the list, not by a name, every render of a component must call the same hooks in the same order. That requirement is the rules of hooks.",
  ],
  why: [
    "Knowing how hooks are stored explains rules that otherwise look arbitrary: why `useState` cannot go inside an `if`, and why `useState` does not need a name or key to find its value.",
    "It also makes bugs easier to understand. When state jumps to the wrong variable or React reports that it rendered more hooks than during the previous render, the cause is almost always a hook whose call order changed.",
  ],
  howItWorks: [
    "Render: React calls your component function. As each hook runs, it reads or creates its item in the component's hook list. The function returns a description of the screen.",
    "Commit: React compares that description with what is on the page and updates only the parts that changed.",
    "Effects: after the page is updated, React runs any effects whose dependencies changed (running the old cleanup first).",
    "State change: calling a setter stores the new value in that hook's item and schedules a new render. The cycle starts again, and each hook finds its item at the same position as last time.",
  ],
  basicExample: {
    language: "jsx",
    code: `function NoteForm({ showContent }) {
  const [title, setTitle] = useState(""); // hook 1

  // WRONG: this hook only runs sometimes
  if (showContent) {
    const [content, setContent] = useState(""); // hook 2 (sometimes)
  }

  const [error, setError] = useState(null); // hook 2 or 3
  // ...
}

// Render 1, showContent = true:  title -> 1, content -> 2, error -> 3
// Render 2, showContent = false: title -> 1, error -> 2 (reads content's slot!)`,
    caption:
      "When showContent changes, error would read the slot that belonged to content. React notices the hook count changed and stops with the error Rendered fewer hooks than expected.",
    highlightLines: [5, 6, 9],
  },
  internals: [
    "React remembers which component it is currently rendering. When `useState` is called, React looks at that component's hook list and a counter that starts at 0 for each render; the call uses the item at the counter and moves the counter forward.",
    "The rules of hooks follow directly. Call hooks only at the top level of a component or of a custom hook. Never inside an `if`, a loop, a nested function, an event handler, or after an early `return`, because any of these can change how many hooks run.",
    "Hooks may only be called while React is rendering a component. A normal helper function called from an event handler runs outside a render, so React has no component and no hook list to use.",
    "Names that start with `use` let tools recognise hooks. Linters check the rules for you: the Vite React template runs oxlint with the `react/rules-of-hooks` rule (`npm run lint`), and projects using ESLint add `eslint-plugin-react-hooks`, which also warns about missing effect dependencies with `react-hooks/exhaustive-deps`.",
  ],
  howToCreate: [
    {
      text: "Create a React project with Vite in a terminal, then start it. The template already includes a linter (oxlint) that knows the rules of hooks.",
      code: {
        language: "bash",
        code: `npm create vite@latest my-notes -- --template react
cd my-notes
npm install
npm run dev`,
      },
    },
    {
      text: "Replace the contents of `src/App.jsx` with a component that breaks the rules: one hook is inside an `if`.",
      code: {
        language: "jsx",
        fileName: "src/App.jsx",
        code: `import { useState } from "react";

export default function App() {
  const [showContent, setShowContent] = useState(true);

  if (showContent) {
    const [content] = useState("Draft text");
    console.log(content);
  }

  const [title] = useState("My note");

  return (
    <div>
      <p>Title: {title}</p>
      <button type="button" onClick={() => setShowContent(false)}>
        Hide content
      </button>
    </div>
  );
}`,
      },
    },
    {
      text: "Run `npm run lint` in a second terminal. The linter reports that `useState` is called conditionally. Then open http://localhost:5173, click Hide content, and look at the browser console: React reports that it rendered fewer hooks than expected and the page breaks.",
      code: {
        language: "bash",
        code: `npm run lint`,
      },
    },
    {
      text: 'Fix it by always calling the hook and putting the condition in what you render: move `const [content] = useState("Draft text");` above the `if`, keep only the `console.log` inside it, save, and click the button again. It now works every time.',
    },
  ],
  whereUsed: [
    "Every component that uses `useState`, `useEffect` or a custom hook relies on call order to find its data.",
    "Custom hooks follow the same rules, because their hook calls are simply added to the list of the component that calls them.",
  ],
  connectsTo: [
    "`useState`, whose value is stored in one item of the hook list.",
    "`useEffect`, which runs in the effects phase after the commit.",
    "Custom hooks, which are just functions that call hooks in a fixed order at their top level.",
    "Conditional rendering: put the condition in the returned JSX, not around the hook call.",
  ],
  projectUsage: [
    {
      explanation:
        "`useNotes` calls `useState` for `notes`, `isLoading` and `error`, then `useEffect`, always in that order and at the top level. Each render of Dashboard therefore lines up the same four hook items.",
      fileId: "frontend/src/hooks/useNotes.js",
      match: "const [notes, setNotes] = useState([]);",
    },
    {
      explanation:
        "`Dashboard` calls `useNotes()` as the first line of the component, outside any condition, so the same hooks run on every render whether it is showing a loading message, an error or the notes.",
      fileId: "frontend/src/pages/Dashboard.jsx",
      match:
        "const { notes, isLoading, error, addNote, replaceNote, removeNote } =",
    },
    {
      explanation:
        "`NoteForm` declares `title` and `content` with two `useState` calls at its top level; the save logic that changes them lives in the `handleSave` event handler, which only calls setters, never hooks.",
      fileId: "frontend/src/components/NoteForm.jsx",
      match: 'const [title, setTitle] = useState("");',
    },
  ],
  commonMistakes: [
    "Calling a hook inside an `if` or loop. The number of hooks changes between renders and values get mixed up. Call the hook every time and put the condition inside it or in the JSX.",
    "Returning early before a hook, e.g. `if (isLoading) return <p>Loading</p>` above a `useState`. Move all hook calls above any early `return`.",
    "Calling a hook inside an event handler or a normal helper function. Call it at the top level of the component and use its value or setter in the handler.",
    "Naming a function that calls hooks without the `use` prefix, e.g. `getNotesData()`. The linter reports an error and readers cannot tell it holds hook state. Name it `useNotesData()`.",
  ],
  relatedConcepts: [
    "react-usestate",
    "react-useeffect",
    "react-custom-hook",
    "react-state",
    "react-component",
  ],
  relatedFiles: [],
  relatedBuildSteps: [],
};
