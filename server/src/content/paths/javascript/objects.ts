import {
  analogy,
  anatomy,
  code,
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

// Objects in depth: why group named values, an object's parts, reading
// with dots and brackets, changing them, nesting, methods, looping over
// keys, objects in and out of functions, copying and references, JSON
// preview, where they're used, mistakes, practice and a recap.
export const objectsModule = moduleLesson(
  "objects",
  "Objects: named values",
  40,
  [
    "Make an object, and name the parts: keys, values and properties.",
    "Read, add, change and delete properties with `.` and `[]`.",
    "Work with nested objects and lists of objects, like a note with tags.",
    "Loop over an object's keys and values, and give objects methods.",
    "Pass objects to functions and return them, copying instead of changing.",
  ],

  part(
    "why",
    "Why objects?",
    explain(
      "A note has a title, some content, a done flag and an id. You could keep four separate variables, but they'd drift apart, and a list of notes would be four lists. An **object** groups values that belong together, each under its own name, so one variable holds the whole note. See [[js-object-array|objects and arrays]].",
    ),
    code("js", "four loose variables, or one object", [
      'const noteTitle = "Milk";',
      "const noteDone = false;",
      "",
      "const note = {",
      '  title: "Milk",',
      "  done: false,",
      "};",
    ]),
    analogy(
      "A form you've filled in: each box has a label (the key) and what you wrote in it (the value). The whole form is the object.",
    ),
    keyPoints(
      "An array is an ordered list, read by position.",
      "An object is a set of named values, read by name.",
      "Most real data is objects inside arrays: a list of notes.",
    ),
  ),

  part(
    "anatomy",
    "The parts of an object",
    anatomy(
      "An object literal",
      ["const note = {", '  title: "Milk",', "  done: false,", "};"],
      [
        ["const note", "name", "One variable holds the whole object."],
        ["{", "opens", "Curly braces make an object."],
        [
          "title",
          "key",
          "The property's name. No quotes needed for simple names.",
        ],
        [":", "colon", "Separates the key from its value."],
        [
          '"Milk"',
          "value",
          "Any value: text, a number, a list, even another object.",
        ],
        [",", "comma", "Goes between properties."],
        [
          "done: false",
          "property",
          "A key and its value together make one property.",
        ],
        ["}", "closes", "The end of the object."],
      ],
    ),
    quickCheck(
      'In `{ id: 7, title: "Milk" }`, what is `id`?',
      ["A value", "A key: the name of a property", "A list"],
      1,
      "Keys are the names; the values come after the colons.",
    ),
  ),

  part(
    "reading",
    "Reading properties",
    reference("Reading an object", [
      ["obj.key", "Dot: the usual way.", "note.title"],
      ['obj["key"]', "Brackets: the key as text.", 'note["title"]'],
      [
        "obj[variable]",
        "Brackets with a variable holding the key.",
        "note[field]",
      ],
      [
        "missing key",
        "Gives undefined, not an error.",
        "note.colour // undefined",
      ],
      ["key in obj", "Does it have this key?", '"title" in note // true'],
    ]),
    jsPlayground("Dots and brackets", [
      "const note = {",
      '  title: "Milk",',
      "  done: false,",
      '  "created at": "Monday",',
      "};",
      "",
      "console.log(note.title);",
      'console.log(note["done"]);',
      'console.log(note["created at"]); // a key with a space needs brackets',
      "",
      'const field = "title";',
      "console.log(note[field]); // the key comes from a variable",
      "console.log(note.colour);",
    ]),
    quickCheck(
      'With `const key = "done";`, which reads `note.done`?',
      ["`note.key`", "`note[key]`", "`note.[key]`"],
      1,
      "`note.key` looks for a property literally called `key`. Brackets use the variable's value.",
    ),
  ),

  part(
    "changing",
    "Adding, changing and deleting",
    explain(
      "Assign to a property to change it, or to add it if it isn't there yet. `delete` removes one. As with arrays, a `const` object can still change inside: `const` only stops the name pointing at a different object.",
    ),
    trace(
      "A note changing",
      [
        'const note = { title: "Milk" };',
        "note.done = false;",
        'note.title = "Oat milk";',
        "note.done = true;",
        "delete note.done;",
      ],
      [
        {
          line: 1,
          note: "An object with one property.",
          vars: [["note", '{ title: "Milk" }']],
        },
        {
          line: 2,
          note: "There's no `done` yet, so assigning adds it.",
          vars: [["note", '{ title: "Milk", done: false }']],
        },
        {
          line: 3,
          note: "`title` exists, so assigning replaces its value.",
          vars: [["note", '{ title: "Oat milk", done: false }']],
        },
        {
          line: 4,
          note: "And again for `done`.",
          vars: [["note", '{ title: "Oat milk", done: true }']],
        },
        {
          line: 5,
          note: "`delete` removes the property completely.",
          vars: [["note", '{ title: "Oat milk" }']],
        },
      ],
    ),
    jsPlayground("Change it yourself", [
      'const user = { name: "Sam" };',
      "",
      "user.age = 30;",
      'user.name = "Sam Lee";',
      'user["email"] = "sam@example.com";',
      "console.log(user);",
      "",
      "delete user.age;",
      "console.log(user);",
    ]),
  ),

  part(
    "nesting",
    "Objects inside objects, and lists of them",
    explain(
      "A value can be anything, including an array or another object. Real data is built this way: a note with a list of tags, a user with an address. Read deeper by chaining dots and brackets, one step at a time.",
    ),
    code(
      "js",
      "a note with nested data",
      [
        "const note = {",
        "  id: 7,",
        '  title: "Milk",',
        '  tags: ["shopping", "today"],',
        '  author: { name: "Sam", email: "sam@example.com" },',
        "};",
        "",
        'note.tags[0];      // "shopping"',
        'note.author.name;  // "Sam"',
      ],
      {
        4: "an array as a value",
        5: "an object as a value",
        8: "into the array, then its first item",
        9: "into the object, then its name",
      },
    ),
    jsPlayground("A list of objects", [
      "const notes = [",
      '  { id: 1, title: "Milk", tags: ["shopping"] },',
      '  { id: 2, title: "Call Sam", tags: ["phone", "today"] },',
      "];",
      "",
      "console.log(notes[1].title);",
      "console.log(notes[1].tags.length);",
      "console.log(notes[0].tags[0]);",
      "",
      "for (const note of notes) {",
      "  console.log(`${note.id}: ${note.title}`);",
      "}",
    ]),
  ),

  part(
    "methods",
    "Methods: functions inside objects",
    explain(
      "A property's value can be a function. Then it's called a **method**, and you call it with a dot: `note.describe()`. You've used built-in ones all along: `console.log`, `\"text\".trim()`, `notes.push()`. Inside a method, `this` means the object it was called on (more on `this` in Advanced).",
    ),
    jsPlayground("An object with a method", [
      "const note = {",
      '  title: "Milk",',
      "  done: false,",
      "  describe() {",
      '    return `${this.title}: ${this.done ? "done" : "to do"}`;',
      "  },",
      "};",
      "",
      "console.log(note.describe());",
      "note.done = true;",
      "console.log(note.describe());",
    ]),
    keyPoints(
      "A method is a function stored in an object.",
      "Call it with a dot and brackets: `obj.method()`.",
      "Most data in apps is plain objects; functions work on it from outside.",
    ),
  ),

  part(
    "looping",
    "Looping over an object",
    reference("Getting at every property", [
      [
        "Object.keys(obj)",
        "An array of the keys.",
        'Object.keys(note) // ["title", "done"]',
      ],
      [
        "Object.values(obj)",
        "An array of the values.",
        'Object.values(note) // ["Milk", false]',
      ],
      [
        "Object.entries(obj)",
        "An array of [key, value] pairs.",
        '[["title", "Milk"], ["done", false]]',
      ],
      ["for…in", "Loop over the keys.", "for (const key in note) { … }"],
    ]),
    jsPlayground("Every key and value", [
      "const prices = { milk: 1.2, bread: 2.5, eggs: 3 };",
      "",
      "console.log(Object.keys(prices));",
      "console.log(Object.values(prices));",
      "",
      "for (const [item, price] of Object.entries(prices)) {",
      "  console.log(`${item} costs £${price}`);",
      "}",
      "",
      'console.log(Object.keys(prices).length, "items");',
    ]),
    quickCheck(
      "How do you count an object's properties?",
      ["`obj.length`", "`Object.keys(obj).length`", "`obj.count()`"],
      1,
      "Objects have no `length`. `Object.keys` gives an array, and arrays do.",
    ),
  ),

  part(
    "functions",
    "Objects in and out of functions",
    explain(
      "Functions often take an object and give one back. Pass one object instead of a long list of arguments, and the names make the call easy to read. Return an object when a function has several things to give back.",
    ),
    code(
      "js",
      "an object in, an object out",
      [
        "function makeNote(title, tags = []) {",
        "  return { id: Date.now(), title, tags, done: false };",
        "}",
        "",
        "function describe(note) {",
        "  return `${note.title} (${note.tags.length} tags)`;",
        "}",
        "",
        'describe(makeNote("Milk", ["shopping"]));',
      ],
      {
        2: "`title` is short for `title: title`",
        5: "takes a whole note, reads what it needs",
      },
    ),
    explain(
      "When a key and the variable holding its value have the same name, you can write the name once: `{ title, tags }` means `{ title: title, tags: tags }`. You'll see this shorthand all over real code.",
    ),
  ),

  part(
    "copying",
    "Copying an object",
    explain(
      "Assigning an object to another variable doesn't copy it: both names point at the **same** object, so a change through one shows through the other. To get a separate object, copy it with the spread syntax `{ ...note }`, and add or override properties after it.",
    ),
    trace(
      "Same object, or a copy?",
      [
        'const a = { title: "Milk" };',
        "const b = a;",
        'b.title = "Bread";',
        "const c = { ...a, done: true };",
        'c.title = "Eggs";',
      ],
      [
        { line: 1, note: "One object.", vars: [["a", '{ title: "Milk" }']] },
        {
          line: 2,
          note: "`b` points at **the same** object as `a`. There's still only one.",
          vars: [
            ["a", '{ title: "Milk" }'],
            ["b", "same object as a"],
          ],
        },
        {
          line: 3,
          note: "Changing it through `b` changes what `a` sees too.",
          vars: [
            ["a", '{ title: "Bread" }'],
            ["b", "same object as a"],
          ],
        },
        {
          line: 4,
          note: "`{ ...a }` makes a new object with a's properties, then `done` is added.",
          vars: [
            ["a", '{ title: "Bread" }'],
            ["b", "same object as a"],
            ["c", '{ title: "Bread", done: true }'],
          ],
        },
        {
          line: 5,
          note: "`c` is separate, so `a` is unaffected.",
          vars: [
            ["a", '{ title: "Bread" }'],
            ["b", "same object as a"],
            ["c", '{ title: "Eggs", done: true }'],
          ],
        },
      ],
    ),
    keyPoints(
      "`=` with an object shares it; it doesn't copy.",
      "`{ ...obj }` makes a copy one level deep.",
      "`{ ...note, done: true }`: a copy with one change, as React likes.",
    ),
  ),

  part(
    "where-used",
    "Where you'll use objects",
    keyPoints(
      "Data from the server: each note arrives as an object.",
      'Settings and options: `fetch(url, { method: "POST" })`.',
      "Grouping a function's results: `return { notes, error }`.",
      "React props: every component receives one object.",
    ),
    code(
      "json",
      "a note, as the Notes App's API sends it",
      [
        "{",
        '  "id": 7,',
        '  "title": "Buy milk",',
        '  "content": "Semi-skimmed",',
        '  "created_at": "2026-10-28T09:00:00.000Z"',
        "}",
      ],
      {
        1: "JSON: objects written as text, with quoted keys (more in Intermediate)",
      },
    ),
    inTheNotesApp(
      "`useNotes` keeps the notes as an array of objects from the API. To update one, `replaceNote` builds a new array where the note with the matching `id` is swapped for the updated object; nothing is changed in place.",
      { symbolId: "hook:useNotes" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "A dot with a variable key",
      wrong: [
        'const field = "title";',
        "console.log(note.field); // undefined",
      ],
      problem: "`note.field` looks for a property literally named `field`.",
      right: ['const field = "title";', "console.log(note[field]);"],
      why: "When the key is in a variable, use brackets.",
    }),
    mistake({
      title: "Reading into something missing",
      wrong: [
        'const note = { title: "Milk" };',
        "console.log(note.author.name);",
      ],
      problem:
        "`note.author` is `undefined`, and reading `.name` of `undefined` throws a `TypeError`.",
      right: [
        'const note = { title: "Milk" };',
        "console.log(note.author?.name); // undefined",
      ],
      why: "`?.` stops and gives `undefined` if the part before it is missing. Or check with an `if` first.",
    }),
    mistake({
      title: "Thinking = makes a copy",
      wrong: [
        "const draft = note;",
        'draft.title = "New";',
        '// note.title is now "New" too',
      ],
      problem: "Both names point at one object, so the original changed.",
      right: [
        "const draft = { ...note };",
        'draft.title = "New";',
        "// note is unchanged",
      ],
      why: "Copy with spread when you need a separate object.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "Make a book",
      task: 'Make an object `book` with `title` `"Dune"`, `pages` `412` and `read` `false`.',
      starter: ["// const book = ..."],
      tests: [
        ["book.title", '"Dune"'],
        ["book.pages", "412"],
        ["book.read", "false"],
      ],
      hint: 'Curly braces, `key: value` pairs, commas between: `{ title: "Dune", … }`.',
      solution: ['const book = { title: "Dune", pages: 412, read: false };'],
    }),
    yourTurn({
      title: "Describe a user",
      task: 'Write `describe(user)` to return `"Sam (30)"` for `{ name: "Sam", age: 30 }`.',
      starter: ["function describe(user) {", "", "}"],
      tests: [
        ['describe({ name: "Sam", age: 30 })', '"Sam (30)"'],
        ['describe({ name: "Ada", age: 36 })', '"Ada (36)"'],
      ],
      hint: "Read `user.name` and `user.age` and build the text with a template literal.",
      solution: [
        "function describe(user) {",
        "  return `${user.name} (${user.age})`;",
        "}",
      ],
    }),
    yourTurn({
      title: "Mark it done",
      task: "Write `markDone(note)` to return a **copy** of the note with `done` set to `true`, leaving the original unchanged.",
      starter: [
        "function markDone(note) {",
        "  note.done = true;",
        "  return note;",
        "}",
      ],
      tests: [
        [
          'markDone({ title: "Milk", done: false })',
          '{ title: "Milk", done: true }',
        ],
        [
          "(() => { const n = { done: false }; markDone(n); return n.done; })()",
          "false",
        ],
      ],
      hint: "Return `{ ...note, done: true }` instead of changing `note`.",
      solution: [
        "function markDone(note) {",
        "  return { ...note, done: true };",
        "}",
      ],
    }),
    yourTurn({
      title: "Total the basket",
      task: "`prices` is an object like `{ milk: 1.5, bread: 2 }`. Write `total(prices)` to return the sum of all its values.",
      starter: ["function total(prices) {", "", "}"],
      tests: [
        ["total({ milk: 1.5, bread: 2 })", "3.5"],
        ["total({ tea: 4, jam: 3, eggs: 3 })", "10"],
        ["total({})", "0"],
      ],
      hint: "`Object.values(prices)` gives an array of the prices; add them up with a loop.",
      solution: [
        "function total(prices) {",
        "  let sum = 0;",
        "  for (const price of Object.values(prices)) {",
        "    sum += price;",
        "  }",
        "  return sum;",
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Objects cheat sheet", [
      [
        "make",
        "Keys and values in curly braces.",
        '{ title: "Milk", done: false }',
      ],
      ["read", "Dot, or brackets for variable keys.", "note.title, note[key]"],
      ["change / add", "Assign to a property.", "note.done = true;"],
      ["delete", "Remove a property.", "delete note.done;"],
      ["nested", "Chain dots and brackets.", "note.tags[0], note.author.name"],
      ["every key", "Keys, values or pairs as arrays.", "Object.entries(note)"],
      ["copy", "Spread into a new object.", "{ ...note, done: true }"],
    ]),
    quickCheck(
      "Which of these is true?",
      [
        "`const b = a;` makes a copy of the object `a`",
        "Reading a missing property gives `undefined`",
        "Objects have a `length` property",
      ],
      1,
      "`=` shares the same object, and objects don't have `length`; use `Object.keys(obj).length`.",
    ),
  ),
);
