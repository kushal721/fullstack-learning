import type { Topic } from "@fsl/shared";

// The Learning Tree (spec §4.1): the order a beginner should learn in.
// Content only — lookups live in lib/learning-tree.ts.
// Text may use `backticks` for code; the client renders them as inline code.

type TopicInput = Pick<Topic, "id" | "title" | "summary"> & Partial<Topic>;

/** Fills the fields that start empty, so each topic below stays readable. */
function topic(order: number, input: TopicInput): Topic {
  return {
    ...input,
    slug: input.slug ?? input.id,
    order,
    overview: input.overview ?? [],
    children: input.children ?? [],
    conceptIds: input.conceptIds ?? [],
    buildStepIds: input.buildStepIds ?? [],
  };
}

const topics: TopicInput[] = [
  {
    id: "how-the-web-works",
    conceptIds: ["how-the-web-works"],
    title: "How the Web Works",
    summary:
      "What happens between typing an address in the browser and seeing a page: browsers, servers, URLs and requests.",
    whereToStart:
      "Start here, even if you have never written code. This topic explains the two computers involved in every website, and everything after it builds on that picture.",
    overview: [
      "Every website involves at least two programs. The browser on your computer asks for something, and a server — a program running on another computer, often far away — answers. The internet is the network of cables and radio links that carries those questions and answers between them.",
      "When you type an address such as `https://example.com/notes`, the browser first finds out which computer `example.com` is (this lookup is called DNS), then sends that computer a request for `/notes`. The server sends back a response: an HTML page, some data, or an error. The browser turns that response into what you see.",
      "Our Notes App works exactly like this. The React code you will write runs in the browser; the Express code runs on a server; the notes themselves live in a database next to the server. Every time you save a note, a request travels from the browser to the server and a response travels back.",
      "Why start here? Because every later topic is one piece of this conversation. HTML, CSS and JavaScript are what the browser receives. HTTP is the language of the requests and responses. The backend and database are what answers on the other side.",
      "After this topic you will be able to describe, step by step, what happens between pressing Enter in the address bar and seeing a page — and you will know which part of the Notes App each later topic is about.",
    ],
  },
  {
    id: "html",
    conceptIds: [
      "html-document",
      "html-element",
      "html-semantic-structure",
      "html-form",
      "html-input",
      "html-button",
    ],
    title: "HTML",
    summary:
      "The structure of a web page: the elements that tell the browser what each piece of content is.",
    overview: [
      "HTML (HyperText Markup Language) is the text a browser reads to know what is on a page. It is not a programming language: it does not make decisions. It labels content — this is a heading, this is a paragraph, this is a button, this is a form.",
      "Each label is an element, written with tags like `<h1>Notes</h1>` or `<button>Save</button>`. Elements can contain other elements, so a page becomes a tree: a form contains inputs and a button; a list contains list items.",
      "Choosing the right element matters. A `<button>` can be reached with the keyboard and announced by screen readers; a `<div>` styled to look like a button cannot. A `<form>` lets the browser send its inputs together. Good HTML makes a page usable before any styling or code is added.",
      "In the Notes App, HTML is the skeleton of every screen: the login form, the list of notes, the note editor. In React we write it as JSX, which looks almost identical to HTML and is turned into real HTML elements in the browser.",
      "After this topic you will be able to build the structure of the Notes App's pages and explain why each element was chosen.",
    ],
  },
  {
    id: "css",
    conceptIds: [
      "css-selector",
      "css-box-model",
      "css-flexbox",
      "css-responsive",
    ],
    title: "CSS",
    summary:
      "How a page looks: colours, spacing and layout, and how the same page adapts to different screens.",
    overview: [
      "HTML says what is on the page; CSS (Cascading Style Sheets) says how it looks. Without CSS a page is black text on white, one element under the other. CSS adds colour, size, spacing, borders, and arranges elements side by side or in grids.",
      "A CSS rule has two parts: a selector that picks which elements to style (for example every `button`), and declarations that say what to change (`color: white; padding: 8px`). Every element is a rectangular box, and much of CSS is about the size of those boxes and the space around them.",
      "Layout tools such as flexbox let you line up items in a row or column and decide how they share space. Media queries let the same page rearrange itself on a phone and on a laptop, so you write one page instead of two.",
      "In the Notes App, CSS turns the plain form and list into a readable interface: note cards in a grid, a clear Save button, a layout that works on a phone. In this platform we use Tailwind CSS, which applies the same CSS through short class names written directly on elements.",
      "After this topic you will be able to style and lay out the Notes App's pages and make them work on small and large screens.",
    ],
  },
  {
    id: "javascript",
    title: "JavaScript",
    summary:
      "The language that makes pages respond to the user: variables, functions, events and talking to servers.",
    overview: [
      "HTML and CSS describe a page, but they cannot react to anything. JavaScript is a programming language that runs in the browser: it can store values, make decisions, respond when the user clicks or types, and change the page while it is open.",
      'The building blocks are small. Variables hold values. Functions are named steps you can run again and again. Events — a click, a key press, a form submit — let you say "when this happens, run that function". Together they turn a static page into an application.',
      "JavaScript can also talk to servers with `fetch()`. Because a server takes time to answer, these calls are asynchronous: the code asks, keeps the page responsive, and continues when the answer arrives. `async`/`await` lets you write that waiting in a readable way.",
      "The Notes App uses JavaScript everywhere. In the browser, a function like `handleSave()` runs when you submit the note form and calls `createNote()`, which sends the note to the server. On the server, Node.js runs JavaScript too, so one language covers both sides. This platform itself is written in TypeScript, which is JavaScript with type checking added.",
      "After this topic you will be able to write the functions and event handlers the Notes App needs and follow how one function calls another.",
    ],
  },
  {
    id: "git",
    title: "Git & GitHub",
    summary:
      "Saving the history of your project, working on changes safely in branches, and sharing code through pull requests.",
    overview: [
      'As a project grows you need to answer questions like "what changed?", "when did this break?" and "how do I try an idea without ruining what works?". Git is a tool that records snapshots of your project, called commits, so you can see every change and go back to any earlier version.',
      "A branch is a separate line of work. You create a branch for one change, commit to it, and the main version of the project stays untouched until the change is ready. If the idea fails, you simply delete the branch.",
      "GitHub stores a copy of your Git repository online. It lets others see your code, and its pull requests are where a change from a branch is reviewed, discussed and checked automatically before it is merged into the main branch.",
      "The Notes App is built this way, one small step at a time, and so is this platform: every change starts as a GitHub issue, happens on its own branch, and is merged through a pull request after the checks pass.",
      "After this topic you will be able to commit your work, use branches for each change, and open a pull request — the everyday workflow of professional developers.",
    ],
  },
  {
    id: "react",
    conceptIds: ["react-usestate"],
    title: "React",
    summary:
      "Building the interface from reusable components that update automatically when the application's data changes.",
    overview: [
      "With plain JavaScript, every time data changes you must find the right elements and update them by hand. In an app like the Notes App — where notes are added, edited and deleted — that quickly becomes error-prone. React lets you describe what the page should look like for the current data, and it updates the page for you when the data changes.",
      "You build the interface from components: functions that return a piece of UI, such as `NoteCard` or `NoteForm`. Components receive data through props and can be reused — the same `Button` component appears in the login form, the register form and the note form.",
      "Data that changes over time is called state. When you call a state setter such as `setNotes`, React re-runs the component and updates only what changed on screen. Functions like `useState` and `useEffect` are hooks: they let a component remember values and run code after it appears. You can also write your own hooks, like the Notes App's `useNotes`, to reuse that logic.",
      "In the Notes App, React is the entire frontend: the pages (Login, Register, Dashboard), the components inside them, and the code that sends requests to the backend. This platform's own interface is written in React too.",
      "After this topic you will be able to split a page into components, pass data between them, keep track of state with hooks, and explain how a click leads to an updated screen.",
    ],
  },
  {
    id: "http",
    conceptIds: ["http-post"],
    title: "HTTP & APIs",
    summary:
      "How the frontend and backend talk: requests, responses, methods, status codes and JSON.",
    overview: [
      "Two programs talking over a network need agreed rules, the same way a letter needs an address and a language both sides understand. HTTP is that set of rules for the web: the browser sends a request, and the server sends back a response.",
      'A request says what it wants with a method and a path: `GET /api/notes` means "give me the notes", `POST /api/notes` means "create a note". It can carry headers (extra information such as who is logged in) and a body (the data, for example the new note). The response has a status code — `200` OK, `201` Created, `404` Not Found, `401` Unauthorized — and usually a body too.',
      'Data in requests and responses is usually written as JSON, a text format that looks like JavaScript objects: `{ "title": "Shopping", "content": "Milk" }`. Both browser and server can read and write it.',
      "An API (Application Programming Interface) is the list of requests a server understands. The Notes App's backend offers an API — register, log in, list notes, create, update and delete notes — and the React frontend uses only that API; it never touches the database directly.",
      "After this topic you will be able to read any request and response, choose the right method and status code, and follow a note travelling from the browser to the server as JSON.",
    ],
  },
  {
    id: "backend",
    title: "Backend",
    summary:
      "The server side with Node.js and Express: receiving requests, applying rules and sending responses.",
    overview: [
      "The browser can't be trusted with everything: anyone can change the code running on their own computer. So the rules that matter — who may see which notes, what a valid note is, how data is stored — run on a backend, a program on a server that only you control.",
      "Node.js lets JavaScript run outside the browser, so the backend can be written in the same language as the frontend. Express is a small Node.js library for building web servers: you declare routes such as `POST /api/notes` and the function that should run when that request arrives.",
      "Between the request arriving and the response leaving, the backend does the real work. Middleware runs first for many routes — for example checking that the user is logged in. A controller then handles the specific request: it validates the input, talks to the database, and sends a response with the right status code.",
      "In the Notes App, the backend lives in `backend/src`: `server.js` starts Express, `routes/` maps URLs to controllers, `controllers/` contains the logic, and `middleware/authMiddleware.js` protects the notes routes.",
      "After this topic you will be able to build an Express server, add routes and middleware, and explain why each rule belongs on the server and not in the browser.",
    ],
  },
  {
    id: "databases",
    title: "Databases",
    summary:
      "Storing data so it survives a restart: tables, rows, relationships and SQL queries.",
    overview: [
      "A server's memory is wiped every time it restarts, and many servers may run at once. To keep notes safe and shared, the backend stores them in a database: a program designed to save data on disk, find it quickly, and keep it consistent even when many requests arrive at the same time.",
      "The Notes App uses PostgreSQL, a relational database. Data is kept in tables — one for `users`, one for `notes` — made of rows (one per user or note) and columns (such as `email` or `title`). Each row has a primary key, a unique `id`.",
      'Tables are connected through foreign keys: every note has a `user_id` column that points to the user who owns it. This expresses the relationship "a user has many notes" and lets the database refuse a note for a user who doesn\'t exist.',
      "You talk to the database in SQL, a language for asking questions and making changes: `SELECT` to read, `INSERT` to add, `UPDATE` to change, `DELETE` to remove (together called CRUD). The backend sends these queries with the user's input passed separately as parameters, never pasted into the SQL text — that is what keeps it safe from SQL injection.",
      "After this topic you will be able to design the Notes App's tables, write the queries its backend needs, and explain how a saved note survives a server restart.",
    ],
  },
  {
    id: "authentication",
    title: "Authentication",
    summary:
      "Knowing who the user is: registering, logging in, protecting passwords and remembering a logged-in user.",
    overview: [
      "Notes are private, so the backend must know who is making each request. Authentication is how a user proves who they are — usually with an email address and a password — and how the server remembers that proof on later requests.",
      "Passwords are never stored as they are typed. When a user registers, the backend runs the password through a hash function (bcrypt in the Notes App), which produces a scrambled value that cannot be turned back into the password. At login, the typed password is hashed the same way and compared. If the database ever leaks, the real passwords are not in it.",
      "Because HTTP doesn't remember anything between requests, the server gives a logged-in browser a token — in the Notes App a signed JWT stored in a cookie. The browser sends the cookie with every request, and the backend's `authMiddleware` checks it to find out who the user is.",
      "In the Notes App, authentication covers the Register and Login pages, the `/api/auth` routes, the `users` table's `password_hash` column, and the middleware in front of every notes route.",
      "After this topic you will be able to implement registration, login and logout, and explain why passwords are hashed and how a server recognises a returning user.",
    ],
  },
  {
    id: "security",
    title: "Security",
    summary:
      "Keeping users and data safe: authorization, validating input and avoiding common attacks.",
    overview: [
      "Knowing who a user is (authentication) is not the same as knowing what they may do. Authorization answers the second question: in the Notes App, a logged-in user may only read, change or delete their own notes. The backend enforces this in every query by checking the note's `user_id`.",
      "Every piece of input from the browser could be wrong or hostile. The backend validates it — is the title present, is it too long? — before using it. Queries pass input as parameters to prevent SQL injection, and React escapes text it displays to prevent cross-site scripting (XSS).",
      "Other protections are about how data travels and where secrets live. HTTPS encrypts traffic between browser and server. Cookies are marked `httpOnly`, `Secure` and `SameSite` so scripts can't read them and other sites can't misuse them. Secrets like the JWT signing key live in environment variables, never in the code.",
      "Good error handling is security too: users get a short, helpful message, while details such as stack traces stay in the server logs where attackers can't see them.",
      "This topic is not a full security course. It covers the protections the Notes App actually needs, shows exactly where in the code each one lives, and explains what would go wrong without it.",
    ],
  },
  {
    id: "testing",
    title: "Testing",
    summary:
      "Checking automatically that the application still works after every change.",
    overview: [
      "Every change risks breaking something that used to work. Clicking through the whole app by hand after each change is slow and easy to forget. Automated tests are small programs that use your code and check the results, so the computer re-checks everything in seconds.",
      "Tests come in sizes. Unit tests check one function on its own — for example, that note validation rejects an empty title. Integration tests check several parts together — for example, that `POST /api/notes` really stores a note and returns `201`. End-to-end tests drive a real browser through the app like a user would.",
      "Tests pay off most when they run automatically. In this project, every pull request runs the tests on GitHub (continuous integration), and a change can only be merged when they pass.",
      "For the Notes App you will test the validation rules, the API routes (including the error cases, like reading someone else's note), and a component or two in the frontend.",
      "After this topic you will be able to decide what is worth testing, write unit and API tests, and use them to change code with confidence.",
    ],
  },
  {
    id: "deployment",
    title: "Deployment",
    summary:
      "Turning the project on your computer into a live website anyone can visit.",
    overview: [
      "While you develop, the Notes App runs only on your computer at `localhost`. Deployment is the process of running it on a server that is always on and reachable from the internet, with a real address and HTTPS.",
      "First the code is built for production: the React frontend is compiled into small static files, and the backend is prepared to run with `node`. Settings that differ between your laptop and the server — the database address, the JWT secret — come from environment variables, so the same code runs in both places.",
      "Docker packages the application and everything it needs into an image that runs the same way everywhere. A hosting service runs that image, and the database runs as a managed service next to it.",
      "With CI/CD, merging a pull request can deploy automatically: the tests run, an image is built and published, the host starts the new version, and a health check confirms it is working. This platform is deployed exactly that way.",
      "After this topic you will be able to prepare the Notes App for production, choose where each part runs, and explain the path from `git push` to a live website.",
    ],
  },
  {
    id: "how-everything-connects",
    title: "How Everything Connects",
    summary:
      "Following one action from the button, through the backend and database, and back to the screen.",
    overview: [
      "Each earlier topic explained one layer. This topic puts them back together by following a single action — clicking Save on a new note — through every layer of the Notes App and back.",
      "The click fires a submit event; React calls `handleSave()`; that calls `createNote()` in `notesApi.js`, which uses `fetch()` to send `POST /api/notes` with the note as JSON and the login cookie attached. The request crosses the network over HTTPS.",
      "On the server, Express matches the route, `authMiddleware` identifies the user, the controller validates the note and runs a parameterized `INSERT` in PostgreSQL. The database stores the row with the user's `user_id` and returns it.",
      "The controller sends back `201 Created` with the saved note as JSON. In the browser, `createNote()` resolves, the `useNotes` hook adds the note to state, and React re-renders the list — the new note appears. If any step fails, you will see where the error is caught and what the user is shown.",
      "After this topic you will be able to trace any feature of the Notes App from the screen to the database and back, and explain why each layer exists — which is the goal of this whole platform.",
    ],
  },
];

export const learningTree: Topic = topic(0, {
  id: "full-stack-development",
  title: "Full-Stack Development",
  summary:
    "Everything needed to build a web application, from an empty folder to a deployed website.",
  whereToStart:
    "New to programming? Begin with How the Web Works, then follow the topics in order — each one builds on the one before. You can also jump into the Build Journey and come back to a topic whenever a step introduces something new.",
  overview: [
    "A full-stack developer builds every layer of a web application: the frontend that runs in the browser, the backend that runs on a server, and the database that stores the data — plus the tools to test and deploy it.",
    "These topics follow the order you need them while building the Notes App, from how the web works to how every layer connects.",
  ],
  children: topics.map((input, index) => topic(index + 1, input)),
});
