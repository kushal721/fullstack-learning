import {
  anatomy,
  code,
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

// Your own elements (web components) in depth: why, the anatomy of a custom
// element, naming rules, lifecycle callbacks, a step-through of an element
// being upgraded and reacting to an attribute, attributes live, shadow DOM
// and its private styles, templates and slots, accessibility, web
// components versus React components, mistakes, practice and a recap.
export const componentsModule = moduleLesson(
  "web-components",
  "Your own elements",
  40,
  [
    "Define a custom element with a class and `customElements.define`, and name it correctly.",
    "Use the lifecycle callbacks: `connectedCallback`, `disconnectedCallback` and `attributeChangedCallback`.",
    "Explain upgrading: what an element is before and after its definition arrives.",
    "Keep an element's markup and styles private with shadow DOM, and let content in with `<slot>`.",
    "Make a custom element accessible, and tell web components from React components.",
  ],

  part(
    "why",
    "Elements of your own",
    explain(
      "HTML has a fixed set of elements, but you can add your own. A [[web-component]] is an element like `<note-card>` that you define once in JavaScript and then use in any page, like a built-in one, with or without a framework. Three browser features make it work: **custom elements**, **shadow DOM** and **templates**.",
    ),
    diagram([
      ["custom elements", "a class becomes a tag"],
      ["shadow DOM", "private markup and styles"],
      ["<template> and <slot>", "markup to copy, holes to fill"],
      ["a web component", "used like any element"],
    ]),
    keyPoints(
      "A custom element is a class the browser calls when your tag appears.",
      "It works in any page: plain HTML, React or anything else.",
      "It's still HTML: attributes in, a DOM element out.",
    ),
  ),

  part(
    "anatomy",
    "Anatomy of a custom element",
    explain(
      "A custom element is a class that **extends `HTMLElement`**, so it gets everything an element has. The browser calls its methods at set moments. `customElements.define` ties the class to a tag name; from then on, every `<note-card>` on the page is one of these.",
    ),
    anatomy(
      "A note card element",
      [
        "class NoteCard extends HTMLElement {",
        '  connectedCallback() { this.textContent = "📝 " + this.getAttribute("title"); }',
        "}",
        'customElements.define("note-card", NoteCard);',
      ],
      [
        [
          "extends HTMLElement",
          "an element",
          "The class is a real element, with attributes, children and events.",
        ],
        [
          "connectedCallback()",
          "added to the page",
          "Runs when the element is put into the document.",
        ],
        [
          'this.getAttribute("title")',
          "its input",
          "Attributes are how a page passes it data.",
        ],
        [
          "customElements.define",
          "the registry",
          "Ties a tag name to a class, once per page.",
        ],
        [
          '"note-card"',
          "the tag name",
          "Must contain a hyphen and be lower case.",
        ],
      ],
    ),
    pagePlayground("Use the element: add another card", [
      '<note-card title="Milk"></note-card>',
      '<note-card title="Bread"></note-card>',
      "<script>",
      "  class NoteCard extends HTMLElement {",
      "    connectedCallback() {",
      '      this.textContent = "📝 " + this.getAttribute("title");',
      "    }",
      "  }",
      '  customElements.define("note-card", NoteCard);',
      "</script>",
      "<style>",
      "  note-card { display: block; padding: 8px; margin: 4px 0; border: 1px solid #999; }",
      "</style>",
    ]),
  ),

  part(
    "naming",
    "Naming and using your element",
    explain(
      "A custom element's name must contain a **hyphen** and be **lower case**, so it can never clash with a built-in element, past or future. Custom elements always need an end tag: `<note-card />` doesn't close. And they're **inline** until CSS says otherwise, like a `<span>`.",
    ),
    reference("Rules for custom elements", [
      ["a hyphen", "Required in the name.", "note-card, app-header, x-icon"],
      ["lower case", "No capitals in the name.", "note-card, not Note-Card"],
      [
        "an end tag",
        "Always; `/>` doesn't close it.",
        "<note-card></note-card>",
      ],
      [
        "define once",
        "A second define for the same name throws an error.",
        'customElements.get("note-card")',
      ],
      [
        "inline by default",
        "Give it display: block to make it a box.",
        "note-card { display: block; }",
      ],
      [
        ":defined",
        "Matches elements whose class has arrived.",
        "note-card:not(:defined) { opacity: 0; }",
      ],
    ]),
    quickCheck(
      "Which of these can be a custom element's name?",
      ["`notecard`", "`note-card`", "`NoteCard`"],
      1,
      "Only `note-card` has a hyphen and is all lower case. Built-in elements never have a hyphen, so the two can never clash.",
    ),
  ),

  part(
    "lifecycle",
    "Lifecycle callbacks",
    explain(
      "The browser calls special methods on your class as the element lives on the page. Set things up when it's **connected**, tidy up (timers, listeners on `window`) when it's **disconnected**, and re-render when a watched **attribute changes**. Only attributes listed in `observedAttributes` are watched.",
    ),
    reference("The callbacks", [
      [
        "constructor()",
        "The element is created. Call super(); don't read attributes or children yet.",
        "constructor() { super(); }",
      ],
      [
        "connectedCallback()",
        "Put into the document: render, add listeners.",
        "connectedCallback() { this.render(); }",
      ],
      [
        "disconnectedCallback()",
        "Removed from the document: clean up.",
        "disconnectedCallback() { clearInterval(this.timer); }",
      ],
      [
        "observedAttributes",
        "The attributes to watch, as a static list.",
        'static observedAttributes = ["title"];',
      ],
      [
        "attributeChangedCallback()",
        "A watched attribute changed: gets its name, old and new value.",
        "attributeChangedCallback(name, old, now) { … }",
      ],
    ]),
  ),

  part(
    "upgrade",
    "From unknown tag to working element",
    explain(
      "The parser can meet `<note-card>` before its class exists. It builds a plain, unknown element and moves on. When `define` runs, the browser **upgrades** every matching element already on the page. Step through an upgrade, then an attribute change:",
    ),
    trace(
      "A card upgraded, then updated",
      [
        '<note-card title="Milk"></note-card>',
        "<script>",
        "  class NoteCard extends HTMLElement {",
        '    static observedAttributes = ["title"];',
        "    attributeChangedCallback() { this.render(); }",
        "    connectedCallback() { this.render(); }",
        '    render() { this.textContent = "📝 " + this.getAttribute("title"); }',
        "  }",
        '  customElements.define("note-card", NoteCard);',
        '  document.querySelector("note-card").setAttribute("title", "Bread");',
        "</script>",
      ],
      [
        {
          line: 1,
          note: "The parser builds a `note-card` element. No class is defined for it yet, so it's an empty, unknown element: it doesn't match `:defined`.",
          vars: [
            ["note-card", "unknown, empty"],
            ["title", '"Milk"'],
          ],
        },
        {
          line: 3,
          note: "The script defines the class. Nothing happens to the page yet: the class isn't tied to a name.",
          vars: [
            ["note-card", "unknown, empty"],
            ["title", '"Milk"'],
          ],
        },
        {
          line: 9,
          note: "`define` ties `note-card` to the class, and the browser upgrades the card already on the page: it runs the constructor on it.",
          vars: [
            ["note-card", "upgrading"],
            ["title", '"Milk"'],
          ],
        },
        {
          line: 5,
          note: "`title` is watched and already set, so `attributeChangedCallback` runs once for it. It renders.",
          vars: [
            ["note-card", '"📝 Milk"'],
            ["title", '"Milk"'],
          ],
        },
        {
          line: 6,
          note: "The card is already in the document, so `connectedCallback` runs too. It renders again, with the same result.",
          vars: [
            ["note-card", '"📝 Milk", :defined'],
            ["title", '"Milk"'],
          ],
        },
        {
          line: 10,
          note: "The page changes the attribute. `title` is in `observedAttributes`, so `attributeChangedCallback` runs and the card re-renders.",
          vars: [
            ["note-card", '"📝 Bread"'],
            ["title", '"Bread"'],
          ],
          output: "📝 Bread",
        },
      ],
      { language: "html" },
    ),
  ),

  part(
    "attributes",
    "Attributes as inputs",
    explain(
      "Attributes are a custom element's inputs, just like `src` on an `<img>`. Watch them and the element stays in step with the page. Click the buttons: they only change the `count` attribute, and the element redraws itself.",
    ),
    pagePlayground("An element that follows its attribute", [
      '<note-count count="2"></note-count>',
      '<button type="button" id="add">Add a note</button>',
      "<script>",
      "  class NoteCount extends HTMLElement {",
      '    static observedAttributes = ["count"];',
      "    connectedCallback() { this.render(); }",
      "    attributeChangedCallback() { this.render(); }",
      "    render() {",
      '      const n = Number(this.getAttribute("count"));',
      '      this.textContent = n === 1 ? "1 note" : n + " notes";',
      "    }",
      "  }",
      '  customElements.define("note-count", NoteCount);',
      '  const counter = document.querySelector("note-count");',
      '  document.querySelector("#add").addEventListener("click", () => {',
      '    counter.setAttribute("count", Number(counter.getAttribute("count")) + 1);',
      "  });",
      "</script>",
    ]),
    keyPoints(
      "Attributes are text in; the element decides what to show.",
      "List an attribute in observedAttributes to hear when it changes.",
      "Render from one method, called from both callbacks.",
    ),
  ),

  part(
    "shadow-dom",
    "Shadow DOM: private markup and styles",
    explain(
      "`this.attachShadow({ mode: \"open\" })` gives the element a **shadow root**: a little DOM of its own, hidden from the page. Page CSS doesn't get in, and the element's CSS doesn't leak out, so a `p { color: crimson }` on the page leaves its paragraph alone. `document.querySelector` can't see inside it either.",
    ),
    pagePlayground("Page styles stop at the shadow root", [
      "<style>",
      "  p { color: crimson; font-weight: bold; }",
      "</style>",
      "<p>A paragraph on the page: styled by the page.</p>",
      "<note-card></note-card>",
      "<script>",
      "  class NoteCard extends HTMLElement {",
      "    connectedCallback() {",
      '      const root = this.attachShadow({ mode: "open" });',
      "      root.innerHTML = `",
      "        <style>p { color: seagreen; }</style>",
      "        <p>A paragraph in the shadow root: only its own styles.</p>`;",
      "    }",
      "  }",
      '  customElements.define("note-card", NoteCard);',
      "</script>",
    ]),
    quickCheck(
      "The page has `p { color: crimson }`. A custom element puts a `<p>` in its shadow root with no styles of its own. What colour is it?",
      [
        "Crimson: page styles apply everywhere",
        "Not crimson: page selectors don't reach into a shadow root",
        "It's invisible",
      ],
      1,
      "Selectors stop at the shadow root. Inherited properties like `color` set on the element itself still pass in, but a `p` rule doesn't.",
    ),
  ),

  part(
    "templates-slots",
    "Templates and slots",
    explain(
      'A `<template>` holds markup the browser parses but never shows or runs: a stamp to copy from. Inside a shadow root, a `<slot>` is a hole the page fills: the element\'s own children appear there. A named slot (`<slot name="title">`) takes the child with a matching `slot` attribute.',
    ),
    code(
      "html",
      "a card whose content comes from the page",
      [
        '<template id="card">',
        "  <style>article { border: 1px solid; padding: 8px; }</style>",
        '  <article><h3><slot name="title"></slot></h3><slot></slot></article>',
        "</template>",
        "",
        "<note-card>",
        '  <span slot="title">Milk</span>',
        "  Two litres, semi-skimmed.",
        "</note-card>",
      ],
      {
        1: "parsed, but never drawn and its scripts never run",
        3: "a named slot, then the default slot for everything else",
        7: "goes into the title slot",
        8: "goes into the default slot",
      },
    ),
  ),

  part(
    "accessibility",
    "Custom elements are still elements",
    explain(
      "A new tag has no meaning to the browser: no role, no focus, no keyboard. `<note-card>` is announced like a `<span>`. So build on the built-ins: put a real `<button>`, `<a>` or `<input>` inside, so their focus and roles come with them. Only reach for `role`, `tabindex` and key handling when there's no built-in to use.",
    ),
    keyPoints(
      "A custom tag has no role and can't be focused by itself.",
      "Put real buttons, links and inputs inside it.",
      "Use [[aria|ARIA]] only when no built-in element fits.",
      "Fields inside a shadow root aren't sent with the page's form.",
    ),
  ),

  part(
    "vs-react",
    "Web components and React components",
    explain(
      "Both let you build a page from your own pieces, but they work differently. A web component is part of the browser: its tag stays in the DOM and works in any page. A React component is a function that exists only while React runs, and it leaves only ordinary HTML in the DOM.",
    ),
    reference("Side by side", [
      [
        "lives in",
        "Web component: the browser. React: your JavaScript bundle.",
        "<note-card> vs <NoteCard />",
      ],
      [
        "in the DOM",
        "Web component: its own tag. React: only the HTML it returns.",
        "<note-card> vs <article>",
      ],
      [
        "inputs",
        "Web component: attributes (text). React: props (any value).",
        'title="Milk" vs note={note}',
      ],
      [
        "works in",
        "Web component: any page. React: React apps.",
        "plain HTML, Vue, React…",
      ],
    ]),
    inTheNotesApp(
      "The Notes App's `NoteCard` is a React component: a function returning an `<article>`. In the DOM you'll see the `<article>`, never a `<NoteCard>` tag.",
      { symbolId: "component:NoteCard" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "A name without a hyphen",
      language: "js",
      wrong: ['customElements.define("notecard", NoteCard);'],
      problem:
        "`define` throws an error, so the element is never defined and every `<notecard>` stays empty.",
      right: ['customElements.define("note-card", NoteCard);'],
      why: "Custom element names need a hyphen, so they never clash with built-in elements.",
    }),
    mistake({
      title: "A self-closing custom element",
      language: "html",
      wrong: ['<note-card title="Milk" />', '<note-card title="Bread" />'],
      problem:
        "`/>` doesn't close it, so the second card ends up inside the first.",
      right: [
        '<note-card title="Milk"></note-card>',
        '<note-card title="Bread"></note-card>',
      ],
      why: "Only a few built-in elements like `<img>` are void. Custom elements always need an end tag.",
    }),
    mistake({
      title: "Changing an attribute nobody watches",
      language: "js",
      wrong: [
        "class NoteCount extends HTMLElement {",
        "  attributeChangedCallback() { this.render(); }",
        "}",
      ],
      problem:
        "Without `observedAttributes`, the callback never runs, so the element never updates.",
      right: [
        "class NoteCount extends HTMLElement {",
        '  static observedAttributes = ["count"];',
        "  attributeChangedCallback() { this.render(); }",
        "}",
      ],
      why: "The browser only reports changes to the attributes you list.",
    }),
    mistake({
      title: "A clickable custom element",
      language: "html",
      wrong: ["<save-note>Save</save-note>"],
      problem:
        "It can't be reached with Tab, Enter does nothing and a screen reader doesn't call it a button.",
      right: ["<save-note><button>Save</button></save-note>"],
      why: "Put a real `<button>` inside, and its focus, keys and role come for free.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    pageYourTurn({
      title: "Define the element",
      task: 'The class is written, but `<hello-note>` stays empty. Register the class under the name `hello-note`, so it says "Hello, Sam".',
      starter: [
        '<hello-note name="Sam"></hello-note>',
        "<script>",
        "  class HelloNote extends HTMLElement {",
        "    connectedCallback() {",
        '      this.textContent = "Hello, " + this.getAttribute("name");',
        "    }",
        "  }",
        "</script>",
      ],
      checks: [
        {
          kind: "text",
          label: 'It says "Hello, Sam"',
          selector: "hello-note",
          text: "Hello, Sam",
        },
        {
          kind: "exists",
          label: "The element is defined",
          selector: "hello-note:defined",
        },
      ],
      hint: 'After the class, add `customElements.define("hello-note", HelloNote);`.',
      solution: [
        '<hello-note name="Sam"></hello-note>',
        "<script>",
        "  class HelloNote extends HTMLElement {",
        "    connectedCallback() {",
        '      this.textContent = "Hello, " + this.getAttribute("name");',
        "    }",
        "  }",
        '  customElements.define("hello-note", HelloNote);',
        "</script>",
      ],
    }),
    pageYourTurn({
      title: "Follow the attribute",
      task: 'Clicking the button sets `count` to 3, but the element still says "Notes: 1". Make it watch `count` and re-render when it changes.',
      starter: [
        '<note-count count="1"></note-count>',
        '<button type="button">Set to 3</button>',
        "<script>",
        "  class NoteCount extends HTMLElement {",
        "    connectedCallback() { this.render(); }",
        "    render() {",
        '      this.textContent = "Notes: " + this.getAttribute("count");',
        "    }",
        "  }",
        '  customElements.define("note-count", NoteCount);',
        '  document.querySelector("button").addEventListener("click", () => {',
        '    document.querySelector("note-count").setAttribute("count", "3");',
        "  });",
        "</script>",
      ],
      checks: [
        {
          kind: "text",
          label: 'It starts at "Notes: 1"',
          selector: "note-count",
          text: "Notes: 1",
        },
        { kind: "click", label: "Click the button", selector: "button" },
        {
          kind: "text",
          label: 'It says "Notes: 3"',
          selector: "note-count",
          text: "Notes: 3",
        },
      ],
      hint: 'Add `static observedAttributes = ["count"];` and `attributeChangedCallback() { this.render(); }` to the class.',
      solution: [
        '<note-count count="1"></note-count>',
        '<button type="button">Set to 3</button>',
        "<script>",
        "  class NoteCount extends HTMLElement {",
        '    static observedAttributes = ["count"];',
        "    connectedCallback() { this.render(); }",
        "    attributeChangedCallback() { this.render(); }",
        "    render() {",
        '      this.textContent = "Notes: " + this.getAttribute("count");',
        "    }",
        "  }",
        '  customElements.define("note-count", NoteCount);',
        '  document.querySelector("button").addEventListener("click", () => {',
        '    document.querySelector("note-count").setAttribute("count", "3");',
        "  });",
        "</script>",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Web components cheat sheet", [
      [
        "a class",
        "Extends HTMLElement.",
        "class NoteCard extends HTMLElement {}",
      ],
      [
        "define",
        "Ties a tag name to the class.",
        'customElements.define("note-card", NoteCard)',
      ],
      ["the name", "Lower case, with a hyphen.", "note-card"],
      [
        "connectedCallback",
        "Added to the page: render.",
        "connectedCallback() { … }",
      ],
      [
        "observedAttributes",
        "Attributes to watch.",
        'static observedAttributes = ["title"]',
      ],
      [
        "attributeChangedCallback",
        "A watched attribute changed.",
        "attributeChangedCallback(name, old, now)",
      ],
      [
        "attachShadow",
        "Private markup and styles.",
        'this.attachShadow({ mode: "open" })',
      ],
      ["<slot>", "Where the element's children appear.", '<slot name="title">'],
      [
        "<template>",
        "Markup that's parsed but not shown.",
        '<template id="card">…</template>',
      ],
    ]),
    quickCheck(
      "A page uses `<note-card>` before the script that defines it has loaded. What happens?",
      [
        "The browser throws an error",
        "It's an unknown, empty element until `define` runs, then it's upgraded",
        "The element is removed from the page",
      ],
      1,
      "Unknown tags are kept as plain elements. When the class is defined, every matching element already on the page is upgraded.",
    ),
  ),
);
