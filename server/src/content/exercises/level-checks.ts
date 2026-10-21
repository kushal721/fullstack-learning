import type { PredictExercise } from "@fsl/shared";

// Questions for the guided paths' level checks. Each is a predict exercise,
// checked on the server like every other; the path says which step it tests.

type Question = {
  id: string;
  title: string;
  prompt: string;
  choices: string[];
  correct: number;
  conceptIds: string[];
  hint: string;
  explanation: string;
};

const question = (q: Question): PredictExercise => ({
  id: q.id,
  mode: "predict",
  title: q.title,
  prompt: q.prompt,
  choices: q.choices.map((text, i) => ({ id: "abcd"[i]!, text })),
  correctChoiceId: "abcd"[q.correct]!,
  conceptIds: q.conceptIds,
  hints: [q.hint],
  explanation: q.explanation,
});

export const levelCheckExercises: PredictExercise[] = [
  // How the Web Works: Basic
  question({
    id: "web-basic-client",
    title: "Who asks?",
    prompt: "What is a client?",
    choices: [
      "The computer that answers requests",
      "The program that asks for things, like your browser",
      "A database",
    ],
    correct: 1,
    conceptIds: ["how-the-web-works"],
    hint: "In a restaurant, are you the kitchen or the customer?",
    explanation:
      "The client is the side that asks: your browser, or a phone app. The server is the always-on computer that answers. Your browser is the client you use most.",
  }),
  question({
    id: "web-basic-query",
    title: "The end of a URL",
    prompt: "In `https://notes.app/notes?sort=new`, what is `?sort=new`?",
    choices: [
      "The server's name",
      "Extra options for the request (a query)",
      "The protocol",
    ],
    correct: 1,
    conceptIds: ["how-the-web-works"],
    hint: "Everything after the `?` is optional.",
    explanation:
      "The part after `?` is the query string: extra options for the request, such as sorting or searching. `notes.app` is the domain and `https` the protocol.",
  }),
  question({
    id: "web-basic-dns-down",
    title: "When DNS fails",
    prompt: "DNS is down. What happens when you open notes.app?",
    choices: [
      "The page loads slowly",
      "The browser can't find the server at all",
      "You see the page without colours",
    ],
    correct: 1,
    conceptIds: ["domain-dns", "how-the-web-works"],
    hint: "What does the browser need before it can send any request?",
    explanation:
      "The browser can only connect to an IP address. Without DNS it never learns the number behind notes.app, so it can't reach the server at all, not even slowly.",
  }),
  question({
    id: "web-basic-status-ok",
    title: "It worked",
    prompt: "Which status code means “it worked”?",
    choices: ["200", "404", "500"],
    correct: 0,
    conceptIds: ["http-status-codes"],
    hint: "Success codes start with a 2.",
    explanation:
      "The first digit gives the kind of answer: 2xx means success, and 200 is plain OK. 404 means the page wasn't found, and 500 means the server itself failed.",
  }),
  question({
    id: "web-basic-no-styles",
    title: "A page without styling",
    prompt:
      "A page shows all its text but no colours or layout. Which file most likely didn't load?",
    choices: ["The HTML", "The CSS", "The DNS answer"],
    correct: 1,
    conceptIds: ["how-the-web-works"],
    hint: "Which file controls how things look?",
    explanation:
      "The text is there, so the HTML arrived. Colours and layout come from the CSS, which is a separate file with its own request, and that one failed.",
  }),
  question({
    id: "web-basic-first-step",
    title: "The first thing that happens",
    prompt:
      "You type `notes.app` and press Enter. What does the browser do first?",
    choices: [
      "Sends `GET /` to the server",
      "Asks DNS for the server's IP address",
      "Draws the page",
    ],
    correct: 1,
    conceptIds: ["how-the-web-works", "domain-dns"],
    hint: "The browser can only connect to a number.",
    explanation:
      "Before any HTTP request can be sent, the browser needs the server's IP address, so it asks DNS first. Only then does it send `GET /` and draw what comes back.",
  }),

  // How the Web Works: Intermediate
  question({
    id: "web-intermediate-port",
    title: "The 3000 in a URL",
    prompt: "The Notes App API runs at `http://localhost:3000`. What is 3000?",
    choices: [
      "A port: which program on the computer gets the request",
      "The number of users",
      "The IP address",
    ],
    correct: 0,
    conceptIds: ["how-the-web-works"],
    hint: "One computer runs many programs; how does a message reach the right one?",
    explanation:
      "`localhost` names the computer, and 3000 is the port the API listens on: it picks which program on that computer gets the request. HTTPS sites use 443.",
  }),
  question({
    id: "web-intermediate-stateless",
    title: "Staying logged in",
    prompt:
      "HTTP doesn't remember earlier requests. How does the server know you're logged in on the next one?",
    choices: [
      "It remembers your IP address",
      "The browser sends a cookie with every request",
      "It doesn't; you log in every time",
    ],
    correct: 1,
    conceptIds: ["secure-cookies", "http-headers"],
    hint: "Something has to travel with every request.",
    explanation:
      "After you log in, the server sets a cookie. The browser sends it back with every later request, and the server uses it to find who you are, request after request.",
  }),
  question({
    id: "web-intermediate-no-store",
    title: "Cache-Control: no-store",
    prompt:
      "A response has `Cache-Control: no-store`. What does the browser do?",
    choices: ["Keeps it for an hour", "Never keeps a copy", "Blocks the page"],
    correct: 1,
    conceptIds: ["http-headers"],
    hint: "Read the value literally.",
    explanation:
      "`no-store` means no copy may be kept anywhere, so the browser fetches it fresh every time. That is right for private, changing data like your notes.",
  }),
  question({
    id: "web-intermediate-api",
    title: "What an API returns",
    prompt: "What does an API usually send back?",
    choices: [
      "JSON data for a program to use",
      "A finished page with styling",
      "An IP address",
    ],
    correct: 0,
    conceptIds: ["rest-endpoint", "json"],
    hint: "APIs are for programs, not people.",
    explanation:
      "Pages are for people; an API is for programs. It returns data, usually JSON, and the client (here the React app) decides how to show it.",
  }),

  // How the Web Works: Advanced
  question({
    id: "web-advanced-certificate",
    title: "What a certificate proves",
    prompt:
      "What does the server's certificate prove during the TLS handshake?",
    choices: [
      "That it really owns the domain",
      "That it has no bugs",
      "That it's fast",
    ],
    correct: 0,
    conceptIds: ["https"],
    hint: "Who signs a certificate, and what do they check?",
    explanation:
      "A certificate authority signs it only after checking who controls the domain, so the browser knows it reached the real site and not an impostor in between.",
  }),
  question({
    id: "web-advanced-cname",
    title: "CNAME records",
    prompt: "What does a CNAME record do?",
    choices: [
      "Points one name at another name",
      "Sets the server's port",
      "Stores the certificate",
    ],
    correct: 0,
    conceptIds: ["domain-dns"],
    hint: "C is for “canonical”: the real name.",
    explanation:
      "A CNAME says “this name is an alias for that one”, for example www.notes.app → notes.app. DNS follows it to the A record and the final IP address.",
  }),
  question({
    id: "web-advanced-cors",
    title: "Who enforces CORS",
    prompt: "Who enforces CORS?",
    choices: ["The server", "The browser", "DNS"],
    correct: 1,
    conceptIds: ["cors"],
    hint: "A request from curl is never blocked by CORS. Why?",
    explanation:
      "The server only sends headers saying which origins are allowed. The browser enforces them, deciding whether the page may read the response; curl ignores them.",
  }),
  question({
    id: "web-advanced-load-balancer",
    title: "Users kept in memory",
    prompt:
      "You run 3 copies of your app behind a load balancer and keep logged-in users in each copy's memory. What goes wrong?",
    choices: [
      "Users seem logged out when a request reaches another copy",
      "Nothing",
      "DNS stops working",
    ],
    correct: 0,
    conceptIds: ["secure-cookies"],
    hint: "Each request may go to a different copy.",
    explanation:
      "The copies don't share memory, so the next request can land on a copy that never saw the login, and the user seems logged out. Keep sessions in shared storage.",
  }),
];
