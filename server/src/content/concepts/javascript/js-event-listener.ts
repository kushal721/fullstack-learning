import type { Concept } from "@fsl/shared";

export const jsEventListener: Concept = {
  id: "js-event-listener",
  slug: "js-event-listener",
  title: "Event listeners",
  topicId: "javascript",
  summary:
    "A function you register on an element so the browser runs it every time a certain event, such as a click, happens there.",
  basics: [
    'When a page is loaded, the browser turns the HTML into a tree of JavaScript objects called the DOM (Document Object Model). Each element, like a button or a form, becomes an object your code can find with `document.getElementById("save")` or `document.querySelector("form")`.',
    "An event is a message the browser creates when something happens: the user clicks (`click`), types (`input`), presses a key (`keydown`) or submits a form (`submit`). Events happen all the time, but nothing reacts to them unless you ask.",
    "A function is a named, reusable block of code. You can pass a function to another function as a value, without calling it, so that it can be called later. A function passed like this is often called a callback or a handler.",
  ],
  what: [
    'An event listener is a pair: an event type (such as `"click"`) and a handler function. You attach it with `element.addEventListener(type, handler)`, and from then on the browser calls `handler` every time that event happens on that element.',
    "The browser calls the handler with one argument, an event object. It describes what happened: `event.target` is the element that was clicked, `event.key` is the key that was pressed, and `event.preventDefault()` cancels the browser's built-in reaction.",
  ],
  why: [
    "A page that only shows content is static. Listeners are what make it interactive: they connect the user's actions to your code, so a click can save a note or open a menu.",
    "The browser decides when events happen, not your code. You cannot write a loop that waits for a click without freezing the page, so instead you hand the browser a function and say: call this when it happens.",
  ],
  howItWorks: [
    "`addEventListener` stores your handler in a list that belongs to the element. It does not run the handler now; it returns immediately and the rest of your script continues.",
    "When the event happens, the browser builds an event object and calls every handler in that element's list for that type, in the order they were added.",
    "To stop listening, call `element.removeEventListener(type, handler)` with the same type and the very same function. That is why a handler you want to remove must be stored in a variable rather than written inline.",
  ],
  basicExample: {
    language: "js",
    code: `const button = document.getElementById("save");

function handleClick(event) {
  console.log("Clicked:", event.target.textContent);
}

button.addEventListener("click", handleClick);

// Later, to stop listening:
button.removeEventListener("click", handleClick);`,
    caption:
      "The handler is passed without parentheses: the browser calls it, with an event object, on every click.",
  },
  internals: [
    "Events travel through the page. A click on a button first reaches the button, then bubbles up to its parent, its grandparent and so on up to `document`. A listener on a form therefore hears clicks on the buttons inside it.",
    "Handlers run on the browser's single JavaScript thread, one at a time. While a handler is running, the page cannot respond to anything else, so handlers should do their work quickly.",
    "React does not attach a listener to every element you write `onClick` on. It attaches a few listeners at the root of your app and, when an event bubbles up to them, calls the matching `onClick` or `onSubmit` function you gave in your JSX. React also removes them for you when a component disappears.",
  ],
  howToCreate: [
    {
      text: "Create `index.html` in an empty folder with a button and an empty paragraph for output.",
      code: {
        language: "html",
        fileName: "index.html",
        code: `<button id="like">Like</button>
<p id="count">0 likes</p>`,
      },
    },
    {
      text: "Below them, add a script that counts clicks with a listener and stops listening after five likes.",
      code: {
        language: "html",
        fileName: "index.html",
        code: `<script>
  const button = document.getElementById("like");
  const output = document.getElementById("count");
  let likes = 0;

  function handleLike(event) {
    likes = likes + 1;
    output.textContent = likes + " likes";
    console.log("Clicked element:", event.target);
    if (likes === 5) {
      button.removeEventListener("click", handleLike);
    }
  }

  button.addEventListener("click", handleLike);
</script>`,
      },
    },
    {
      text: "Open `index.html` in your browser and open the developer console (F12 or Cmd+Opt+I). Click Like several times.",
    },
    {
      text: "Check that it worked: the counter goes up and the console prints the button on each click, and after the fifth click nothing changes any more because the listener was removed.",
    },
  ],
  whereUsed: [
    "Every interactive part of a page: buttons, forms, inputs, menus, keyboard shortcuts.",
    "In plain JavaScript you call `addEventListener` yourself; in React you write `onClick={handleClick}` or `onSubmit={handleSubmit}` in JSX, which is React's way of adding the same listeners for you.",
  ],
  connectsTo: [
    "Events, the messages the browser creates that listeners react to.",
    "Functions and arrow functions, which are what you pass as handlers.",
    "Forms and buttons, whose `submit` and `click` events are the most common ones to listen for.",
    "React state: a handler often calls a state setter so the screen updates.",
  ],
  projectUsage: [
    {
      explanation:
        "`NoteForm.jsx` passes its `handleSave` function to the form as `onSubmit`. React calls it when the user presses Save, and it calls `event.preventDefault()` so the page does not reload before saving the note.",
      fileId: "frontend/src/components/NoteForm.jsx",
      match: '<form className="note-form" onSubmit={handleSave}>',
    },
    {
      explanation:
        "The `Input` component passes the `onChange` handler it receives on to its field, so every keystroke updates the text kept in state, and `NoteCard.jsx` uses `onClick` on its Delete button.",
      fileId: "frontend/src/components/Input.jsx",
      match: "<Field id={id} {...props} />",
    },
  ],
  commonMistakes: [
    'Calling the handler instead of passing it: `addEventListener("click", handleClick())` runs it once immediately and registers its return value. Pass the function itself: `addEventListener("click", handleClick)`, and in React `onClick={handleClick}`.',
    'Trying to remove an inline arrow function: `removeEventListener("click", () => save())` creates a new function, so nothing is removed. Store the handler in a variable and pass the same one to both calls.',
    "Running the script before the element exists, so `getElementById` returns `null` and `addEventListener` throws. Put the script at the end of the body or use the `defer` attribute.",
    "Writing `onclick` in lowercase or as a string in React. React needs camelCase and a function: `onClick={handleClick}`.",
  ],
  relatedConcepts: [
    "js-event",
    "js-function",
    "js-arrow-function",
    "html-button",
    "html-form",
    "react-usestate",
  ],
  relatedFiles: [],
  relatedBuildSteps: [],
};
