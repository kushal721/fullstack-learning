import type { Concept } from "@fsl/shared";

export const xss: Concept = {
  id: "xss",
  slug: "xss",
  title: "Cross-site scripting (XSS)",
  topicId: "security",
  summary:
    "An attack where text saved or sent by one person is shown on a page as HTML instead of as text, so a script hidden in it runs in another person's browser as if it were part of the app.",
  basics: [
    "A web page is HTML: text plus markup such as `<p>`, `<img>` and `<script>`. When the browser reads HTML, it turns the markup into elements, and some of them run JavaScript.",
    "JavaScript running in a page can do anything that page can: read what is on the screen, change it, and send requests to the site's backend with the user's cookies attached, just as the app itself does.",
    "Apps show text that users wrote: note titles, comments, names. If that text is put into the page as HTML, any markup inside it becomes real elements, including ones that run code.",
  ],
  what: [
    "Cross-site scripting, XSS for short, is when an attacker gets their own JavaScript to run on your site in someone else's browser, by hiding it in text the site displays. The browser can't tell it apart from the app's own code.",
    "The fix is to always put user text into the page as text, never as HTML. Then `<img src=x onerror=…>` in a note is displayed as those characters, and nothing runs. React does this for you every time you write `{value}` in JSX.",
  ],
  why: [
    "A script running as the victim can read their private data on the page, change what they see (for example, a fake login form), or make requests in their name: change their email, delete their notes, post content as them.",
    "Stored XSS is the most dangerous kind: the attacker saves the script once, for example in a comment, and it runs for everyone who views that comment. In the Notes App each note is only ever shown to its owner, so today a script in a note would only run for the person who wrote it. But apps grow (shared notes, an admin page), and safe display has to be in place before that happens.",
    "This is also why the Notes App's login cookie is `httpOnly`: even if a script did run, it couldn't read the token and send it away. It could still make requests while the page is open, so escaping is the real defence and `httpOnly` limits the damage.",
  ],
  howItWorks: [
    "Imagine a note whose content is `<img src=x onerror=\"alert('hacked')\">`. The `src` is not a real image, so loading it fails, and `onerror` is an attribute that runs JavaScript when that happens.",
    "Unsafe display: code such as `element.innerHTML = note.content` asks the browser to parse the text as HTML. It creates an `<img>` element, the image fails to load, and the attacker's code runs.",
    "Safe display: `element.textContent = note.content`, or `<p>{note.content}</p>` in React, puts the characters into the page as a text node. The browser shows `<img src=x …>` literally and never treats it as markup.",
    "React has one deliberate way around this, `dangerouslySetInnerHTML={{ __html: text }}`. The long name is a warning: it puts the string in as HTML, exactly like `innerHTML`. If you really need user-written formatting, such as Markdown, turn it into HTML with a library made for that and clean the result with a sanitizer such as DOMPurify before using it.",
  ],
  basicExample: {
    language: "jsx",
    code: `const content = "<img src=x onerror=\\"alert('hacked')\\">";

// SAFE (the Notes App): React inserts the text as text
<p>{content}</p>
// shows: <img src=x onerror="alert('hacked')">

// UNSAFE: the text is parsed as HTML, so the script runs
<p dangerouslySetInnerHTML={{ __html: content }} />
// shows a broken image and runs alert('hacked')`,
    caption:
      "The same string is harmless text in the first version and running code in the second.",
    highlightLines: [4, 8],
  },
  internals: [
    "A `<script>` tag inserted with `innerHTML` does not run, which makes some people think `innerHTML` is safe. It isn't: event attributes such as `onerror`, `onload` or `onclick` on other elements do run.",
    "React escapes text everywhere you use `{…}`: as element content and in attribute values like `title={note.title}`. It creates text nodes and sets attributes through the DOM, so text can't close a tag or start a new one.",
    "Escaping text doesn't make every value safe in every place. In HTML, a link whose `href` is `javascript:…` runs code when clicked, so a link address typed by a user is dangerous even as plain text. Don't count on any one library to catch this: for user-supplied links, only allow addresses that start with `http://` or `https://`.",
    "Browsers can add a second wall, a Content Security Policy (CSP): a response header that tells the browser which scripts the page may run. It catches some mistakes, but it is a backup for escaping, not a replacement.",
  ],
  howToCreate: [
    {
      text: "No install needed. Create `xss.html` with a text box and two outputs: one filled with `innerHTML`, one with `textContent`.",
      code: {
        language: "html",
        fileName: "xss.html",
        code: `<!doctype html>
<meta charset="utf-8" />
<title>XSS demo</title>
<textarea id="note" rows="3" cols="60"><img src=x onerror="alert('hacked')"></textarea>
<button id="show">Show the note</button>
<h2>innerHTML (unsafe)</h2>
<div id="unsafe"></div>
<h2>textContent (safe)</h2>
<div id="safe"></div>
<script>
  document.getElementById("show").addEventListener("click", () => {
    const text = document.getElementById("note").value;
    document.getElementById("unsafe").innerHTML = text;
    document.getElementById("safe").textContent = text;
  });
</script>`,
      },
    },
    {
      text: "Open it in your browser (double-click the file, or run the command below on macOS; on Windows use `start xss.html`) and press Show the note. An alert saying `hacked` appears: that is the attacker's code running. Under textContent, the same note is shown as plain characters. Try `<script>alert(1)</script>` too: nothing runs, but the `<img onerror>` version always does.",
      code: { language: "bash", code: "open xss.html" },
    },
  ],
  whereUsed: [
    'Every place an app shows text that a user, another system or a URL provided: notes, comments, names, search terms shown back as "Results for …", error messages.',
    "Rich-text editors and Markdown previews, which need HTML and therefore a sanitizer.",
    "Links and image addresses built from user input.",
  ],
  connectsTo: [
    "JSX, whose `{value}` escapes text automatically.",
    "The httpOnly login cookie, which keeps the token out of reach of any script that does run.",
    "Input validation, which checks lengths and types but doesn't remove HTML from text; safe display does that job.",
    "The DOM, where `textContent` is safe and `innerHTML` is not.",
  ],
  projectUsage: [
    {
      explanation:
        "NoteCard shows a note's content with `<p>{note.content}</p>`. The comment above it explains that React escapes the text, so a note containing HTML is shown as text and can never run as code.",
      fileId: "frontend/src/components/NoteCard.jsx",
      match: "<p>{note.content}</p>",
    },
    {
      explanation:
        "The title is shown the same way, `<h2>{note.title}</h2>`. The Notes App never uses `dangerouslySetInnerHTML` or `innerHTML`, so every piece of user text reaches the page as text.",
      fileId: "frontend/src/components/NoteCard.jsx",
      match: "<h2>{note.title}</h2>",
    },
    {
      explanation:
        "The login cookie is `httpOnly`, so even a script that somehow ran in the page could not read the token. The comment says this is about XSS.",
      fileId: "backend/src/controllers/authController.js",
      match: "httpOnly: true,",
    },
    {
      explanation:
        "Error messages from the server are shown with `{error}` too, so even a message that echoed user input would be displayed as text.",
      fileId: "frontend/src/components/NoteForm.jsx",
      match: "{error}",
    },
  ],
  commonMistakes: [
    'Using `dangerouslySetInnerHTML` (or `innerHTML`) to show user text because it "just shows the formatting". Show text as text; if formatting is needed, sanitize it.',
    "Trying to strip `<script>` tags with a regular expression. There are endless other ways to run code, such as `onerror`, so filters like this always miss something.",
    "Thinking validation prevents XSS. A note may legitimately contain `<` and `>`; the safe answer is to display it as text, not to forbid it.",
    "Storing the login token in `localStorage`, where any script on the page can read it. An httpOnly cookie keeps it away from scripts.",
  ],
  relatedConcepts: [
    "input-validation",
    "jsx",
    "react-component",
    "html-element",
    "http-headers",
  ],
  relatedFiles: [],
  relatedBuildSteps: ["create-first-component"],
};
