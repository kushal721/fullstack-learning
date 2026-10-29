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

// JSON and working with data in depth: why data travels as text, JSON's
// rules, stringify and parse, bad JSON, reduce (summing, counting,
// grouping), sorting objects, Object.entries and friends, shaping API
// data with a chain, where they're used, mistakes, practice and a recap.
export const jsonAndDataModule = moduleLesson(
  "json",
  "JSON and working with data",
  45,
  [
    "Explain why data travels as JSON text, and write valid JSON.",
    "Turn values into JSON and back with `JSON.stringify` and `JSON.parse`.",
    "Handle JSON that isn't valid without crashing the page.",
    "Boil a list down to a total, a count or a group with `reduce`.",
    "Sort lists of objects, and walk an object with `Object.entries`.",
    "Shape data from an API with a chain of array methods.",
  ],

  part(
    "why",
    "Why JSON?",
    explain(
      "Your objects and arrays live in your program's memory. A server is a different program, on a different computer: it can't reach into your memory. To send data across, you turn it into **text**, send the text, and the other side turns it back into values. [[json|JSON]] is the text format almost every web app uses for this.",
    ),
    diagram([
      ["your program", '{ title: "Milk" }'],
      ["JSON.stringify", "the value becomes text"],
      ["over the network", '\'{"title":"Milk"}\''],
      ["JSON.parse", "the text becomes a value"],
      ["the other program", '{ title: "Milk" }'],
    ]),
    analogy(
      "Moving house: you can't post a sofa as it is, so you take it apart, pack it flat in a box with instructions, and it's put back together at the other end. JSON is the flat-pack box for data.",
    ),
    keyPoints(
      "Values live in memory; only text can travel between programs.",
      "JSON is text that describes objects, arrays and simple values.",
      "Every language can read it, so a JS page can talk to any server.",
    ),
  ),

  part(
    "format",
    "What JSON looks like",
    explain(
      "JSON looks almost exactly like a JavaScript object or array. The differences are strict rules: keys **must** be in double quotes, strings use double quotes only, and only a few kinds of value are allowed.",
    ),
    anatomy(
      "A note as JSON",
      [
        '{ "title": "Milk", "done": false,',
        '  "tags": ["shop"], "price": 1.2, "due": null }',
      ],
      [
        ['"title"', "key", "Keys always in double quotes."],
        ['"Milk"', "string", "Text in double quotes, never single."],
        ["false", "boolean", "true or false, no quotes."],
        ['["shop"]', "array", "Lists work as in JavaScript."],
        ["1.2", "number", "Plain numbers, no quotes."],
        ["null", "null", "Nothing here. There's no undefined in JSON."],
      ],
    ),
    reference("JSON's rules", [
      ["keys", "Always in double quotes.", '{ "id": 7 }'],
      ["strings", "Double quotes only.", '"Buy milk"'],
      [
        "allowed values",
        "string, number, true/false, null, object, array.",
        '[1, "a", true, null]',
      ],
      ["not allowed", "Functions, undefined, dates, comments.", "—"],
      [
        "no trailing comma",
        "Nothing after the last item.",
        "[1, 2] not [1, 2,]",
      ],
    ]),
    quickCheck(
      "Which of these is valid JSON?",
      ['`{ title: "Milk" }`', '`{ "title": "Milk" }`', "`{ 'title': 'Milk' }`"],
      1,
      "JSON needs double quotes around every key and every string.",
    ),
  ),

  part(
    "stringify-parse",
    "stringify and parse: there and back",
    explain(
      "Two built-in functions do the converting. `JSON.stringify(value)` turns a value into JSON text. `JSON.parse(text)` turns JSON text back into a value: a **new** object that you can read with dots, as usual.",
    ),
    trace(
      "A note's round trip",
      [
        'const note = { id: 7, title: "Milk" };',
        "const text = JSON.stringify(note);",
        "console.log(typeof text);",
        "const back = JSON.parse(text);",
        "console.log(back.title);",
      ],
      [
        {
          line: 1,
          note: "An object, in memory.",
          vars: [["note", '{ id: 7, title: "Milk" }']],
        },
        {
          line: 2,
          note: "`stringify` writes it out as text. The keys gain double quotes, and the spaces go.",
          vars: [
            ["note", '{ id: 7, title: "Milk" }'],
            ["text", '\'{"id":7,"title":"Milk"}\''],
          ],
        },
        {
          line: 3,
          note: "It really is a string now: you can't read `text.title`.",
          vars: [
            ["note", '{ id: 7, title: "Milk" }'],
            ["text", '\'{"id":7,"title":"Milk"}\''],
          ],
          output: "string",
        },
        {
          line: 4,
          note: "`parse` reads the text and builds a brand new object from it.",
          vars: [
            ["note", '{ id: 7, title: "Milk" }'],
            ["text", '\'{"id":7,"title":"Milk"}\''],
            ["back", '{ id: 7, title: "Milk" }'],
          ],
        },
        {
          line: 5,
          note: "`back` is a normal object again, so `.title` works.",
          vars: [
            ["note", '{ id: 7, title: "Milk" }'],
            ["text", '\'{"id":7,"title":"Milk"}\''],
            ["back", '{ id: 7, title: "Milk" }'],
          ],
          output: "Milk",
        },
      ],
    ),
    jsPlayground("Try the round trip", [
      "const note = {",
      '  title: "Milk",',
      "  done: false,",
      '  tags: ["shop", "today"],',
      "};",
      "",
      "console.log(JSON.stringify(note));",
      "// Indent by 2 spaces, for people to read:",
      "console.log(JSON.stringify(note, null, 2));",
      "",
      "const back = JSON.parse(JSON.stringify(note));",
      "console.log(back.tags[1], back === note);",
    ]),
  ),

  part(
    "what-changes",
    "What doesn't survive the trip",
    explain(
      'Only JSON\'s kinds of value make it through. A **function** or `undefined` is left out. A **date** becomes a string, and stays a string when parsed: turn it back with `new Date(text)` yourself. This is why APIs send dates as text like `"2026-10-28T09:00:00.000Z"`.',
    ),
    jsPlayground("What gets lost", [
      "const note = {",
      '  title: "Milk",',
      "  due: undefined,",
      "  save() {},",
      '  created: new Date("2026-10-28T09:00:00Z"),',
      "};",
      "",
      "const text = JSON.stringify(note);",
      "console.log(text);",
      "",
      "const back = JSON.parse(text);",
      "console.log(typeof back.created);",
      "console.log(new Date(back.created).getFullYear());",
    ]),
    keyPoints(
      "Functions and undefined values are dropped.",
      "Dates become strings; make them dates again with `new Date()`.",
      "Parsing always makes new objects, never the same ones.",
    ),
  ),

  part(
    "bad-json",
    "When the text isn't valid JSON",
    explain(
      "`JSON.parse` **throws an error** if the text isn't valid JSON, and an error you don't catch stops your code. Text from outside (a server, a saved file, the user) can be broken, so wrap the parse in `try { … } catch { … }`: if anything in `try` throws, the code in `catch` runs instead.",
    ),
    code(
      "js",
      "parse without crashing",
      [
        "function safeParse(text) {",
        "  try {",
        "    return JSON.parse(text);",
        "  } catch {",
        "    return null;",
        "  }",
        "}",
      ],
      {
        3: "if this throws, JavaScript jumps straight to catch",
        5: "so a broken text gives null instead of crashing",
      },
    ),
    jsPlayground("Valid and broken", [
      "function safeParse(text) {",
      "  try {",
      "    return JSON.parse(text);",
      "  } catch (error) {",
      '    console.log("Not JSON:", error.message);',
      "    return null;",
      "  }",
      "}",
      "",
      "console.log(safeParse('{\"id\": 7}'));",
      'console.log(safeParse("{id: 7}"));',
      'console.log(safeParse(""));',
    ]),
  ),

  part(
    "reduce",
    "reduce: boil a list down to one value",
    explain(
      "[[array-methods|`reduce`]] walks the list carrying one value along: a running total. Your function gets the total so far and the next item, and returns the new total. The second argument to `reduce` is where the total starts.",
    ),
    trace(
      "Adding up prices",
      [
        "const prices = [2, 5, 10];",
        "const total = prices.reduce(",
        "  (sum, p) => sum + p,",
        "  0,",
        ");",
        "console.log(total);",
      ],
      [
        { line: 1, note: "Three prices.", vars: [["prices", "[2, 5, 10]"]] },
        {
          line: 3,
          note: "The total starts at 0, the second argument. First call: `sum` is 0 and `p` is 2, so it returns 2.",
          vars: [["prices", "[2, 5, 10]"]],
          stack: ["main program", "(sum, p) with sum = 0, p = 2"],
        },
        {
          line: 3,
          note: "What it returned becomes the next `sum`: 2 + 5 is 7.",
          vars: [["prices", "[2, 5, 10]"]],
          stack: ["main program", "(sum, p) with sum = 2, p = 5"],
        },
        {
          line: 3,
          note: "Last item: 7 + 10 is 17.",
          vars: [["prices", "[2, 5, 10]"]],
          stack: ["main program", "(sum, p) with sum = 7, p = 10"],
        },
        {
          line: 2,
          note: "No items left, so `reduce` gives back the last total.",
          vars: [
            ["prices", "[2, 5, 10]"],
            ["total", "17"],
          ],
          stack: ["main program"],
        },
        {
          line: 6,
          note: "Printed.",
          vars: [
            ["prices", "[2, 5, 10]"],
            ["total", "17"],
          ],
          output: "17",
        },
      ],
    ),
    jsPlayground("Totals from a list of objects", [
      "const items = [",
      '  { name: "Milk", price: 1.2, qty: 2 },',
      '  { name: "Bread", price: 2.5, qty: 1 },',
      '  { name: "Eggs", price: 3, qty: 1 },',
      "];",
      "",
      "const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);",
      "console.log(total.toFixed(2));",
      "",
      "const count = items.reduce((n, i) => n + i.qty, 0);",
      'console.log(count, "things");',
    ]),
  ),

  part(
    "counting",
    "Counting and grouping with reduce",
    explain(
      "The running value can be anything, not just a number. Start with an **empty object** `{}` and you can count how often each thing appears, or sort items into groups: each call adds to the object and returns it.",
    ),
    code(
      "js",
      "count notes per tag",
      [
        "const counts = notes.reduce((acc, note) => {",
        "  acc[note.tag] = (acc[note.tag] ?? 0) + 1;",
        "  return acc;",
        "}, {});",
        "// { work: 2, home: 1 }",
      ],
      {
        2: "the count so far for this tag (0 if none yet), plus one",
        3: "always return the object, for the next call",
        4: "start with an empty object",
      },
    ),
    jsPlayground("Count and group", [
      "const notes = [",
      '  { title: "Report", tag: "work" },',
      '  { title: "Milk", tag: "home" },',
      '  { title: "Email Sam", tag: "work" },',
      "];",
      "",
      "const counts = notes.reduce((acc, n) => {",
      "  acc[n.tag] = (acc[n.tag] ?? 0) + 1;",
      "  return acc;",
      "}, {});",
      "console.log(counts);",
      "",
      "const groups = notes.reduce((acc, n) => {",
      "  (acc[n.tag] ??= []).push(n.title);",
      "  return acc;",
      "}, {});",
      "console.log(groups);",
    ]),
    keyPoints(
      "`reduce(fn, start)`: always give the start value.",
      "Return the running value from every call.",
      "A number start gives a total; `{}` gives counts or groups.",
    ),
  ),

  part(
    "sorting",
    "Sorting lists of objects",
    explain(
      "`sort` takes a **compare function** `(a, b)` that returns a negative number to put `a` first, a positive one to put `b` first, or 0 to keep them as they are. Numbers: `a.price - b.price`. Text: `a.title.localeCompare(b.title)`. Swap `a` and `b` to reverse.",
    ),
    reference("Sorting recipes", [
      ["numbers, small first", "Subtract.", "(a, b) => a.price - b.price"],
      ["numbers, big first", "Swap a and b.", "(a, b) => b.price - a.price"],
      [
        "text, A to Z",
        "localeCompare.",
        "(a, b) => a.title.localeCompare(b.title)",
      ],
      [
        "ISO dates, newest first",
        "They sort as text.",
        "(a, b) => b.created_at.localeCompare(a.created_at)",
      ],
      ["a sorted copy", "toSorted leaves the original.", "notes.toSorted(fn)"],
    ]),
    jsPlayground("Sort three ways", [
      "const notes = [",
      '  { title: "milk", created_at: "2026-10-02" },',
      '  { title: "Bread", created_at: "2026-10-28" },',
      '  { title: "eggs", created_at: "2026-09-15" },',
      "];",
      "",
      "const az = notes.toSorted((a, b) => a.title.localeCompare(b.title));",
      "console.log(az.map((n) => n.title));",
      "",
      "const newest = notes.toSorted((a, b) =>",
      "  b.created_at.localeCompare(a.created_at),",
      ");",
      "console.log(newest.map((n) => n.title));",
      "console.log(notes[0].title); // unchanged",
    ]),
  ),

  part(
    "object-entries",
    "Walking an object: keys, values, entries",
    explain(
      "Arrays have `map` and `filter`; plain objects don't. To loop over an object, turn it into an array first. `Object.entries(obj)` gives `[key, value]` pairs, and `Object.fromEntries(pairs)` turns pairs back into an object.",
    ),
    reference("Objects as lists", [
      ["Object.keys(o)", "The keys.", 'Object.keys({ a: 1 }) // ["a"]'],
      ["Object.values(o)", "The values.", "Object.values({ a: 1 }) // [1]"],
      ["Object.entries(o)", "[key, value] pairs.", '[["a", 1]]'],
      ["Object.fromEntries(p)", "Pairs back to an object.", "{ a: 1 }"],
      ["for (const [k, v] of …)", "Loop over the pairs.", "Object.entries(o)"],
    ]),
    jsPlayground("Print the counts", [
      "const counts = { work: 2, home: 1, shop: 4 };",
      "",
      "for (const [tag, n] of Object.entries(counts)) {",
      "  console.log(`${tag}: ${n}`);",
      "}",
      "",
      "const total = Object.values(counts).reduce((s, n) => s + n, 0);",
      'console.log("total", total);',
      "",
      "const doubled = Object.fromEntries(",
      "  Object.entries(counts).map(([tag, n]) => [tag, n * 2]),",
      ");",
      "console.log(doubled);",
    ]),
  ),

  part(
    "shaping",
    "Shaping data from an API",
    explain(
      "Data from a server rarely arrives exactly as the page needs it. The usual recipe: **parse** the JSON, then chain array methods: `filter` what you don't want, sort, and `map` each item into the shape you'll show.",
    ),
    code(
      "js",
      "from server text to what the page shows",
      [
        "const notes = JSON.parse(text);",
        "const shown = notes",
        '  .filter((n) => n.title.trim() !== "")',
        "  .toSorted((a, b) => b.created_at.localeCompare(a.created_at))",
        "  .map((n) => ({ id: n.id, label: n.title.toUpperCase() }));",
      ],
      {
        1: "text to an array of objects",
        3: "drop notes with an empty title",
        4: "newest first, as a copy",
        5: "keep just what the page needs",
      },
    ),
    jsPlayground("A chain on API data", [
      "const text = `[",
      '  {"id":1,"title":"Milk","created_at":"2026-10-02"},',
      '  {"id":2,"title":" ","created_at":"2026-10-28"},',
      '  {"id":3,"title":"Call Sam","created_at":"2026-10-20"}',
      "]`;",
      "",
      "const notes = JSON.parse(text);",
      "const shown = notes",
      '  .filter((n) => n.title.trim() !== "")',
      "  .toSorted((a, b) => b.created_at.localeCompare(a.created_at))",
      "  .map((n) => `#${n.id} ${n.title}`);",
      "",
      "console.log(shown);",
      'console.log(notes.length, "from the server,", shown.length, "shown");',
    ]),
    quickCheck(
      "An API sends 20 notes; you want the titles of the done ones, A to Z. Which order of steps?",
      [
        "`map` to titles, then `filter` done, then sort",
        "`filter` done, then sort by title, then `map` to titles",
        "Sort, then `reduce`, then `filter`",
      ],
      1,
      "Filter while you still have the objects (once mapped to titles, `done` is gone), then sort, then map to what you show.",
    ),
  ),

  part(
    "where-used",
    "Where you'll use JSON and data",
    keyPoints(
      "Every API call: send JSON in the request, read JSON from the reply.",
      "`fetch`'s `response.json()` is `JSON.parse` on the reply's text.",
      "Saving in the browser: `localStorage` only stores text, so use JSON.",
      "Totals, counts and sorted lists on dashboards: `reduce` and `sort`.",
    ),
    inTheNotesApp(
      "The Notes App's `request` function sends every body with `JSON.stringify(body)` and a `Content-Type: application/json` header, then reads the reply with `response.json()`. The server's `express.json()` does the parsing on the other side.",
      { symbolId: "fn:request" },
    ),
    jsPlayground("Save and load like localStorage", [
      "// localStorage stores only text, like this Map of strings.",
      "const storage = new Map();",
      "",
      'const notes = [{ id: 1, title: "Milk" }];',
      'storage.set("notes", JSON.stringify(notes));',
      "",
      'console.log(storage.get("notes"));',
      'const loaded = JSON.parse(storage.get("notes") ?? "[]");',
      "console.log(loaded[0].title);",
    ]),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Reading a property of the text",
      wrong: [
        'const text = \'{"title":"Milk"}\';',
        "console.log(text.title); // undefined",
      ],
      problem:
        "JSON is a string until you parse it. A string has no `title` property.",
      right: [
        "const note = JSON.parse(text);",
        'console.log(note.title); // "Milk"',
      ],
      why: "Parse first, then read. With fetch, `await response.json()` parses for you.",
    }),
    mistake({
      title: "Gluing an object into a string",
      wrong: [
        'const note = { title: "Milk" };',
        'const body = "data=" + note;',
        '// "data=[object Object]"',
      ],
      problem:
        "Turning an object into text with `+` gives `[object Object]`, not its contents.",
      right: ["const body = JSON.stringify(note);", '// \'{"title":"Milk"}\''],
      why: "Use `JSON.stringify` whenever an object has to become text.",
    }),
    mistake({
      title: "reduce without a start value",
      wrong: [
        "const total = [].reduce((sum, p) => sum + p);",
        "// TypeError: Reduce of empty array with no initial value",
      ],
      problem:
        "Without a start value, `reduce` uses the first item, and an empty list has none.",
      right: ["const total = [].reduce((sum, p) => sum + p, 0);", "// 0"],
      why: "Always pass the start: `0` for totals, `{}` for counts.",
    }),
    mistake({
      title: "Sorting the original by accident",
      wrong: [
        "const newest = notes.sort(byDate);",
        "// notes is now sorted too",
      ],
      problem:
        "`sort` changes the array itself and gives back the same array, so both names see the new order.",
      right: ["const newest = notes.toSorted(byDate);"],
      why: "`toSorted` (or `[...notes].sort(byDate)`) leaves the original as it was.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "The basket total",
      task: 'Each item is like `{ name: "Milk", price: 2 }`. Write `total(items)` to return the sum of the prices, using `reduce`. An empty basket is 0.',
      starter: ["function total(items) {", "", "}"],
      tests: [
        ["total([{ price: 2 }, { price: 3.5 }])", "5.5"],
        ["total([{ price: 10 }])", "10"],
        ["total([])", "0"],
      ],
      hint: "`items.reduce((sum, item) => sum + item.price, 0)`",
      solution: [
        "function total(items) {",
        "  return items.reduce((sum, item) => sum + item.price, 0);",
        "}",
      ],
    }),
    yourTurn({
      title: "Titles from the server",
      task: "A server sends JSON text of an array of notes. Write `titles(text)` to return an array of just their titles.",
      starter: ["function titles(text) {", "", "}"],
      tests: [
        [
          `titles('[{"id":1,"title":"Milk"},{"id":2,"title":"Bread"}]')`,
          '["Milk", "Bread"]',
        ],
        ["titles('[]')", "[]"],
      ],
      hint: "Parse first, then `map`: `JSON.parse(text).map((n) => n.title)`.",
      solution: [
        "function titles(text) {",
        "  return JSON.parse(text).map((n) => n.title);",
        "}",
      ],
    }),
    yourTurn({
      title: "Parse safely",
      task: "Write `safeParse(text)` to return the parsed value, or `null` if the text isn't valid JSON.",
      starter: [
        "function safeParse(text) {",
        "  return JSON.parse(text);",
        "}",
      ],
      tests: [
        [`safeParse('{"a":1}')`, "{ a: 1 }"],
        ["safeParse('[1, 2]')", "[1, 2]"],
        ['safeParse("{bad")', "null"],
      ],
      hint: "Put the `return JSON.parse(text);` inside `try { }`, and `return null;` in `catch { }`.",
      solution: [
        "function safeParse(text) {",
        "  try {",
        "    return JSON.parse(text);",
        "  } catch {",
        "    return null;",
        "  }",
        "}",
      ],
    }),
    yourTurn({
      title: "Count the tags",
      task: 'Each note is like `{ tag: "work" }`. Write `countTags(notes)` to return an object with how many notes have each tag: `{ work: 2, home: 1 }`.',
      starter: ["function countTags(notes) {", "", "}"],
      tests: [
        [
          'countTags([{ tag: "work" }, { tag: "home" }, { tag: "work" }])',
          "{ work: 2, home: 1 }",
        ],
        ["countTags([])", "{}"],
      ],
      hint: "`reduce` starting from `{}`: in the function, `acc[note.tag] = (acc[note.tag] ?? 0) + 1; return acc;`",
      solution: [
        "function countTags(notes) {",
        "  return notes.reduce((acc, note) => {",
        "    acc[note.tag] = (acc[note.tag] ?? 0) + 1;",
        "    return acc;",
        "  }, {});",
        "}",
      ],
    }),
    yourTurn({
      title: "Newest first",
      task: 'Notes have a `created_at` like `"2026-10-28"`. Write `newestFirst(notes)` to return a **sorted copy**, newest first, leaving the original as it was.',
      starter: ["function newestFirst(notes) {", "", "}"],
      tests: [
        [
          'newestFirst([{ id: 1, created_at: "2026-01-05" }, { id: 2, created_at: "2026-03-01" }, { id: 3, created_at: "2026-02-10" }]).map((n) => n.id)',
          "[2, 3, 1]",
        ],
        [
          '(() => { const a = [{ id: 1, created_at: "2026-01-05" }, { id: 2, created_at: "2026-03-01" }]; newestFirst(a); return a[0].id; })()',
          "1",
        ],
      ],
      hint: "`notes.toSorted((a, b) => b.created_at.localeCompare(a.created_at))`",
      solution: [
        "function newestFirst(notes) {",
        "  return notes.toSorted((a, b) =>",
        "    b.created_at.localeCompare(a.created_at),",
        "  );",
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("JSON and data cheat sheet", [
      ["to text", "A value as JSON.", "JSON.stringify(value)"],
      ["readable text", "Indented by 2.", "JSON.stringify(value, null, 2)"],
      ["from text", "JSON back to a value.", "JSON.parse(text)"],
      ["safely", "Catch broken JSON.", "try { JSON.parse(t) } catch { … }"],
      ["total", "Sum a list.", "a.reduce((s, x) => s + x, 0)"],
      ["count", "Count into an object.", "a.reduce((acc, x) => …, {})"],
      ["sort numbers", "Subtract; a copy.", "a.toSorted((x, y) => x - y)"],
      ["sort text", "localeCompare.", "x.title.localeCompare(y.title)"],
      ["walk an object", "Key-value pairs.", "Object.entries(o)"],
    ]),
    quickCheck(
      "Which of these is true?",
      [
        "`JSON.parse` gives back the same object you stringified",
        "`JSON.stringify` keeps functions and dates exactly as they were",
        "`JSON.parse` throws on text that isn't valid JSON",
      ],
      2,
      "Parsing builds new objects, and stringify drops functions and turns dates into strings. Broken text makes `parse` throw, so catch it.",
    ),
  ),
);
