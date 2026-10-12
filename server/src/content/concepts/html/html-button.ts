import type { Concept } from "@fsl/shared";

export const htmlButton: Concept = {
  id: "html-button",
  slug: "html-button",
  title: "HTML <button>",
  topicId: "html",
  summary:
    "The element that lets a user trigger an action on a page, such as saving a note or submitting a form.",
  basics: [
    "A web page is built from HTML elements. Each element is written with tags, like `<p>Hello</p>` for a paragraph: an opening tag, the content, and a closing tag.",
    "The browser reads these elements and decides how each one looks and behaves. Some elements only show content (a paragraph, a heading); others are interactive — the user can click, type into or select them.",
    'A form is a group of inputs whose values are sent together. A button is usually what tells the form "send it now".',
  ],
  what: [
    "`<button>` is the HTML element for an action. Whatever is between the tags — usually text such as `Save` — is the button's label.",
    "Its `type` attribute decides what a click does: `submit` sends the surrounding form, `button` does nothing on its own (you attach your own code), and `reset` clears the form. Inside a form, a button without a `type` is a submit button.",
  ],
  why: [
    'You could make any element look like a button with CSS, but it would not behave like one. A real `<button>` can be reached with the Tab key, pressed with Enter or Space, and is announced as "button" by screen readers — without any extra code.',
    "Using the element whose meaning matches the job gives every user the same abilities and lets the browser handle the details for you.",
  ],
  howItWorks: [
    "When the user clicks the button (or presses Enter or Space while it has focus), the browser fires a `click` event on it.",
    "If it is a submit button inside a `<form>`, the browser then fires a `submit` event on the form. JavaScript can listen to either event and decide what happens next.",
    "Without JavaScript, a submitted form makes the browser send the form's values to a URL and load a new page. In a React app we stop that default behaviour and send the data with `fetch()` instead, so the page does not reload.",
  ],
  basicExample: {
    language: "html",
    code: `<form>
  <label for="title">Title</label>
  <input id="title" name="title" />

  <button type="submit">Save</button>
</form>`,
    caption: "Clicking Save (or pressing Enter in the input) submits the form.",
  },
  internals: [
    'The browser gives every `<button>` built-in behaviour: it is focusable, it shows a focus outline, it reacts to Enter and Space, and it tells assistive technology its role ("button") and its name (the label text).',
    'A click starts at the button and then "bubbles" up through its parent elements. That is why a click on a submit button also reaches the `<form>`, which turns it into a `submit` event.',
    "Calling `event.preventDefault()` in a submit handler cancels the browser's default action (sending the form and loading a new page), leaving your code in charge.",
  ],
  howToCreate: [
    {
      text: "Create a file called `index.html` in an empty folder and add a form with one input and a submit button.",
      code: {
        language: "html",
        fileName: "index.html",
        code: `<form id="note-form">
  <input name="title" placeholder="Note title" />
  <button type="submit">Save</button>
</form>`,
      },
    },
    {
      text: "Below the form, add a script that listens for the form's submit event, stops the page reload and reads the input's value.",
      code: {
        language: "html",
        fileName: "index.html",
        code: `<script>
  const form = document.getElementById("note-form");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const title = new FormData(form).get("title");
    console.log("Saving:", title);
  });
</script>`,
      },
    },
    {
      text: "Open `index.html` in your browser, open the developer console (F12 or Cmd+Opt+I), type a title and press Save — then try pressing Enter in the input. Both print the title and the page does not reload.",
    },
    {
      text: "Press Tab until the button is focused and press Space. It works too: the keyboard support came for free because you used a real `<button>`.",
    },
  ],
  whereUsed: [
    "Every form that sends data: logging in, registering, saving or editing a note.",
    "Actions that are not navigation: deleting a note, logging out, opening a menu.",
    "If clicking should take the user to another page, use a link (`<a>`) instead — links navigate, buttons act.",
  ],
  connectsTo: [
    "The `<form>` it submits and the inputs whose values are sent.",
    "JavaScript event handlers (`onClick`, `onSubmit` in React) that run when it is pressed.",
    "In the Notes App, that handler eventually sends an HTTP request to the backend.",
  ],
  projectUsage: [
    {
      explanation:
        "The Notes App wraps `<button>` in a reusable `Button` component (`frontend/src/components/Button.jsx`) so every button has the same style and behaviour.",
      fileId: "frontend/src/components/Button.jsx",
      match: "<button className={`button button-${variant}`} {...props}>",
    },
    {
      explanation:
        'In `NoteForm.jsx`, `<Button type="submit">Save</Button>` submits the note form, which calls `handleSave()`. That function calls `createNote()`, which sends `POST /api/notes`.',
      fileId: "frontend/src/components/NoteForm.jsx",
      match: '<Button type="submit" disabled={isSaving}>',
    },
    {
      explanation:
        "The Login and Register pages use the same `Button` component to submit their forms.",
      fileId: "frontend/src/pages/Login.jsx",
      match: '<Button type="submit">Log in</Button>',
    },
  ],
  commonMistakes: [
    "Using a `<div>` or `<span>` with an `onClick` as a button: it cannot be reached with the keyboard and screen readers don't know it is clickable. Use `<button>`.",
    'Forgetting that buttons inside a form submit by default: a "Cancel" button without `type="button"` will submit the form. Give non-submit buttons `type="button"`.',
    "Forgetting `event.preventDefault()` in a submit handler, so the browser reloads the page and your `fetch()` request is cancelled.",
    "Leaving a button without a text label (only an icon). Add visible text or an `aria-label` so everyone knows what it does.",
  ],
  relatedConcepts: ["http-post"],
  relatedFiles: [],
  relatedBuildSteps: [],
};
