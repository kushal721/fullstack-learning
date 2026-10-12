import type { Concept } from "@fsl/shared";

export const cssResponsive: Concept = {
  id: "css-responsive",
  slug: "css-responsive",
  title: "Responsive design",
  topicId: "css",
  summary:
    "Building one page whose layout adapts to any screen size, from a small phone to a wide desktop monitor.",
  basics: [
    "The same web page is opened on phones, tablets, laptops and large monitors. The visible area of the browser window, where the page is drawn, is called the viewport, and its width can be anything from about 320 pixels to well over 2000.",
    "A layout that looks good at one width can break at another: on a phone, three cards side by side become too narrow to read, and on a large monitor a single line of text can become uncomfortably long.",
    "CSS sizes can be fixed (`300px` is always 300 pixels) or relative (`50%` is half of the parent's width). Relative sizes change automatically when the space around them changes.",
  ],
  what: [
    "Responsive design is the practice of writing HTML and CSS so that one page works well at every width, instead of building separate sites for phones and computers.",
    "It rests on four tools: the viewport meta tag, relative units such as `rem` and `%`, limits like `max-width`, and media queries, which are CSS blocks that only apply when the screen meets a condition, such as being at least 768 pixels wide.",
  ],
  why: [
    "More than half of web traffic comes from phones. A page that only works on a desktop forces phone users to pinch, zoom and scroll sideways, and many will simply leave.",
    "Maintaining one responsive page is far less work than maintaining a separate mobile site. Every fix and every new feature only has to be written once.",
  ],
  howItWorks: [
    'Phones were built when most sites were designed for desktops, so by default a phone browser pretends to be about 980 pixels wide and shrinks the page to fit. The viewport meta tag, `<meta name="viewport" content="width=device-width, initial-scale=1" />` in the page\'s `<head>`, tells the browser to use the phone\'s real width instead, so your CSS sees the true screen size.',
    "Relative units let sizes follow their surroundings. `%` is a share of the parent element's size. `rem` is a multiple of the root font size, which is 16 pixels by default, so `1.5rem` is 24 pixels and grows if the user raises their browser's font size.",
    "`max-width` sets an upper limit without a lower one. `max-width: 960px` with `width: 100%` means the element fills small screens completely but stops growing at 960 pixels on large ones, which keeps text lines readable.",
    "A media query like `@media (min-width: 768px) { ... }` applies the rules inside it only when the viewport is at least 768 pixels wide. Writing the basic styles for phones first and adding `min-width` queries for bigger screens is called mobile-first.",
  ],
  basicExample: {
    language: "css",
    code: `.notes-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 768px) {
  .notes-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}`,
    caption:
      "One column of notes on phones; from 768px wide and up, three equal columns.",
    highlightLines: [7],
  },
  internals: [
    "Every time the browser draws the page, it checks each media query against the current viewport. When the window is resized or a phone is rotated, it checks again, applies or removes the matching rules and recalculates the layout straight away, without reloading the page.",
    "Rules inside a media query are ordinary CSS rules. If they match, they compete with the other rules in the usual way, so a later rule with the same selector wins. That is why media queries usually go after the basic styles they change.",
    "Mobile-first works well because phone layouts are usually the simplest: one column, full width. Each `min-width` query then only adds what bigger screens need, instead of undoing desktop styles for small screens.",
    "`rem` values are calculated from the font size of the `<html>` element. Because users can change that size in their browser settings, layouts built with `rem` scale with the user's choice, which helps people who need larger text.",
  ],
  howToCreate: [
    {
      text: "Create a file called `index.html` with the viewport meta tag and a few note cards inside a grid.",
      code: {
        language: "html",
        fileName: "index.html",
        code: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <main class="page">
      <div class="notes-grid">
        <div class="note-card">Buy milk</div>
        <div class="note-card">Call Sam</div>
        <div class="note-card">Read chapter 3</div>
      </div>
    </main>
  </body>
</html>`,
      },
    },
    {
      text: "Create `styles.css` next to it. Write the phone layout first, using `rem` for spacing and `max-width` to limit the page on big screens.",
      code: {
        language: "css",
        fileName: "styles.css",
        code: `.page {
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
  padding: 1rem;
}

.notes-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.note-card {
  padding: 1rem;
  border: 1px solid #ccc;
}`,
      },
    },
    {
      text: "At the end of `styles.css`, add a media query that switches to three columns on wider screens.",
      code: {
        language: "css",
        fileName: "styles.css",
        code: `@media (min-width: 768px) {
  .notes-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}`,
      },
    },
    {
      text: "Open `index.html` in your browser and open DevTools (F12 or Cmd+Opt+I). Click the device toolbar icon (or press Ctrl+Shift+M, Cmd+Shift+M on a Mac) and pick a phone such as iPhone SE: the notes are in one column. Drag the width past 768 pixels and they jump to three columns.",
    },
  ],
  whereUsed: [
    "Almost every modern website and web app, because visitors arrive on all kinds of devices.",
    "Card grids, navigation bars and forms, which are the parts most likely to change shape between phone and desktop.",
    "Text containers, where `max-width` keeps lines short enough to read comfortably on wide monitors.",
  ],
  connectsTo: [
    "The HTML document, whose `<head>` holds the viewport meta tag that makes responsive CSS work on phones.",
    "Flexbox and grid, the layout tools whose direction, columns and wrapping usually change inside media queries.",
    "The box model, since widths, padding and margins are what you adjust for each screen size.",
  ],
  projectUsage: [
    {
      explanation:
        "The Notes App's `frontend/index.html` includes the viewport meta tag, so phones show the app at their real width instead of a shrunken desktop view.",
      fileId: "frontend/index.html",
      match:
        '<meta name="viewport" content="width=device-width, initial-scale=1.0" />',
    },
    {
      explanation:
        "On the Dashboard, the `.notes-grid` rule in `frontend/src/index.css` shows `NoteCard` components in one column on phones, and a `min-width` media query adds more columns on wider screens.",
      fileId: "frontend/src/index.css",
      match: "grid-template-columns: 1fr;",
    },
    {
      explanation:
        "To check the Notes App layout, run the frontend, open http://localhost:5173 and turn on the DevTools device toolbar: the Dashboard should switch from one column of notes to several as you widen the screen.",
    },
  ],
  commonMistakes: [
    "Forgetting the viewport meta tag. Media queries then seem to do nothing on a real phone because the browser pretends to be 980 pixels wide. Add it to the `<head>` of `index.html`.",
    "Giving containers fixed widths like `width: 1000px`, which forces sideways scrolling on phones. Use `width: 100%` with `max-width: 1000px` instead.",
    "Writing desktop styles first and then many `max-width` media queries to undo them. Start with the phone layout and add `min-width` queries for larger screens.",
    "Only testing by resizing a desktop window. Use the DevTools device toolbar to try real phone sizes, and check on an actual phone when you can.",
  ],
  relatedConcepts: ["html-document", "css-box-model", "css-flexbox"],
  relatedFiles: [],
  relatedBuildSteps: [],
};
