import {
  anatomy,
  code,
  diagram,
  explain,
  inTheNotesApp,
  jsPlayground,
  keyPoints,
  mistake,
  moduleLesson,
  part,
  quickCheck,
  reference,
  trace,
  yourTurn,
} from "../blocks.js";

// Copies and references in depth: a surprising change, values that are
// copied, objects that are shared, a memory step-through, methods that
// change the original, objects passed to functions, what const means,
// shallow and deep copies, === on objects, why React needs new arrays,
// mistakes, practice and a recap.
export const referencesModule = moduleLesson(
  "references",
  "Copies and references",
  45,
  [
    "Explain why numbers and strings are copied, but objects and arrays are shared.",
    "Tell which array methods change the original and which make a new array.",
    "Make shallow copies with spread, and deep copies with `structuredClone`.",
    "Compare objects correctly, knowing what `===` checks.",
    "Update nested data without changing the original, the way React needs.",
  ],

  part(
    "why",
    "A surprising change",
    explain(
      "You copy a list, change the copy, and the original changes too. It's one of the most common bugs in JavaScript, and in React it's why a page sometimes doesn't update. The cause is simple once you see it: for objects and arrays, `=` doesn't copy. It makes a second name for the **same** thing. See [[reference-vs-value]].",
    ),
    code(
      "js",
      "the surprise",
      [
        'const notes = ["Milk"];',
        "const copy = notes;",
        'copy.push("Bread");',
        "",
        'notes; // ["Milk", "Bread"]',
      ],
      {
        2: "not a copy: a second name for the same array",
        3: "changes the one array",
        5: "so notes changed too",
      },
    ),
    keyPoints(
      "Numbers, strings and booleans are copied by `=`.",
      "Objects and arrays are shared by `=`.",
      "To copy an object or array, make a new one on purpose.",
    ),
  ),

  part(
    "values-and-references",
    "Values and references",
    explain(
      "A variable holding a number holds the **value** itself, so `let b = a` copies it. An object lives once, somewhere in memory, and a variable holds a **reference** to it: like an address. `const same = note` copies the address, so both names lead to one object.",
    ),
    diagram([
      ["a = 1, b = a", "two boxes, each holding its own 1"],
      ['note = { title: "Milk" }', "one object; note holds its address"],
      ["same = note", "a copy of the address, not the object"],
      ["same.title = …", "changes the one object both lead to"],
    ]),
    anatomy(
      "Reading a reference",
      ["const same = note;", 'same.title = "Bread";'],
      [
        ["same", "new name", "A second variable…"],
        ["note", "existing name", "…given the same reference as `note`."],
        [
          'same.title = "Bread"',
          "a change",
          "Follows the reference to the one object and changes it.",
        ],
      ],
    ),
  ),

  part(
    "how-it-runs",
    "Step through memory",
    explain(
      "Watch the variables. Numbers are copied; objects are shared until you make a new one with spread. `#1` and `#2` stand for the two objects in memory.",
    ),
    trace(
      "Values and references, move by move",
      [
        "let a = 1;",
        "let b = a;",
        "b = 2;",
        'const note = { title: "Milk" };',
        "const same = note;",
        'same.title = "Bread";',
        "const copy = { ...note };",
        'copy.title = "Eggs";',
        "console.log(a, b, note.title, copy.title);",
      ],
      [
        { line: 1, note: "A number, held in `a`.", vars: [["a", "1"]] },
        {
          line: 2,
          note: "The **value** is copied into `b`.",
          vars: [
            ["a", "1"],
            ["b", "1"],
          ],
        },
        {
          line: 3,
          note: "Changing `b` doesn't touch `a`: they're separate copies.",
          vars: [
            ["a", "1"],
            ["b", "2"],
          ],
        },
        {
          line: 4,
          note: "An object is made in memory (call it #1). `note` holds a reference to it.",
          vars: [
            ["a", "1"],
            ["b", "2"],
            ["note", '→ #1 { title: "Milk" }'],
          ],
        },
        {
          line: 5,
          note: "`same` gets a copy of the **reference**: it leads to the same object #1.",
          vars: [
            ["a", "1"],
            ["b", "2"],
            ["note", '→ #1 { title: "Milk" }'],
            ["same", "→ #1 (the same object)"],
          ],
        },
        {
          line: 6,
          note: "Changing it through `same` changes object #1, so `note` sees it too.",
          vars: [
            ["a", "1"],
            ["b", "2"],
            ["note", '→ #1 { title: "Bread" }'],
            ["same", "→ #1 (the same object)"],
          ],
        },
        {
          line: 7,
          note: "Spread makes a **new** object, #2, with #1's properties copied in.",
          vars: [
            ["a", "1"],
            ["b", "2"],
            ["note", '→ #1 { title: "Bread" }'],
            ["same", "→ #1 (the same object)"],
            ["copy", '→ #2 { title: "Bread" }'],
          ],
        },
        {
          line: 8,
          note: "Changing #2 leaves #1 alone.",
          vars: [
            ["a", "1"],
            ["b", "2"],
            ["note", '→ #1 { title: "Bread" }'],
            ["same", "→ #1 (the same object)"],
            ["copy", '→ #2 { title: "Eggs" }'],
          ],
          output: "1 2 Bread Eggs",
        },
      ],
    ),
  ),

  part(
    "mutating-methods",
    "Methods that change the original",
    explain(
      "Some array methods **mutate**: they change the array you call them on. Others leave it alone and give back a new array. If the array is shared, mutating it changes it for everyone who holds a reference. When in doubt, use the ones that make a new array.",
    ),
    reference("Changes the original, or makes a new one?", [
      ["push, pop", "Change it: add or remove at the end.", "notes.push(n)"],
      [
        "shift, unshift, splice",
        "Change it: at the start, or anywhere.",
        "notes.splice(1, 1)",
      ],
      [
        "sort, reverse",
        "Change it, and return the same array.",
        "notes.sort()",
      ],
      [
        "map, filter, slice, concat",
        "New array; original untouched.",
        "notes.filter((n) => !n.done)",
      ],
      [
        "toSorted, toReversed",
        "New array versions of sort and reverse.",
        "notes.toSorted(byTitle)",
      ],
      ["[...arr, x]", "New array with an item added.", "[...notes, note]"],
    ]),
    jsPlayground("sort changes it; toSorted doesn't", [
      'const titles = ["Milk", "Bread", "Eggs"];',
      "",
      "const sorted = titles.toSorted();",
      "console.log(titles, sorted);",
      "",
      "const alsoSorted = titles.sort();",
      "console.log(titles, alsoSorted === titles);",
    ]),
  ),

  part(
    "functions",
    "Passing objects to functions",
    explain(
      "Calling a function with an object passes the **reference**. So a function can change the caller's object, which surprises callers. But reassigning the parameter only changes where the function's own name points: the caller's variable is untouched.",
    ),
    jsPlayground("Change it, or point elsewhere", [
      "function markDone(note) {",
      "  note.done = true; // changes the caller's object",
      "}",
      "function replace(note) {",
      '  note = { title: "Other" }; // only the parameter points elsewhere',
      "}",
      "",
      'const milk = { title: "Milk", done: false };',
      "markDone(milk);",
      "replace(milk);",
      "console.log(milk);",
    ]),
    quickCheck(
      'After `replace(milk)`, why is `milk.title` still "Milk"?',
      [
        "Strings can't change",
        "`note = …` points the parameter at a new object; `milk` still points at the old one",
        "replace was never called",
      ],
      1,
      "Assigning to a parameter changes only that local name. Changing a property (`note.done = …`) is what reaches the shared object.",
    ),
  ),

  part(
    "const",
    "What const really means",
    explain(
      "`const` means the variable can't be **pointed at something else**. It doesn't freeze the object: you can still change its properties or push to the array. If you need an object that can't be changed, `Object.freeze` makes its top level read-only.",
    ),
    jsPlayground("const fixes the name, not the contents", [
      'const notes = ["Milk"];',
      'notes.push("Bread"); // allowed: same array, changed',
      "console.log(notes);",
      "",
      "try {",
      "  notes = []; // not allowed: pointing elsewhere",
      "} catch (error) {",
      "  console.log(error.name);",
      "}",
      "",
      'const settings = Object.freeze({ theme: "dark" });',
      'settings.theme = "light"; // ignored (strict code would throw)',
      "console.log(settings.theme);",
    ]),
  ),

  part(
    "shallow-copies",
    "Shallow copies",
    explain(
      "Spread makes a new object or array, but only **one level** deep. Properties that are themselves objects or arrays are copied as **references**, so the copy and the original still share them. That's a shallow copy. Change a nested array through the copy, and the original changes.",
    ),
    jsPlayground("The outside is new; the inside is shared", [
      'const note = { title: "Milk", tags: ["food"] };',
      "const copy = { ...note };",
      "",
      'copy.title = "Bread"; // fine: title is copied',
      'copy.tags.push("urgent"); // tags is shared!',
      "",
      "console.log(note.title, note.tags);",
      "console.log(copy.tags === note.tags);",
    ]),
  ),

  part(
    "deep-copies",
    "Deep copies and nested updates",
    explain(
      "`structuredClone(value)` copies **every** level, so nothing is shared. It's the simple choice for a full independent copy. To change one nested thing, the usual way is to spread at each level you change: a new outer object, with a new inner array. Everything you didn't change can be shared safely.",
    ),
    jsPlayground("Two ways to avoid sharing", [
      'const note = { title: "Milk", tags: ["food"], meta: { pinned: false } };',
      "",
      "const clone = structuredClone(note);",
      'clone.tags.push("urgent");',
      "console.log(note.tags, clone.tags);",
      "",
      "// Change one nested thing: spread at each level you change.",
      "const pinned = { ...note, meta: { ...note.meta, pinned: true } };",
      "console.log(note.meta.pinned, pinned.meta.pinned);",
      "console.log(pinned.tags === note.tags); // unchanged parts are shared",
    ]),
    keyPoints(
      "Spread copies one level.",
      "`structuredClone` copies every level.",
      "To update nested data, make new objects along the path you change.",
    ),
  ),

  part(
    "equality",
    "Comparing objects",
    explain(
      "`===` on objects asks “is this the **same** object?”, not “do they look the same?”. Two separate objects with identical contents are not `===`. To compare contents, compare the properties you care about, often just an `id`.",
    ),
    jsPlayground("Same object, or same contents?", [
      'const a = { id: 1, title: "Milk" };',
      'const b = { id: 1, title: "Milk" };',
      "const c = a;",
      "",
      "console.log(a === b); // different objects",
      "console.log(a === c); // the same object",
      "console.log(a.id === b.id); // compare what matters",
      "console.log([1, 2] === [1, 2]);",
    ]),
    quickCheck(
      "`notes.includes({ id: 1 })` gives false, though a note with id 1 is in the list. Why?",
      [
        "includes only works on strings",
        "includes uses ===, and `{ id: 1 }` is a new object",
        "The id is a string",
      ],
      1,
      "It looks for that exact object. Use `notes.some((n) => n.id === 1)` to compare by id.",
    ),
  ),

  part(
    "react",
    "Why React needs new arrays",
    explain(
      "React decides whether to redraw by asking “is this state a **new** value?”, using the same check as `===`. If you `push` onto the notes array, it's still the same array, so React sees no change and the page doesn't update. A new array, from spread, `map` or `filter`, is a new reference, and React redraws.",
    ),
    code(
      "js",
      "the same array, or a new one",
      [
        "// React sees no change: same array",
        "notes.push(note);",
        "setNotes(notes);",
        "",
        "// React redraws: a new array",
        "setNotes([note, ...notes]);",
      ],
      { 3: "old === new, so nothing happens", 6: "a new reference" },
    ),
    inTheNotesApp(
      "`useNotes` never changes the notes array in place. Adding uses `[note, ...current]`; replacing uses `current.map(…)`; removing uses `current.filter(…)`. Each gives React a new array, and its comment says why: “React only re-renders when state is a new value.”",
      { symbolId: "hook:useNotes" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Thinking = copies",
      wrong: [
        "const draft = note;",
        'draft.title = "New title"; // note changed too',
      ],
      problem: "`draft` is the same object as `note`, not a copy.",
      right: ["const draft = { ...note };", 'draft.title = "New title";'],
      why: "Spread into a new object when you need a copy.",
    }),
    mistake({
      title: "Sorting data you were given",
      wrong: [
        "function byTitle(notes) {",
        "  return notes.sort((a, b) => a.title.localeCompare(b.title));",
        "}",
      ],
      problem:
        "`sort` changes the caller's array, which might be React state or shared elsewhere.",
      right: [
        "function byTitle(notes) {",
        "  return notes.toSorted((a, b) => a.title.localeCompare(b.title));",
        "}",
      ],
      why: "`toSorted` (or `[...notes].sort(…)`) sorts a copy.",
    }),
    mistake({
      title: "Changing a nested array in a shallow copy",
      wrong: [
        "const copy = { ...note };",
        'copy.tags.push("urgent"); // note.tags changed too',
      ],
      problem: "Spread copied `tags` as a reference, so both share one array.",
      right: ['const copy = { ...note, tags: [...note.tags, "urgent"] };'],
      why: "Make a new array for the part you're changing.",
    }),
    mistake({
      title: "Comparing objects with ===",
      wrong: ["if (selected === { id: 1 }) { … } // never true"],
      problem: "A new object is never `===` to an existing one.",
      right: ["if (selected.id === 1) { … }"],
      why: "Compare the properties that identify it.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "Add a tag, safely",
      task: "Write `addTag(note, tag)`: return a new note with `tag` added to the end of its `tags`. Neither the note nor its tags array may change.",
      starter: [
        "function addTag(note, tag) {",
        "  const copy = { ...note };",
        "  copy.tags.push(tag);",
        "  return copy;",
        "}",
      ],
      tests: [
        [
          'addTag({ title: "Milk", tags: ["food"] }, "urgent")',
          '{ title: "Milk", tags: ["food", "urgent"] }',
        ],
        [
          '((n) => (addTag(n, "urgent"), n.tags))({ title: "Milk", tags: ["food"] })',
          '["food"]',
        ],
      ],
      hint: "`return { ...note, tags: [...note.tags, tag] };`",
      solution: [
        "function addTag(note, tag) {",
        "  return { ...note, tags: [...note.tags, tag] };",
        "}",
      ],
    }),
    yourTurn({
      title: "Sorted, but not in place",
      task: "Write `sortedTitles(notes)`: return the titles in alphabetical order, without changing `notes`.",
      starter: [
        "function sortedTitles(notes) {",
        "  return notes.sort((a, b) => a.title.localeCompare(b.title)).map((n) => n.title);",
        "}",
      ],
      tests: [
        [
          'sortedTitles([{ title: "Milk" }, { title: "Bread" }])',
          '["Bread", "Milk"]',
        ],
        [
          '((list) => (sortedTitles(list), list[0].title))([{ title: "Milk" }, { title: "Bread" }])',
          '"Milk"',
        ],
      ],
      hint: "Sort a copy: `notes.toSorted(…)` or `[...notes].sort(…)`.",
      solution: [
        "function sortedTitles(notes) {",
        "  return notes",
        "    .toSorted((a, b) => a.title.localeCompare(b.title))",
        "    .map((n) => n.title);",
        "}",
      ],
    }),
    yourTurn({
      title: "Is it in the list?",
      task: "Write `hasNote(notes, note)`: return true if a note with the same `id` is in `notes`, even if it's a different object.",
      starter: [
        "function hasNote(notes, note) {",
        "  return notes.includes(note);",
        "}",
      ],
      tests: [
        [
          'hasNote([{ id: 1, title: "Milk" }], { id: 1, title: "Milk" })',
          "true",
        ],
        [
          'hasNote([{ id: 1, title: "Milk" }], { id: 2, title: "Milk" })',
          "false",
        ],
        ["hasNote([], { id: 1 })", "false"],
      ],
      hint: "`return notes.some((n) => n.id === note.id);`",
      solution: [
        "function hasNote(notes, note) {",
        "  return notes.some((n) => n.id === note.id);",
        "}",
      ],
    }),
    yourTurn({
      title: "Move house",
      task: "Write `moveTo(user, city)`: return a new user whose `address.city` is `city`. The original user and its address must not change.",
      starter: [
        "function moveTo(user, city) {",
        "  const copy = { ...user };",
        "  copy.address.city = city;",
        "  return copy;",
        "}",
      ],
      tests: [
        [
          'moveTo({ name: "Ann", address: { city: "Pokhara", zip: "33700" } }, "Kathmandu")',
          '{ name: "Ann", address: { city: "Kathmandu", zip: "33700" } }',
        ],
        [
          '((u) => (moveTo(u, "Kathmandu"), u.address.city))({ name: "Ann", address: { city: "Pokhara" } })',
          '"Pokhara"',
        ],
      ],
      hint: "Spread at both levels: `{ ...user, address: { ...user.address, city } }`.",
      solution: [
        "function moveTo(user, city) {",
        "  return { ...user, address: { ...user.address, city } };",
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Copies and references cheat sheet", [
      ["value", "Numbers, strings, booleans: copied by =.", "let b = a;"],
      ["reference", "Objects and arrays: shared by =.", "const same = note;"],
      ["mutate", "Changes the original.", "push, splice, sort, obj.x = …"],
      [
        "new array",
        "Leaves the original alone.",
        "map, filter, toSorted, [...a]",
      ],
      [
        "shallow copy",
        "One level; nested parts shared.",
        "{ ...note }, [...list]",
      ],
      ["deep copy", "Every level.", "structuredClone(note)"],
      [
        "nested update",
        "New objects along the changed path.",
        "{ ...u, address: { ...u.address, city } }",
      ],
      ["===", "Same object? Not same contents.", "a.id === b.id"],
      [
        "const",
        "Can't point elsewhere; contents can change.",
        "Object.freeze(obj)",
      ],
    ]),
    quickCheck(
      "`const b = [...a]; b[0].done = true;` where `a` holds note objects. Does `a[0].done` change?",
      [
        "No: b is a copy",
        "Yes: the array is new, but the note objects inside are shared",
        "It throws, because of const",
      ],
      1,
      "Spread copies the array one level deep. Both arrays hold references to the same note objects.",
    ),
  ),
);
