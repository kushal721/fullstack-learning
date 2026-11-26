import {
  anatomy,
  code,
  diagram,
  explain,
  inTheNotesApp,
  mistake,
  moduleLesson,
  pageYourTurn,
  part,
  quickCheck,
  reference,
  trace,
  yourTurn,
} from "../blocks.js";

// Routing: one page with many screens, switching screens with state (the
// Notes App), what a router does underneath, React Router's routes taken
// apart, links and navigating in code, a URL with a parameter step by
// step, layouts, not-found and protected routes, the server fallback,
// mistakes, practice and a recap.
export const routingModule = moduleLesson(
  "routing",
  "Routing: screens and URLs",
  50,
  [
    "Explain how a single-page app shows different screens without loading new pages.",
    "Compare switching screens with state and routing with the URL.",
    "Define routes with React Router, including a parameter like /notes/:id.",
    "Navigate with Link and useNavigate, and read parameters with useParams.",
    "Add a layout, a not-found page and a protected route, and configure the server's fallback.",
  ],

  part(
    "spa",
    "One page, many screens",
    explain(
      "A React app is a [[single-page-app|single-page app]]: the server sends one HTML page and the JavaScript, then React swaps screens itself, without asking for a new page. It's fast, but the browser's address bar, Back button and bookmarks know nothing about your screens unless you tell them.",
    ),
    diagram([
      ["first visit", "index.html + JavaScript"],
      ["click a link", "no new page is loaded"],
      ["React swaps", "the screen and the URL"],
      ["Back button", "the previous screen"],
    ]),
  ),

  part(
    "by-state",
    "Switching screens with state",
    explain(
      "The simplest approach is a piece of state saying which screen to show, and conditional rendering. With a few screens and nothing worth bookmarking, that's enough. But the URL never changes: Back leaves the app, and you can't link someone to a screen.",
    ),
    code(
      "jsx",
      "Three screens, no router",
      [
        'const [page, setPage] = useState("login");',
        "",
        "return (",
        "  <>",
        '    {page === "login" && <Login />}',
        '    {page === "register" && <Register />}',
        '    {page === "dashboard" && <Dashboard />}',
        "  </>",
        ");",
      ],
      {
        1: "which screen: just state",
        5: "one shown at a time",
      },
    ),
    inTheNotesApp(
      "`App` switches between login, register and dashboard with a `page` state, and needs no router library.",
      { fileId: "frontend/src/App.jsx" },
    ),
  ),

  part(
    "underneath",
    "What a router does",
    explain(
      "[[client-side-routing|Client-side routing]] makes the URL the source of truth. On a link click the router stops the browser loading a page, changes the URL with `history.pushState`, and renders the screen that matches. When you press Back the browser fires `popstate`, and the router renders the matching screen again.",
    ),
    code(
      "js",
      "The idea, without a library",
      [
        "function navigate(path) {",
        '  history.pushState(null, "", path);',
        "  render(path);",
        "}",
        "",
        'window.addEventListener("popstate", () => {',
        "  render(location.pathname);",
        "});",
      ],
      {
        2: "change the URL without loading a page",
        6: "Back and Forward",
      },
    ),
  ),

  part(
    "routes",
    "Routes, taken apart",
    explain(
      "[[react-router|React Router]] is the most used routing library. You list routes: a URL pattern and the element to show for it. A part starting with `:` is a [[route-parameter|parameter]] that matches anything, like the id in `/notes/7`.",
    ),
    anatomy(
      "A route table",
      [
        "<Routes>",
        '  <Route path="/notes/:id"',
        "    element={<NoteView />} />",
        "</Routes>",
      ],
      [
        [
          "<Routes>",
          "the table",
          "Shows the first route whose path matches the URL.",
        ],
        [
          '"/notes/',
          "pattern",
          "The fixed part of the URLs this route matches.",
        ],
        [":id", "parameter", "Matches any value: /notes/7, /notes/42."],
        [
          "element={<NoteView />}",
          "screen",
          "What to render when the route matches.",
        ],
      ],
    ),
  ),

  part(
    "navigating",
    "Links and navigating in code",
    explain(
      "Use `<Link to>` instead of `<a href>`: it renders a real link, so it's still keyboard- and screen-reader-friendly, but changes the screen without reloading. To move after something happens, like a save, call the function from `useNavigate`.",
    ),
    code(
      "jsx",
      "Two ways to move",
      [
        "<Link to={`/notes/${note.id}`}>{note.title}</Link>",
        "",
        "const navigate = useNavigate();",
        "async function handleSave(event) {",
        "  event.preventDefault();",
        "  const note = await createNote({ title });",
        "  navigate(`/notes/${note.id}`);",
        "}",
      ],
      {
        1: "a real <a>, but no page load",
        7: "go to the new note once it's saved",
      },
    ),
  ),

  part(
    "step-by-step",
    "A URL with a parameter, step by step",
    explain(
      "Someone opens a link to `/notes/7`. Follow it from the address bar to the note on screen:",
    ),
    trace(
      "Opening /notes/7",
      [
        "<Routes>",
        '  <Route path="/"',
        "    element={<Dashboard />} />",
        '  <Route path="/notes/:id"',
        "    element={<NoteView />} />",
        "</Routes>",
        "",
        "function NoteView() {",
        "  const { id } = useParams();",
        "  const note = useNote(id);",
        "  if (!note) return <p>Loading…</p>;",
        "  return <h1>{note.title}</h1>;",
        "}",
      ],
      [
        {
          line: 2,
          note: "The router compares the URL with each route in order. `/` doesn't match `/notes/7`.",
          vars: [["URL", "/notes/7"]],
        },
        {
          line: 4,
          note: "`/notes/:id` matches, with `id` standing for 7. The router renders `NoteView`.",
          vars: [["params", '{ id: "7" }']],
        },
        {
          line: 9,
          note: "`useParams` hands the component the parameters. Note the quotes: from a URL, it's always text.",
          vars: [["id", '"7"']],
        },
        {
          line: 11,
          note: "The note is still loading, so the first render shows Loading.",
          output: "Loading…",
        },
        {
          line: 12,
          note: "When it arrives, the note's title is shown. Copy the URL and anyone can open the same screen.",
          vars: [["note", '{ id: 7, title: "Milk" }']],
          output: "<h1>Milk</h1>",
        },
      ],
    ),
  ),

  part(
    "layouts",
    "Layouts, not found, and logged-in only",
    explain(
      "Routes can nest: a parent route draws the parts every screen shares, like the navigation, and `<Outlet />` marks where the child screen goes. A `*` path catches every URL nothing else matched. And a route can send people elsewhere with `<Navigate>`, for example to the login page if nobody's logged in.",
    ),
    code(
      "jsx",
      "Shared layout, a fallback, a guard",
      [
        "<Route element={<Layout />}>",
        '  <Route path="/" element={<Dashboard />} />',
        '  <Route path="*" element={<NotFound />} />',
        "</Route>",
        "",
        "function Dashboard() {",
        '  if (!user) return <Navigate to="/login" />;',
        "  // …",
        "}",
      ],
      {
        1: "Layout renders the navbar and an <Outlet />",
        3: "any other URL",
        7: "logged out? go to login",
      },
    ),
    quickCheck(
      "A page is hidden from logged-out users by a `<Navigate>` in React. Is the data on it safe?",
      [
        "Yes, they can't reach the page",
        "No: the API must check who's asking, too",
        "Only on HTTPS",
      ],
      1,
      "Anything in the browser can be bypassed. The redirect is for convenience; the server must refuse to send private data to people who aren't logged in.",
    ),
  ),

  part(
    "server",
    "The server's part: a fallback",
    explain(
      "Client-side routes only exist in JavaScript. If someone refreshes on `/notes/7`, the browser asks the *server* for `/notes/7`, and a plain [[static-hosting|static host]] answers 404. Configure it to send `index.html` for any path that isn't a real file; React Router then reads the URL and shows the right screen.",
    ),
    reference("Making deep links work", [
      [
        "The symptom",
        "Links work, but refreshing gives 404.",
        "GET /notes/7 → 404",
      ],
      [
        "The fix",
        "Serve index.html for unknown paths.",
        "a rewrite or fallback rule",
      ],
      [
        "Express",
        "A catch-all after the API and static files.",
        "app.use((req, res) => res.sendFile(indexHtml))",
      ],
      ["Keep API 404s", "Only fall back for page URLs.", "/api/… still 404s"],
    ]),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "A plain link inside the app",
      language: "jsx",
      wrong: ['<a href="/notes/7">Milk</a>'],
      problem:
        "The browser loads the whole app again from the server: slower, and all state is lost.",
      right: ['<Link to="/notes/7">Milk</Link>'],
      why: "Use the router's Link for links inside the app.",
    }),
    mistake({
      title: "Treating a parameter as a number",
      language: "jsx",
      wrong: ["const { id } = useParams();", "notes.find((n) => n.id === id);"],
      problem:
        '`id` is the text "7" and `n.id` the number 7, so nothing is ever found.',
      right: [
        "const id = Number(useParams().id);",
        "notes.find((n) => n.id === id);",
      ],
      why: "Everything from a URL is text: convert it.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "Match a route",
      task: 'Write `matchRoute(pattern, path)`. If they match, return the parameters as an object; if not, `null`. Parts starting with `:` match anything: `matchRoute("/notes/:id", "/notes/7")` is `{ id: "7" }`.',
      starter: ["function matchRoute(pattern, path) {", "", "}"],
      tests: [
        ['matchRoute("/notes/:id", "/notes/7")', '{ id: "7" }'],
        ['matchRoute("/about", "/about")', "{}"],
        ['matchRoute("/notes/:id", "/users/7")', "null"],
        ['matchRoute("/notes/:id", "/notes")', "null"],
      ],
      hint: "Split both on `/`. Different lengths: null. Then for each part: if the pattern's starts with `:`, store it; otherwise they must be equal.",
      solution: [
        "function matchRoute(pattern, path) {",
        '  const want = pattern.split("/");',
        '  const got = path.split("/");',
        "  if (want.length !== got.length) return null;",
        "  const params = {};",
        "  for (let i = 0; i < want.length; i++) {",
        '    if (want[i].startsWith(":")) params[want[i].slice(1)] = got[i];',
        "    else if (want[i] !== got[i]) return null;",
        "  }",
        "  return params;",
        "}",
      ],
    }),
    pageYourTurn({
      title: "A tiny router",
      task: "Finish `navigate(path)`: store the path in `state.path` and render. In the nav's click handler, stop the browser following the link, then navigate to the link's `data-to`.",
      starter: [
        '<nav><a href="/" data-to="/">Home</a> <a href="/about" data-to="/about">About</a></nav>',
        '<main id="view"></main>',
        "<script>",
        '  const routes = { "/": "<h1>Your notes</h1>", "/about": "<h1>About</h1>" };',
        '  const state = { path: "/" };',
        "  function render() {",
        '    document.querySelector("#view").innerHTML = routes[state.path];',
        "  }",
        "  function navigate(path) {",
        "",
        "  }",
        '  document.querySelector("nav").addEventListener("click", (event) => {',
        '    const link = event.target.closest("a");',
        "",
        "  });",
        "  render();",
        "</script>",
      ],
      checks: [
        {
          kind: "text",
          label: "Home first",
          selector: "#view h1",
          text: "Your notes",
        },
        {
          kind: "click",
          label: "Click About",
          selector: 'a[data-to="/about"]',
        },
        {
          kind: "text",
          label: "About is shown",
          selector: "#view h1",
          text: "About",
        },
        { kind: "click", label: "Click Home", selector: 'a[data-to="/"]' },
        {
          kind: "text",
          label: "Home again",
          selector: "#view h1",
          text: "Your notes",
        },
      ],
      hint: "`navigate`: `state.path = path; render();`. In the handler: `event.preventDefault(); navigate(link.dataset.to);`",
      solution: [
        '<nav><a href="/" data-to="/">Home</a> <a href="/about" data-to="/about">About</a></nav>',
        '<main id="view"></main>',
        "<script>",
        '  const routes = { "/": "<h1>Your notes</h1>", "/about": "<h1>About</h1>" };',
        '  const state = { path: "/" };',
        "  function render() {",
        '    document.querySelector("#view").innerHTML = routes[state.path];',
        "  }",
        "  function navigate(path) {",
        "    state.path = path;",
        "    render();",
        "  }",
        '  document.querySelector("nav").addEventListener("click", (event) => {',
        '    const link = event.target.closest("a");',
        "    event.preventDefault();",
        "    navigate(link.dataset.to);",
        "  });",
        "  render();",
        "</script>",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Routing cheat sheet", [
      [
        "State switch",
        "Fine for a few unlinkable screens.",
        'page === "login" && <Login />',
      ],
      [
        "<Routes>",
        "Shows the route that matches.",
        '<Route path="/" element={…} />',
      ],
      [":id", "A parameter in the path.", '"/notes/:id"'],
      ["useParams", "Read parameters, as text.", "const { id } = useParams()"],
      ["<Link>", "Navigate without a reload.", '<Link to="/about">'],
      ["useNavigate", "Navigate from code.", 'navigate("/")'],
      ["<Outlet />", "Where a layout puts child routes.", "nested routes"],
      ['path="*"', "Not found.", "<NotFound />"],
      [
        "Fallback",
        "The server sends index.html.",
        "deep links survive a refresh",
      ],
    ]),
    quickCheck(
      "Links in your app work, but refreshing on `/notes/7` gives a 404. What's wrong?",
      [
        "The route's pattern is wrong",
        "The server has no fallback to index.html for that path",
        "useParams isn't called",
      ],
      1,
      "On a refresh the browser asks the server for /notes/7. Only index.html knows the routes, so the server must send it for page URLs.",
    ),
  ),
);
