import {
  analogy,
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

// Arrays in depth: why lists, making and reading them, changing them,
// looping, the array methods that take a function (map, filter, find and
// friends), how map runs, chaining, arrays of objects, copying, where
// they're used, mistakes, practice and a recap.
export const arraysModule = moduleLesson(
  "arrays",
  "Arrays: lists of values",
  45,
  [
    "Make an array, and read items by position (from 0) and `length`.",
    "Add, remove and change items with `push`, `pop`, `splice` and more.",
    "Use `map`, `filter`, `find`, `some` and `includes`, each with a function.",
    "Chain array methods, and work with arrays of objects like a list of notes.",
    "Copy arrays instead of changing them, and avoid the common mistakes.",
  ],

  part(
    "why",
    "Why arrays?",
    explain(
      "Programs work with lists all the time: notes, prices, users, search results. You could make `note1`, `note2`, `note3`… but then you can't loop over them, count them or add a fourth without changing the code. An **array** keeps any number of values in one ordered list under one name. See [[js-object-array|objects and arrays]].",
    ),
    diagram([
      ["index 0", '"Milk"'],
      ["index 1", '"Bread"'],
      ["index 2", '"Eggs"'],
    ]),
    analogy(
      "A row of numbered lockers: one name for the whole row, a number on each door, starting at 0. You can add lockers at the end, and open any one by its number.",
    ),
    keyPoints(
      "One name for a whole list of values.",
      "The order is kept, and each item has a position: its index.",
      "Any number of items, of any type.",
    ),
  ),

  part(
    "making",
    "Making and reading an array",
    anatomy(
      "An array",
      ['const notes = ["Milk", "Bread", "Eggs"];'],
      [
        ["const notes", "name", "One variable holds the whole list."],
        ["[", "opens", "Square brackets make an array."],
        ['"Milk"', "item 0", "The first item is at index 0."],
        [",", "separator", "Commas go between items."],
        ['"Eggs"', "item 2", "The last item is at `length - 1`."],
        ["]", "closes", "The end of the list."],
      ],
    ),
    reference("Reading an array", [
      ["[i]", "The item at index i, from 0.", 'notes[0] // "Milk"'],
      ["length", "How many items.", "notes.length // 3"],
      ["at(-1)", "From the end: -1 is the last.", 'notes.at(-1) // "Eggs"'],
      ["[] past the end", "There's nothing there.", "notes[9] // undefined"],
      ["[]", "An empty array.", "const list = [];"],
    ]),
    jsPlayground("Read the list", [
      'const notes = ["Milk", "Bread", "Eggs"];',
      "",
      "console.log(notes);",
      "console.log(notes[0], notes[2]);",
      "console.log(notes.length);",
      "console.log(notes.at(-1));",
      "console.log(notes[5]);",
      "",
      'const mixed = [1, "two", true, null];',
      "console.log(mixed.length);",
    ]),
  ),

  part(
    "changing",
    "Adding, removing and changing items",
    reference("Changing an array (these change it in place)", [
      ["push(x)", "Add to the end.", 'notes.push("Tea")'],
      ["pop()", "Remove the last; gives it back.", "notes.pop()"],
      ["unshift(x)", "Add to the start.", 'notes.unshift("Jam")'],
      ["shift()", "Remove the first.", "notes.shift()"],
      ["[i] = x", "Replace the item at i.", 'notes[1] = "Rolls"'],
      ["splice(i, n)", "Remove n items starting at i.", "notes.splice(1, 1)"],
    ]),
    trace(
      "A shopping list changing",
      [
        'const list = ["Milk"];',
        'list.push("Bread");',
        'list.push("Eggs");',
        'list[0] = "Oat milk";',
        "list.splice(1, 1);",
        "console.log(list);",
      ],
      [
        {
          line: 1,
          note: "A list with one item.",
          vars: [["list", '["Milk"]']],
        },
        {
          line: 2,
          note: "`push` adds to the end.",
          vars: [["list", '["Milk", "Bread"]']],
        },
        {
          line: 3,
          note: "And again.",
          vars: [["list", '["Milk", "Bread", "Eggs"]']],
        },
        {
          line: 4,
          note: "Assigning to index 0 replaces the first item.",
          vars: [["list", '["Oat milk", "Bread", "Eggs"]']],
        },
        {
          line: 5,
          note: "`splice(1, 1)` removes 1 item starting at index 1: Bread. The items after it move up.",
          vars: [["list", '["Oat milk", "Eggs"]']],
        },
        {
          line: 6,
          note: "It's printed.",
          vars: [["list", '["Oat milk", "Eggs"]']],
          output: '["Oat milk","Eggs"]',
        },
      ],
    ),
    explain(
      "Notice `list` is a `const`, yet it changed. `const` means the name always points at **the same array**; the array's contents can still change. You'll see why that matters in *Copying arrays*.",
    ),
  ),

  part(
    "looping",
    "Going through every item",
    explain(
      "You met `for…of` in the Loops step. Arrays also have `forEach`, which takes a **function** and calls it once for every item. Handing a function to other code to call is called a [[callback]], and every array method in the rest of this module works this way.",
    ),
    jsPlayground("Two ways to visit every item", [
      'const notes = ["Milk", "Bread", "Eggs"];',
      "",
      "for (const note of notes) {",
      '  console.log("for…of:", note);',
      "}",
      "",
      "notes.forEach((note, index) => {",
      '  console.log("forEach:", index, note);',
      "});",
    ]),
    code(
      "js",
      "the function forEach calls",
      [
        "notes.forEach((note, index) => {",
        "  console.log(index, note);",
        "});",
      ],
      {
        1: "an arrow function: the array calls it with each item and its index",
      },
    ),
  ),

  part(
    "map",
    "map: change every item",
    explain(
      "[[array-methods|`map`]] makes a **new** array of the same length, where each item is what your function returns for the old one. The original is untouched. Use it whenever you think *turn each X into a Y*.",
    ),
    trace(
      "How map runs",
      [
        "const prices = [2, 5, 10];",
        "const doubled = prices.map((p) => p * 2);",
        "console.log(doubled);",
      ],
      [
        { line: 1, note: "Three prices.", vars: [["prices", "[2, 5, 10]"]] },
        {
          line: 2,
          note: "`map` calls the function with the first item: `p` is 2, it returns 4.",
          vars: [["prices", "[2, 5, 10]"]],
          stack: ["main program", "(p) => p * 2 with p = 2"],
        },
        {
          line: 2,
          note: "Then with 5, which returns 10.",
          vars: [["prices", "[2, 5, 10]"]],
          stack: ["main program", "(p) => p * 2 with p = 5"],
        },
        {
          line: 2,
          note: "Then with 10, which returns 20. `map` collects the three answers into a new array.",
          vars: [
            ["prices", "[2, 5, 10]"],
            ["doubled", "[4, 10, 20]"],
          ],
          stack: ["main program"],
        },
        {
          line: 3,
          note: "The new array is printed. `prices` hasn't changed.",
          vars: [
            ["prices", "[2, 5, 10]"],
            ["doubled", "[4, 10, 20]"],
          ],
          output: "[4,10,20]",
        },
      ],
    ),
    jsPlayground("Turn each item into something else", [
      'const names = ["ann", "bob", "cal"];',
      "",
      "console.log(names.map((n) => n.toUpperCase()));",
      "console.log(names.map((n) => n.length));",
      "console.log(names.map((n, i) => `${i + 1}. ${n}`));",
      "console.log(names); // unchanged",
    ]),
  ),

  part(
    "filter-find",
    "filter, find and friends",
    reference("Array methods that take a function", [
      ["map(fn)", "New array: each item changed.", "prices.map((p) => p * 2)"],
      [
        "filter(fn)",
        "New array: only items where fn returns true.",
        "notes.filter((n) => n.done)",
      ],
      [
        "find(fn)",
        "The first item where fn returns true, or undefined.",
        "notes.find((n) => n.id === 7)",
      ],
      [
        "findIndex(fn)",
        "Its position, or -1.",
        "notes.findIndex((n) => n.id === 7)",
      ],
      ["some(fn)", "Is at least one item true?", "notes.some((n) => n.done)"],
      ["every(fn)", "Are all items true?", "notes.every((n) => n.done)"],
      [
        "forEach(fn)",
        "Just call fn for each; gives back nothing.",
        "notes.forEach(show)",
      ],
    ]),
    reference("Methods that don't need a function", [
      ["includes(x)", "Is x in the list?", 'tags.includes("work")'],
      ["indexOf(x)", "Where is x? -1 if not there.", 'tags.indexOf("work")'],
      ["join(sep)", "One string from all items.", 'tags.join(", ")'],
      ["slice(a, b)", "A copy of part of the list.", "notes.slice(0, 2)"],
      ["concat(list)", "A new list: one then the other.", "a.concat(b)"],
    ]),
    jsPlayground("Ask questions of a list", [
      "const scores = [42, 88, 67, 95, 30];",
      "",
      "console.log(scores.filter((s) => s >= 50));",
      "console.log(scores.find((s) => s > 90));",
      "console.log(scores.some((s) => s < 40));",
      "console.log(scores.every((s) => s > 0));",
      "console.log(scores.includes(67), scores.indexOf(67));",
      'console.log(scores.join(" | "));',
    ]),
    quickCheck(
      "You need the one note whose `id` is 7. Which method?",
      ["`filter`", "`find`", "`map`"],
      1,
      "`find` gives back the first matching item itself. `filter` would give a list containing it.",
    ),
  ),

  part(
    "objects-and-chaining",
    "Lists of objects, and chaining",
    explain(
      "Real lists are usually lists of **objects**: each note has a title, a done flag, an id. (Objects get their own step next.) Because `map` and `filter` give back arrays, you can **chain** them: the result of one is the input of the next.",
    ),
    code(
      "js",
      "the titles of the unfinished notes",
      [
        "const notes = [",
        '  { id: 1, title: "Milk", done: true },',
        '  { id: 2, title: "Bread", done: false },',
        '  { id: 3, title: "Eggs", done: false },',
        "];",
        "",
        "const todo = notes",
        "  .filter((note) => !note.done)",
        "  .map((note) => note.title);",
        '// ["Bread", "Eggs"]',
      ],
      {
        8: "first keep the unfinished notes (2 objects)",
        9: "then turn each into its title",
      },
    ),
    jsPlayground("Chain your own", [
      "const notes = [",
      '  { id: 1, title: "Milk", done: true },',
      '  { id: 2, title: "Bread", done: false },',
      '  { id: 3, title: "Eggs", done: false },',
      "];",
      "",
      "console.log(notes.filter((n) => !n.done).map((n) => n.title));",
      "console.log(notes.find((n) => n.id === 2).title);",
      'console.log(notes.filter((n) => n.done).length, "done");',
    ]),
  ),

  part(
    "copying",
    "Copying instead of changing",
    explain(
      "Methods like `push`, `pop` and `splice` change the array itself, and every variable pointing at it sees the change. Often, especially in React, you want a **new** array instead, and leave the old one alone. The spread syntax `...` copies all the items into a new array.",
    ),
    reference("Changing vs making a new array", [
      ["add", "push changes; spread makes new.", "[...notes, newNote]"],
      [
        "remove",
        "splice changes; filter makes new.",
        "notes.filter((n) => n.id !== 2)",
      ],
      [
        "update",
        "[i] = x changes; map makes new.",
        "notes.map((n) => n.id === 2 ? updated : n)",
      ],
      ["sort", "sort changes; toSorted makes new.", "notes.toSorted()"],
    ]),
    jsPlayground("Same array, or a copy?", [
      'const original = ["a", "b"];',
      "",
      "const same = original;",
      'same.push("c");',
      "console.log(original); // changed too!",
      "",
      'const copy = [...original, "d"];',
      "console.log(original, copy);",
    ]),
  ),

  part(
    "where-used",
    "Where you'll use arrays",
    keyPoints(
      "Lists from the server: the notes, as an array of objects.",
      "Showing a list on screen: `notes.map(...)` makes one item per note.",
      "Searching and filtering: `filter` by a search word.",
      "Adding and removing: a new array with `...` or `filter`.",
    ),
    inTheNotesApp(
      "The Notes App's `useNotes` keeps the notes as an array. Adding one makes a new array with the note at the front, deleting one uses `filter`, and the Dashboard shows them with `notes.map`.",
      { symbolId: "hook:useNotes" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Counting from 1",
      wrong: [
        'const notes = ["Milk", "Bread"];',
        "console.log(notes[1]); // expecting Milk",
        "console.log(notes[2]); // undefined",
      ],
      problem:
        "The first item is at index 0, so `notes[1]` is Bread and `notes[2]` doesn't exist.",
      right: [
        'const notes = ["Milk", "Bread"];',
        "console.log(notes[0]); // Milk",
        "console.log(notes[notes.length - 1]); // Bread",
      ],
      why: "Indexes start at 0; the last is at `length - 1`.",
    }),
    mistake({
      title: "No return in map",
      wrong: [
        "const doubled = [1, 2].map((n) => {",
        "  n * 2;",
        "});",
        "// [undefined, undefined]",
      ],
      problem:
        "With curly braces, the arrow function needs `return`. Without it, each call gives back `undefined`.",
      right: ["const doubled = [1, 2].map((n) => n * 2);", "// [2, 4]"],
      why: "Drop the braces for a one-line answer, or write `return` inside them.",
    }),
    mistake({
      title: "Using the result of forEach",
      wrong: ["const names = notes.forEach((n) => n.title);", "// undefined"],
      problem:
        "`forEach` only calls the function; it always gives back `undefined`.",
      right: ["const names = notes.map((n) => n.title);"],
      why: "To build a new list from the old one, use `map`.",
    }),
    mistake({
      title: "Sorting numbers as text",
      wrong: ["[10, 9, 100].sort();", "// [10, 100, 9]"],
      problem:
        '`sort()` with no function compares items as text, so `"100"` comes before `"9"`.',
      right: ["[10, 9, 100].sort((a, b) => a - b);", "// [9, 10, 100]"],
      why: "Give `sort` a compare function for numbers: `a - b` sorts small to big.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "The last item",
      task: "Write `last(list)` to return the last item of any array. For an empty array it should return `undefined`.",
      starter: ["function last(list) {", "", "}"],
      tests: [
        ["last([1, 2, 3])", "3"],
        ['last(["only"])', '"only"'],
        ["last([])", "undefined"],
      ],
      hint: "The last index is `list.length - 1`, or use `list.at(-1)`.",
      solution: [
        "function last(list) {",
        "  return list[list.length - 1];",
        "}",
      ],
    }),
    yourTurn({
      title: "Prices with tax",
      task: "Write `addTax(prices)` to return a **new** array with every price multiplied by 1.5. Use `map`.",
      starter: ["function addTax(prices) {", "", "}"],
      tests: [
        ["addTax([2, 10])", "[3, 15]"],
        ["addTax([])", "[]"],
      ],
      hint: "`return prices.map((p) => p * 1.5);`",
      solution: [
        "function addTax(prices) {",
        "  return prices.map((p) => p * 1.5);",
        "}",
      ],
    }),
    yourTurn({
      title: "Search the notes",
      task: 'Write `search(titles, word)` to return only the titles that include `word`, ignoring capitals: `search(["Buy milk", "Call Sam"], "MILK")` is `["Buy milk"]`.',
      starter: ["function search(titles, word) {", "", "}"],
      tests: [
        [
          'search(["Buy milk", "Call Sam", "Milkshake"], "MILK")',
          '["Buy milk", "Milkshake"]',
        ],
        ['search(["a", "b"], "z")', "[]"],
      ],
      hint: "`filter` the titles; in the function compare `title.toLowerCase().includes(word.toLowerCase())`.",
      solution: [
        "function search(titles, word) {",
        "  const w = word.toLowerCase();",
        "  return titles.filter((t) => t.toLowerCase().includes(w));",
        "}",
      ],
    }),
    yourTurn({
      title: "Titles still to do",
      task: 'Each note is an object like `{ title: "Milk", done: false }`. Write `todoTitles(notes)` to return the titles of the notes that aren\'t done, by chaining `filter` and `map`.',
      starter: ["function todoTitles(notes) {", "", "}"],
      tests: [
        [
          'todoTitles([{ title: "Milk", done: true }, { title: "Bread", done: false }])',
          '["Bread"]',
        ],
        [
          'todoTitles([{ title: "A", done: false }, { title: "B", done: false }])',
          '["A", "B"]',
        ],
        ["todoTitles([])", "[]"],
      ],
      hint: "`notes.filter((n) => !n.done)` keeps the unfinished ones; then `.map((n) => n.title)`.",
      solution: [
        "function todoTitles(notes) {",
        "  return notes.filter((n) => !n.done).map((n) => n.title);",
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Arrays cheat sheet", [
      ["make", "Square brackets, commas between.", "const a = [1, 2, 3];"],
      ["read", "Index from 0; how many.", "a[0], a.length, a.at(-1)"],
      [
        "change",
        "These change the array itself.",
        "push, pop, shift, splice, a[i] = x",
      ],
      ["map", "Each item changed: new array.", "a.map((x) => x * 2)"],
      [
        "filter / find",
        "Keep matches / the first match.",
        "a.filter(fn), a.find(fn)",
      ],
      ["some / every / includes", "Yes-or-no questions.", "a.includes(2)"],
      ["copy", "A new array with spread.", "[...a, 4]"],
    ]),
    quickCheck(
      "Which of these is true?",
      [
        "`map` changes the original array",
        "`filter` gives back a new array of the items its function returned true for",
        "`find` gives back a list of matches",
      ],
      1,
      "`map` and `filter` make new arrays and leave the original alone. `find` gives back a single item, or `undefined`.",
    ),
  ),
);
