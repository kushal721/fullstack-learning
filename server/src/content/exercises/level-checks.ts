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

  // HTML: Basic
  question({
    id: "html-basic-closing-tag",
    title: "A missing closing tag",
    prompt: "Which tag closes `<p>`?",
    choices: ["`<p/>`", "`</p>`", "`<\\p>`"],
    correct: 1,
    conceptIds: ["html-element"],
    hint: "Closing tags start with a slash right after the `<`.",
    explanation:
      "A closing tag repeats the element's name after a slash: `</p>`. Together the opening tag, content and closing tag make one element.",
  }),
  question({
    id: "html-basic-nesting",
    title: "Closing in the right order",
    prompt: "Which line is nested correctly?",
    choices: [
      "`<p><em>Hi</p></em>`",
      "`<p><em>Hi</em></p>`",
      "`<em><p>Hi</em></p>`",
    ],
    correct: 1,
    conceptIds: ["html-element"],
    hint: "The last tag you open is the first one you close.",
    explanation:
      "`<em>` opened inside `<p>`, so it must close before `</p>`. Elements fit inside each other like boxes, never overlapping.",
  }),
  question({
    id: "html-basic-head",
    title: "Head or body",
    prompt: "Where does the page's `<title>` go?",
    choices: ["In `<head>`", "In `<body>`", "After `</html>`"],
    correct: 0,
    conceptIds: ["html-document"],
    hint: "The title appears on the browser tab, not on the page.",
    explanation:
      "`<head>` holds information about the page that isn't shown in it, such as the title on the tab, the character set and the viewport setting.",
  }),
  question({
    id: "html-basic-ordered-list",
    title: "Steps in order",
    prompt:
      "You list the steps of a recipe, which must be followed in order. Which element?",
    choices: ["`<ul>`", "`<ol>`", "`<table>`"],
    correct: 1,
    conceptIds: ["html-element", "html-semantic-structure"],
    hint: "One list is “ordered”.",
    explanation:
      "`<ol>` is an ordered list: its numbers tell the reader the order matters. `<ul>` is for items whose order doesn't matter.",
  }),
  question({
    id: "html-basic-alt",
    title: "Describing an image",
    prompt: "What is an image's `alt` text for?",
    choices: [
      "A tooltip with the file name",
      "Words that replace the image when it can't be seen",
      "Making the image load faster",
    ],
    correct: 1,
    conceptIds: ["html-element"],
    hint: "Think of someone using a screen reader.",
    explanation:
      "Screen readers read the alt text aloud, and browsers show it when the picture fails to load, so it should say what the image shows.",
  }),
  question({
    id: "html-basic-label",
    title: "Connecting a label",
    prompt: 'How does `<label for="email">` know which field it names?',
    choices: [
      "It names the field right after it, whatever it is",
      "Its `for` matches the field's `id`",
      "Its `for` matches the field's `type`",
    ],
    correct: 1,
    conceptIds: ["html-input", "html-form"],
    hint: "Look for the same word on both elements.",
    explanation:
      '`for="email"` points at the element with `id="email"`. Then clicking the label focuses the field and screen readers announce the label with it.',
  }),

  // HTML: Intermediate
  question({
    id: "html-intermediate-main",
    title: "The main content",
    prompt:
      "Which element marks the page's main content, so people can jump straight to it?",
    choices: ['`<div id="main">`', "`<main>`", "`<section>`"],
    correct: 1,
    conceptIds: ["html-semantic-structure"],
    hint: "Landmarks have names that say what they are.",
    explanation:
      "`<main>` is a landmark: screen readers can jump to it, and there is only one per page. A `<div>` means nothing on its own.",
  }),
  question({
    id: "html-intermediate-required",
    title: "required and the server",
    prompt:
      "A field has `required`. Can an empty value still reach the server?",
    choices: [
      "No, the browser always blocks it",
      "Yes, a request can be sent without using the form",
      "Only in old browsers",
    ],
    correct: 1,
    conceptIds: ["html-form", "input-validation"],
    hint: "Who controls the request: the page, or whoever sends it?",
    explanation:
      "`required` only helps people using the form. Anyone can send a request with other tools, so the server must check every value again.",
  }),
  question({
    id: "html-intermediate-radio",
    title: "Radio groups",
    prompt:
      "What makes several radio buttons one group where only one can be chosen?",
    choices: [
      "Putting them on the same line",
      "Giving them the same `name`",
      "Giving them the same `id`",
    ],
    correct: 1,
    conceptIds: ["html-input"],
    hint: "Ids must be unique; something else must be shared.",
    explanation:
      "Radio buttons with the same `name` form a group, and choosing one unchooses the others. Ids must stay unique so each label can point at its own button.",
  }),
  question({
    id: "html-intermediate-icon-button",
    title: "A button with only an icon",
    prompt:
      "A close button shows only “✕”. What will a screen reader announce without anything else?",
    choices: [
      "“Close, button”",
      "Something like “multiplication sign, button”",
      "Nothing at all",
    ],
    correct: 1,
    conceptIds: ["html-button"],
    hint: "Screen readers read the text that's there.",
    explanation:
      'The button\'s accessible name is its text, “✕”. Adding `aria-label="Close"` or visually hidden text gives it a name that says what it does.',
  }),

  // HTML: Advanced
  question({
    id: "html-advanced-aria",
    title: "What ARIA does",
    prompt: 'You add `aria-expanded="true"` to a menu button. What happens?',
    choices: [
      "The menu opens",
      "Screen readers announce the menu as open",
      "The button gets an arrow icon",
    ],
    correct: 1,
    conceptIds: ["html-button"],
    hint: "ARIA describes; it doesn't do.",
    explanation:
      "ARIA attributes only change what assistive technology hears. Your code still has to open the menu and update the attribute when it closes.",
  }),
  question({
    id: "html-advanced-div-button",
    title: "A div that acts as a button",
    prompt:
      'A `<div role="button">` has an onclick. What\'s still missing compared with `<button>`?',
    choices: [
      "Nothing",
      "Focus by Tab and activation by Enter and Space",
      "Only its colour",
    ],
    correct: 1,
    conceptIds: ["html-button", "html-semantic-structure"],
    hint: "Try using it without a mouse.",
    explanation:
      "A real button can be focused and pressed with Enter or Space for free. A div needs tabindex and key handling added by hand, so use `<button>`.",
  }),
  question({
    id: "html-advanced-defer",
    title: "defer",
    prompt: "What does `defer` on a `<script>` do?",
    choices: [
      "Never runs the script",
      "Runs it after the HTML has been read, without blocking it",
      "Runs it before anything else",
    ],
    correct: 1,
    conceptIds: ["html-document"],
    hint: "A plain script stops the browser reading the page.",
    explanation:
      "With `defer` the browser keeps reading the HTML while the script downloads, then runs it once the page is read, in order. Module scripts behave like this by default.",
  }),
  question({
    id: "html-advanced-htmlfor",
    title: "for in React",
    prompt: "In React's JSX, how do you write a label's `for` attribute?",
    choices: ["`for`", "`htmlFor`", "`labelFor`"],
    correct: 1,
    conceptIds: ["jsx", "html-input"],
    hint: "`for` is already a word in JavaScript.",
    explanation:
      "`for` is a JavaScript keyword, so JSX uses `htmlFor` (and `className` for `class`). React writes the normal `for` attribute into the real page.",
  }),
  question({
    id: "html-basic-block-inline",
    title: "Block or inline",
    prompt:
      "You put `<span>One</span><span>Two</span>` in a page. How do they appear?",
    choices: [
      "On two lines",
      "Side by side on one line",
      "Not at all, a span needs a class",
    ],
    correct: 1,
    conceptIds: ["html-element"],
    hint: "Is `<span>` a block or an inline element?",
    explanation:
      "`<span>` is inline, so both sit in the same line of text (“OneTwo”). Two `<div>`s, which are block elements, would each start on a new line.",
  }),
  question({
    id: "html-intermediate-entity",
    title: "Showing a tag as text",
    prompt:
      "A page should show the text `<p>` to the reader. What goes in the HTML?",
    choices: ["`<p>`", "`&lt;p&gt;`", "`<code><p></code>`"],
    correct: 1,
    conceptIds: ["html-element"],
    hint: "The browser reads `<` as the start of a tag.",
    explanation:
      "`&lt;` and `&gt;` are character entities for < and >, so the browser shows them as text instead of starting a new paragraph element.",
  }),
  question({
    id: "html-advanced-details",
    title: "An FAQ without JavaScript",
    prompt:
      "Which element opens and closes a section on click, with no JavaScript?",
    choices: ["`<section>`", "`<details>`", "`<aside>`"],
    correct: 1,
    conceptIds: ["html-semantic-structure"],
    hint: "Its first child is a `<summary>`.",
    explanation:
      "`<details>` with a `<summary>` opens and closes by itself, and works with the keyboard and screen readers. `<section>` and `<aside>` only describe content.",
  }),
];
