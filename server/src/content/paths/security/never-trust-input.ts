import {
  anatomy,
  code,
  diagram,
  explain,
  inTheNotesApp,
  keyPoints,
  mistake,
  moduleLesson,
  part,
  quickCheck,
  reference,
  trace,
  yourTurn,
} from "../blocks.js";

// Never trust input: what security means here, what counts as untrusted, a
// request taken apart, the attack surface, keeping data as data, trusted
// values step by step, saved data is still input, defence in depth, what the
// Notes App has and hasn't, mistakes, practice and a recap.
export const neverTrustInputModule = moduleLesson(
  "never-trust-input",
  "Never trust input",
  40,
  [
    "Explain what an attacker wants and why every request may come from one.",
    "List the untrusted parts of a request: path, query, headers, cookies and body.",
    "Describe the attack surface of the Notes App and how to keep it small.",
    "Take trusted values, such as the owner, from the server, never from the request.",
    "Explain defence in depth: several layers, so one miss isn't a disaster.",
  ],

  part(
    "what",
    "What security is about",
    explain(
      "Security means people can't read, change or break what isn't theirs. In the Notes App, that's other people's notes and accounts. An attacker doesn't need your front end: they send requests straight to the API with curl or a script, and they can put anything in them. So the server has to assume any request might be an attack.",
    ),
    diagram([
      ["Your React app", "one way to call the API"],
      ["curl, a script", "another way"],
      ["The API", "can't tell them apart"],
    ]),
    keyPoints(
      "The API only sees requests, not who wrote the code that sent them.",
      "Anyone can send any method, URL, header or body.",
      "Most attacks are ordinary requests with unusual values.",
    ),
  ),

  part(
    "untrusted",
    "What counts as untrusted input",
    explain(
      "[[untrusted-input|Untrusted input]] is any data your code didn't create itself. That's every part of a request, and also anything saved from one earlier, like a note another user wrote. Treat it as possibly hostile until it's checked, and keep it as data. Values your server makes itself, like `req.user` after the token is verified, are the ones you can trust.",
    ),
    reference("Where untrusted data comes from", [
      ["Path", "The URL path, including ids.", "/api/notes/abc"],
      ["Query string", "Everything after ?.", "?sort=desc;DROP"],
      ["Headers", "Any header, with any value.", "X-User-Id: 1"],
      ["Cookies", "Text the browser sends back; it can be edited.", "token=…"],
      [
        "Body",
        "Any JSON, with any fields and types.",
        '{ "title": ["a"], "user_id": 1 }',
      ],
      [
        "Saved data",
        "Rows written earlier from someone's input.",
        "another user's note title",
      ],
    ]),
    quickCheck(
      "Which of these values can the server trust without checking?",
      [
        "The X-User-Id header",
        "The user_id field in the body",
        "req.user.id, set after the token is verified",
      ],
      2,
      "Headers and bodies are written by whoever sends the request. `req.user.id` is set by your own middleware, only after `jwt.verify` checks the token's signature.",
    ),
  ),

  part(
    "request",
    "A request, taken apart",
    explain(
      "Look at one request the way an attacker does: every part is a place to put a value. The [[trust-boundary|trust boundary]] from Backend runs between this text and your code. Everything here crosses it, so nothing in it is believed until the server checks it.",
    ),
    anatomy(
      "Every part is chosen by the sender",
      [
        "POST /api/notes?sort=asc HTTP/1.1",
        "Cookie: token=eyJhbGci…",
        "Content-Type: application/json",
        '{ "title": "Hi", "user_id": 1 }',
      ],
      [
        ["/api/notes", "path", "Ids in it are text: /api/notes/abc is valid."],
        ["?sort=asc", "query", "Can be missing, repeated or anything else."],
        [
          "token=eyJhbGci…",
          "cookie",
          "Trusted only after jwt.verify checks its signature.",
        ],
        [
          "application/json",
          "header",
          "A claim about the body, not a promise.",
        ],
        ['"title": "Hi"', "a field", "Could be a number, an array or huge."],
        [
          '"user_id": 1',
          "an extra field",
          "Your form never sends it. An attacker can.",
        ],
      ],
    ),
  ),

  part(
    "surface",
    "The attack surface",
    explain(
      "The [[attack-surface|attack surface]] is every place an attacker can send data to your app: each route, each field, each header you read, each open port. The bigger it is, the more there is to defend. The Notes App's is small: nine routes, all JSON. Remove what you don't use, and check everything that stays.",
    ),
    code(
      "http",
      "The Notes App's whole API",
      [
        "GET    /api/health",
        "POST   /api/auth/register",
        "POST   /api/auth/login",
        "POST   /api/auth/logout",
        "GET    /api/auth/me",
        "GET    /api/notes",
        "POST   /api/notes",
        "PUT    /api/notes/:id",
        "DELETE /api/notes/:id",
      ],
      {
        1: "public, but returns only { status: 'ok' }",
        2: "public: email and password from anyone",
        6: "everything under /api/notes needs a login",
        8: ":id is text from the URL",
      },
    ),
    keyPoints(
      "Every new route or field makes the surface bigger.",
      "Delete old debug and test routes before you ship.",
      "Public routes, like login, need the most care.",
    ),
  ),

  part(
    "data-not-code",
    "Keep data as data",
    explain(
      "Most serious attacks have one cause: input pasted into code. Glue a title into SQL text and it can change the query. Put it into a page as HTML and it can run as a script. The habit that prevents them is always the same: pass input as a value, never as part of the code. The next steps show each case in detail.",
    ),
    code(
      "js",
      "Input as code vs input as data",
      [
        "// ✗ the title becomes part of the code",
        '"... WHERE title = \'" + title + "\'"',
        'li.innerHTML = "<b>" + title + "</b>";',
        "",
        "// ✓ the title stays a value",
        "pool.query(",
        '  "... WHERE title = $1", [title]);',
        "li.textContent = title;",
      ],
      {
        2: "a quote in the title ends the SQL string",
        3: "tags in the title become real elements",
        7: "a parameterized query: SQL can't change",
        8: "shown as text, whatever it contains",
      },
    ),
  ),

  part(
    "trusted-values",
    "Trusted values, step by step",
    explain(
      "Some values must never come from the request. The owner of a new note is the main one: if the body could choose it, anyone could write into anyone's account. Step through a request that tries. The title is taken from the body, but only after checking its type; the owner comes from `req.user`.",
    ),
    trace(
      "A body that tries to pick the owner",
      [
        "function buildNote(req) {",
        "  const t = req.body.title;",
        "  const title =",
        '    typeof t === "string" ? t.trim() : "";',
        "  const userId = req.user.id;",
        "  return { title, userId };",
        "}",
        "const req = {",
        '  body: { title: " Hi ", user_id: 1 },',
        "  user: { id: 42 },",
        "};",
        "buildNote(req);",
      ],
      [
        {
          line: 8,
          note: "The body is what the client sent, including a `user_id` it shouldn't. `user` was set by requireAuth from the verified cookie.",
          vars: [
            [
              "req",
              '{ body: { title: " Hi ", user_id: 1 }, user: { id: 42 } }',
            ],
          ],
        },
        {
          line: 2,
          note: "The title is read from the body. It's untrusted, so it isn't used yet.",
          vars: [
            [
              "req",
              '{ body: { title: " Hi ", user_id: 1 }, user: { id: 42 } }',
            ],
            ["t", '" Hi "'],
          ],
          stack: ["buildNote"],
        },
        {
          line: 3,
          note: "It's a string, so it's trimmed. A number or array would have become an empty title.",
          vars: [
            [
              "req",
              '{ body: { title: " Hi ", user_id: 1 }, user: { id: 42 } }',
            ],
            ["t", '" Hi "'],
            ["title", '"Hi"'],
          ],
          stack: ["buildNote"],
        },
        {
          line: 5,
          note: "The owner comes from `req.user`, which the server set. `req.body.user_id` is never read.",
          vars: [
            [
              "req",
              '{ body: { title: " Hi ", user_id: 1 }, user: { id: 42 } }',
            ],
            ["t", '" Hi "'],
            ["title", '"Hi"'],
            ["userId", "42"],
          ],
          stack: ["buildNote"],
        },
        {
          line: 6,
          note: "The note belongs to user 42, the person who is logged in. The attack did nothing.",
          vars: [
            [
              "req",
              '{ body: { title: " Hi ", user_id: 1 }, user: { id: 42 } }',
            ],
            ["t", '" Hi "'],
            ["title", '"Hi"'],
            ["userId", "42"],
          ],
          stack: ["buildNote"],
          output: '{ title: "Hi", userId: 42 }',
        },
      ],
    ),
  ),

  part(
    "saved-data",
    "Saved data is still input",
    explain(
      "A note in your own database feels safe: you saved it. But its title was typed by a user, maybe an attacker, so it's still untrusted when you read it back and show it to someone else. Checking on the way in and treating it as text on the way out are two separate jobs, and you need both.",
    ),
    diagram([
      ["Attacker", "saves a note"],
      ["Database", "keeps it as it was"],
      ["Another user", "views it later"],
    ]),
    keyPoints(
      "Data from your database came from input once.",
      "Check input when it arrives; treat it as text when it leaves.",
      "Data from other systems or files counts too.",
    ),
  ),

  part(
    "layers",
    "Defence in depth",
    explain(
      "No single check catches everything, and everyone makes mistakes. [[defence-in-depth|Defence in depth]] means stacking layers that each stop attacks on their own, so one missed check isn't a disaster. The Notes App already has several, as the scene at the start of this topic shows.",
    ),
    reference("The Notes App's layers", [
      ["Validation", "Wrong types and huge values get a 400.", "validateNote"],
      [
        "Parameterized queries",
        "Input can never change the SQL.",
        "VALUES ($1, $2, $3)",
      ],
      [
        "Text, not HTML",
        "React shows saved text as text.",
        "<h2>{note.title}</h2>",
      ],
      [
        "Ownership checks",
        "Every query is limited to your own notes.",
        "WHERE user_id = $2",
      ],
      [
        "Cookie flags",
        "httpOnly hides the token from scripts; SameSite keeps it on our site.",
        'sameSite: "lax"',
      ],
    ]),
    inTheNotesApp(
      "Every query in the notes controller uses placeholders and `req.user.id`: two layers in each line.",
      { fileId: "backend/src/controllers/notesController.js" },
    ),
  ),

  part(
    "not-yet",
    "What the Notes App doesn't have",
    explain(
      "The Notes App is small and careful, but not complete. It has no security headers (no helmet), no limit on login attempts, no CSRF tokens (it relies on SameSite cookies and never changing data on a GET), and no audit log or alerts: errors are only printed with `console.error`. Later steps show what each would look like.",
    ),
    inTheNotesApp(
      "`app.js` uses only `express.json()` and `cookieParser()`: no other security middleware.",
      { fileId: "backend/src/app.js" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Trusting a header to say who's asking",
      wrong: [
        'const userId = req.headers["x-user-id"];',
        "await listNotesFor(userId);",
      ],
      problem:
        "Anyone can send `X-User-Id: 1` with curl and read user 1's notes. A header is just text the sender chose.",
      right: ["const userId = req.user.id;", "await listNotesFor(userId);"],
      why: "Who's asking comes from a token the server signed and verified, never from a plain value in the request.",
    }),
    mistake({
      title: "Assuming the field is a string",
      wrong: ["const title = req.body.title.trim();"],
      problem:
        '`{ "title": 5 }` makes `.trim()` throw: a 500 instead of a 400. Other types can slip past checks written for strings.',
      right: [
        "const t = req.body?.title;",
        'const title = typeof t === "string"',
        '  ? t.trim() : "";',
      ],
      why: "JSON can carry numbers, arrays, objects or null in any field. Check the type before you use it.",
    }),
    mistake({
      title: "Trusting data because you saved it",
      wrong: ["card.innerHTML = note.title;"],
      problem:
        "The title came from a user. If it contains HTML with a script, it runs for everyone who views the note.",
      right: ["card.textContent = note.title;"],
      why: "Saved data is still untrusted input. Show it as text.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "The owner comes from the server",
      task: 'Write `buildNote(req)` that returns `{ title, content, userId }`. Take `title` and `content` from `req.body` (content defaults to `""`), and `userId` from `req.user.id`. Ignore anything else in the body, such as `user_id`.',
      starter: ["function buildNote(req) {", "  return { ...req.body };", "}"],
      tests: [
        [
          'buildNote({ body: { title: "Hi", content: "x" }, user: { id: 7 } })',
          '{ title: "Hi", content: "x", userId: 7 }',
        ],
        [
          'buildNote({ body: { title: "Hi", user_id: 1 }, user: { id: 7 } })',
          '{ title: "Hi", content: "", userId: 7 }',
        ],
        [
          'buildNote({ body: { title: "Hi", userId: 1 }, user: { id: 7 } })',
          '{ title: "Hi", content: "", userId: 7 }',
        ],
      ],
      hint: 'Destructure `const { title, content = "" } = req.body;` and use `req.user.id` for the owner.',
      solution: [
        "function buildNote(req) {",
        '  const { title, content = "" } = req.body;',
        "  return { title, content, userId: req.user.id };",
        "}",
      ],
    }),
    yourTurn({
      title: "Expect any type",
      task: 'Write `toTitle(value)`: the trimmed text when `value` is a string, otherwise `""`. Numbers, arrays, objects and `null` all give `""`.',
      starter: [
        "function toTitle(value) {",
        "  return String(value).trim();",
        "}",
      ],
      tests: [
        ['toTitle("  Milk ")', '"Milk"'],
        ["toTitle(5)", '""'],
        ['toTitle(["Milk"])', '""'],
        ['toTitle({ $ne: "" })', '""'],
        ["toTitle(null)", '""'],
      ],
      hint: 'Check `typeof value === "string"` first.',
      solution: [
        "function toTitle(value) {",
        '  return typeof value === "string"',
        "    ? value.trim()",
        '    : "";',
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Never trust input: cheat sheet", [
      [
        "Untrusted input",
        "Anything your code didn't create: every part of a request, and saved data.",
        "req.body, req.query, req.headers",
      ],
      [
        "Trusted values",
        "Made by your server after checking.",
        "req.user.id after jwt.verify",
      ],
      ["Trust boundary", "Where untrusted data enters your code.", "the API"],
      [
        "Attack surface",
        "Every route, field and header you accept. Keep it small.",
        "9 routes in the Notes App",
      ],
      [
        "Keep data as data",
        "Pass input as a value, never as part of SQL or HTML.",
        "$1, textContent, {title}",
      ],
      [
        "Defence in depth",
        "Several layers, each able to stop an attack alone.",
        "validation + placeholders + escaping",
      ],
    ]),
    quickCheck(
      "Validation already limits titles to 100 characters of text. Why does the Notes App still show titles as text, not HTML?",
      [
        "It doesn't need to; validation is enough",
        "A short, valid title can still contain a script: it's a second layer",
        "Because HTML is slower",
      ],
      1,
      "`<img src=x onerror=…>` is a valid 30-character title. Validation checks shape; showing it as text is a separate layer that stops the script. That's defence in depth.",
    ),
  ),
);
