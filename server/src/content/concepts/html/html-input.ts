import type { Concept } from "@fsl/shared";

export const htmlInput: Concept = {
  id: "html-input",
  slug: "html-input",
  title: "HTML <input>",
  topicId: "html",
  summary:
    "The element that gives the user a box to type into or a control to tick, so a page can collect information such as an email, a password or a note title.",
  basics: [
    "A web page is built from HTML elements. Most elements only show content, but a few are form controls: elements the user can fill in or change, such as a text box or a checkbox.",
    'An attribute is extra information written inside an opening tag, like `type` in `<input type="email">`. Attributes change how an element looks or behaves.',
    "The value of a form control is whatever the user has typed or chosen right now. When a form is submitted, the browser collects the value of every control and sends them together.",
    "Some elements, like `<input>`, never have content between tags, so they have no closing tag. These are called void elements: everything they need is in their attributes.",
  ],
  what: [
    "`<input>` is the HTML element for a single piece of user input. Its `type` attribute picks the kind of control: `text` (the default) for one line of text, `email` for an email address, `password` for a hidden password, and `checkbox` for a yes or no tick box.",
    "Other attributes describe the data: `name` is the key the value is sent under, `value` is the current or starting value, `placeholder` is a faint hint shown while the box is empty, and `required` means the form cannot be submitted while it is empty. For longer, multi-line text there is a separate element, `<textarea>`.",
  ],
  why: [
    "Almost every useful app needs information from its user: an email to log in, a password, the title and text of a note. `<input>` is the standard way to ask for it, and the browser gives it typing, copy and paste, keyboard support and autofill for free.",
    'Choosing the right `type` helps people too. `type="email"` makes phones show a keyboard with an @ key and lets the browser check the format, and `type="password"` hides what is typed so nobody can read it over your shoulder.',
  ],
  howItWorks: [
    "When the user types into an input, the browser updates the input's value and fires an `input` event every time it changes. JavaScript can read the current value from the element's `value` property.",
    "A `<label>` names the input. When the label's `for` attribute matches the input's `id`, the two are linked: clicking the label focuses the input, and screen readers read the label text aloud when the input is focused.",
    'When the surrounding form is submitted, the browser first checks rules like `required` and `type="email"`. If a rule fails it stops, shows a message next to the input and does not submit. If all rules pass, it sends each value under its `name`.',
    "In React, an input is usually controlled: you store its value in state, pass that state to the `value` attribute and update the state in `onChange`. React then always shows exactly what is in state, so state and screen never disagree.",
  ],
  basicExample: {
    language: "html",
    code: `<form>
  <label for="email">Email</label>
  <input id="email" name="email" type="email" required />

  <label for="password">Password</label>
  <input id="password" name="password" type="password" required />

  <label>
    <input name="remember" type="checkbox" />
    Remember me
  </label>

  <button type="submit">Log in</button>
</form>`,
    caption:
      "Each input has a label, a `name` and a `type`. The browser will not submit the form until both required fields are filled in.",
  },
  internals: [
    "The browser keeps the current value inside the input element itself. The `value` attribute you write in HTML is only the starting value; after the user types, the `value` property in JavaScript holds the new text while the attribute stays the same.",
    "A checkbox works differently: what changes is its `checked` state (true or false). Its `value` is only the text sent when it is ticked, which is `on` if you do not set one. An unticked checkbox sends nothing at all.",
    'Built-in validation (`required`, `type="email"`, `minlength`) runs before the `submit` event fires. If it fails, your submit handler never runs. Remember this is only a convenience for the user: anyone can bypass it, so the server must check the data again.',
    "In a controlled React input, every keystroke fires `onChange`, your code calls the state setter, React re-renders and writes the new state back into the input. If you set `value` but never update the state, React keeps writing the old value back and the input looks frozen.",
  ],
  howToCreate: [
    {
      text: "Create a file called `index.html` in an empty folder and add a form with a labelled email input, a textarea for longer text and a submit button.",
      code: {
        language: "html",
        fileName: "index.html",
        code: `<form id="note-form">
  <label for="email">Email</label>
  <input id="email" name="email" type="email" placeholder="you@example.com" required />

  <label for="content">Note</label>
  <textarea id="content" name="content" rows="4"></textarea>

  <button type="submit">Save</button>
</form>`,
      },
    },
    {
      text: "Below the form, add a script that stops the page reload and prints every value the form would send.",
      code: {
        language: "html",
        fileName: "index.html",
        code: `<script>
  const form = document.getElementById("note-form");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    console.log(data);
  });
</script>`,
      },
    },
    {
      text: "Open `index.html` in your browser and open the developer console (F12 or Cmd+Opt+I). Press Save with the email empty, then with `hello` in it: the browser blocks both and shows a message. Type a real address and press Save: the console prints an object with `email` and `content`.",
    },
    {
      text: "Click the word Email above the box. The cursor jumps into the input because the label's `for` matches the input's `id`. In a React project, the same input is controlled with state, as below.",
      code: {
        language: "jsx",
        fileName: "src/EmailField.jsx",
        code: `import { useState } from "react";

export default function EmailField() {
  const [email, setEmail] = useState("");

  return (
    <>
      <label htmlFor="email">Email</label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <p>You typed: {email}</p>
    </>
  );
}`,
      },
    },
    {
      text: "Render `EmailField` in your app and type into the box. The text under it updates on every keystroke, which shows that the value really lives in state.",
    },
  ],
  whereUsed: [
    "Login and sign-up forms: an email input and a password input.",
    "Any form that creates or edits data, such as the title of a note (an `<input>`) and its body (a `<textarea>`).",
    "Search boxes, settings checkboxes and filters, wherever the user needs to type or choose something.",
  ],
  connectsTo: [
    "The `<form>` that groups inputs and the `<button>` that submits them.",
    "The `<label>` that names each input, linked by `for` and `id`.",
    "React state: `useState` holds the value and `onChange` updates it on every keystroke.",
    "In the Notes App, the values typed into inputs become the JSON body of an HTTP request to the backend.",
  ],
  projectUsage: [
    {
      explanation:
        "The Notes App wraps a label and an input in a reusable `Input` component (`frontend/src/components/Input.jsx`), so every field is labelled and styled the same way with the `.form-field` class.",
      fileId: "frontend/src/components/Input.jsx",
      match: '<div className="form-field">',
    },
    {
      explanation:
        'The Login and Register pages use `Input` with `type="email"` and `type="password"`. Each value is kept in React state through `value` and `onChange`, then sent to the backend by `authApi.js`.',
      fileId: "frontend/src/pages/Login.jsx",
      match: 'type="email"',
    },
    {
      explanation:
        "`NoteForm.jsx` uses `Input` for the note title and `Input` with `multiline` (which renders a `<textarea>`) for the content. When the form is submitted, `handleSave()` calls `createNote()`, which sends both values with `POST /api/notes`.",
      fileId: "frontend/src/components/NoteForm.jsx",
      match: 'id="note-title"',
    },
  ],
  commonMistakes: [
    "Using `placeholder` instead of a label. The hint disappears as soon as the user types, and screen readers may not announce it. Always add a `<label>` linked with `for` and `id` (in JSX, `htmlFor`).",
    "Forgetting the `name` attribute. Inputs without a `name` are left out when the form is submitted or read with `FormData`. Give every input a `name`.",
    "Setting `value` in React without an `onChange` that updates state. The input looks frozen because React keeps writing the old value back. Add `onChange={(event) => setValue(event.target.value)}`, or use `defaultValue` if you do not need state.",
    'Trusting `required` and `type="email"` as security. They only help honest users; anyone can send a request without them. Validate the data again on the server.',
  ],
  relatedConcepts: ["html-form", "html-button", "react-usestate", "http-post"],
  relatedFiles: [],
  relatedBuildSteps: [],
};
