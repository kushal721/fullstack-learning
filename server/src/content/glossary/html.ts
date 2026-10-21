import type { GlossaryEntry } from "@fsl/shared";

// Glossary entries introduced by the "HTML" topic.
export const htmlGlossary: GlossaryEntry[] = [
  {
    id: "html-document",
    topicId: "html",
    term: "HTML document",
    aliases: ["html page", "doctype", "head", "body"],
    kind: "concept",
    short:
      "The whole HTML file a browser loads for one page, with a fixed outer skeleton.",
    body: "It starts with `<!doctype html>`, then one `<html>` element holding two parts. The `<head>` describes the page (title, character set, CSS links) and isn't shown. The `<body>` holds everything you see, built from [[html-element|elements]].",
    conceptPageId: "html-document",
  },
  {
    id: "html-element",
    topicId: "html",
    term: "HTML element",
    aliases: ["element", "tag", "attribute", "tags"],
    kind: "concept",
    short:
      "One building block of a page, such as a heading, a paragraph or an image, written with tags.",
    body: "An element is an opening tag, some content and a closing tag: `<p>Buy milk</p>`. The tag name says what kind of element it is. Attributes add settings, like `href` on a link. [[css-selector|CSS selectors]] pick elements to style them.",
    conceptPageId: "html-element",
  },
  {
    id: "html-semantic-structure",
    topicId: "html",
    term: "Semantic HTML",
    aliases: ["semantics", "semantic elements", "header", "nav", "main"],
    kind: "concept",
    short:
      "Choosing elements that say what each part of a page is, like header, nav and main, instead of plain boxes.",
    body: "`<header>`, `<nav>`, `<main>`, `<section>`, `<article>` and `<footer>` describe the parts of a page, and `<h1>` to `<h6>` make an outline like book chapters. Screen readers, search engines and other developers all use this meaning. It is plain [[html-element|HTML elements]], chosen with care.",
    conceptPageId: "html-semantic-structure",
  },
  {
    id: "html-form",
    topicId: "html",
    term: "HTML form",
    aliases: ["form", "<form>"],
    kind: "concept",
    short:
      "The element that groups inputs so their values are checked and sent together, like a login or a new note.",
    body: "A `<form>` wraps [[html-input|inputs]] and a submit [[html-button|button]]. When it is submitted, the browser sends every named input's value to the `action` URL using the `method`, often [[http-post|POST]]. In React, a [[react-controlled-form|controlled form]] handles the sending itself.",
    conceptPageId: "html-form",
  },
  {
    id: "html-input",
    topicId: "html",
    term: "HTML input",
    aliases: ["input", "<input>", "textarea", "text box"],
    kind: "concept",
    short:
      "The element that gives the user a box to type in or a control to tick, such as an email or a password.",
    body: "Its `type` picks the control: `text`, `email`, `password`, `checkbox` and more. `name` is the key its value is sent under, `placeholder` is a hint and `required` stops an empty [[html-form|form]] from being sent. Longer text uses `<textarea>`.",
    conceptPageId: "html-input",
  },
  {
    id: "html-button",
    topicId: "html",
    term: "HTML button",
    aliases: ["button", "<button>", "submit button"],
    kind: "concept",
    short:
      "The element a user clicks to trigger an action, such as saving a note or sending a form.",
    body: "The text between the tags is its label. Its `type` decides what a click does: `submit` sends the surrounding [[html-form|form]], `button` does nothing until your code [[js-event-listener|listens for the click]]. Inside a form, a button without a type submits it.",
    conceptPageId: "html-button",
  },
];
