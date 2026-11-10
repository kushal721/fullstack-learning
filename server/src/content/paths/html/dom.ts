import {
  anatomy,
  diagram,
  explain,
  inTheNotesApp,
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

// From HTML to the DOM, from HTML's side (the JavaScript path's DOM module
// covers finding and changing elements): the file isn't the page, the tree
// and its nodes, a live tree viewer, a step-through of the parser, how the
// parser repairs broken HTML, view source versus the live DOM, attributes
// versus properties, from the tree to pixels, the Notes App, mistakes,
// practice and a recap.
export const htmlDomModule = moduleLesson(
  "the-dom",
  "From HTML to the DOM",
  40,
  [
    "Explain how the browser's parser turns HTML text into the DOM, a tree of nodes.",
    "Name the node types (document, element, text, comment) and spot whitespace text nodes.",
    "Predict how the parser repairs broken HTML: closed paragraphs, an added `<tbody>`.",
    "Tell the HTML file (view source) from the live DOM (the browser's developer tools).",
    "Say the difference between an attribute (the starting value) and a property (the live one).",
  ],

  part(
    "why",
    "The file isn't the page",
    explain(
      "Your HTML file is just text. The browser's [[html-parser|parser]] reads it once, top to bottom, and builds the [[dom]]: a tree of objects, one per element, piece of text and comment. From then on everything works with the tree, not the file: the screen is drawn from it, CSS styles it, scripts change it and screen readers read it.",
    ),
    diagram([
      ["HTML file", "text with tags"],
      ["parser", "reads it top to bottom"],
      ["DOM tree", "live objects in memory"],
      ["screen, scripts, screen readers", "all use the tree"],
    ]),
    keyPoints(
      "The browser reads the HTML once and builds a tree, the DOM.",
      "The page you see is drawn from the tree, not the file.",
      "Scripts change the tree; the file on the server never changes.",
    ),
  ),

  part(
    "tree",
    "A page as a tree",
    explain(
      "Each piece of the tree is a [[dom-node|node]]. At the top is the **document**; under it the `<html>` element, then `<head>` and `<body>`. An element's contents become its **children**: more elements, **text nodes** holding the words, and comment nodes. Attributes aren't children; they belong to their element. [[nesting|Nesting]] in the file is exactly parent and child in the tree.",
    ),
    anatomy(
      "This HTML, as nodes",
      ["<ul>", '  <li class="done">Milk</li>', "  <!-- more soon -->", "</ul>"],
      [
        ["<ul>", "element node", "The parent of everything inside it."],
        [
          "<li",
          "element node",
          "A child of the ul, and the parent of its text.",
        ],
        [
          'class="done"',
          "an attribute",
          "Belongs to the li; it's not a child node.",
        ],
        ["Milk", "text node", "The words are a node of their own."],
        [
          "<!-- more soon -->",
          "comment node",
          "Kept in the tree, but never shown.",
        ],
      ],
    ),
    quickCheck(
      "How many children does the `<li>` in `<li>Buy <b>milk</b></li>` have?",
      [
        "One: the `<b>` element",
        "Two: the text “Buy ” and the `<b>` element",
        "Three: “Buy ”, `<b>` and “milk”",
      ],
      1,
      "“Buy ” is a text node and `<b>` is an element; “milk” is the `<b>`'s child, a grandchild of the li.",
    ),
  ),

  part(
    "see-the-tree",
    "See the tree your HTML builds",
    explain(
      "This page prints the tree under its `<ul>`. Element names come out in capitals (that's how the DOM names them). Notice the `#text` nodes holding only a line break and spaces: the gaps between your tags are text too. Add an item, nest a `<b>`, delete the comment, and run it again.",
    ),
    pagePlayground("Print the tree under the list", [
      "<ul>",
      "  <li>Milk</li>",
      "  <li>Bread <!-- fresh --></li>",
      "</ul>",
      "<pre></pre>",
      "<script>",
      "  function show(node, depth) {",
      "    let label = node.nodeName;",
      '    if (node.nodeType === 3) label = "#text " + JSON.stringify(node.data);',
      '    if (node.nodeType === 8) label = "#comment " + node.data;',
      '    let out = "  ".repeat(depth) + label + "\\n";',
      "    for (const child of node.childNodes) out += show(child, depth + 1);",
      "    return out;",
      "  }",
      '  const list = document.querySelector("ul");',
      '  document.querySelector("pre").textContent = show(list, 0);',
      "</script>",
    ]),
    reference("Node types", [
      [
        "document",
        "The root of the tree; scripts reach the page through it.",
        "document",
      ],
      ["element", "One tag pair and what's inside it.", "<li>…</li>"],
      [
        "text",
        "Words, and the whitespace between tags.",
        "Milk, or a line break",
      ],
      ["comment", "A comment; in the tree, never shown.", "<!-- note -->"],
    ]),
  ),

  part(
    "parsing",
    "How the parser builds the tree",
    explain(
      "The parser keeps a list of the elements that are still open. Each start tag opens one, inside the newest; each end tag closes it. Some end tags are optional, and the parser knows when to close them for you. Step through a list written without its `</li>`s:",
    ),
    trace(
      "Parsing a list, move by move",
      ["<ul>", "  <li>Milk", "  <li>Bread", "</ul>", "<p>Two items"],
      [
        {
          line: 1,
          note: "A start tag: the parser makes a `ul` element and adds it inside the open `body`. The `ul` is now open, so what comes next goes inside it.",
          vars: [
            ["open", "html > body > ul"],
            ["tree", "body: ul"],
          ],
        },
        {
          line: 2,
          note: "A line break and spaces become a text node in the `ul`. Then `<li>` opens an `li`, and `Milk` becomes its text.",
          vars: [
            ["open", "html > body > ul > li"],
            ["tree", "ul: #text, li(Milk)"],
          ],
        },
        {
          line: 3,
          note: "Another `<li>` while an `li` is still open. A list item can't hold another list item, so the parser closes the first one for you, then opens the new one.",
          vars: [
            ["open", "html > body > ul > li"],
            ["tree", "ul: #text, li(Milk), li(Bread)"],
          ],
        },
        {
          line: 4,
          note: "`</ul>` closes the open `li` first, then the `ul`. We're back in the `body`.",
          vars: [
            ["open", "html > body"],
            ["tree", "body: ul(2 items)"],
          ],
        },
        {
          line: 5,
          note: "A `p` opens in the `body` with its text. The file ends with it still open.",
          vars: [
            ["open", "html > body > p"],
            ["tree", "body: ul, p(Two items)"],
          ],
        },
        {
          line: 5,
          note: "At the end of the file, the parser closes everything still open: `p`, `body`, `html`. The tree is complete and the page can be drawn.",
          vars: [
            ["open", "nothing"],
            ["tree", "body: ul(li, li), p"],
          ],
          output: "<ul><li>Milk</li><li>Bread</li></ul><p>Two items</p>",
        },
      ],
      { language: "html" },
    ),
  ),

  part(
    "repairs",
    "The parser fixes your mistakes",
    explain(
      "HTML never fails with an error. When the markup is wrong, the parser follows fixed rules to repair it, the same in every browser. A `<p>` can't hold a `<div>`, so the `<div>` closes it. A table row always ends up in a `<tbody>`. The page still shows, but the tree may not be what you wrote. Run this to see what the browser really built:",
    ),
    pagePlayground("What the browser built from broken HTML", [
      '<div id="broken"><p>One<p>Two<div>Box</div><table><tr><td>Milk</table></div>',
      "",
      "<p>What's really in the tree:</p>",
      "<pre></pre>",
      "<script>",
      '  const built = document.querySelector("#broken").innerHTML;',
      '  document.querySelector("pre").textContent = built.replaceAll("><", ">\\n<");',
      "</script>",
    ]),
    keyPoints(
      "Broken HTML never stops the page; the parser repairs it by fixed rules.",
      "A new `<p>`, `<div>` or `<table>` closes an open paragraph.",
      "Table rows always end up in a `<tbody>`, even if you didn't write one.",
      "Missing `<html>`, `<head>` and `<body>` tags are added for you.",
    ),
  ),

  part(
    "source-vs-dom",
    "View source isn't the DOM",
    explain(
      "Two views look alike but aren't. **View source** shows the file exactly as it arrived. The **Elements** panel in [[devtools]] shows the live DOM: the parser's repairs, everything scripts have added or changed, and what's there right now. When a page doesn't look like its HTML, check the Elements panel first.",
    ),
    reference("Which view to use", [
      [
        "View source",
        "The file as the server sent it. Never changes.",
        "Ctrl+U (⌥⌘U on a Mac)",
      ],
      [
        "Elements panel",
        "The live DOM, with repairs and script changes. Editable.",
        "Right-click › Inspect",
      ],
      [
        "Copy outerHTML",
        "The current tree as HTML, from the Elements panel.",
        "Right-click an element › Copy",
      ],
    ]),
    quickCheck(
      "A script adds a note to the page. Where can you see the new `<li>`?",
      [
        "In view source, after a reload",
        "In the Elements panel, straight away",
        "Nowhere: scripts can't add elements",
      ],
      1,
      "The script changed the DOM, which the Elements panel shows live. The file, and so view source, stays the same.",
    ),
  ),

  part(
    "attributes-properties",
    "Attributes and properties",
    explain(
      "An [[attribute]] in your HTML sets an element's **starting** state. The DOM object also has **properties** with the live state. Usually they match, but for form fields they split: `value=\"Milk\"` is the starting text, while the `value` property is what's in the box now. `checked` and `selected` work the same way. Type something, then compare:",
    ),
    pagePlayground("The attribute stays; the property follows you", [
      '<label>Title <input id="title" value="Milk"></label>',
      '<button type="button">Compare</button>',
      "<pre></pre>",
      "<script>",
      '  const input = document.querySelector("#title");',
      '  document.querySelector("button").addEventListener("click", () => {',
      '    document.querySelector("pre").textContent =',
      '      "attribute: " + input.getAttribute("value") + "\\nproperty:  " + input.value;',
      "  });",
      "</script>",
    ]),
    keyPoints(
      "Attributes are what the HTML said; properties are the live state.",
      "A field's value attribute is only its starting text.",
      "Resetting a form puts each field back to its attribute.",
    ),
  ),

  part(
    "to-pixels",
    "From the tree to pixels",
    explain(
      "Once the DOM exists, [[rendering]] can start. The browser matches CSS to each node, leaves out what isn't shown (like `display: none` or the `hidden` attribute), works out sizes and positions, then paints. It also builds the accessibility tree from the same DOM. Change the DOM and both are updated.",
    ),
    diagram([
      ["DOM", "every node"],
      ["styles", "CSS matched to each node"],
      ["layout", "sizes and positions; hidden nodes skipped"],
      ["paint", "pixels on screen"],
    ]),
    quickCheck(
      "An element has the `hidden` attribute. Is it in the DOM?",
      [
        "No: the parser skips it",
        "Yes, but it isn't drawn, and screen readers skip it",
        "Yes, and it's drawn but invisible",
      ],
      1,
      "`hidden` keeps the node in the tree, where scripts can find it, but it's left out of layout and the accessibility tree.",
    ),
  ),

  part(
    "where-used",
    "The Notes App's nearly empty page",
    explain(
      'Open view source on the Notes App and you\'ll find almost nothing in the body: an empty `<div id="root">` and one script. The notes, the form and the buttons are all built by React in the browser, straight into the DOM. So view source shows the file, and only the Elements panel shows the app.',
    ),
    inTheNotesApp(
      'The Notes App\'s `index.html` body is a comment, `<div id="root"></div>` and `<script type="module" src="/src/main.jsx">`. Everything else you see lives only in the DOM.',
      { fileId: "frontend/index.html" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "A div inside a paragraph",
      language: "html",
      wrong: ['<p class="intro">Welcome <div class="box">…</div></p>'],
      problem:
        "The `<div>` closes the paragraph, and the stray `</p>` makes a new empty one. `.intro .box` matches nothing.",
      right: ['<div class="intro">Welcome <div class="box">…</div></div>'],
      why: "A `<p>` holds only text-level content. Use a `<div>` (or `<section>`) to hold boxes.",
    }),
    mistake({
      title: "A selector that skips tbody",
      language: "css",
      wrong: ["table > tr { background: #eee; }"],
      problem:
        "The parser puts every row in a `<tbody>`, so no `tr` is a direct child of the `table`.",
      right: ["tbody > tr { background: #eee; }"],
      why: "CSS matches the DOM, not the file. Write selectors for the tree the parser builds.",
    }),
    mistake({
      title: "The same id twice",
      language: "html",
      wrong: [
        '<input id="title" name="title">',
        '<textarea id="title" name="content"></textarea>',
      ],
      problem:
        'An id must be unique. `#title` and `<label for="title">` only find the first, so the second field has no label.',
      right: [
        '<input id="title" name="title">',
        '<textarea id="content" name="content"></textarea>',
      ],
      why: "Every id in the tree is used to find one element. Give each element its own.",
    }),
    mistake({
      title: "Expecting firstChild to be an element",
      language: "js",
      wrong: [
        'const list = document.querySelector("ul");',
        "list.firstChild.textContent; // just a line break",
      ],
      problem:
        "The line break and spaces before the first `<li>` are a text node, and that's the first child.",
      right: [
        'const list = document.querySelector("ul");',
        "list.firstElementChild.textContent; // the first item",
      ],
      why: "Whitespace between tags becomes text nodes. Ask for element children to skip them.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    pageYourTurn({
      title: "Keep the box in its parent",
      task: "The parser pulls the box out of the paragraph. Change the markup so the tree has the `.box` inside `.intro`, with no empty paragraph left over.",
      starter: [
        '<p class="intro">Notes you can trust <div class="box">Saved</div></p>',
      ],
      checks: [
        {
          kind: "exists",
          label: "The box is inside .intro",
          selector: ".intro .box",
        },
        {
          kind: "missing",
          label: "No empty paragraph",
          selector: "p:empty",
        },
      ],
      hint: "A `<p>` can't hold a `<div>`. Make `.intro` a `<div>` instead (both its start and end tag).",
      solution: [
        '<div class="intro">Notes you can trust <div class="box">Saved</div></div>',
      ],
    }),
    pageYourTurn({
      title: "One id each",
      task: 'Both fields share the id "title", so the Note label points at the wrong one. Give the textarea the id "content" and point its label at it.',
      starter: [
        "<form>",
        '  <label for="title">Title</label>',
        '  <input id="title" name="title">',
        '  <label for="title">Note</label>',
        '  <textarea id="title" name="content"></textarea>',
        "</form>",
      ],
      checks: [
        {
          kind: "count",
          label: 'Only one element has the id "title"',
          selector: "#title",
          count: 1,
        },
        {
          kind: "exists",
          label: 'The textarea has the id "content"',
          selector: "textarea#content",
        },
        {
          kind: "text",
          label: "The Note label points at it",
          selector: 'label[for="content"]',
          text: "Note",
        },
      ],
      hint: 'Change the textarea to `id="content"` and its label to `for="content"`.',
      solution: [
        "<form>",
        '  <label for="title">Title</label>',
        '  <input id="title" name="title">',
        '  <label for="content">Note</label>',
        '  <textarea id="content" name="content"></textarea>',
        "</form>",
      ],
    }),
    pageYourTurn({
      title: "Set the starting state",
      task: 'Use attributes to set how the form starts: the title field shows "Milk", the Done box is ticked, and Blue is the chosen colour.',
      starter: [
        "<form>",
        '  <label>Title <input id="title" name="title"></label>',
        '  <label><input id="done" type="checkbox" name="done"> Done</label>',
        '  <select name="colour">',
        '    <option value="yellow">Yellow</option>',
        '    <option value="blue">Blue</option>',
        "  </select>",
        "</form>",
      ],
      checks: [
        {
          kind: "attr",
          label: "The title starts as Milk",
          selector: "#title",
          name: "value",
          value: "Milk",
        },
        {
          kind: "attr",
          label: "Done starts ticked",
          selector: "#done",
          name: "checked",
        },
        {
          kind: "attr",
          label: "Blue starts chosen",
          selector: 'option[value="blue"]',
          name: "selected",
        },
      ],
      hint: 'Add `value="Milk"` to the input, `checked` to the checkbox and `selected` to the Blue option.',
      solution: [
        "<form>",
        '  <label>Title <input id="title" name="title" value="Milk"></label>',
        '  <label><input id="done" type="checkbox" name="done" checked> Done</label>',
        '  <select name="colour">',
        '    <option value="yellow">Yellow</option>',
        '    <option value="blue" selected>Blue</option>',
        "  </select>",
        "</form>",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("HTML to DOM cheat sheet", [
      ["DOM", "The live tree built from the HTML.", "document"],
      ["parser", "Reads the HTML once and builds the tree.", "top to bottom"],
      [
        "element node",
        "One tag pair; its contents are its children.",
        "<li>Milk</li>",
      ],
      ["text node", "Words, and whitespace between tags.", "#text"],
      [
        "repairs",
        "Closed paragraphs, an added tbody, added html/head/body.",
        "<p>One<div>",
      ],
      ["view source", "The file as it arrived; never changes.", "Ctrl+U"],
      [
        "Elements panel",
        "The live DOM, with repairs and script changes.",
        "Right-click › Inspect",
      ],
      ["attribute", "The starting value, from the HTML.", 'value="Milk"'],
      ["property", "The live value, right now.", "input.value"],
    ]),
    quickCheck(
      "You wrote `<table><tr><td>Milk</td></tr></table>`. What's in the DOM?",
      [
        "Exactly what you wrote",
        "The row inside a `<tbody>` the parser added",
        "Nothing: the table is invalid without a tbody",
      ],
      1,
      "The parser always puts rows in a `<tbody>`, which is why `table > tr` matches nothing.",
    ),
  ),
);
