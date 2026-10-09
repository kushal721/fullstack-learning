import type { Concept } from "@fsl/shared";

export const jsEvent: Concept = {
  id: "js-event",
  slug: "js-event",
  title: "Events",
  topicId: "javascript",
  summary:
    "A signal the browser sends when something happens on the page, such as a click, a key press or a form submit.",
  basics: [
    "A web page is made of HTML elements — buttons, inputs, forms — that the browser draws on the screen. JavaScript can find these elements and change them, but it also needs to know when the user does something with them.",
    "Code normally runs from top to bottom once and then stops. An interactive page is different: it has to wait, possibly for minutes, until the user clicks or types, and only then react. The program cannot know in advance when that will happen.",
    'Events are how the browser solves this. Instead of your code constantly asking "has anyone clicked yet?", the browser tells your code the moment it happens by calling a function you gave it earlier.',
  ],
  what: [
    "An event is a message from the browser that something happened. Each event has a type, written as a string: `click` (an element was clicked), `submit` (a form was sent), `input` (the text in a field changed), `keydown` (a key was pressed), and many more.",
    "When an event happens, the browser creates an event object describing it and passes that object to your handler — the function you asked it to run. It holds details such as `event.target` (the element where it happened) and `event.key` (which key was pressed, for keyboard events).",
  ],
  why: [
    "Events are the only way a page can respond to people. Saving a note on click, showing what is typed, closing a menu with Escape — all of these start with an event.",
    "Because the browser does the waiting and calls your code only when needed, the page stays responsive and your code does not waste work checking for changes that have not happened.",
  ],
  howItWorks: [
    'First you register a handler: you tell the browser "when `click` happens on this button, call this function". In plain JavaScript you do that with `button.addEventListener("click", handleClick)`; in React you write `onClick={handleClick}`.',
    "When the user acts, the browser builds the event object and calls your function with it as the first argument, so your handler is usually written as `function handleClick(event) { ... }`.",
    "Some events have a default action — something the browser does on its own afterwards. Submitting a form reloads the page, and clicking a link opens a new page. Calling `event.preventDefault()` in your handler cancels that default so your code stays in charge.",
    "Most events bubble: after reaching the element where they happened, they travel up through each parent element to the top of the page. A handler on a parent therefore also hears events from its children, and `event.target` still tells you which child it came from.",
  ],
  basicExample: {
    language: "html",
    code: `<input id="title" placeholder="Note title" />
<button id="save">Save</button>

<script>
  const input = document.getElementById("title");
  const button = document.getElementById("save");

  button.addEventListener("click", (event) => {
    console.log("Clicked:", event.target.textContent);
    console.log("Title is:", input.value);
  });
</script>`,
    caption:
      "The browser calls the arrow function each time the button is clicked and passes it the event object.",
    highlightLines: [8, 9],
  },
  internals: [
    "Events go through three phases. In the capture phase the event travels down from the top of the page to the element; in the target phase it reaches the element; in the bubble phase it travels back up through the parents. Handlers run in the bubble phase by default, which is why you usually only think about bubbling.",
    "`event.target` is the element where the event started, while `event.currentTarget` is the element whose handler is running right now. During bubbling these can be different: click a button inside a form, and a handler on the form sees the button as `target` and the form as `currentTarget`.",
    "Calling `event.stopPropagation()` stops the event from bubbling further up. It is rarely needed, and it can break other code that listens higher up, so prefer checking `event.target` instead.",
    "React attaches its own listeners at the root of your app and passes your handler a wrapper called a synthetic event. It has the same `target`, `preventDefault()` and so on, so the knowledge transfers directly.",
  ],
  howToCreate: [
    {
      text: "Create an `index.html` file with a small form, an input and a paragraph for output, and load a script from it.",
      code: {
        language: "html",
        fileName: "index.html",
        code: `<form id="note-form">
  <input id="title" placeholder="Note title" />
  <button type="submit">Save</button>
</form>
<p id="preview"></p>

<script src="script.js"></script>`,
      },
    },
    {
      text: "Create `script.js` next to it. Listen for `input` to show the text as it is typed, and for `submit` to save without reloading the page.",
      code: {
        language: "js",
        fileName: "script.js",
        code: `const form = document.getElementById("note-form");
const input = document.getElementById("title");
const preview = document.getElementById("preview");

input.addEventListener("input", (event) => {
  preview.textContent = event.target.value;
});

form.addEventListener("submit", (event) => {
  event.preventDefault(); // stop the page reload
  console.log("Saving:", input.value);
});`,
      },
    },
    {
      text: "Add a `keydown` listener on the whole page and a click listener on the form to see bubbling.",
      code: {
        language: "js",
        fileName: "script.js",
        code: `document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") input.value = "";
});

form.addEventListener("click", (event) => {
  console.log("Click bubbled up from:", event.target.tagName);
});`,
      },
    },
    {
      text: "Open `index.html` in the browser and open the developer console (F12 or Cmd+Opt+I). Type a title — the paragraph updates with each key. Press Save — the console prints the title and the page does not reload. Click the input and the button — the form's handler logs `INPUT` and `BUTTON`, because those clicks bubbled up. Press Escape to clear the input.",
    },
  ],
  whereUsed: [
    "Every interactive feature: buttons, form submits, typing in inputs, keyboard shortcuts, opening and closing menus.",
    "In React, through props such as `onClick`, `onChange` and `onSubmit` on elements and components.",
    "Beyond the user: the page itself fires events such as `load` when it has finished loading, and network and timer code also signals completion in similar ways.",
  ],
  connectsTo: [
    "Event listeners, the `addEventListener` mechanism that registers a handler for an event type.",
    "Functions and arrow functions, which are what you hand over as handlers.",
    "HTML forms, inputs and buttons, the elements that produce most events.",
    "React state: handlers usually call a setter such as `setTitle(event.target.value)` to update the screen.",
  ],
  projectUsage: [
    {
      explanation:
        "`NoteForm.jsx` handles the form's submit event with `handleSave(event)`. It first calls `event.preventDefault()` so the browser does not reload, then calls `createNote({ title, content })`, which sends `POST /api/notes`.",
    },
    {
      explanation:
        "The title and content inputs in `NoteForm` react to change events and read `event.target.value` to store the typed text in state.",
    },
    {
      explanation:
        "The Login and Register pages handle their form submits the same way: a handler that calls `event.preventDefault()` first and then sends the data with a function from `authApi.js`.",
    },
  ],
  commonMistakes: [
    "Forgetting `event.preventDefault()` in a submit handler, so the page reloads and your request and state are lost. Call it as the first line of the handler.",
    'Calling the handler instead of passing it: `addEventListener("click", save())` or `onClick={save()}` runs `save` immediately. Pass the function: `save`, or `() => save(note)`.',
    'Writing the event type wrong, such as `"onclick"` or `"Click"` in `addEventListener`. Event types are lowercase without `on`: `"click"`. (In React it is the opposite: `onClick`.)',
    "Assuming `event.target` is the element the handler is on. Because of bubbling it may be a child; use `event.currentTarget` for the element that owns the handler.",
  ],
  relatedConcepts: [
    "js-event-listener",
    "js-arrow-function",
    "html-form",
    "html-button",
  ],
  relatedFiles: [],
  relatedBuildSteps: [],
};
