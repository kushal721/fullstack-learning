import type { GlossaryEntry } from "@fsl/shared";

// Glossary entries introduced by the "React" topic.
export const reactGlossary: GlossaryEntry[] = [
  {
    id: "react-why",
    topicId: "react",
    term: "React",
    aliases: ["why react", "react library", "declarative"],
    kind: "concept",
    short:
      "A library where you describe what the page should look like for the current data, and React updates it.",
    body: "You write [[react-component|components]]: functions that take data and return what should be on screen. When the data ([[react-state|state]]) changes, React works out the page changes for you, instead of you finding and editing each element by hand.",
    conceptPageId: "react-why",
  },
  {
    id: "react-component",
    topicId: "react",
    term: "Component",
    aliases: ["components", "react component", "function component"],
    kind: "concept",
    short:
      "A function that returns a piece of the screen, which you then use like your own HTML tag.",
    body: "`function NoteCard() { return <article>…</article>; }` describes one note; `<NoteCard />` puts it on the page. Names start with a capital letter, they return [[jsx|JSX]], and they receive their inputs as [[react-props|props]].",
    analogy:
      "A LEGO brick: built once, used in many places, and bigger things are made by snapping bricks together.",
    conceptPageId: "react-component",
  },
  {
    id: "jsx",
    topicId: "react",
    term: "JSX",
    aliases: ["tsx", "jsx syntax"],
    kind: "concept",
    short:
      "HTML-like syntax for writing React UI inside JavaScript, turned into plain JavaScript by a build tool.",
    body: "`<h2>{note.title}</h2>` looks like HTML, but anything in curly braces is a JavaScript expression whose result is shown. Tags can be [[html-element|HTML elements]] or your own [[react-component|components]]. [[vite|Vite]] turns JSX into JavaScript the browser can run.",
    conceptPageId: "jsx",
  },
  {
    id: "react-props",
    topicId: "react",
    term: "Props",
    aliases: ["prop", "properties", "children"],
    kind: "concept",
    short:
      "The inputs a parent component passes to a child, written like attributes on the child's tag.",
    body: "In `<NoteCard note={note} />`, `note` is a prop. React collects props into one object and passes it to the [[react-component|component]]. They can be any value, even functions, and `children` holds what you put between the tags. A child never changes its props.",
    conceptPageId: "react-props",
  },
  {
    id: "react-event-handling",
    topicId: "react",
    term: "Event handling in React",
    aliases: ["onClick", "onChange", "onSubmit", "react events"],
    kind: "concept",
    short:
      "Passing a function to a JSX attribute like `onClick`, so React runs it when the user acts.",
    body: "`<button onClick={handleClick}>` calls `handleClick` on every click. React passes an [[js-event|event]] object, with `event.target.value` for an input's text and `event.preventDefault()` to stop a form reloading. Handlers usually update [[react-state|state]].",
    conceptPageId: "react-event-handling",
  },
  {
    id: "react-state",
    topicId: "react",
    term: "State",
    aliases: ["react state", "component state", "re-render"],
    kind: "concept",
    short:
      "Data a component remembers between renders; when it changes, the screen updates to match.",
    body: "The list of notes, the text in an input, whether a menu is open: all state. React keeps it outside the [[react-component|component]] function so it survives re-renders, and re-renders when it changes. You create it with [[react-usestate|useState]].",
    conceptPageId: "react-state",
  },
  {
    id: "react-usestate",
    topicId: "react",
    term: "useState",
    aliases: ["usestate", "setState", "setter"],
    kind: "concept",
    short:
      "The React hook that lets a component remember a value and update the screen when it changes.",
    body: "`const [notes, setNotes] = useState([])` gives you the current value and a setter; `[]` is the starting value. Calling `setNotes(newNotes)` stores the new [[react-state|state]] and makes React re-render. Never change the value directly.",
    conceptPageId: "react-usestate",
  },
  {
    id: "react-useeffect",
    topicId: "react",
    term: "useEffect",
    aliases: ["useeffect", "effect", "side effect", "dependency array"],
    kind: "concept",
    short:
      "The hook that runs code after a component appears, to sync with things outside React like a server.",
    body: "`useEffect(setup, [deps])` runs `setup` after the component is on screen, and again when a dependency changes; `[]` means once. Loading notes with [[js-fetch|fetch]] is the classic use. The setup can return a cleanup function.",
    conceptPageId: "react-useeffect",
  },
  {
    id: "react-how-hooks-work",
    topicId: "react",
    term: "How hooks work",
    aliases: ["hooks", "rules of hooks", "hook"],
    kind: "concept",
    short:
      "React remembers each hook by the order it is called, which is why hooks must always run in the same order.",
    body: "React keeps a list of hook data per component, and each call like [[react-usestate|useState]] reads the next item. So a component must call the same hooks in the same order every render: never inside an `if` or a loop. That is the rules of hooks.",
    conceptPageId: "react-how-hooks-work",
  },
  {
    id: "react-custom-hook",
    topicId: "react",
    term: "Custom hook",
    aliases: ["custom hooks", "useNotes", "use function"],
    kind: "concept",
    short:
      "Your own function whose name starts with `use`, bundling state and effects so components can reuse them.",
    body: "`useNotes` calls [[react-usestate|useState]] and [[react-useeffect|useEffect]] and returns `{ notes, isLoading, addNote }`. Any component gets all of that with one line, and the logic lives in one place instead of being copied.",
    conceptPageId: "react-custom-hook",
  },
  {
    id: "react-lists-keys",
    topicId: "react",
    term: "Lists and keys",
    aliases: ["key", "keys", "map", "list rendering"],
    kind: "concept",
    short:
      "Turning an array into a list on screen with `map`, giving each item a stable, unique `key`.",
    body: "`notes.map((note) => <NoteCard key={note.id} note={note} />)` draws one card per note. The `key` lets React tell items apart when the list changes, so use an id that never changes, not the position in the [[js-object-array|array]].",
    conceptPageId: "react-lists-keys",
  },
  {
    id: "react-controlled-form",
    topicId: "react",
    term: "Controlled form",
    aliases: ["controlled input", "controlled forms", "react form"],
    kind: "concept",
    short:
      "A form whose input values live in React state, so your code always knows what was typed.",
    body: "Each input gets `value={title}` and `onChange` that updates the [[react-usestate|state]]. On submit, your handler stops the page reload, checks the values, sends them, then clears the fields or shows an error. It is a plain [[html-form|form]] that React drives.",
    conceptPageId: "react-controlled-form",
  },
  {
    id: "react-component-communication",
    topicId: "react",
    term: "How components communicate",
    aliases: ["lifting state up", "callback props", "props down events up"],
    kind: "concept",
    short:
      "Data flows down as props, events flow up through callbacks, and shared state lives in the nearest common parent.",
    body: "A parent passes data down as [[react-props|props]] and a function like `onSaved(note)`; the child calls it to say something happened. When two components need the same [[react-state|state]], move it up to their closest common parent: lifting state up.",
    conceptPageId: "react-component-communication",
  },
  {
    id: "react-reusable-component",
    topicId: "react",
    term: "Reusable component",
    aliases: ["reusable components", "ui component", "design system"],
    kind: "concept",
    short:
      "A small component like a button, written once with flexible props and used everywhere.",
    body: "A `Button` [[react-component|component]] wraps an [[html-button|HTML button]] with shared styling. Its [[react-props|props]] are its settings: `children` for the label, a few choices like `variant`, and the rest passed straight to the element. Change it once and every button changes.",
    conceptPageId: "react-reusable-component",
  },
  {
    id: "vite",
    topicId: "react",
    term: "Vite",
    aliases: ["dev server", "bundler", "build tool"],
    kind: "concept",
    short:
      "The build tool that runs a React project while you work and turns it into small, fast files for production.",
    body: "During development, `npm run dev` serves your files and updates the page the moment you save. For release, `npm run build` makes a [[production-build|production build]]: a few optimized files in `dist/`. It also turns [[jsx|JSX]] into JavaScript.",
    conceptPageId: "vite",
  },
];
