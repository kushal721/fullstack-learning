import type { Concept } from "@fsl/shared";

export const cssSelector: Concept = {
  id: "css-selector",
  slug: "css-selector",
  title: "CSS selector",
  topicId: "css",
  summary:
    "The part of a CSS rule that picks which HTML elements the styles apply to, such as every button or every element with the class `note-card`.",
  basics: [
    "HTML describes what is on a page; CSS (Cascading Style Sheets) describes how it looks: colours, sizes, spacing and layout. CSS is written as a list of rules, usually in a separate file called a stylesheet.",
    "A rule has two parts. The selector says which elements to style, and the declarations inside the curly braces say how. Each declaration is a property and a value, like `color: red;`, which sets the text colour to red.",
    'Elements can carry attributes that CSS can target. The two most used for styling are `class`, a label you can give to many elements (`class="note-card"`), and `id`, a name that must be unique on the page (`id="title"`).',
  ],
  what: [
    'A selector is a pattern that matches elements. A type selector like `p` matches every paragraph, a class selector like `.button` matches every element with that class, an id selector like `#title` matches the one element with that id, and an attribute selector like `input[type="email"]` matches elements whose attribute has that value.',
    "Selectors can be combined. A descendant selector, written with a space as in `.note-card h3`, matches `h3` elements anywhere inside a `.note-card`. A pseudo-class, written with a colon, matches elements in a certain state: `:hover` while the mouse is over it, and `:focus-visible` while it has keyboard focus.",
  ],
  why: [
    "Without selectors you would have to put a `style` attribute on every single element, repeating the same colours and sizes hundreds of times. A selector lets you write a style once and apply it to every element that matches, so changing the design means changing one rule.",
    "Pseudo-classes let a page respond to the user without any JavaScript. A button can change colour on `:hover`, and `:focus-visible` can draw a clear outline so keyboard users can always see where they are.",
  ],
  howItWorks: [
    'The browser loads your HTML and builds a tree of elements. It then loads every stylesheet linked with `<link rel="stylesheet">` and checks each rule\'s selector against each element to see which rules match it.',
    "Often several rules match the same element and set the same property, for example two rules that both set `color`. The cascade is the set of steps the browser uses to choose one winner.",
    "At beginner level, the cascade compares specificity first: how precise the selector is. An id selector beats a class selector, and a class (or attribute or pseudo-class) selector beats a type selector. If two selectors are equally specific, the rule written later in the CSS wins.",
    "Pseudo-classes are checked again whenever the state changes. When the mouse moves onto a button, `:hover` starts matching and the browser redraws it with the extra styles; when the mouse leaves, they are removed.",
  ],
  basicExample: {
    language: "css",
    code: `/* type selector: every button */
button {
  padding: 8px 16px;
}

/* class selector: every element with class="button" */
.button {
  background: royalblue;
  color: white;
}

/* pseudo-classes: mouse over it, or focused with the keyboard */
.button:hover {
  background: navy;
}

.button:focus-visible {
  outline: 3px solid orange;
}`,
    caption:
      'Each rule is a selector followed by declarations in curly braces. A `button` with `class="button"` gets the styles from all four rules.',
  },
  internals: [
    "Specificity can be counted as three numbers: (ids, classes, types). `#title` is (1, 0, 0), `.note-card h3` is (0, 1, 1) and `h3` is (0, 0, 1). The browser compares them from left to right, so a single id beats any number of classes.",
    "Inline styles written in a `style` attribute beat every selector, and `!important` beats even those. Both make styles hard to override later, which is why it is better to rely on classes.",
    "Some properties, like `color` and `font-family`, are inherited: if no rule sets them on an element, it takes the value from its parent. Others, like `padding` and `border`, are not. That is why setting a font on `body` changes the text everywhere.",
    "Browsers match selectors from right to left. For `.note-card h3` they find each `h3` and then look up its ancestors for a `.note-card`. You do not need to optimise for this, but it explains why the last part of a selector is called the key selector.",
  ],
  howToCreate: [
    {
      text: "In an empty folder, create a file called `index.html` that links a stylesheet and contains two cards and a button.",
      code: {
        language: "html",
        fileName: "index.html",
        code: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Selectors</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <article class="note-card"><h3>First note</h3></article>
    <article class="note-card" id="pinned"><h3>Pinned note</h3></article>
    <button class="button">Save</button>
  </body>
</html>`,
      },
    },
    {
      text: "Next to it, create `styles.css` with rules that use a type, a class, an id, a descendant selector and two pseudo-classes.",
      code: {
        language: "css",
        fileName: "styles.css",
        code: `h3 {
  color: gray;
}

.note-card h3 {
  color: black;
}

#pinned h3 {
  color: crimson;
}

.button:hover {
  background: gold;
}

.button:focus-visible {
  outline: 3px solid royalblue;
}`,
      },
    },
    {
      text: "Open `index.html` in your browser. The first title is black (the class rule beats the plain `h3` rule) and the pinned title is red (the id rule beats the class rule). Move the mouse over Save, then press Tab to focus it: you see the hover colour and the focus outline.",
    },
    {
      text: "Right-click the pinned title and choose Inspect. The Styles panel lists every rule that matches the `h3`, with the losing `color` declarations crossed out. This is the cascade at work, and the first place to look when a style does not apply.",
    },
  ],
  whereUsed: [
    "Every stylesheet: each rule starts with a selector.",
    "Component styles in React apps, usually through class names such as `.note-card` or `.form-field` that match the `className` set in JSX.",
    'JavaScript uses the same syntax to find elements, for example `document.querySelector(".note-card")`.',
  ],
  connectsTo: [
    "HTML elements and their `class`, `id` and other attributes, which selectors match.",
    "The box model, Flexbox and responsive design: the properties you set inside the rules a selector picks.",
    "React's `className` prop, which adds the classes your selectors target.",
  ],
  projectUsage: [
    {
      explanation:
        "The Notes App styles everything in one plain CSS file, `frontend/src/index.css`, which `main.jsx` imports. Its rules mostly use class selectors such as `.note-card`, `.button` and `.form-field`.",
      fileId: "frontend/src/index.css",
      match: ".note-card {",
    },
    {
      explanation:
        'Components add those classes with `className`: `NoteCard.jsx` renders an article with `className="note-card"`, and `Button.jsx` renders a button with `className="button"`, so every card and button looks the same.',
      fileId: "frontend/src/components/NoteCard.jsx",
      match: '<article className="note-card">',
    },
    {
      explanation:
        "Pseudo-classes such as `.button:hover` and `.button:focus-visible` give buttons a hover colour and a visible keyboard focus outline without any JavaScript.",
      fileId: "frontend/src/index.css",
      match: ".button:focus-visible {",
    },
  ],
  commonMistakes: [
    "Forgetting the dot or the hash: writing `note-card { }` looks for an element called `note-card`, which does not exist. Use `.note-card` for a class and `#title` for an id.",
    "Styling with id selectors everywhere. Their high specificity makes them hard to override later, and an id must be unique. Use classes for styling and keep ids for links and labels.",
    "Removing the focus outline with `outline: none` because it looks untidy. Keyboard users then cannot see where they are. Style `:focus-visible` with a clear outline instead.",
    "Wondering why a rule does nothing when another rule wins the cascade. Inspect the element: crossed-out declarations show which rule beat yours, so make your selector more specific or move it later rather than adding `!important`.",
  ],
  relatedConcepts: [
    "html-element",
    "css-box-model",
    "css-flexbox",
    "html-semantic-structure",
  ],
  relatedFiles: [],
  relatedBuildSteps: [],
};
