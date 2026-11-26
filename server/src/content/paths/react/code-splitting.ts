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

// Code splitting and Suspense: one big bundle, dynamic import, lazy and
// Suspense taken apart, opening a lazy screen step by step, where to split,
// placing Suspense boundaries, error boundaries, Suspense for data, the
// Notes App, mistakes, practice and a recap.
export const codeSplittingModule = moduleLesson(
  "code-splitting",
  "Code splitting and Suspense",
  45,
  [
    "Explain why one large JavaScript bundle slows the first visit.",
    "Split code with dynamic import() and load components with lazy.",
    "Show a fallback while code loads with Suspense, and place boundaries well.",
    "Catch a failed load with an error boundary.",
    "Decide which parts of an app are worth splitting.",
  ],

  part(
    "bundle",
    "One big bundle",
    explain(
      "When you build a React app, [[vite|Vite]] bundles all your code and libraries into JavaScript files. By default everything ends up in what the first page downloads: the settings screen, the chart library, the rich text editor. Visitors pay for all of it before seeing anything, even if they never open those screens.",
    ),
    diagram([
      ["first visit", "downloads everything"],
      ["parse and run", "on a slow phone, seconds"],
      ["the page appears", "late"],
    ]),
  ),

  part(
    "dynamic-import",
    "Loading code when it's needed",
    explain(
      'A normal `import` at the top of a file is bundled in. Calling `import("./Chart.jsx")` as a function is a *dynamic import*: it returns a promise, and Vite puts that file and what only it uses into a separate file, a chunk, loaded the first time the import runs. That\'s [[code-splitting|code splitting]].',
    ),
    code(
      "js",
      "Static and dynamic",
      [
        'import { formatDate } from "./dates.js";',
        "",
        "async function showChart() {",
        '  const { drawChart } = await import("./chart.js");',
        "  drawChart(data);",
        "}",
      ],
      {
        1: "in the main bundle, loaded up front",
        4: "its own chunk, downloaded on first use",
      },
    ),
  ),

  part(
    "anatomy",
    "lazy and Suspense, taken apart",
    explain(
      "For components, React wraps this up. [[react-lazy|lazy]] takes a function that imports a component's file and gives you a component that loads it on first render. [[suspense|Suspense]] shows a fallback while anything inside it is still loading.",
    ),
    anatomy(
      "A lazily loaded screen",
      [
        "const Settings = lazy(() =>",
        '  import("./Settings.jsx"),',
        ");",
        "<Settings />",
      ],
      [
        ["lazy(", "lazy", "Declared once, at the top level of the file."],
        [
          'import("./Settings.jsx")',
          "the chunk",
          "Loaded the first time Settings renders. The file needs a default export.",
        ],
        [
          "<Settings />",
          "used normally",
          "Like any component. While it loads, the nearest Suspense shows its fallback.",
        ],
      ],
    ),
  ),

  part(
    "step-by-step",
    "Opening a lazy screen, step by step",
    explain(
      "Splitting by route is the most common use: each screen's code loads when someone goes there. Follow a first visit to the settings screen, then a second:",
    ),
    trace(
      "Going to /settings",
      [
        "const Settings = lazy(() =>",
        '  import("./Settings.jsx"),',
        ");",
        "function App() {",
        "  return (",
        "    <Suspense fallback={<Spinner />}>",
        "      <Routes>",
        '        <Route path="/" element={<Home />} />',
        '        <Route path="/settings"',
        "          element={<Settings />} />",
        "      </Routes>",
        "    </Suspense>",
        "  );",
        "}",
      ],
      [
        {
          line: 8,
          note: "On `/` only the main bundle has downloaded. The settings code isn't loaded.",
          vars: [["Settings chunk", "not loaded"]],
        },
        {
          line: 10,
          note: "You click Settings. React renders `<Settings />`, and lazy starts the import: a request for the chunk.",
          vars: [["Settings chunk", "downloading"]],
        },
        {
          line: 6,
          note: "Settings isn't ready, so it *suspends*. React shows the nearest Suspense's fallback instead.",
          output: "(spinner)",
        },
        {
          line: 10,
          note: "The chunk arrives. React renders Settings in place of the fallback.",
          vars: [["Settings chunk", "loaded"]],
          output: "<h1>Settings</h1>",
        },
        {
          line: 1,
          note: "Next time, lazy already has the component, so Settings renders straight away, with no fallback.",
          vars: [["Settings chunk", "cached"]],
        },
      ],
    ),
  ),

  part(
    "where",
    "What's worth splitting",
    explain(
      "Each chunk is one more request, so split where it saves a lot: screens most visitors don't open, and big libraries used in one place. Don't split small components that are on screen anyway; they'd only arrive later.",
    ),
    reference("Where to split", [
      [
        "Routes",
        "Each screen loads when visited.",
        'lazy(() => import("./Settings.jsx"))',
      ],
      [
        "Heavy libraries",
        "Charts, editors, maps.",
        "the editor loads when you click Edit",
      ],
      ["Rare dialogs", "Big, and rarely opened.", "an export wizard"],
      ["Not", "Small parts shown on every page.", "Button, Navbar ✗"],
    ]),
    quickCheck(
      "Which is the best candidate for lazy loading?",
      [
        "The Navbar, shown on every screen",
        "A rich text editor used only when editing a note",
        "The Button component",
      ],
      1,
      "The editor is large and only needed sometimes, so most visits skip it. Splitting the Navbar or Button would only delay what every page needs.",
    ),
  ),

  part(
    "boundaries",
    "Placing Suspense boundaries",
    explain(
      "The fallback replaces *everything* inside its Suspense. One boundary around the whole app means the navbar disappears whenever a screen loads. Put boundaries around the part that's loading, so the rest of the page stays put. Boundaries can nest; the nearest one above the loading component wins.",
    ),
    code(
      "jsx",
      "The navbar stays while the screen loads",
      [
        "<>",
        "  <Navbar />",
        "  <Suspense fallback={<p>Loading…</p>}>",
        "    <Routes>…</Routes>",
        "  </Suspense>",
        "</>",
      ],
      {
        2: "outside the boundary: always visible",
        3: "only the screen area shows the fallback",
      },
    ),
  ),

  part(
    "errors",
    "When loading fails",
    explain(
      "A chunk can fail to load: the network drops, or you deployed a new version and the old chunk is gone. The failure is thrown while rendering, and only an [[error-boundary|error boundary]] can catch that: a component that shows a fallback when something inside it throws. Most apps use the small `react-error-boundary` library.",
    ),
    code(
      "jsx",
      "Loading and failing, both handled",
      [
        'import { ErrorBoundary } from "react-error-boundary";',
        "",
        "<ErrorBoundary",
        "  fallback={<p>Couldn't load. Refresh to try again.</p>}",
        ">",
        "  <Suspense fallback={<p>Loading…</p>}>",
        "    <Settings />",
        "  </Suspense>",
        "</ErrorBoundary>",
      ],
      {
        4: "if anything inside throws while rendering",
        6: "while it's loading",
      },
    ),
    keyPoints(
      "Suspense: still loading.",
      "Error boundary: it failed.",
      "Use both around code that loads.",
    ),
  ),

  part(
    "data",
    "Suspense for data",
    explain(
      "Suspense isn't only for code. Data libraries and frameworks can make a component suspend while its data loads, and React 19's `use(promise)` reads a promise's result the same way. Then the same fallbacks cover code and data. Without one of those, keep the `isLoading` state from the effects module.",
    ),
  ),

  part(
    "notes-app",
    "The Notes App's bundle",
    explain(
      "The Notes App is three small screens, so `vite build` makes one JavaScript file and splitting would only add requests. If it grew a rich text editor or a charts page, those would be the first things to load with `lazy`. Vite needs no setup for that: every dynamic import becomes a chunk.",
    ),
    inTheNotesApp(
      "`vite.config.js` has no splitting settings: Vite splits automatically wherever the code uses import().",
      { fileId: "frontend/vite.config.js" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Calling lazy inside a component",
      language: "jsx",
      wrong: [
        "function App() {",
        '  const Settings = lazy(() => import("./Settings.jsx"));',
      ],
      problem:
        "Every render makes a new lazy component, so React throws away the old one, suspends again and loses its state.",
      right: [
        'const Settings = lazy(() => import("./Settings.jsx"));',
        "function App() { … }",
      ],
      why: "Declare lazy components at the top level of the file.",
    }),
    mistake({
      title: "No Suspense above a lazy component",
      language: "jsx",
      wrong: [
        "<Routes>",
        '  <Route path="/settings" element={<Settings />} />',
        "</Routes>",
      ],
      problem:
        "When Settings suspends there's no fallback to show, so React can't render it.",
      right: [
        "<Suspense fallback={<Spinner />}>",
        "  <Routes>…</Routes>",
        "</Suspense>",
      ],
      why: "Every lazy component needs a Suspense somewhere above it.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "Load it once",
      task: "Write `loadOnce(loader)`, which returns a function. The first call runs `loader()` and keeps the promise; later calls return that same promise without calling `loader` again. `lazy` does this with your import.",
      starter: ["function loadOnce(loader) {", "", "}"],
      tests: [
        ["loadOnce(() => Promise.resolve(42))()", "42"],
        [
          "(async () => { let calls = 0; const get = loadOnce(async () => { calls++; return 'Settings'; }); await get(); await get(); return calls; })()",
          "1",
        ],
      ],
      hint: "Keep `let promise = null;` outside. In the returned function: `if (!promise) promise = loader(); return promise;`",
      solution: [
        "function loadOnce(loader) {",
        "  let promise = null;",
        "  return () => {",
        "    if (!promise) promise = loader();",
        "    return promise;",
        "  };",
        "}",
      ],
    }),
    pageYourTurn({
      title: "Loading, failed or ready",
      task: "`render()` should show `Loading…` while `state.status` is `loading`, `Couldn't load` when it's `error`, and `<h1>Settings</h1>` when it's `ready`. The buttons pretend the chunk arrived or failed.",
      starter: [
        '<button id="arrive">Chunk arrives</button> <button id="fail">Load fails</button>',
        '<div id="view"></div>',
        "<script>",
        '  const state = { status: "loading" };',
        '  const view = document.querySelector("#view");',
        "  function render() {",
        "",
        "  }",
        "  function set(status) { state.status = status; render(); }",
        '  document.querySelector("#arrive").onclick = () => set("ready");',
        '  document.querySelector("#fail").onclick = () => set("error");',
        "  render();",
        "</script>",
      ],
      checks: [
        {
          kind: "text",
          label: "The fallback first",
          selector: "#view",
          text: "Loading…",
        },
        { kind: "click", label: "Make it fail", selector: "#fail" },
        {
          kind: "text",
          label: "The error",
          selector: "#view",
          text: "Couldn't load",
        },
        { kind: "click", label: "Make it arrive", selector: "#arrive" },
        {
          kind: "text",
          label: "The screen",
          selector: "#view h1",
          text: "Settings",
        },
      ],
      hint: 'Use `if`s on `state.status` and set `view.innerHTML`, e.g. `view.innerHTML = "<h1>Settings</h1>";`',
      solution: [
        '<button id="arrive">Chunk arrives</button> <button id="fail">Load fails</button>',
        '<div id="view"></div>',
        "<script>",
        '  const state = { status: "loading" };',
        '  const view = document.querySelector("#view");',
        "  function render() {",
        '    if (state.status === "loading") view.textContent = "Loading…";',
        '    if (state.status === "error") view.textContent = "Couldn\'t load";',
        '    if (state.status === "ready") view.innerHTML = "<h1>Settings</h1>";',
        "  }",
        "  function set(status) { state.status = status; render(); }",
        '  document.querySelector("#arrive").onclick = () => set("ready");',
        '  document.querySelector("#fail").onclick = () => set("error");',
        "  render();",
        "</script>",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Code splitting cheat sheet", [
      ["Bundle", "All code the first page downloads.", "smaller is faster"],
      [
        "import()",
        "Load a file later, as its own chunk.",
        'await import("./chart.js")',
      ],
      [
        "lazy",
        "A component that loads its code on first render.",
        'lazy(() => import("./Settings.jsx"))',
      ],
      ["Suspense", "A fallback while loading.", "<Suspense fallback={…}>"],
      ["Boundaries", "Around the part that loads.", "keep the navbar outside"],
      [
        "Error boundary",
        "A fallback when loading fails.",
        "<ErrorBoundary fallback={…}>",
      ],
      ["Split", "Routes and heavy, rare things.", "editor, charts"],
      ["Top level", "Declare lazy outside components.", "const X = lazy(…)"],
    ]),
    quickCheck(
      "A lazy screen's chunk fails to download. What shows the user a message?",
      [
        "The Suspense fallback",
        "An error boundary around it",
        "Nothing can: the app crashes",
      ],
      1,
      "Suspense only covers waiting. A failed load throws while rendering, and an error boundary above it catches that and shows its fallback.",
    ),
  ),
);
