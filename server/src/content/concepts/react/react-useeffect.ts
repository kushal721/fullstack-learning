import type { Concept } from "@fsl/shared";

export const reactUseEffect: Concept = {
  id: "react-useeffect",
  slug: "react-useeffect",
  title: "useEffect",
  topicId: "react",
  summary:
    "The React hook that runs code after a component appears on the screen, to keep it in sync with things outside React such as a server or a timer.",
  basics: [
    "A React component is a function that returns what should appear on the screen. Rendering should only calculate that output: it should not change anything outside the component.",
    "Some work does reach outside React, though: loading data from a server, starting a timer, listening to window events, or changing the page title. This outside work is called a side effect, or simply an effect.",
    "Hooks are functions from React whose names start with `use`; they give a component extra abilities. `useEffect` is the hook for effects.",
  ],
  what: [
    "`useEffect(setup, dependencies)` tells React: after you have put this component on the screen, run the `setup` function. The setup can optionally return a cleanup function that undoes what it started.",
    "The dependency array controls when it runs again. With no array, it runs after every render. With `[]`, it runs once when the component appears. With `[value]`, it runs when the component appears and again whenever `value` has changed.",
  ],
  why: [
    "If you fetch data or start a timer directly in the component body, it happens on every render, and setting state from it causes another render, which can loop forever. Effects run at a controlled moment, after the screen is updated.",
    "The cleanup function prevents leaks and bugs: timers that keep ticking after the component is gone, duplicate event listeners, or an old request overwriting newer data.",
  ],
  howItWorks: [
    "React renders the component and updates the page first. Only then does it run the effect, so the user already sees something (for example a loading message) while the effect works.",
    "On each later render, React compares every value in the dependency array with its value from the previous render. If none changed, the effect is skipped. If one changed, React first runs the previous cleanup, then the effect again.",
    "When the component is removed from the page, React runs the last cleanup one final time.",
    "In development, `<StrictMode>` (which the Vite template turns on in `main.jsx`) runs every effect, then its cleanup, then the effect again right after the component appears. This is deliberate: if that breaks something, your cleanup is missing. It does not happen in the production build.",
  ],
  basicExample: {
    language: "jsx",
    code: `import { useEffect, useState } from "react";

function Clock() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);

    return () => clearInterval(id); // cleanup
  }, []); // run once when Clock appears

  return <p>Open for {seconds} seconds</p>;
}`,
    caption:
      "The effect starts one timer when Clock appears, and the cleanup stops it when Clock is removed.",
    highlightLines: [6, 11, 12],
  },
  internals: [
    "Each render has its own props and state, and the effect function created during that render sees those values. That is why every value from the component used inside the effect belongs in the dependency array; otherwise the effect keeps using old values.",
    "React compares dependencies with `Object.is`, roughly the same as `===`. A new object or array created during render counts as changed every time, which makes the effect run on every render.",
    "The setup function itself must not be `async`, because it may only return a cleanup function, not a promise. Define an `async` function inside the effect and call it.",
    "When fetching, the component may change or disappear before the response arrives. A common fix is an `ignore` flag set to `true` in the cleanup, so a late response is not written into state.",
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
      text: "Replace the contents of `src/App.jsx` with a component that loads data in an effect. It uses the free test API at jsonplaceholder.typicode.com and an `ignore` flag in the cleanup.",
      code: {
        language: "jsx",
        fileName: "src/App.jsx",
        code: `import { useEffect, useState } from "react";

export default function App() {
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    console.log("effect runs");

    async function load() {
      const response = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=5");
      const data = await response.json();
      if (!ignore) {
        setNotes(data);
        setIsLoading(false);
      }
    }
    load();

    return () => {
      console.log("cleanup runs");
      ignore = true;
    };
  }, []);

  if (isLoading) return <p>Loading...</p>;

  return (
    <ul>
      {notes.map((note) => (
        <li key={note.id}>{note.title}</li>
      ))}
    </ul>
  );
}`,
      },
    },
    {
      text: "Open http://localhost:5173. You see Loading... first, then the list once the data arrives — the effect ran after the first render.",
    },
    {
      text: "Open the browser console. In development you see effect runs, cleanup runs, effect runs: StrictMode tested your cleanup. Thanks to the `ignore` flag, only the second request writes into state.",
    },
  ],
  whereUsed: [
    "Loading data when a page or component appears, such as the list of notes on a dashboard.",
    "Starting and stopping timers, subscriptions, or listeners on `window` and `document`.",
    "Not for calculating values from props or state (compute them during render) and not for reacting to a click or submit (do that in the event handler).",
  ],
  connectsTo: [
    "`useState`, which stores the results an effect produces, such as loaded data, loading and error flags.",
    "`fetch` and `async`/`await`, the usual way an effect talks to an API.",
    "How hooks work: effects run after the commit phase of each render, and must follow the rules of hooks.",
    "Custom hooks like `useNotes`, which hide an effect and its state behind a simple function.",
  ],
  projectUsage: [
    {
      explanation:
        "`useNotes` (`src/hooks/useNotes.js`) has a `useEffect(() => { ... getNotes() ... }, [])` that loads the notes once when the Dashboard appears, then stores them with `setNotes` and clears `isLoading`.",
    },
    {
      explanation:
        "Saving and deleting are not done in effects: `NoteForm` calls `createNote` inside its `handleSave` submit handler, and `removeNote` runs when a Delete button is clicked, because those happen in response to a user event.",
    },
  ],
  commonMistakes: [
    "Leaving out the dependency array when fetching and setting state. The effect runs after every render, each fetch sets state, which renders again: an endless loop. Add `[]` or the right dependencies.",
    "Missing dependencies, so the effect uses old values. List every prop and state value the effect reads; the `react-hooks/exhaustive-deps` lint rule warns you.",
    "Making the setup function `async`, e.g. `useEffect(async () => ...)`. Define an `async` function inside the effect and call it instead.",
    "Using an effect for things that are not effects, such as copying `notes.length` into a `count` state, or sending a request when a button is clicked. Calculate during render, and handle clicks in the event handler.",
  ],
  relatedConcepts: [
    "react-usestate",
    "react-how-hooks-work",
    "react-custom-hook",
    "js-fetch",
    "js-async-await",
  ],
  relatedFiles: [],
  relatedBuildSteps: [],
};
