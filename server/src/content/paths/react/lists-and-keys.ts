import {
  anatomy,
  code,
  explain,
  inTheNotesApp,
  keyPoints,
  mistake,
  moduleLesson,
  pageYourTurn,
  part,
  quickCheck,
  reference,
  trace,
  yourTurn,
} from "../blocks.js";

// Lists and keys: an array becomes elements, a list taken apart, why
// React needs keys (step by step), good and bad keys, filtering and
// sorting before map, empty lists, list item components, the Notes App,
// mistakes, practice and a recap.
export const listsAndKeysModule = moduleLesson(
  "lists-and-keys",
  "Lists and keys",
  45,
  [
    "Turn an array into elements with map.",
    "Give every item a stable, unique key, and explain what React uses it for.",
    "Explain why an array index or a random number makes a bad key.",
    "Filter and sort a list before showing it, without changing the state.",
    "Show a message for an empty list, and move each item into its own component.",
  ],

  part(
    "map",
    "From an array to elements",
    explain(
      "Data usually arrives as an array: notes, users, messages. To show one element per item, [[array-methods|map]] the array to JSX inside curly braces. React shows an array of elements one after another. That's [[react-lists-keys|lists and keys]], and the key is the part people forget.",
    ),
    code(
      "jsx",
      "One <li> per note",
      [
        "function NoteList({ notes }) {",
        "  return (",
        "    <ul>",
        "      {notes.map((note) => (",
        "        <li key={note.id}>{note.title}</li>",
        "      ))}",
        "    </ul>",
        "  );",
        "}",
      ],
      {
        4: "map gives back a new array of elements",
        5: "each one needs a key",
      },
    ),
  ),

  part(
    "anatomy",
    "A list, taken apart",
    explain(
      "Most lists in a real app draw a component per item. The `key` goes on the element that `map` returns, here the component itself, not on something inside it.",
    ),
    anatomy(
      "One card per note",
      [
        "{notes.map((note) => (",
        "  <NoteCard key={note.id} note={note} />",
        "))}",
      ],
      [
        ["notes.map", "loop", "Runs once per note and collects the results."],
        ["(note) =>", "each item", "Receives one note at a time."],
        ["key={note.id}", "key", "Tells this card apart from its siblings."],
        [
          "note={note}",
          "props",
          "The data the card shows. `key` isn't passed to it.",
        ],
      ],
    ),
  ),

  part(
    "why-keys",
    "What keys are for",
    explain(
      "After every render React compares the new elements with the old ones, to change as little of the page as possible: [[reconciliation|reconciliation]]. In a list, keys are how it matches them up. Same key means “same item, maybe moved”. Step through adding a note at the top, with ids as keys and then with positions:",
    ),
    trace(
      "Adding Tea at the top",
      [
        "function NoteList({ notes }) {",
        "  return (",
        "    <ul>",
        "      {notes.map((note) => (",
        "        <li key={note.id}>",
        "          {note.title} <input />",
        "        </li>",
        "      ))}",
        "    </ul>",
        "  );",
        "}",
      ],
      [
        {
          line: 5,
          note: "First render: Milk (id 1) and Eggs (id 2). You type “2 litres” in Milk's input.",
          vars: [["keys", "1, 2"]],
          output: "Milk [2 litres] · Eggs [ ]",
        },
        {
          line: 4,
          note: "Tea (id 3) is added at the top. The new list is Tea, Milk, Eggs.",
          vars: [["keys", "3, 1, 2"]],
        },
        {
          line: 5,
          note: "React matches by key: 1 and 2 already exist, so it keeps those `<li>`s, inputs and all. Key 3 is new, so it creates one.",
          vars: [["new", "3"]],
          output: "Tea [ ] · Milk [2 litres] · Eggs [ ]",
        },
        {
          line: 5,
          note: "Now imagine `key={index}`. Before, key 0 was Milk. Now key 0 is Tea, so React reuses Milk's `<li>` for Tea, and only changes its text.",
          vars: [["keys", "0, 1, 2"]],
        },
        {
          line: 6,
          note: "The typed text stays in the first `<li>`, which now says Tea. The comment has jumped to the wrong note.",
          output: "Tea [2 litres] · Milk [ ] · Eggs [ ]",
        },
      ],
    ),
  ),

  part(
    "good-keys",
    "Choosing a key",
    explain(
      "A good key is unique among the siblings and stays the same for the item forever. Data from a database already has one: its id. Keys only need to be unique within one list, not across the whole app.",
    ),
    reference("Keys: good and bad", [
      ["note.id", "✓ Unique and never changes.", "key={note.id}"],
      ["A unique field", "✓ If it never changes.", "key={user.email}"],
      [
        "Index",
        "✗ Changes when items move, are added or removed.",
        "key={index}",
      ],
      [
        "Math.random()",
        "✗ New every render: React rebuilds every item.",
        "key={Math.random()}",
      ],
      [
        "No key",
        "✗ React warns, then falls back to the index.",
        "<li>{title}</li>",
      ],
    ]),
    quickCheck(
      "When is the array index an acceptable key?",
      [
        "Never",
        "When the list never changes order and items are never added or removed",
        "When the items are components",
      ],
      1,
      "If the list is fixed, positions never shift, so an index identifies an item. As soon as it can change, use an id.",
    ),
  ),

  part(
    "filter-sort",
    "Filter and sort, then map",
    explain(
      "To show only some items, or show them in an order, work it out while rendering: `filter` and then `map`. Careful with `sort`: it changes the array it's called on, and state must never be changed. Copy first with `[...notes]`, or use `toSorted`, which returns a new array.",
    ),
    code(
      "jsx",
      "Search, then newest first",
      [
        "const shown = notes",
        "  .filter((n) => n.title.includes(query))",
        "  .toSorted((a, b) => b.createdAt - a.createdAt);",
        "",
        "return (",
        "  <ul>",
        "    {shown.map((n) => <li key={n.id}>{n.title}</li>)}",
        "  </ul>",
        ");",
      ],
      {
        2: "filter returns a new array",
        3: "toSorted: a sorted copy, notes is untouched",
        7: "the keys still come from the data",
      },
    ),
  ),

  part(
    "empty",
    "Empty lists",
    explain(
      "An empty array maps to nothing, so the page just looks broken. Say so instead, with [[conditional-rendering|conditional rendering]]: one message while loading, another when there's nothing to show.",
    ),
    code(
      "jsx",
      "Always show something",
      [
        "{notes.length === 0 ? (",
        "  <p>No notes yet. Write your first one above.</p>",
        ") : (",
        "  <NoteList notes={notes} />",
        ")}",
      ],
      { 1: "a real true-or-false test, not just notes.length" },
    ),
    keyPoints(
      "map turns an array into elements.",
      "Every item gets a key from the data.",
      "Filter and sort copies, never the state itself.",
      "Say something when the list is empty.",
    ),
  ),

  part(
    "notes-app",
    "Lists in the Notes App",
    explain(
      "The dashboard maps the notes to `NoteCard`s with `key={note.id}`, the id the database gave each note. When you edit or delete one, React matches the cards by id, so the other cards, and anything typed in them, stay put. Above the list it shows “No notes yet” when the array is empty.",
    ),
    inTheNotesApp(
      "`Dashboard` draws one `NoteCard` per note, keyed by `note.id`.",
      { fileId: "frontend/src/pages/Dashboard.jsx" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "The key on the wrong element",
      language: "jsx",
      wrong: [
        "function NoteCard({ note }) {",
        "  return <article key={note.id}>…</article>;",
        "}",
        "{notes.map((n) => <NoteCard note={n} />)}",
      ],
      problem:
        "React looks for keys on what `map` returns. The cards have none, so React warns.",
      right: ["{notes.map((n) => <NoteCard key={n.id} note={n} />)}"],
      why: "Put the key on the outermost element in the map.",
    }),
    mistake({
      title: "Sorting the state",
      language: "jsx",
      wrong: ["const shown = notes.sort(byTitle);"],
      problem:
        "`sort` reorders the state array in place, which React can't see and other code doesn't expect.",
      right: ["const shown = notes.toSorted(byTitle);"],
      why: "Sort a copy: `toSorted`, or `[...notes].sort(…)`.",
    }),
    mistake({
      title: "A random key",
      language: "jsx",
      wrong: ["<li key={Math.random()}>"],
      problem:
        "Every render makes new keys, so React throws away every item and rebuilds it: slow, and typed text and focus are lost.",
      right: ["<li key={note.id}>"],
      why: "Keys must stay the same between renders.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "Newest first, safely",
      task: "Write `newestFirst(notes)` to return the notes sorted by `createdAt`, biggest first, **without** changing the original array.",
      starter: ["function newestFirst(notes) {", "", "}"],
      tests: [
        [
          "newestFirst([{ id: 1, createdAt: 10 }, { id: 2, createdAt: 30 }, { id: 3, createdAt: 20 }]).map((n) => n.id)",
          "[2, 3, 1]",
        ],
        [
          "(() => { const old = [{ id: 1, createdAt: 1 }, { id: 2, createdAt: 2 }]; newestFirst(old); return old[0].id; })()",
          "1",
        ],
      ],
      hint: "Copy, then sort: `[...notes].sort((a, b) => b.createdAt - a.createdAt)`.",
      solution: [
        "function newestFirst(notes) {",
        "  return [...notes].sort((a, b) => b.createdAt - a.createdAt);",
        "}",
      ],
    }),
    pageYourTurn({
      title: "Search as you type",
      task: "Store the input's text in `state.query` on every `input` event and render. In `render`, show only titles that include the query, ignoring capitals.",
      starter: [
        '<input id="search" aria-label="Search">',
        '<ul id="list"></ul>',
        "<script>",
        '  const notes = ["Milk", "Eggs", "Mint tea"];',
        '  const state = { query: "" };',
        "  function render() {",
        "    const shown = notes;",
        '    document.querySelector("#list").innerHTML =',
        '      shown.map((t) => `<li>${t}</li>`).join("");',
        "  }",
        '  document.querySelector("#search").addEventListener("input", (event) => {',
        "",
        "  });",
        "  render();",
        "</script>",
      ],
      checks: [
        {
          kind: "count",
          label: "All three at first",
          selector: "#list li",
          count: 3,
        },
        { kind: "type", label: "Type mi", selector: "#search", value: "mi" },
        { kind: "count", label: "Two match", selector: "#list li", count: 2 },
        {
          kind: "text",
          label: "Milk first",
          selector: "#list li",
          text: "Milk",
        },
        { kind: "type", label: "Type EGG", selector: "#search", value: "EGG" },
        { kind: "count", label: "Only Eggs", selector: "#list li", count: 1 },
      ],
      hint: "Filter with `t.toLowerCase().includes(state.query.toLowerCase())`. In the listener: `state.query = event.target.value; render();`",
      solution: [
        '<input id="search" aria-label="Search">',
        '<ul id="list"></ul>',
        "<script>",
        '  const notes = ["Milk", "Eggs", "Mint tea"];',
        '  const state = { query: "" };',
        "  function render() {",
        "    const q = state.query.toLowerCase();",
        "    const shown = notes.filter((t) => t.toLowerCase().includes(q));",
        '    document.querySelector("#list").innerHTML =',
        '      shown.map((t) => `<li>${t}</li>`).join("");',
        "  }",
        '  document.querySelector("#search").addEventListener("input", (event) => {',
        "    state.query = event.target.value;",
        "    render();",
        "  });",
        "  render();",
        "</script>",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Lists and keys cheat sheet", [
      ["map", "One element per item.", "{notes.map((n) => <li key={n.id}>…)}"],
      ["key", "Unique among siblings, stable.", "key={note.id}"],
      ["Where", "On the element map returns.", "<NoteCard key={n.id} … />"],
      ["Not index", "If the list can change.", "key={index} ✗"],
      ["Not random", "Keys must stay the same.", "key={Math.random()} ✗"],
      ["Filter", "A new array.", "notes.filter(…)"],
      ["Sort", "A copy, never the state.", "notes.toSorted(…)"],
      ["Empty", "Say so.", "notes.length === 0 ? … : …"],
    ]),
    quickCheck(
      "What does React use a list item's key for?",
      [
        "To style the item",
        "To match each item with the one from the previous render",
        "To pass the id to the component as a prop",
      ],
      1,
      "Keys identify items between renders, so React can keep, move, add or remove the right elements. `key` isn't passed to the component.",
    ),
  ),
);
