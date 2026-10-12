import type { Concept } from "@fsl/shared";

export const htmlSemanticStructure: Concept = {
  id: "html-semantic-structure",
  slug: "html-semantic-structure",
  title: "Semantic HTML",
  topicId: "html",
  summary:
    "Using HTML elements that describe what each part of a page is, such as its header, navigation and main content, instead of generic boxes.",
  basics: [
    "A web page is built from HTML elements nested inside each other, like boxes inside boxes. Each element is written with an opening and a closing tag, for example `<p>Hello</p>`.",
    "Semantic means having to do with meaning. A semantic element tells the browser what its content is, not just how it should look. `<nav>` says this is navigation; `<div>` says nothing at all, it is just a box.",
    "Not everyone reads a page with their eyes. A screen reader is a program that reads the page aloud for people who cannot see it, and many people move around a page with only the keyboard. Both rely on the meaning written into the HTML.",
  ],
  what: [
    "Semantic HTML is the habit of picking the element whose meaning matches the content: `<header>` for the top of a page, `<nav>` for a group of main links, `<main>` for the page's main content, `<section>` for a themed part with its own heading, `<article>` for a self-contained item such as one note or blog post, and `<footer>` for closing information.",
    "It also covers headings. `<h1>` to `<h6>` are six levels of heading, from most to least important. A page usually has one `<h1>` for its main title, then `<h2>` for its sections, `<h3>` for parts inside those, and so on, like the chapters of a book.",
  ],
  why: [
    "Screen readers list a page's headings and its landmarks (the main regions like navigation and main content), so users can jump straight to what they want. If everything is a `<div>`, that list is empty and they must listen to the whole page from the top.",
    "Search engines and browser features such as reader mode also read the structure to work out what the page is about. And for you, code full of `<header>`, `<main>` and `<article>` is far easier to read than a pile of nested `<div>` elements, often called div soup.",
  ],
  howItWorks: [
    "As the browser reads your HTML it builds the accessibility tree: a simplified copy of the page that lists each element's role (what kind of thing it is) and name. Screen readers read this tree, not your CSS.",
    "Some elements create landmarks in that tree. `<nav>` becomes a navigation landmark, `<main>` becomes the main landmark, and a `<header>` or `<footer>` that is not inside an `<article>` or `<section>` becomes the page's banner or content info landmark.",
    "Headings build an outline. A screen reader user can press a single key to jump from heading to heading, so the heading levels must form a sensible order without gaps, such as `<h1>` then `<h2>` then `<h3>`.",
    "Semantic elements look almost like a plain `<div>`: they are block boxes with no special styling. You still style them with CSS however you like; the meaning and the looks are separate.",
  ],
  basicExample: {
    language: "html",
    code: `<body>
  <header>
    <nav>
      <a href="/">Notes</a>
      <a href="/login">Log in</a>
    </nav>
  </header>

  <main>
    <h1>My notes</h1>

    <section>
      <h2>Recent</h2>
      <article>
        <h3>Shopping list</h3>
        <p>Milk, eggs, bread</p>
      </article>
    </section>
  </main>

  <footer>Made while learning HTML</footer>
</body>`,
    caption:
      "Each region says what it is, and the headings go from `h1` to `h2` to `h3` in order, like an outline.",
  },
  internals: [
    "Every element has an implicit role in the accessibility tree: `<nav>` has the role navigation, `<main>` has main, `<article>` has article, and `<div>` has generic, which means no meaning at all.",
    "You can give a `<div>` a role by hand with the `role` attribute, but the browser adds no behaviour to it, and it is easy to get wrong. The first rule of accessible HTML is to use the native element when one exists.",
    "A page should have exactly one visible `<main>`. Screen readers and the common skip to content link use it to jump straight past the header and navigation.",
    "The browser does not check your structure. A page full of `<div>` elements or with headings in the wrong order still displays fine, which is why the problems go unnoticed unless you test with the keyboard or a screen reader.",
  ],
  howToCreate: [
    {
      text: "Create a file called `index.html` in an empty folder and write the skeleton of a page with a header, navigation, main content and a footer.",
      code: {
        language: "html",
        fileName: "index.html",
        code: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>My notes</title>
  </head>
  <body>
    <header>
      <nav>
        <a href="#">Home</a>
        <a href="#">About</a>
      </nav>
    </header>
    <main>
      <h1>My notes</h1>
    </main>
    <footer>Made by me</footer>
  </body>
</html>`,
      },
    },
    {
      text: "Inside `<main>`, below the `<h1>`, add a section with a heading and two articles, one for each note. Each article gets its own `<h3>` because it sits under the `<h2>`.",
      code: {
        language: "html",
        fileName: "index.html",
        code: `<section>
  <h2>Recent notes</h2>
  <article>
    <h3>Shopping list</h3>
    <p>Milk, eggs, bread</p>
  </article>
  <article>
    <h3>Ideas</h3>
    <p>Learn semantic HTML</p>
  </article>
</section>`,
      },
    },
    {
      text: "Open `index.html` in Chrome or Edge, right-click a note title and choose Inspect. In the developer tools, open the Accessibility tab: it shows the element's role (heading, level 3) and the landmarks it sits inside, such as main.",
    },
    {
      text: "To compare, change `<main>` to `<div>` (and `</main>` to `</div>`), reload and inspect again. The main landmark is gone even though the page looks exactly the same. Change it back.",
    },
  ],
  whereUsed: [
    "The outer layout of almost every site: a header with the logo and navigation, the main content, and a footer.",
    "Lists of repeated items that stand on their own, such as notes, blog posts, products or comments, each in an `<article>`.",
    "Any page that should work well with screen readers and keyboards and be understood by search engines, which should be every page.",
  ],
  connectsTo: [
    "Every other HTML element: semantic structure is about choosing the right one for each job.",
    "CSS, which styles these elements and lays them out, for example with Flexbox, without changing their meaning.",
    "React components, which return these elements. A component called `Navbar` should still render a `<nav>`.",
  ],
  projectUsage: [
    {
      explanation:
        "The Notes App's `Navbar` component (`frontend/src/components/Navbar.jsx`) is a `<header>`, and the logged-in user's email and Log out button sit inside a `<nav>`, so screen readers announce them as navigation.",
      fileId: "frontend/src/components/Navbar.jsx",
      match: '<nav className="navbar-user">',
    },
    {
      explanation:
        "`App.jsx` switches between the pages (Login, Register or Dashboard), and each page renders its own single `<main>` element, so users can jump straight past the navigation to the content.",
      fileId: "frontend/src/App.jsx",
      match: '{page === "dashboard" && <Dashboard />}',
    },
    {
      explanation:
        "`NoteCard.jsx` shows each note as an `<article>` with the note title as its heading, because every note is a self-contained piece of content.",
      fileId: "frontend/src/components/NoteCard.jsx",
      match: '<article className="note-card">',
    },
  ],
  commonMistakes: [
    "Building the whole layout from `<div>` elements. The page looks fine but has no landmarks for screen readers. Use `<header>`, `<nav>`, `<main>` and `<footer>` for the main regions.",
    "Choosing a heading level for its size, such as an `<h4>` because it looks small, or skipping from `<h1>` to `<h4>`. Pick the level that matches the outline and change the size with CSS.",
    "Using `<section>` as a styling wrapper with no heading. A section should be a themed group with its own heading; if you only need a box for CSS, a `<div>` is the right choice.",
    "Putting more than one `<main>` on a page, or wrapping the navigation inside it. Keep one `<main>` for the page's own content and keep the `<nav>` outside it.",
  ],
  relatedConcepts: ["html-element", "html-document", "css-flexbox"],
  relatedFiles: [],
  relatedBuildSteps: [],
};
