import type { Concept } from "@fsl/shared";

export const htmlForm: Concept = {
  id: "html-form",
  slug: "html-form",
  title: "HTML <form>",
  topicId: "html",
  summary:
    "The element that groups inputs together so their values can be checked and sent as one, such as a login or a new note.",
  basics: [
    "A web page is built from HTML elements. Some only show content, like headings and paragraphs. Others let the user give information to the page: an `<input>` is a box the user can type into, and a `<button>` is something the user can press.",
    "On its own, a single input just holds text. To do something useful, such as logging in, the page needs to collect several values (an email and a password), check them and send them somewhere.",
    "Sending data from the browser to a server is done with an HTTP request: a message the browser sends over the network, naming a method (such as `GET` or `POST`) and a URL, and carrying the data.",
  ],
  what: [
    "`<form>` is the HTML element that wraps a group of inputs and a submit button. When the form is submitted, the browser collects the value of every input that has a `name` attribute and sends them together as `name=value` pairs.",
    "Two attributes say where and how the data goes. `action` is the URL to send it to, and `method` is the HTTP method, `get` or `post`. If you leave them out, the form is sent to the current page's URL with `get`, which puts the values in the address bar.",
  ],
  why: [
    "A form gives you a lot of behaviour for free. Pressing Enter in any input submits it, the browser checks rules such as `required` before sending, and the `<label>` elements tell screen readers what each input is for. You would have to write all of this yourself without a form.",
    "Even in a React app that sends data with JavaScript, wrapping inputs in a real `<form>` and listening for its `submit` event keeps the keyboard and accessibility behaviour that people expect, instead of only reacting to a mouse click on a button.",
  ],
  howItWorks: [
    "Each input gets a `name`, which becomes the key its value is sent under, and a `<label>` describing it. Connecting the label to the input with `for` and `id` means clicking the label focuses the input and screen readers read the label aloud.",
    'The user submits the form by clicking a submit button or pressing Enter in a text input. Before anything is sent, the browser runs its built-in validation: if a `required` input is empty or a `type="email"` input does not contain a valid email, it shows a message next to the input and stops.',
    "If everything is valid, the browser fires a `submit` event on the form. JavaScript can listen to it. If nothing stops it, the browser does the default action: it sends the values to the `action` URL and loads the server's response as a whole new page.",
    "In a React app we do not want a new page. The submit handler calls `event.preventDefault()` to cancel the default action, reads the values itself and sends them with `fetch()`, then updates only the part of the page that changed.",
  ],
  basicExample: {
    language: "html",
    code: `<form action="/api/notes" method="post">
  <label for="title">Title</label>
  <input id="title" name="title" required />

  <label for="content">Content</label>
  <textarea id="content" name="content"></textarea>

  <button type="submit">Save</button>
</form>`,
    caption:
      "Pressing Save checks that the title is filled in, then sends title and content to /api/notes with POST.",
    highlightLines: [1, 3, 8],
  },
  internals: [
    "When the form is submitted, the browser builds a list of name and value pairs from its inputs. Inputs without a `name` are skipped, and disabled inputs are skipped too. With `get` the pairs are added to the URL as `?title=Shopping&content=Milk`; with `post` they go in the request body.",
    "Validation happens in the browser before the `submit` event fires. Every input has a validity state, and the form is only submitted when all of them are valid. That is why a `submit` handler never runs while a `required` field is empty.",
    "The `submit` event is cancelable. `event.preventDefault()` marks it as cancelled, so the browser skips sending the request and loading a new page, leaving your code fully in charge.",
    "JavaScript can read every named value at once with `new FormData(form)`, the same list of pairs the browser would have sent. Browser checks are only for the user's convenience: anyone can bypass them, so the server must check the data again.",
  ],
  howToCreate: [
    {
      text: "Create a file named `form.html` with a form that has two labelled inputs, one of them required, and a submit button.",
      code: {
        language: "html",
        fileName: "form.html",
        code: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Note form</title>
  </head>
  <body>
    <form id="note-form">
      <label for="title">Title</label>
      <input id="title" name="title" required />

      <label for="content">Content</label>
      <input id="content" name="content" />

      <button type="submit">Save</button>
    </form>
  </body>
</html>`,
      },
    },
    {
      text: "Open `form.html` in your browser and press Save with the title empty: the browser shows a message and nothing is sent. Now type `Shopping` as the title and press Enter. The page reloads and the address bar ends with `?title=Shopping&content=`, because the default method is `get` and the default action is the same page.",
    },
    {
      text: "Add a script just before `</body>` that listens for the `submit` event, stops the reload and sends the values with `fetch()`, the way a React app does.",
      code: {
        language: "html",
        fileName: "form.html",
        code: `<script>
  const form = document.getElementById("note-form");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const note = Object.fromEntries(new FormData(form));
    console.log("Sending:", note);

    fetch("https://httpbin.org/post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(note),
    })
      .then((response) => response.json())
      .then((data) => console.log("Server received:", data.json));
  });
</script>`,
      },
    },
    {
      text: "Reload the page, open the developer tools (F12, or Cmd+Option+I on a Mac) and fill in the form. It worked if the page does not reload, the Console prints `Sending:` with your title and content and then `Server received:` with the same values, and the Network tab shows a `POST` request to `httpbin.org` (a free test server that sends back what it receives).",
    },
  ],
  whereUsed: [
    "Logging in, registering, searching, leaving a comment, checking out in a shop: any time a user types information and sends it.",
    "In single-page apps built with React, where the form's `submit` event is handled in JavaScript and the data is sent with `fetch()` instead of loading a new page.",
    "In settings and edit pages, where a form is filled in with the current values and sent back after the user changes them.",
  ],
  connectsTo: [
    "The `<input>` and `<label>` elements inside it, whose `name` and value are what gets sent.",
    "The submit `<button>` that triggers the `submit` event.",
    "JavaScript and React event handlers, such as `onSubmit`, that run when the form is submitted.",
    "HTTP POST requests, which carry the form's data to the server to be saved.",
  ],
  projectUsage: [
    {
      explanation:
        '`frontend/src/components/NoteForm.jsx` renders a `<form>` with `Input` components for the title and the content and a `Button` with `type="submit"` labelled Save.',
      fileId: "frontend/src/components/NoteForm.jsx",
      match: '<form className="note-form" onSubmit={handleSave}>',
    },
    {
      explanation:
        "The form's `onSubmit` handler, `handleSave()`, calls `event.preventDefault()` so the page does not reload, then calls `createNote()` from `frontend/src/services/notesApi.js`, which sends `POST /api/notes` to the Express backend with `fetch()`.",
      fileId: "frontend/src/components/NoteForm.jsx",
      match: "async function handleSave(event) {",
    },
    {
      explanation:
        "The Login and Register pages use the same pattern with their own forms. Login sends the email and password with `POST /api/auth/login` instead of letting the browser submit the form.",
      fileId: "frontend/src/pages/Login.jsx",
      match: "<form onSubmit={handleSubmit}>",
    },
  ],
  commonMistakes: [
    "Forgetting the `name` attribute on an input. Its value is then left out of the submitted data and out of `new FormData(form)`. Give every input a `name`.",
    "Forgetting `event.preventDefault()` in the submit handler. The browser reloads the page, your state is lost and the `fetch()` request is often cancelled. Call it as the first line of the handler.",
    "Handling the button's `onClick` instead of the form's `onSubmit`. Pressing Enter then skips your code and the built-in validation is bypassed. Put the handler on the form and give the button `type=\"submit\"`.",
    "Trusting browser validation alone. Attributes like `required` can be removed in the developer tools, and requests can be sent without the page at all. Always check the data on the server too.",
  ],
  relatedConcepts: ["html-input", "html-button", "http-post", "react-usestate"],
  relatedFiles: [],
  relatedBuildSteps: [],
};
