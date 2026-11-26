import {
  anatomy,
  code,
  diagram,
  explain,
  inTheNotesApp,
  mistake,
  moduleLesson,
  pageYourTurn,
  part,
  quickCheck,
  reference,
  trace,
} from "../blocks.js";

// Events: handlers as props, a handler taken apart, passing versus
// calling, passing arguments, the event object, the common events, a
// child telling its parent (step by step), lifting state up, the Notes
// App, mistakes, practice and a recap.
export const eventsModule = moduleLesson(
  "events",
  "Events: responding to the user",
  45,
  [
    "Attach an event handler in JSX with onClick, onChange and friends.",
    "Pass a handler without calling it, and wrap it in an arrow to give it arguments.",
    "Read the event object: event.target.value and event.preventDefault().",
    "Let a child tell its parent something happened through a function prop.",
    "Lift state up to the closest common parent when two components need it.",
  ],

  part(
    "handlers",
    "Handlers are props too",
    explain(
      "In plain JavaScript you'd find a button and call `addEventListener`. In React you pass the function straight to the element as a prop: `onClick={handleClick}`. That's [[react-event-handling|event handling in React]]. When the user clicks, React calls your function; it usually sets state, and the screen follows.",
    ),
    diagram([
      ["the user clicks", "a button"],
      ["React calls", "your onClick handler"],
      ["the handler", "sets state"],
      ["React re-renders", "the screen updates"],
    ]),
  ),

  part(
    "anatomy",
    "A handler, taken apart",
    explain(
      "Handlers are usually defined inside the component, so they can read its props and state. Their names start with `handle`; the props that receive them start with `on`.",
    ),
    anatomy(
      "A click handler",
      [
        "function handleClick() {",
        "  setIsOpen(!isOpen);",
        "}",
        "<button onClick={handleClick}>Menu</button>",
      ],
      [
        [
          "handleClick",
          "the handler",
          "A function inside the component: it can see state.",
        ],
        ["setIsOpen(!isOpen)", "its job", "Change state; React redraws."],
        ["onClick", "the event", "camelCase: on + the event's name."],
        ["{handleClick}", "the function", "Passed, not called: no brackets."],
      ],
    ),
  ),

  part(
    "pass-not-call",
    "Pass the function, don't call it",
    explain(
      "`onClick={handleClick}` hands React the function to call later. `onClick={handleClick()}` calls it *now*, while rendering, and passes its result. To give a handler an argument, wrap it in an [[js-arrow-function|arrow function]]: the arrow is what React calls on the click.",
    ),
    code(
      "jsx",
      "Three ways to write it",
      [
        "<button onClick={handleClick}>",
        "",
        "<button onClick={handleClick()}>",
        "",
        "<button onClick={() => onDelete(note.id)}>",
      ],
      {
        1: "✓ React calls it on each click",
        3: "✗ runs during the render, not on click",
        5: "✓ with an argument: an arrow wraps the call",
      },
    ),
    quickCheck(
      "Which runs `remove(note.id)` only when the button is clicked?",
      [
        "`onClick={remove(note.id)}`",
        "`onClick={() => remove(note.id)}`",
        '`onClick="remove(note.id)"`',
      ],
      1,
      "The arrow function is created during the render but only called on the click. The first calls `remove` immediately.",
    ),
  ),

  part(
    "event-object",
    "The event object",
    explain(
      "React passes your handler an [[js-event|event]] object, much like the browser's. `event.target` is the element; for an input, `event.target.value` is its text. `event.preventDefault()` stops the browser's own action, like a form reloading the page.",
    ),
    code(
      "jsx",
      "Reading what was typed",
      [
        'const [query, setQuery] = useState("");',
        "",
        "<input",
        "  value={query}",
        "  onChange={(event) => setQuery(event.target.value)}",
        "/>",
        "<p>Searching for {query}</p>",
      ],
      {
        5: "runs on every key: store the input's text",
        7: "the paragraph follows as you type",
      },
    ),
  ),

  part(
    "common",
    "The events you'll use most",
    explain(
      "React's event props are the browser's events with `on` in front, in camelCase. A handful cover almost everything.",
    ),
    reference("Common events", [
      [
        "onClick",
        "A click or tap; Enter or Space on a button.",
        "<button onClick={save}>",
      ],
      [
        "onChange",
        "An input's value changed: every key.",
        "<input onChange={…} />",
      ],
      ["onSubmit", "A form is sent.", "<form onSubmit={handleSave}>"],
      ["onKeyDown", "A key is pressed.", 'if (event.key === "Escape") close()'],
      [
        "onFocus, onBlur",
        "An element gains or loses focus.",
        "<input onBlur={validate} />",
      ],
      [
        "stopPropagation",
        "Stop the event reaching parents.",
        "event.stopPropagation()",
      ],
    ]),
  ),

  part(
    "up",
    "A child tells its parent",
    explain(
      "A card can't remove itself from its parent's list: the list is the parent's state. So the parent passes down a function, and the card calls it with the id. That's [[react-component-communication|props down, events up]]. Step through a delete:",
    ),
    trace(
      "Deleting a note",
      [
        "function NoteCard({ note, onDelete }) {",
        "  const remove = () => onDelete(note.id);",
        "  return <button onClick={remove}>Delete</button>;",
        "}",
        "function Dashboard() {",
        "  const [notes, setNotes] = useState(start);",
        "  function removeNote(id) {",
        "    setNotes(notes.filter((n) => n.id !== id));",
        "  }",
        "  return notes.map((n) => (",
        "    <NoteCard key={n.id} note={n}",
        "      onDelete={removeNote} />",
        "  ));",
        "}",
      ],
      [
        {
          line: 6,
          note: "`Dashboard` owns the notes: Milk (id 1) and Eggs (id 2).",
          vars: [["notes", "[Milk, Eggs]"]],
        },
        {
          line: 12,
          note: "It draws a card per note and hands each one its `removeNote` function as the `onDelete` prop.",
          vars: [["onDelete", "removeNote"]],
          output: "[Delete] [Delete]",
        },
        {
          line: 2,
          note: "You click Milk's Delete. The arrow runs and calls `onDelete(1)`: the card is asking its parent.",
          vars: [["note.id", "1"]],
        },
        {
          line: 8,
          note: "That's `removeNote(1)` in the parent. It sets a new array without id 1.",
          vars: [
            ["id", "1"],
            ["new notes", "[Eggs]"],
          ],
        },
        {
          line: 11,
          note: "New state, so `Dashboard` re-renders with one note, and React removes Milk's card from the page.",
          vars: [["notes", "[Eggs]"]],
          output: "[Delete]",
        },
      ],
    ),
  ),

  part(
    "lifting",
    "Lifting state up",
    explain(
      "When two components need the same data, say a form that adds notes and a list that shows them, the state can't live in either one. Move it up to their closest common parent, and pass it down to both: the list gets the notes, the form gets a function to add one. This is called lifting state up.",
    ),
    code(
      "jsx",
      "The parent holds what both need",
      [
        "function Dashboard() {",
        "  const [notes, setNotes] = useState([]);",
        "  return (",
        "    <>",
        "      <NoteForm onSaved={(n) => setNotes([n, ...notes])} />",
        "      <NoteList notes={notes} />",
        "    </>",
        "  );",
        "}",
      ],
      {
        2: "lifted here, above both",
        5: "the form reports a new note up",
        6: "the list gets the notes down",
      },
    ),
  ),

  part(
    "notes-app",
    "Events in the Notes App",
    explain(
      "The Notes App's `Navbar` shows a Log out button, but logging out changes `App`'s state: who the user is and which page shows. So `App` passes `handleLogout` down as the `onLogout` prop, and the button calls it. `NoteCard` does the same with `onDelete` and `onUpdated`.",
    ),
    inTheNotesApp(
      "`Navbar` calls the `onLogout` prop it's given; the state it changes lives in `App`.",
      { fileId: "frontend/src/components/Navbar.jsx" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Calling the handler while rendering",
      language: "jsx",
      wrong: ["<button onClick={onDelete(note.id)}>"],
      problem:
        "It runs on every render, deleting straight away, and the click does nothing. If it sets state, it can loop forever.",
      right: ["<button onClick={() => onDelete(note.id)}>"],
      why: "Pass a function. Wrap the call in an arrow when it needs arguments.",
    }),
    mistake({
      title: "Lowercase event names",
      language: "jsx",
      wrong: ["<button onclick={save}>"],
      problem:
        "React warns about an unknown prop and never attaches the handler.",
      right: ["<button onClick={save}>"],
      why: "React's event props are camelCase.",
    }),
    mistake({
      title: "The child changing the parent's data",
      language: "jsx",
      wrong: [
        "function NoteCard({ notes, note }) {",
        "  notes.splice(notes.indexOf(note), 1);",
      ],
      problem: "It changes an array the parent owns, and nothing re-renders.",
      right: [
        "function NoteCard({ note, onDelete }) {",
        "  // … onClick={() => onDelete(note.id)}",
      ],
      why: "The owner of the state changes it; others ask through a function prop.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    pageYourTurn({
      title: "A like button",
      task: 'Keep `liked` in `state`. Make `render()` show `Liked` or `Like` on the button and set `aria-pressed` to `"true"` or `"false"`. On click, flip `state.liked` and render.',
      starter: [
        "<button></button>",
        "<script>",
        "  const state = { liked: false };",
        '  const button = document.querySelector("button");',
        "  function render() {",
        "",
        "  }",
        '  button.addEventListener("click", () => {',
        "",
        "  });",
        "  render();",
        "</script>",
      ],
      checks: [
        {
          kind: "text",
          label: "It starts as Like",
          selector: "button",
          text: "Like",
        },
        { kind: "click", label: "Click it", selector: "button" },
        {
          kind: "text",
          label: "It says Liked",
          selector: "button",
          text: "Liked",
        },
        {
          kind: "attr",
          label: "aria-pressed is true",
          selector: "button",
          name: "aria-pressed",
          value: "true",
        },
        { kind: "click", label: "Click again", selector: "button" },
        {
          kind: "text",
          label: "Back to Like",
          selector: "button",
          text: "Like",
        },
      ],
      hint: 'In `render`: `button.textContent = state.liked ? "Liked" : "Like";` and `button.setAttribute("aria-pressed", state.liked);`. On click: `state.liked = !state.liked; render();`',
      solution: [
        "<button></button>",
        "<script>",
        "  const state = { liked: false };",
        '  const button = document.querySelector("button");',
        "  function render() {",
        '    button.textContent = state.liked ? "Liked" : "Like";',
        '    button.setAttribute("aria-pressed", state.liked);',
        "  }",
        '  button.addEventListener("click", () => {',
        "    state.liked = !state.liked;",
        "    render();",
        "  });",
        "  render();",
        "</script>",
      ],
    }),
    pageYourTurn({
      title: "The child asks, the parent changes",
      task: "Each item's Delete button already calls `onDelete(note.id)`. Finish the parent's `removeNote(id)`: keep every note except that id, then `render()`.",
      starter: [
        '<ul id="list"></ul>',
        "<script>",
        '  let notes = [{ id: 1, title: "Milk" }, { id: 2, title: "Eggs" }];',
        "  function removeNote(id) {",
        "",
        "  }",
        "  function NoteItem(note, onDelete) {",
        '    const li = document.createElement("li");',
        "    li.innerHTML = `<span>${note.title}</span> <button>Delete</button>`;",
        '    li.querySelector("button").onclick = () => onDelete(note.id);',
        "    return li;",
        "  }",
        "  function render() {",
        "    const items = notes.map((n) => NoteItem(n, removeNote));",
        '    document.querySelector("#list").replaceChildren(...items);',
        "  }",
        "  render();",
        "</script>",
      ],
      checks: [
        { kind: "count", label: "Two notes", selector: "#list li", count: 2 },
        {
          kind: "click",
          label: "Delete Milk",
          selector: "#list li:first-child button",
        },
        {
          kind: "count",
          label: "One note left",
          selector: "#list li",
          count: 1,
        },
        {
          kind: "text",
          label: "It's Eggs",
          selector: "#list li span",
          text: "Eggs",
        },
      ],
      hint: "`notes = notes.filter((n) => n.id !== id);` then `render();`",
      solution: [
        '<ul id="list"></ul>',
        "<script>",
        '  let notes = [{ id: 1, title: "Milk" }, { id: 2, title: "Eggs" }];',
        "  function removeNote(id) {",
        "    notes = notes.filter((n) => n.id !== id);",
        "    render();",
        "  }",
        "  function NoteItem(note, onDelete) {",
        '    const li = document.createElement("li");',
        "    li.innerHTML = `<span>${note.title}</span> <button>Delete</button>`;",
        '    li.querySelector("button").onclick = () => onDelete(note.id);',
        "    return li;",
        "  }",
        "  function render() {",
        "    const items = notes.map((n) => NoteItem(n, removeNote));",
        '    document.querySelector("#list").replaceChildren(...items);',
        "  }",
        "  render();",
        "</script>",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Events cheat sheet", [
      ["onClick={fn}", "Pass the function.", "<button onClick={save}>"],
      ["With arguments", "Wrap in an arrow.", "onClick={() => remove(id)}"],
      ["Input text", "From the event.", "event.target.value"],
      ["Stop the default", "E.g. a form's reload.", "event.preventDefault()"],
      ["Names", "handle… inside, on… as props.", "onDelete={handleDelete}"],
      ["Events up", "Child calls a function prop.", "onDelete(note.id)"],
      [
        "Lift state up",
        "Shared state in the common parent.",
        "Dashboard holds notes",
      ],
    ]),
    quickCheck(
      "A search box and a results list both need the search text. Where should that state live?",
      [
        "In the search box",
        "In their closest common parent",
        "In both, kept in step",
      ],
      1,
      "Lift it up: the parent holds the text, passes it to the list, and passes a setter-calling function to the box.",
    ),
  ),
);
