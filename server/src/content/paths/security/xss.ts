import {
  anatomy,
  code,
  diagram,
  explain,
  inTheNotesApp,
  keyPoints,
  mistake,
  moduleLesson,
  pageYourTurn,
  part,
  quickCheck,
  reference,
  trace,
  yourTurn,
} from "../blocks.js";

// XSS: text that becomes code, what a script can do, stored XSS, reflected
// XSS, escaping output, escaping step by step, textContent vs innerHTML,
// React and its escape hatches, sanitizers for real HTML, mistakes, practice
// and a recap.
export const xssModule = moduleLesson(
  "xss",
  "XSS: when text becomes code",
  45,
  [
    "Explain how XSS turns saved or sent text into a script in someone else's browser.",
    "Tell stored XSS from reflected XSS, with an example of each.",
    "Escape output: insert user text as text with textContent or React's {}.",
    "Spot the escape hatches: innerHTML, dangerouslySetInnerHTML and javascript: links.",
    "Use an HTML sanitizer such as DOMPurify when users really must write HTML.",
  ],

  part(
    "what",
    "Text that becomes code",
    explain(
      "[[xss|XSS]] (cross-site scripting) happens when text from a user is put into a page as HTML. If a note's title is `<img src=x onerror=steal()>` and the page inserts it as HTML, the browser builds an image, the image fails to load, and `steal()` runs. It runs in the viewer's browser, on your site, as if your app had written it.",
    ),
    diagram([
      ["Attacker", "saves a title with HTML"],
      ["API + database", "store it as text"],
      ["Viewer's page", "inserts it as HTML"],
      ["Browser", "runs the script"],
    ]),
    keyPoints(
      "The data is fine; the bug is inserting it as HTML.",
      "The script runs in the viewer's browser, not the attacker's.",
      "The fix: insert user text as text, everywhere.",
    ),
  ),

  part(
    "damage",
    "What the script can do",
    explain(
      "The injected script runs with your app's powers. It can read everything on the page, change it (a fake login form, say), and send requests to your API, which carry the viewer's login cookie automatically. The Notes App's cookie is [[secure-cookies|httpOnly]], so a script can't read and steal the token, but it can still act as the viewer while the page is open.",
    ),
    keyPoints(
      "The script runs on your site, as the person viewing the page.",
      "It can read and change the page, and call your API as them.",
      "httpOnly stops token theft, not everything else.",
    ),
  ),

  part(
    "stored",
    "Stored XSS",
    explain(
      "In [[stored-xss|stored XSS]] the script is saved, in a note, a comment or a profile name, and runs for everyone who later views it. One request attacks many people. Here, a note list built by gluing HTML strings would run any HTML in a title. The data was validated: it's a short string. The bug is how it's shown.",
    ),
    code(
      "js",
      "A note list that runs saved HTML",
      [
        "for (const note of notes) {",
        "  list.innerHTML +=",
        '    "<li>" + note.title + "</li>";',
        "}",
        "",
        '// note.title: "<img src=x onerror=steal()>"',
      ],
      {
        2: "innerHTML reads the string as HTML",
        3: "the title's tags become real elements",
        6: "steal() runs for every viewer",
      },
    ),
  ),

  part(
    "reflected",
    "Reflected XSS",
    explain(
      "In [[reflected-xss|reflected XSS]] the script comes in the request itself, usually in a link. A server that puts a query value straight back into its HTML runs whatever the link carries. The attacker sends the link to a victim; clicking it runs their script on your site. The Notes App's API only answers JSON, so it has no page like this.",
    ),
    code(
      "js",
      "A search page that echoes the query",
      [
        'app.get("/search", (req, res) => {',
        "  const q = req.query.q;",
        "  res.send(",
        '    "<p>Results for " + q + "</p>");',
        "});",
        "",
        "// the link the attacker sends:",
        "// /search?q=<script>steal()</script>",
      ],
      {
        2: "untrusted: from the URL",
        4: "glued into HTML: the bug",
        8: "the victim's browser runs steal()",
      },
    ),
    quickCheck(
      "A comment containing a script is saved and runs for everyone who opens the post. Which kind of XSS is it?",
      ["Stored XSS", "Reflected XSS", "Not XSS: it was validated"],
      0,
      "The script was saved and runs for every later viewer: stored XSS. Reflected XSS comes from the request itself, such as a link, and isn't saved.",
    ),
  ),

  part(
    "escaping",
    "Escaping output",
    explain(
      "The fix is [[output-escaping|escaping output]]: when you put text into HTML, turn the characters HTML treats as code into [[html-entity|character entities]]. `<` becomes `&lt;`, so the browser shows a `<` instead of starting a tag. Escape where the text is inserted (on output), not when it's saved: the same title may end up in HTML, JSON or a text email.",
    ),
    anatomy(
      "A title, escaped",
      ["<img src=x onerror=steal()>", "", "&lt;img src=x onerror=steal()&gt;"],
      [
        ["<img", "the raw text", "As HTML, < starts a tag."],
        ["&lt;", "escaped <", "Shown as <, never read as a tag."],
        ["&gt;", "escaped >", "Shown as >."],
      ],
    ),
    reference("The characters to escape in HTML", [
      ["&", "First, or the others get mixed up.", "&amp;"],
      ["<", "Would start a tag.", "&lt;"],
      [">", "Would end a tag.", "&gt;"],
      ['"', "Would end an attribute value.", "&quot;"],
      ["'", "Would end an attribute value too.", "&#39;"],
    ]),
  ),

  part(
    "escape-trace",
    "Escaping, step by step",
    explain(
      "Here's an `escapeHtml` function at work. It replaces `&` first: if it ran last, it would turn the `&` of `&lt;` into `&amp;lt;`. You rarely need to write this yourself, since `textContent` and React do it for you, but seeing it makes clear what they do.",
    ),
    trace(
      "Escaping a title",
      [
        "function escapeHtml(text) {",
        "  return text",
        '    .replaceAll("&", "&amp;")',
        '    .replaceAll("<", "&lt;")',
        '    .replaceAll(">", "&gt;");',
        "}",
        'const title = "<b>Tom & Jo</b>";',
        "const safe = escapeHtml(title);",
      ],
      [
        {
          line: 7,
          note: "A title with tags and an ampersand.",
          vars: [["title", '"<b>Tom & Jo</b>"']],
        },
        {
          line: 3,
          note: "`&` first, so the `&` in later codes isn't touched. Now: `<b>Tom &amp; Jo</b>`.",
          vars: [
            ["title", '"<b>Tom & Jo</b>"'],
            ["text", '"<b>Tom & Jo</b>"'],
          ],
          stack: ["escapeHtml"],
        },
        {
          line: 4,
          note: "Every `<` becomes `&lt;`, so nothing can start a tag: `&lt;b>Tom &amp; Jo&lt;/b>`.",
          vars: [
            ["title", '"<b>Tom & Jo</b>"'],
            ["text", '"<b>Tom & Jo</b>"'],
          ],
          stack: ["escapeHtml"],
        },
        {
          line: 5,
          note: "And every `>` becomes `&gt;`. The result is returned.",
          vars: [
            ["title", '"<b>Tom & Jo</b>"'],
            ["text", '"<b>Tom & Jo</b>"'],
          ],
          stack: ["escapeHtml"],
        },
        {
          line: 8,
          note: "Inserted as HTML, this shows `<b>Tom & Jo</b>` as plain text, not bold.",
          vars: [
            ["title", '"<b>Tom & Jo</b>"'],
            ["safe", '"&lt;b&gt;Tom &amp; Jo&lt;/b&gt;"'],
          ],
        },
      ],
    ),
  ),

  part(
    "dom",
    "textContent, not innerHTML",
    explain(
      "In plain JavaScript, how you set an element's content decides everything. `textContent` treats the value as text: it's escaped for you. `innerHTML` parses it as HTML, so tags and event attributes become real. Use `textContent` (or `createElement` and `append`) for anything that came from a user, and keep `innerHTML` for markup you wrote yourself.",
    ),
    code(
      "js",
      "Same title, two results",
      [
        'const title = "<img src=x onerror=steal()>";',
        "",
        "// ✗ an image is created; steal() runs",
        "h2.innerHTML = title;",
        "",
        "// ✓ the text is shown, tags and all",
        "h2.textContent = title;",
      ],
      {
        4: "parsed as HTML",
        7: "shown exactly as typed",
      },
    ),
  ),

  part(
    "react",
    "React, and its escape hatches",
    explain(
      "React escapes for you: `{note.title}` in JSX is always inserted as text, which is why the Notes App is safe. Two escape hatches skip that. `dangerouslySetInnerHTML` inserts HTML, as its name warns. And a link's `href` from a user can be `javascript:steal()`, which runs when clicked. Allow only links that start with `https://` or `http://`.",
    ),
    code(
      "jsx",
      "Safe and unsafe in JSX",
      [
        "// ✓ text: escaped by React",
        "<h2>{note.title}</h2>",
        "",
        "// ✗ HTML: nothing is escaped",
        "<div dangerouslySetInnerHTML={{",
        "  __html: note.content }} />",
        "",
        "// ✗ if link is javascript:steal()",
        "<a href={note.link}>Open</a>",
      ],
      {
        2: "what NoteCard does",
        5: "runs any script in content",
        9: "check the scheme before using it",
      },
    ),
    inTheNotesApp(
      "`NoteCard` shows the title and content with `{}`. There's no `innerHTML` or `dangerouslySetInnerHTML` anywhere in the front end.",
      { fileId: "frontend/src/components/NoteCard.jsx" },
    ),
  ),

  part(
    "sanitizer",
    "When users must write HTML",
    explain(
      "Sometimes users really need formatting: bold, lists, links in a rich text editor. Escaping would show the tags as text. Then use an [[html-sanitizer|HTML sanitizer]]: a library that removes scripts, event attributes and `javascript:` links and keeps safe tags. Use a maintained one like DOMPurify. Never write your own with a regex: attackers know more tricks than you can list.",
    ),
    code(
      "jsx",
      "Rich text through DOMPurify (not in the Notes App)",
      [
        'import DOMPurify from "dompurify";',
        "",
        "const clean = DOMPurify.sanitize(",
        "  note.html);",
        "",
        "<div dangerouslySetInnerHTML={{",
        "  __html: clean }} />",
      ],
      {
        3: '"<b>Hi</b><img onerror=…>" → "<b>Hi</b><img>"',
        7: "only the sanitized HTML is inserted",
      },
    ),
    keyPoints(
      "Plain text: escape it. That's almost always what you want.",
      "Real HTML from users: sanitize it with a library, then insert it.",
      "Sanitizing is a denylist inside: keep the library up to date.",
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Building HTML strings from data",
      wrong: ["card.innerHTML =", '  "<h2>" + note.title + "</h2>";'],
      problem:
        "Any HTML in the title becomes real elements, and event attributes like onerror run.",
      right: [
        'const h2 = document.createElement("h2");',
        "h2.textContent = note.title;",
        "card.append(h2);",
      ],
      why: "Build elements and set their text. The title can only ever be text.",
    }),
    mistake({
      title: "Escaping when saving instead of when showing",
      language: "jsx",
      wrong: ["await saveNote(escapeHtml(title));"],
      problem:
        "React escapes again, so `Tom & Jo` shows as `Tom &amp; Jo`. And other places that read the data, like an email or an export, get mangled text.",
      right: [
        "await saveNote(title);",
        "// escape where it's inserted:",
        "<h2>{note.title}</h2>",
      ],
      why: "Save the text as it was typed; escape it for the place it's shown.",
    }),
    mistake({
      title: "Trusting a link from a user",
      language: "jsx",
      wrong: ["<a href={note.link}>Open</a>"],
      problem:
        "`javascript:steal()` is a valid href. React only warns about it; clicking the link runs the script.",
      right: [
        "const ok = /^https?:\\/\\//.test(note.link);",
        "{ok && <a href={note.link}>Open</a>}",
      ],
      why: "Allowlist the scheme: only http and https links are shown.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    pageYourTurn({
      title: "Show titles as text",
      task: "The second note's title is an attack. The starter builds the list with `innerHTML`, so an image is created and its script runs. Change the loop to create each `<li>` with `createElement`, set its `textContent` to the title, and `append` it.",
      starter: [
        '<ul id="notes"></ul>',
        "<script>",
        "  const notes = [",
        '    { id: 1, title: "Milk" },',
        "    { id: 2, title: '<img src=x onerror=\"document.body.dataset.hacked=1\">' },",
        "  ];",
        '  const list = document.querySelector("#notes");',
        "  for (const note of notes) {",
        '    list.innerHTML += "<li>" + note.title + "</li>";',
        "  }",
        "</script>",
      ],
      checks: [
        { kind: "count", label: "Two notes", selector: "#notes li", count: 2 },
        {
          kind: "missing",
          label: "No image was created",
          selector: "#notes img",
        },
        {
          kind: "text",
          label: "The first title",
          selector: "#notes li:first-child",
          text: "Milk",
        },
        {
          kind: "text",
          label: "The attack is shown as text",
          selector: "#notes li:nth-child(2)",
          text: '<img src=x onerror="document.body.dataset.hacked=1">',
        },
        {
          kind: "missing",
          label: "The script never ran",
          selector: "body[data-hacked]",
        },
      ],
      hint: 'Inside the loop: `const li = document.createElement("li");`, then `li.textContent = note.title;` and `list.append(li);`.',
      solution: [
        '<ul id="notes"></ul>',
        "<script>",
        "  const notes = [",
        '    { id: 1, title: "Milk" },',
        "    { id: 2, title: '<img src=x onerror=\"document.body.dataset.hacked=1\">' },",
        "  ];",
        '  const list = document.querySelector("#notes");',
        "  for (const note of notes) {",
        '    const li = document.createElement("li");',
        "    li.textContent = note.title;",
        "    list.append(li);",
        "  }",
        "</script>",
      ],
    }),
    yourTurn({
      title: "Escape HTML",
      task: "Write `escapeHtml(text)` that replaces `&` with `&amp;`, `<` with `&lt;`, `>` with `&gt;`, `\"` with `&quot;` and `'` with `&#39;`. Mind the order.",
      starter: ["function escapeHtml(text) {", "  return text;", "}"],
      tests: [
        ['escapeHtml("Milk")', '"Milk"'],
        ['escapeHtml("<b>hi</b>")', '"&lt;b&gt;hi&lt;/b&gt;"'],
        ['escapeHtml("Tom & Jo")', '"Tom &amp; Jo"'],
        ['escapeHtml("&lt;")', '"&amp;lt;"'],
        ['escapeHtml(`"it\'s"`)', '"&quot;it&#39;s&quot;"'],
      ],
      hint: "Chain `replaceAll` calls, and do `&` first.",
      solution: [
        "function escapeHtml(text) {",
        "  return text",
        '    .replaceAll("&", "&amp;")',
        '    .replaceAll("<", "&lt;")',
        '    .replaceAll(">", "&gt;")',
        '    .replaceAll(\'"\', "&quot;")',
        '    .replaceAll("\'", "&#39;");',
        "}",
      ],
    }),
    yourTurn({
      title: "Only web links",
      task: "Write `safeLink(url)`: return `url` when it starts with `https://` or `http://` (any capitals), otherwise `null`. A `javascript:` link must never be returned.",
      starter: ["function safeLink(url) {", "  return url;", "}"],
      tests: [
        ['safeLink("https://example.com")', '"https://example.com"'],
        ['safeLink("HTTP://example.com")', '"HTTP://example.com"'],
        ['safeLink("javascript:steal()")', "null"],
        ['safeLink("JavaScript:steal()")', "null"],
      ],
      hint: "Lower-case a copy with `toLowerCase()`, then use `startsWith`.",
      solution: [
        "function safeLink(url) {",
        "  const lower = url.toLowerCase();",
        '  return lower.startsWith("https://") ||',
        '    lower.startsWith("http://")',
        "    ? url",
        "    : null;",
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("XSS cheat sheet", [
      [
        "XSS",
        "User text inserted as HTML runs as a script on your site.",
        "<img src=x onerror=steal()>",
      ],
      ["Stored XSS", "Saved, runs for every later viewer.", "a note title"],
      [
        "Reflected XSS",
        "Comes in the request, often a link, and is echoed back.",
        "/search?q=<script>…",
      ],
      [
        "Escape output",
        "Turn & < > \" ' into entities where text is inserted.",
        "&lt;b&gt;",
      ],
      ["Plain JS", "textContent, not innerHTML.", "h2.textContent = title"],
      [
        "React",
        "{} is safe; dangerouslySetInnerHTML isn't.",
        "<h2>{note.title}</h2>",
      ],
      ["Links", "Allow only http and https.", "✗ javascript:steal()"],
      [
        "Real HTML",
        "Sanitize with a library, never a regex.",
        "DOMPurify.sanitize(html)",
      ],
    ]),
    quickCheck(
      "Which line is safe for a title that came from a user?",
      [
        "el.innerHTML = note.title",
        "el.textContent = note.title",
        "dangerouslySetInnerHTML with the title",
      ],
      1,
      "`textContent` inserts the value as text, so any tags are shown, not run. The other two parse the title as HTML, so a hidden script would run.",
    ),
  ),
);
