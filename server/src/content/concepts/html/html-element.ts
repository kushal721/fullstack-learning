import type { Concept } from "@fsl/shared";

export const htmlElement: Concept = {
  id: "html-element",
  slug: "html-element",
  title: "HTML element",
  topicId: "html",
  summary:
    "One building block of a web page, such as a heading, a paragraph, an image or an input, written with tags and turned by the browser into a node of the DOM.",
  basics: [
    "A web page is described in HTML, a plain-text language. HTML does not say how things look; it says what each piece of content is: this is a heading, this is a paragraph, this is a link.",
    "Each of those pieces is an element. You mark where an element starts and ends with tags: words inside angle brackets, such as `<p>` to open a paragraph and `</p>` (with a slash) to close it.",
    "The browser reads the tags, builds the page from the elements and shows it. It also keeps every element in memory as an object, so JavaScript can find it and change it later.",
  ],
  what: [
    "An element is made of an opening tag, its content and a closing tag: `<p>Buy milk</p>`. The name in the tag (`p`, `h1`, `a`, `img`) says what kind of element it is, and the browser gives each kind its own meaning and default behaviour.",
    'Elements can have attributes, extra settings written inside the opening tag as `name="value"`. In `<a href="/notes">My notes</a>` the `href` attribute tells the link where to go; in `<img src="cat.jpg" alt="A sleeping cat">` the `src` says which picture to load and the `alt` describes it for people who cannot see it.',
  ],
  why: [
    "Choosing the element whose meaning matches the content gives you behaviour for free. A `<button>` can be pressed with the keyboard, an `<a>` can be opened in a new tab, an `<input>` lets people type, and screen readers announce each one correctly. A plain box styled to look the same gets none of this.",
    "Elements are also the hooks for everything else you will learn. CSS picks elements to style them, JavaScript finds elements to read or change them, and React components return elements in the end.",
  ],
  howItWorks: [
    "Elements nest: an element can contain other elements, and each one must be closed before its parent is. `<p>Read <strong>this</strong> now</p>` is correct; `<p><strong>Read</p></strong>` is not, because the tags cross over.",
    "Some elements can never have content, so they have no closing tag. These are called void elements. Examples are `<img>`, `<input>`, `<br>` (a line break) and `<meta>`. You may write them as `<input>` or `<input />`; both mean the same in HTML.",
    "By default, most elements are either block or inline. A block element, such as `<h1>`, `<p>`, `<div>` or `<form>`, starts on a new line and stretches across the full width available. An inline element, such as `<a>`, `<strong>`, `<span>` or `<button>`, sits inside a line of text and is only as wide as its content. CSS can change this later.",
  ],
  basicExample: {
    language: "html",
    code: `<article class="note">
  <h2>Shopping</h2>
  <p>Buy <strong>milk</strong> and bread.</p>
  <img src="milk.png" alt="A bottle of milk" />
  <a href="/notes/42">Open note</a>
</article>`,
    caption:
      "An article element containing a heading, a paragraph with bold text inside it, a void img element with attributes, and a link.",
    highlightLines: [3, 4],
  },
  internals: [
    "When the browser reads an element, it creates a matching object called a node in the DOM (Document Object Model), the tree of everything on the page. Elements inside another element become its child nodes, and the text inside an element becomes a text node.",
    'Each node remembers its tag name, its attributes and its children. JavaScript can reach it with `document.querySelector("p")`, then read `textContent`, change `className` or add new child nodes, and the browser redraws only that part of the page.',
    "The browser also gives each kind of element built-in rules: default styles (headings are big and bold, links are blue and underlined), keyboard behaviour (inputs and buttons can be focused with Tab) and a role that assistive technology uses to describe it.",
    "The browser is forgiving with mistakes. If you forget a closing tag or cross tags over, it quietly rebuilds the tree its own way, which may not be what you meant. That is why the DOM in the developer tools can look different from your file.",
  ],
  howToCreate: [
    {
      text: "Create a file named `elements.html` and add a few elements of different kinds: block, inline and void.",
      code: {
        language: "html",
        fileName: "elements.html",
        code: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Elements</title>
  </head>
  <body>
    <h1>My notes</h1>
    <p>Buy <strong>milk</strong> and <a href="https://example.com">read this</a>.</p>
    <p>A second paragraph starts on a new line.</p>
    <input placeholder="Type here" />
  </body>
</html>`,
      },
    },
    {
      text: "Open `elements.html` in your browser. Notice that the heading and each paragraph start on a new line (block elements), while the bold word and the link stay inside the sentence (inline elements). Click in the input and type: you got a working text box from one void element.",
    },
    {
      text: "Open the developer tools (F12, or Cmd+Option+I on a Mac) and go to the Elements tab. Expand `<body>` and click the first `<p>`. The page highlights it across the whole width, and you can see `<strong>` and `<a>` nested inside it as child nodes.",
    },
    {
      text: "In the Console tab, create a new element with JavaScript and add it to the page, just like the browser does when it reads HTML.",
      code: {
        language: "js",
        code: `const note = document.createElement("p");
note.textContent = "Added from JavaScript";
note.setAttribute("title", "I am a new node");
document.body.append(note);`,
        caption:
          "It worked if a new paragraph appears at the bottom of the page and shows its title as a tooltip when you hover over it.",
      },
    },
  ],
  whereUsed: [
    "Everywhere on every web page: text, images, links, lists, forms and buttons are all elements.",
    "In React, the JSX a component returns, such as `<h2>{note.title}</h2>`, describes elements. React creates the matching DOM nodes for you.",
    "In CSS selectors and JavaScript queries, which find elements by tag name, class or other attributes.",
  ],
  connectsTo: [
    "The HTML document, which is the tree that holds every element of a page.",
    "Attributes, which configure elements, such as `href`, `src`, `type` and `class`.",
    "CSS, which selects elements and changes how they look and how they are laid out.",
    "The DOM, the in-memory version of the elements that JavaScript and React work with.",
  ],
  projectUsage: [
    {
      explanation:
        "`NoteCard.jsx` builds each note from plain elements such as a heading for the title and a paragraph for the content. React turns that JSX into real DOM nodes on the Dashboard.",
      fileId: "frontend/src/components/NoteCard.jsx",
      match: "<h2>{note.title}</h2>",
    },
    {
      explanation:
        "The reusable `Input` component in `frontend/src/components/Input.jsx` wraps the void `<input>` element and passes attributes like `name`, `type` and `value` through to it, so Login, Register and NoteForm all get the same input.",
      fileId: "frontend/src/components/Input.jsx",
      match: "<Field id={id} {...props} />",
    },
    {
      explanation:
        "In JSX the `class` attribute is written `className`, because `class` is a reserved word in JavaScript. The Notes App uses `className` to connect elements to the styles in `src/index.css`.",
      fileId: "frontend/src/components/Button.jsx",
      match: "<button className={`button button-${variant}`} {...props}>",
    },
  ],
  commonMistakes: [
    "Forgetting a closing tag, such as an unclosed `<p>` or `<div>`. The browser guesses where the element ends and the layout breaks in confusing places. Close every non-void element, and let your editor auto-close tags for you.",
    "Crossing tags over, like `<strong><em>hi</strong></em>`. Close tags in the reverse order you opened them: `<strong><em>hi</em></strong>`.",
    "Writing a closing tag for a void element, like `<input></input>` or `<img></img>`. Void elements have no content and no closing tag; write `<input />` or `<img />`. In JSX the self-closing slash is required.",
    'Leaving out the `alt` attribute on images. Screen readers then read the file name instead. Describe the picture with `alt`, or use `alt=""` if it is only decoration.',
  ],
  relatedConcepts: [
    "html-document",
    "html-input",
    "html-button",
    "css-selector",
    "css-box-model",
  ],
  relatedFiles: [],
  relatedBuildSteps: [],
};
