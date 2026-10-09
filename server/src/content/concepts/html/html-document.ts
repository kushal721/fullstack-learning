import type { Concept } from "@fsl/shared";

export const htmlDocument: Concept = {
  id: "html-document",
  slug: "html-document",
  title: "HTML document",
  topicId: "html",
  summary:
    "The complete HTML file a browser loads for a page, with a fixed outer structure that tells the browser how to read it and what to show.",
  basics: [
    "HTML (HyperText Markup Language) is the language web pages are written in. It is plain text, so you can write it in any text editor and save it in a file ending in `.html`.",
    "HTML describes content with elements. An element is usually written as an opening tag, some content and a closing tag, like `<h1>My notes</h1>` for a main heading. Elements can sit inside other elements, the way folders sit inside folders.",
    "A document is the whole file: every element of one page, from the first line to the last. The browser receives it from a server (or opens it from your disk), reads it and turns it into the page you see.",
  ],
  what: [
    "Every HTML document follows the same skeleton. It starts with `<!doctype html>`, then one `<html>` element that wraps everything else. Inside `<html>` there are exactly two parts: `<head>` and `<body>`.",
    'The `<head>` holds information about the page that is not shown in the page itself: the character encoding (`<meta charset="utf-8">`), how to size the page on phones (`<meta name="viewport">`), the title shown in the browser tab (`<title>`) and links to CSS files. The `<body>` holds everything the user actually sees: headings, text, images, forms and buttons.',
  ],
  why: [
    'Browsers are very forgiving and will show something even from a broken file, but they have to guess. The standard skeleton removes the guessing: the doctype switches on modern "standards mode", the charset makes accented letters and emoji appear correctly, and the viewport stops phones from shrinking the page to an unreadable size.',
    "The `<head>` also matters to other programs. Search engines and link previews read the `<title>`, screen readers use the `lang` attribute to pick the right pronunciation, and React apps like the Notes App need a known element in the `<body>` to draw themselves into.",
  ],
  howItWorks: [
    'The browser reads the document from top to bottom. The first line, `<!doctype html>`, is not an element; it is a short signal that says "this is modern HTML, follow the current rules".',
    "While reading the `<head>`, the browser sets up the page: it learns the encoding, sets the tab title and starts downloading any linked stylesheets or scripts.",
    "While reading the `<body>`, it creates an object for each element it meets and keeps track of which element is inside which. When it has enough information, it draws the content on the screen.",
  ],
  basicExample: {
    language: "html",
    code: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>My notes</title>
  </head>
  <body>
    <h1>My notes</h1>
    <p>Nothing saved yet.</p>
  </body>
</html>`,
    caption:
      "The smallest complete document: the head describes the page, the body holds what the user sees.",
    highlightLines: [1, 2, 3, 8],
  },
  internals: [
    "As it reads the HTML, the browser builds the DOM (Document Object Model): a tree of objects in memory, one object (called a node) per element and per piece of text. `<html>` is the root of the tree, `<head>` and `<body>` are its two children, and every element inside them becomes a child of its parent.",
    'JavaScript never works on the HTML text itself; it works on the DOM. `document.body` is the body node, `document.title` is the text of the `<title>`, and `document.querySelector("h1")` finds the first heading node. Changing a node makes the browser redraw that part of the page.',
    "If you leave something out, the browser repairs the tree for you. A file containing only `<p>Hi</p>` still gets `<html>`, `<head>` and `<body>` nodes in the DOM, which is why mistakes in HTML often go unnoticed until something behaves strangely.",
    'Without `<!doctype html>` the browser falls back to "quirks mode", which copies old browser bugs from the 1990s so that very old pages still look the same. Modern CSS can then behave unexpectedly, especially sizes and spacing.',
  ],
  howToCreate: [
    {
      text: "Create a new folder, open it in a code editor such as VS Code, and create a file named `index.html` with the full skeleton.",
      code: {
        language: "html",
        fileName: "index.html",
        code: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>My notes</title>
  </head>
  <body>
    <h1>My notes</h1>
    <p>Café, naïve and 🎉 all show correctly.</p>
  </body>
</html>`,
      },
    },
    {
      text: "Open `index.html` in your browser (drag it into a browser window or double-click it). Check that the tab says `My notes` and that the accented letters and the emoji appear correctly, thanks to the charset.",
    },
    {
      text: "Open the developer tools (F12, or Cmd+Option+I on a Mac) and click the Elements tab (Inspector in Firefox). You are looking at the DOM tree, not your file: click the small arrows to open `<html>`, `<head>` and `<body>` and see how each element sits inside its parent.",
    },
    {
      text: "Click the Console tab and type these lines one at a time, pressing Enter after each. Each one reads or changes a node of the DOM.",
      code: {
        language: "js",
        code: `document.title
document.body.children.length
document.querySelector("h1").textContent = "Changed by JavaScript";`,
        caption:
          'It worked if the first line prints "My notes", the second prints 2, and the heading on the page changes. Reload the page and it comes back, because you changed the DOM, not the file.',
      },
    },
  ],
  whereUsed: [
    "Every web page starts as an HTML document, including pages built with React, which start from one small document and then add the rest with JavaScript.",
    "Single-page apps such as the Notes App use one document for the whole app. Moving between Login, Register and Dashboard changes the DOM inside that document instead of loading a new one.",
    "Email templates, documentation sites and app help pages are HTML documents too.",
  ],
  connectsTo: [
    "HTML elements, which are the building blocks inside the `<body>` and the `<head>`.",
    "CSS, which is linked from the `<head>` and styles the elements in the DOM.",
    "JavaScript, which is loaded with a `<script>` element and reads or changes the DOM.",
    "The server, which sends the document as the body of an HTTP response.",
  ],
  projectUsage: [
    {
      explanation:
        'The Notes App has exactly one HTML document, `frontend/index.html`. Its `<body>` contains an empty `<div id="root">` and a `<script type="module" src="/src/main.jsx">` that loads the React app.',
    },
    {
      explanation:
        '`frontend/src/main.jsx` finds that `root` element in the DOM with `document.getElementById("root")` and tells React to draw the `App` component inside it. Everything else you see, from the Navbar to the notes, is added to the DOM by React.',
    },
    {
      explanation:
        "The `<title>` and the viewport `<meta>` in `frontend/index.html` set the browser tab text and make the Notes App readable on phones, where the styles in `src/index.css` can then adapt the layout.",
    },
  ],
  commonMistakes: [
    "Forgetting `<!doctype html>`, which puts the browser in quirks mode, so CSS sizes and spacing behave strangely. Always make it the very first line.",
    "Putting visible content such as headings or paragraphs inside the `<head>`. The browser moves them into the body or ignores them. The head is for information about the page; the body is for the page itself.",
    'Leaving out the viewport `<meta>` tag, so on a phone the page looks like a tiny zoomed-out desktop page. Add `<meta name="viewport" content="width=device-width, initial-scale=1" />` to every document.',
    "Thinking that changes made in the Elements tab or with JavaScript are saved to the file. They only change the DOM in memory; reload the page and they are gone. Edit the `.html` file to make a lasting change.",
  ],
  relatedConcepts: [
    "how-the-web-works",
    "html-element",
    "html-semantic-structure",
  ],
  relatedFiles: [],
  relatedBuildSteps: [],
};
