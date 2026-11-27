import {
  analogy,
  anatomy,
  code,
  diagram,
  explain,
  keyPoints,
  mistake,
  moduleLesson,
  pagePlayground,
  pageYourTurn,
  part,
  quickCheck,
  reference,
  trace,
} from "../blocks.js";

// The DOM in depth: what it is (the page as a tree of objects), finding
// elements, reading and changing text, attributes, classes and styles,
// making, adding and removing elements, rendering a list from data, safe
// text versus innerHTML, where scripts go, mistakes, practice and a recap.
export const domModule = moduleLesson(
  "the-dom",
  "The DOM: finding and changing the page",
  45,
  [
    "Explain the DOM: the page as a tree of objects JavaScript can change.",
    "Find elements with `querySelector` and `querySelectorAll`.",
    "Change text, attributes, classes and styles on the page.",
    "Make, add and remove elements, and render a list from an array.",
    "Use `textContent` rather than `innerHTML` for text, and say why.",
  ],

  part(
    "what",
    "What the DOM is",
    explain(
      "When the browser reads your HTML, it builds a **tree of objects** in memory, one object per element, nested just like the tags. That tree is the **DOM** (Document Object Model). What you see is drawn from the tree, so when JavaScript changes the tree, the page on screen changes straight away, without reloading.",
    ),
    code("html", "this HTML…", [
      "<body>",
      "  <h1>My notes</h1>",
      '  <ul id="list">',
      "    <li>Milk</li>",
      "    <li>Bread</li>",
      "  </ul>",
      "</body>",
    ]),
    diagram([
      ["document", "the whole page"],
      ["body", "inside it"],
      ["h1 and ul", "children of body"],
      ["li, li", "children of ul"],
    ]),
    analogy(
      "A family tree: `body` is the parent of `h1` and `ul`, the two `li`s are siblings and children of `ul`. JavaScript can walk the tree, change any member, or add new ones.",
    ),
  ),

  part(
    "finding",
    "Finding elements",
    explain(
      "Everything starts from `document`, the object for the whole page. [[dom-query|Finding elements]] uses the **same selectors as CSS**: `h1`, `.note`, `#list`, `ul li`.",
    ),
    reference("Finding elements", [
      [
        "querySelector(s)",
        "The first element matching the selector, or null.",
        'document.querySelector(".note")',
      ],
      [
        "querySelectorAll(s)",
        "Every match, as a list you can loop over.",
        'document.querySelectorAll("li")',
      ],
      [
        "getElementById(id)",
        "The element with that id (no #).",
        'document.getElementById("list")',
      ],
      [
        "el.querySelector(s)",
        "Search only inside one element.",
        'list.querySelector("li")',
      ],
      [
        "el.closest(s)",
        "The nearest parent that matches.",
        'btn.closest(".note")',
      ],
    ]),
    pagePlayground("Find things, and log what you found", [
      "<h1>My notes</h1>",
      '<ul id="list">',
      '  <li class="note">Milk</li>',
      '  <li class="note done">Bread</li>',
      "</ul>",
      "<script>",
      '  const heading = document.querySelector("h1");',
      "  console.log(heading.textContent);",
      "",
      '  const notes = document.querySelectorAll(".note");',
      '  console.log(notes.length, "notes");',
      "",
      '  console.log(document.querySelector(".done").textContent);',
      '  console.log(document.querySelector(".missing")); // null',
      "</script>",
    ]),
    quickCheck(
      'What does `document.querySelector(".card")` give back when there is no `.card`?',
      ["An empty list", "`null`", "An error"],
      1,
      '`querySelector` gives `null` when nothing matches. Using `null` as an element is what causes "Cannot read properties of null".',
    ),
  ),

  part(
    "text-and-attributes",
    "Reading and changing text and attributes",
    reference("Changing an element", [
      [
        "textContent",
        "Read or replace the text.",
        'title.textContent = "Saved";',
      ],
      ["value", "What's in an input.", "input.value"],
      [
        "setAttribute(n, v)",
        "Set any attribute.",
        'img.setAttribute("alt", "A cat");',
      ],
      ["getAttribute(n)", "Read an attribute.", 'link.getAttribute("href")'],
      [
        "el.id, el.href, el.src…",
        "Common attributes as properties.",
        'img.src = "cat.png";',
      ],
      ["hidden", "Hide or show.", "banner.hidden = true;"],
    ]),
    pagePlayground("Change the page from a script", [
      '<h1 id="title">Loading…</h1>',
      '<img id="pic" alt="" width="80" height="80">',
      '<p id="note" hidden>Secret note</p>',
      "<script>",
      '  const title = document.querySelector("#title");',
      '  title.textContent = "My notes";',
      "",
      '  const pic = document.querySelector("#pic");',
      '  pic.setAttribute("alt", "A blank picture");',
      '  console.log("alt is", pic.getAttribute("alt"));',
      "",
      '  document.querySelector("#note").hidden = false;',
      "</script>",
    ]),
    keyPoints(
      "Find the element first, then change it.",
      "The change shows at once: no reload.",
      "Inputs keep what's typed in `.value`, not `textContent`.",
    ),
  ),

  part(
    "classes-and-styles",
    "Classes and styles",
    explain(
      "To change how something looks, add or remove a **class** and let your CSS do the styling. `classList` has methods for exactly that. Setting `el.style` directly works too, but keep it for values worked out in JavaScript, like a width.",
    ),
    reference("classList and style", [
      ["classList.add(c)", "Add a class.", 'note.classList.add("done");'],
      [
        "classList.remove(c)",
        "Remove a class.",
        'note.classList.remove("done");',
      ],
      [
        "classList.toggle(c)",
        "Add if missing, remove if there.",
        'note.classList.toggle("done");',
      ],
      [
        "classList.contains(c)",
        "Does it have the class?",
        'note.classList.contains("done")',
      ],
      [
        "style.prop",
        "One inline style (camelCase).",
        'bar.style.width = "40%";',
      ],
    ]),
    pagePlayground("Toggle a class", [
      "<style>",
      "  .done { text-decoration: line-through; color: gray; }",
      "</style>",
      '<p class="note">Buy milk</p>',
      "<script>",
      '  const note = document.querySelector(".note");',
      '  note.classList.add("done");',
      "  console.log(note.className);",
      '  console.log(note.classList.contains("done"));',
      "  // Try toggle instead of add, twice.",
      "</script>",
    ]),
  ),

  part(
    "making",
    "Making, adding and removing elements",
    explain(
      "New elements are made in JavaScript first, then put on the page. `document.createElement` makes one that exists only in memory; it appears when you [[dom-manipulation|append]] it to an element that's already on the page.",
    ),
    anatomy(
      "Adding an item to a list",
      [
        'const item = document.createElement("li");',
        'item.textContent = "Eggs";',
        'document.querySelector("#list").append(item);',
      ],
      [
        [
          'document.createElement("li")',
          "make",
          "A new, empty `<li>`. Not on the page yet.",
        ],
        ["item.textContent", "fill", "Give it its text."],
        [
          'document.querySelector("#list")',
          "find",
          "The list that's already on the page.",
        ],
        [
          ".append(item)",
          "add",
          "Put the new item at the end of the list. Now it shows.",
        ],
      ],
    ),
    reference("Adding and removing", [
      ["append(el)", "Add at the end, inside.", "list.append(item)"],
      ["prepend(el)", "Add at the start, inside.", "list.prepend(item)"],
      [
        "before(el) / after(el)",
        "Add next to an element.",
        "first.before(item)",
      ],
      ["remove()", "Take it off the page.", "item.remove()"],
      [
        "replaceChildren()",
        "Remove everything inside.",
        "list.replaceChildren()",
      ],
    ]),
    pagePlayground("Add and remove", [
      '<ul id="list"><li>Milk</li><li>Bread</li></ul>',
      "<script>",
      '  const list = document.querySelector("#list");',
      "",
      '  const item = document.createElement("li");',
      '  item.textContent = "Eggs";',
      "  list.append(item);",
      "",
      '  list.querySelector("li").remove(); // the first one',
      '  console.log(list.children.length, "items");',
      "</script>",
    ]),
  ),

  part(
    "rendering",
    "Showing a list from data",
    explain(
      "Apps keep their data in arrays and objects, then **render** it: turn each item into elements on the page. Clear the list, loop over the data, make an element for each item and append it. Run the same function again whenever the data changes. Watch it work:",
    ),
    trace(
      "Rendering two notes",
      [
        'const notes = ["Milk", "Bread"];',
        'const ul = document.querySelector("ul");',
        "ul.replaceChildren();",
        "for (const note of notes) {",
        '  const li = document.createElement("li");',
        "  li.textContent = note;",
        "  ul.append(li);",
        "}",
      ],
      [
        {
          line: 1,
          note: "The data: two notes.",
          vars: [["notes", '["Milk", "Bread"]']],
        },
        {
          line: 2,
          note: "Find the empty list on the page.",
          vars: [
            ["notes", '["Milk", "Bread"]'],
            ["ul", "<ul> (empty)"],
          ],
        },
        {
          line: 3,
          note: "Clear it, in case it was rendered before.",
          vars: [
            ["notes", '["Milk", "Bread"]'],
            ["ul", "<ul> (empty)"],
          ],
        },
        {
          line: 5,
          note: 'First round: `note` is "Milk". A new, empty `<li>` is made, in memory only.',
          vars: [
            ["notes", '["Milk", "Bread"]'],
            ["ul", "<ul> (empty)"],
            ["note", '"Milk"'],
            ["li", "<li></li> (not on the page)"],
          ],
        },
        {
          line: 7,
          note: "Its text is set to Milk, and it is appended: now it appears on the page.",
          vars: [
            ["notes", '["Milk", "Bread"]'],
            ["ul", "<ul> Milk </ul>"],
            ["note", '"Milk"'],
          ],
        },
        {
          line: 7,
          note: 'Second round, for "Bread": made, filled, appended.',
          vars: [
            ["notes", '["Milk", "Bread"]'],
            ["ul", "<ul> Milk, Bread </ul>"],
            ["note", '"Bread"'],
          ],
        },
      ],
    ),
    pagePlayground("A render function", [
      '<ul id="list"></ul>',
      "<script>",
      '  const notes = ["Milk", "Bread", "Eggs"];',
      "",
      "  function render() {",
      '    const list = document.querySelector("#list");',
      "    list.replaceChildren();",
      "    for (const note of notes) {",
      '      const li = document.createElement("li");',
      "      li.textContent = note;",
      "      list.append(li);",
      "    }",
      "  }",
      "",
      "  render();",
      '  notes.push("Tea");',
      "  render(); // the page follows the data",
      "</script>",
    ]),
  ),

  part(
    "safe-text",
    "textContent, not innerHTML",
    explain(
      "`innerHTML` reads text **as HTML**. If that text came from a user, they can slip in their own tags and scripts, which then run on everyone's page. That attack is cross-site scripting (XSS). `textContent` always treats text as plain text, so it's safe. Build elements with `createElement` and fill them with `textContent`.",
    ),
    mistake({
      title: "Putting user text in with innerHTML",
      wrong: [
        "const title = input.value;",
        "list.innerHTML += `<li>${title}</li>`;",
        '// title = <img src=x onerror="steal()">',
      ],
      problem:
        "The typed text becomes real HTML: the `<img>` fails to load and its `onerror` runs the attacker's code.",
      right: [
        'const li = document.createElement("li");',
        "li.textContent = input.value;",
        "list.append(li);",
      ],
      why: "`textContent` shows the text as typed, tags and all, and never runs it.",
    }),
    quickCheck(
      "When is `innerHTML` reasonably safe?",
      [
        "Never use it",
        "Only with HTML you wrote yourself, never with text from users or servers",
        "Whenever the text is short",
      ],
      1,
      "Your own fixed HTML is fine. Anything from outside, like input or API data, goes in with `textContent`.",
    ),
  ),

  part(
    "where-scripts-go",
    "Where your script runs",
    explain(
      "A script can only find elements that already exist. The browser reads the page top to bottom, so a script in the `<head>` runs **before** the body exists and finds nothing. Put scripts at the end of `<body>`, or add `defer` so they wait for the whole page.",
    ),
    code(
      "html",
      "two ways to make sure the elements exist",
      [
        "<head>",
        '  <script src="app.js" defer></script>',
        "</head>",
        "<body>",
        "  <h1>My notes</h1>",
        '  <script src="other.js"></script>',
        "</body>",
      ],
      {
        2: "defer: download now, run after the page is read",
        6: "at the end of body: everything above it exists",
      },
    ),
    keyPoints(
      "Scripts run where they're placed, top to bottom.",
      "`defer` (or the end of `<body>`) means the elements are there.",
      "React and Vite handle this for you in the Notes App.",
    ),
  ),

  part(
    "where-used",
    "Where you'll use the DOM",
    keyPoints(
      "Showing data: render a list of notes from an array.",
      'Feedback: "Saved", error messages, loading spinners.',
      "Showing and hiding: menus, dialogs, tabs.",
      "Reading forms: `input.value`.",
    ),
    explain(
      "In the Notes App, React does this DOM work for you: you describe the page from your data, and React works out which elements to create, change or remove. Knowing the DOM is what makes React make sense, and you'll still use it directly for small pages and for debugging in DevTools' Elements tab.",
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Using an element that wasn't found",
      wrong: [
        'const btn = document.querySelector("#save-btn");',
        'btn.textContent = "Save";',
        "// TypeError: Cannot set properties of null",
      ],
      problem:
        "Nothing matched (a typo in the selector, or the script ran before the element existed), so `btn` is `null`.",
      right: [
        'const btn = document.querySelector("#save");',
        "if (btn) {",
        '  btn.textContent = "Save";',
        "}",
      ],
      why: "Check the selector matches the HTML exactly, run scripts after the elements, and check for `null` when it might be missing.",
    }),
    mistake({
      title: "Forgetting the # or .",
      language: "js",
      wrong: ['document.querySelector("list");'],
      problem: "Without `#`, `list` means a `<list>` tag, which doesn't exist.",
      right: ['document.querySelector("#list");'],
      why: "Selectors work exactly as in CSS: `#` for an id, `.` for a class.",
    }),
    mistake({
      title: "Treating querySelectorAll like one element",
      wrong: [
        'const items = document.querySelectorAll("li");',
        'items.classList.add("done");',
      ],
      problem: "`querySelectorAll` gives a list; a list has no `classList`.",
      right: [
        'const items = document.querySelectorAll("li");',
        "for (const item of items) {",
        '  item.classList.add("done");',
        "}",
      ],
      why: "Loop over the list and change each element.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    pageYourTurn({
      title: "Change the heading",
      task: "Using a script, change the heading's text to `My notes` and give it the class `big`.",
      starter: ["<h1>Loading…</h1>", "<script>", "", "</script>"],
      checks: [
        {
          kind: "text",
          label: "The heading says My notes",
          selector: "h1",
          text: "My notes",
        },
        {
          kind: "exists",
          label: "The heading has the class big",
          selector: "h1.big",
        },
      ],
      hint: 'Find it with `document.querySelector("h1")`, then set `textContent` and `classList.add("big")`.',
      solution: [
        "<h1>Loading…</h1>",
        "<script>",
        '  const h1 = document.querySelector("h1");',
        '  h1.textContent = "My notes";',
        '  h1.classList.add("big");',
        "</script>",
      ],
    }),
    pageYourTurn({
      title: "Render the list",
      task: "Add one `<li>` to `#list` for every item in `notes`, in order, using `createElement`, `textContent` and `append`.",
      starter: [
        '<ul id="list"></ul>',
        "<script>",
        '  const notes = ["Milk", "Bread", "Eggs"];',
        "",
        "</script>",
      ],
      checks: [
        {
          kind: "count",
          label: "The list has 3 items",
          selector: "#list li",
          count: 3,
        },
        {
          kind: "text",
          label: "The first item is Milk",
          selector: "#list li:first-child",
          text: "Milk",
        },
        {
          kind: "text",
          label: "The last item is Eggs",
          selector: "#list li:last-child",
          text: "Eggs",
        },
      ],
      hint: "Find the list once. Then `for (const note of notes)`: make an `li`, set its `textContent`, and `append` it.",
      solution: [
        '<ul id="list"></ul>',
        "<script>",
        '  const notes = ["Milk", "Bread", "Eggs"];',
        '  const list = document.querySelector("#list");',
        "  for (const note of notes) {",
        '    const li = document.createElement("li");',
        "    li.textContent = note;",
        "    list.append(li);",
        "  }",
        "</script>",
      ],
    }),
    pageYourTurn({
      title: "Tidy up",
      task: "Remove every item that has the class `done`, and set `#count` to say how many items are left, like `2 left`.",
      starter: [
        "<ul>",
        '  <li>Milk</li><li class="done">Bread</li>',
        '  <li>Eggs</li><li class="done">Tea</li>',
        "</ul>",
        '<p id="count"></p>',
        "<script>",
        "",
        "</script>",
      ],
      checks: [
        {
          kind: "missing",
          label: "No done items are left",
          selector: "li.done",
        },
        { kind: "count", label: "Two items remain", selector: "li", count: 2 },
        {
          kind: "text",
          label: "#count says 2 left",
          selector: "#count",
          text: "2 left",
        },
      ],
      hint: 'Loop over `querySelectorAll("li.done")` and `remove()` each one. Then count `querySelectorAll("li").length`.',
      solution: [
        "<ul>",
        '  <li>Milk</li><li class="done">Bread</li>',
        '  <li>Eggs</li><li class="done">Tea</li>',
        "</ul>",
        '<p id="count"></p>',
        "<script>",
        '  for (const li of document.querySelectorAll("li.done")) {',
        "    li.remove();",
        "  }",
        '  const left = document.querySelectorAll("li").length;',
        '  document.querySelector("#count").textContent = `${left} left`;',
        "</script>",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("DOM cheat sheet", [
      ["find one / all", "CSS selectors.", 'document.querySelector("#list")'],
      ["text", "Read or set plain text (safe).", 'el.textContent = "Hi";'],
      ["attributes", "Set or read.", 'img.setAttribute("alt", "…")'],
      ["classes", "Let CSS do the styling.", 'el.classList.toggle("done")'],
      [
        "make and add",
        "Create in memory, then append.",
        'list.append(document.createElement("li"))',
      ],
      ["remove", "Take it off the page.", "el.remove()"],
      [
        "render",
        "Clear, loop over data, append each.",
        "list.replaceChildren(); for (…) …",
      ],
    ]),
    quickCheck(
      "Which of these is true?",
      [
        "`createElement` puts the new element on the page straight away",
        "Changing the DOM changes the page without a reload",
        "`innerHTML` is the safe way to show what a user typed",
      ],
      1,
      "A new element only appears once it's appended, and user text goes in with `textContent`.",
    ),
  ),
);
