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
    id: "html-intermediate-aria",
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
    id: "html-intermediate-div-button",
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
    id: "html-basic-entity",
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
    id: "html-advanced-custom-element",
    title: "Naming your own element",
    prompt:
      "You register a custom element with `customElements.define`. Which name works?",
    choices: ["`notecard`", "`note-card`", "`NoteCard`"],
    correct: 1,
    conceptIds: ["html-element"],
    hint: "Built-in elements never have one character that custom ones must.",
    explanation:
      "Custom element names must contain a hyphen and be lowercase, so they can never clash with a built-in HTML element. `NoteCard` is how a React component would be named.",
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

  // CSS
  question({
    id: "css-basic-property",
    title: "Property or value",
    prompt: "In `p { font-size: 18px; }`, what is `18px`?",
    choices: ["The selector", "The property", "The value"],
    correct: 2,
    conceptIds: ["css-selector"],
    hint: "The part after the colon.",
    explanation:
      "`p` is the selector, `font-size` the property and `18px` the value it is set to. Together `font-size: 18px;` is one declaration.",
  }),
  question({
    id: "css-basic-class",
    title: "Sharing a look",
    prompt:
      "Several elements should share the same style. What do you give them?",
    choices: ["The same id", "The same class", "The same tag name only"],
    correct: 1,
    conceptIds: ["css-selector"],
    hint: "Ids must be unique on a page.",
    explanation:
      "A class can be used by many elements, and one element can have several classes. Ids are unique, and id selectors are hard to override.",
  }),
  question({
    id: "css-basic-rem",
    title: "Text that grows",
    prompt: "Which unit follows the size people set for text in their browser?",
    choices: ["px", "rem", "vw"],
    correct: 1,
    conceptIds: ["css-responsive"],
    hint: "It is relative to the root font size.",
    explanation:
      "`rem` multiplies the root font size, which grows when someone enlarges text in their browser settings. `px` stays fixed and `vw` follows the window width.",
  }),
  question({
    id: "css-basic-padding",
    title: "Space inside the border",
    prompt:
      "You want more space between a box's border and its text. Which property?",
    choices: ["margin", "padding", "gap"],
    correct: 1,
    conceptIds: ["css-box-model"],
    hint: "Inside or outside the border?",
    explanation:
      "Padding is the space inside the border, around the content. Margin is outside the border and pushes other boxes away; gap spaces flex and grid items.",
  }),
  question({
    id: "css-basic-display-none",
    title: "Hiding an element",
    prompt: "Which hides an element so it takes no space at all?",
    choices: ["`visibility: hidden`", "`display: none`", "`opacity: 0`"],
    correct: 1,
    conceptIds: ["css-box-model"],
    hint: "Two of these leave an empty space behind.",
    explanation:
      "`display: none` removes the box from the layout. `visibility: hidden` and `opacity: 0` make it invisible but it still takes its space.",
  }),
  question({
    id: "css-basic-align",
    title: "Centring in a row",
    prompt: "Flex items are in a row. Which property centres them vertically?",
    choices: ["`justify-content`", "`align-items`", "`text-align`"],
    correct: 1,
    conceptIds: ["css-flexbox"],
    hint: "In a row, vertical is the cross axis.",
    explanation:
      "In a row the main axis is horizontal, so `justify-content` spaces items left to right and `align-items` lines them up top to bottom.",
  }),
  question({
    id: "css-intermediate-fr",
    title: "What fr means",
    prompt: "What does `grid-template-columns: 1fr 1fr 1fr` make?",
    choices: ["Three equal columns", "One column", "Three rows"],
    correct: 0,
    conceptIds: ["css-flexbox"],
    hint: "fr is a share of the free space.",
    explanation:
      "Each `1fr` is one equal share of the space left over, so three of them make three equal columns that grow and shrink with the container.",
  }),
  question({
    id: "css-intermediate-mobile-first",
    title: "Mobile first",
    prompt: "In mobile-first CSS, what do media queries usually add?",
    choices: [
      "Styles for smaller screens",
      "Layout for wider screens",
      "Print styles only",
    ],
    correct: 1,
    conceptIds: ["css-responsive"],
    hint: "The default styles are for phones.",
    explanation:
      "Mobile-first writes the simple phone layout as the default and uses `@media (min-width: …)` to add columns and space as the screen gets wider.",
  }),
  question({
    id: "css-intermediate-absolute",
    title: "An absolute badge",
    prompt:
      "A badge with `position: absolute` sits in the page corner instead of its card's. What fixes it?",
    choices: [
      "`position: relative` on the card",
      "A larger z-index",
      "`display: block` on the badge",
    ],
    correct: 0,
    conceptIds: ["css-box-model"],
    hint: "Absolute positions inside the nearest positioned ancestor.",
    explanation:
      "An absolutely positioned element is placed relative to its nearest positioned ancestor. Without one, that's the page; `position: relative` on the card makes the card the anchor.",
  }),
  question({
    id: "css-intermediate-specificity",
    title: "Which rule wins",
    prompt:
      "`#main h1 { color: blue }` comes first and `.title { color: red }` second. An h1 matches both. Its colour?",
    choices: [
      "Red, because it comes later",
      "Blue, because the id is more specific",
      "Black, because they cancel out",
    ],
    correct: 1,
    conceptIds: ["css-selector"],
    hint: "Specificity is checked before order.",
    explanation:
      "Order only decides between equally specific selectors. `#main h1` contains an id, which beats any number of classes, so blue wins.",
  }),
  question({
    id: "css-advanced-var",
    title: "Using a variable",
    prompt: "How do you use the custom property `--brand` as a colour?",
    choices: [
      "`color: --brand;`",
      "`color: var(--brand);`",
      "`color: $brand;`",
    ],
    correct: 1,
    conceptIds: ["css-selector"],
    hint: "Custom properties are read with a function.",
    explanation:
      "Custom properties are defined with two dashes and read with `var()`, as in `color: var(--brand);`. Changing `--brand` in one place updates every use.",
  }),
  question({
    id: "css-advanced-has",
    title: "Selecting a parent",
    prompt: "Which selector styles only the cards that contain an image?",
    choices: ["`.card img`", "`.card:has(img)`", "`img + .card`"],
    correct: 1,
    conceptIds: ["css-selector"],
    hint: "One of these selects the image, not the card.",
    explanation:
      "`.card:has(img)` matches the card itself when it contains an image. `.card img` would style the image inside the card instead.",
  }),
  question({
    id: "css-advanced-container",
    title: "Container queries",
    prompt: "What does a container query check?",
    choices: [
      "The size of the browser window",
      "The size of a parent element",
      "The user's device type",
    ],
    correct: 1,
    conceptIds: ["css-responsive"],
    hint: "It's the local version of a media query.",
    explanation:
      "A container query responds to the size of an element marked with `container-type`, so the same component can adapt wherever it is placed.",
  }),
  question({
    id: "css-advanced-dark",
    title: "Dark mode",
    prompt: "Which media feature follows the system's light or dark setting?",
    choices: [
      "`prefers-color-scheme`",
      "`prefers-reduced-motion`",
      "`min-width`",
    ],
    correct: 0,
    conceptIds: ["css-responsive"],
    hint: "Its values are light and dark.",
    explanation:
      "`@media (prefers-color-scheme: dark)` applies when the system is in dark mode, usually by swapping the values of colour custom properties.",
  }),

  // JavaScript
  question({
    id: "js-basic-const",
    title: "const or let",
    prompt:
      "A note's title never changes after it is set. How should you declare it?",
    choices: [
      '`const title = "Milk";`',
      '`let title = "Milk";`',
      '`title = "Milk";`',
    ],
    correct: 0,
    conceptIds: ["js-variable"],
    hint: "Which one refuses a new value?",
    explanation:
      "Use `const` for a value that never gets reassigned and `let` only when it must change. Leaving the keyword out creates an accidental global, which is a bug.",
  }),
  question({
    id: "js-basic-plus",
    title: "Text plus a number",
    prompt: 'What does `"5" + 1` give in JavaScript?',
    choices: ["`6`", '`"51"`', "An error"],
    correct: 1,
    conceptIds: ["js-variable"],
    hint: "With a string on either side, `+` joins text.",
    explanation:
      'When one side of `+` is a string, JavaScript joins the two as text, so the result is `"51"`. Convert first with `Number("5") + 1` to get `6`.',
  }),
  question({
    id: "js-basic-equals",
    title: "Strict equality",
    prompt: 'What does `3 === "3"` give?',
    choices: ["`true`", "`false`", "An error"],
    correct: 1,
    conceptIds: ["js-variable"],
    hint: "`===` compares the type as well as the value.",
    explanation:
      "`===` is strict: a number and a string are different types, so the answer is `false`. The loose `==` would convert and say `true`, which is why code uses `===`.",
  }),
  question({
    id: "js-basic-return",
    title: "Returning a value",
    prompt: "`function double(n) { n * 2; }` — what does `double(4)` give?",
    choices: ["`8`", "`undefined`", "`4`"],
    correct: 1,
    conceptIds: ["js-function"],
    hint: "Does the function hand anything back?",
    explanation:
      "A function with curly braces only gives back what `return` hands it. Without `return`, the result is `undefined`; write `return n * 2;` to get `8`.",
  }),
  question({
    id: "js-basic-filter",
    title: "Choosing an array method",
    prompt:
      "You want only the notes that are done, as a new array. Which method?",
    choices: ["`notes.map(...)`", "`notes.filter(...)`", "`notes.find(...)`"],
    correct: 1,
    conceptIds: ["js-object-array"],
    hint: "One keeps some items, one changes every item, one returns a single item.",
    explanation:
      "`filter` returns a new array with the items its function returns true for. `map` changes every item, and `find` returns only the first match, not an array.",
  }),
  question({
    id: "js-basic-listener",
    title: "Event listeners",
    prompt: 'What is wrong with `button.addEventListener("click", save());`?',
    choices: [
      "Nothing",
      "It calls `save` straight away and passes its result, not the function",
      "`click` should be `onclick`",
    ],
    correct: 1,
    conceptIds: ["js-event-listener"],
    hint: "Look at the brackets after `save`.",
    explanation:
      "`save()` runs the function immediately and hands its result to `addEventListener`. Pass the function itself, `save`, so the browser can call it on every click.",
  }),
  question({
    id: "js-intermediate-json",
    title: "Reading JSON",
    prompt:
      'A server sends the text `{"id":7}`. How do you get an object you can read `.id` from?',
    choices: ["`JSON.parse(text)`", "`JSON.stringify(text)`", "`text.id`"],
    correct: 0,
    conceptIds: ["json"],
    hint: "Which one turns text into a value?",
    explanation:
      "`JSON.parse` turns JSON text into objects and arrays; `JSON.stringify` goes the other way. With fetch, `response.json()` does the parsing for you.",
  }),
  question({
    id: "js-intermediate-async",
    title: "await",
    prompt: "Where can you use `await`?",
    choices: [
      "Anywhere",
      "Inside an `async` function (or at the top of a module)",
      "Only inside loops",
    ],
    correct: 1,
    conceptIds: ["js-async-await"],
    hint: "It needs a keyword on the function around it.",
    explanation:
      "`await` pauses an `async` function until a promise settles. Modules also allow it at the top level, but inside an ordinary function it is a syntax error.",
  }),
  question({
    id: "js-intermediate-fetch-ok",
    title: "fetch and errors",
    prompt: "`fetch` gets a 404 reply. What happens?",
    choices: [
      "The promise rejects",
      "It resolves; `response.ok` is false",
      "The page reloads",
    ],
    correct: 1,
    conceptIds: ["js-fetch"],
    hint: "The server did answer.",
    explanation:
      "`fetch` only rejects when the request can't be made at all, such as no network. Any HTTP reply resolves the promise, so check `response.ok` or the status yourself.",
  }),
  question({
    id: "js-intermediate-spread",
    title: "Copying with spread",
    prompt: "What is `{ ...note, done: true }`?",
    choices: [
      "`note` itself, changed",
      "A new object: a copy of `note` with `done` set to true",
      "An array",
    ],
    correct: 1,
    conceptIds: ["js-object-array"],
    hint: "The curly braces make something new.",
    explanation:
      "Spread copies every property of `note` into a new object, then `done: true` overrides one. The original `note` is untouched, which is what React state updates need.",
  }),
  question({
    id: "js-intermediate-nullish",
    title: "Missing values",
    prompt: "`user` has no `address`. What does `user.address?.city` give?",
    choices: ["An error", "`undefined`", '`""`'],
    correct: 1,
    conceptIds: ["js-object-array"],
    hint: "`?.` stops early instead of failing.",
    explanation:
      'Optional chaining stops at the missing `address` and gives `undefined` instead of throwing. Add `?? "Unknown"` to supply a fallback for display.',
  }),
  question({
    id: "js-advanced-closure",
    title: "Closures",
    prompt:
      "`makeCounter()` returns a function that adds to a `let count` inside it. You make two counters. Do they share `count`?",
    choices: [
      "Yes",
      "No, each call makes its own `count`",
      "Only after the first call",
    ],
    correct: 1,
    conceptIds: ["js-function"],
    hint: "Every call to `makeCounter` runs `let count = 0` again.",
    explanation:
      "Each call to `makeCounter` creates a fresh `count`, and the function it returns closes over that one. The two counters remember separate values.",
  }),
  question({
    id: "js-advanced-event-loop",
    title: "The event loop",
    prompt:
      'In what order do these print? `setTimeout(() => log("A"), 0); Promise.resolve().then(() => log("B")); log("C");`',
    choices: ["A, B, C", "C, B, A", "C, A, B"],
    correct: 1,
    conceptIds: ["js-promise"],
    hint: "Running code first; then promise callbacks; then timers.",
    explanation:
      "Synchronous code finishes first (C). Then the event loop empties the promise queue (B) before taking the next task from the timer queue (A), even with a 0 ms delay.",
  }),
  question({
    id: "js-advanced-reference",
    title: "References",
    prompt:
      "`const b = a;` where `a` is an array, then `b.push(1)`. What happens to `a`?",
    choices: [
      "Nothing",
      "It gets the 1 too: both names point at one array",
      "It's emptied",
    ],
    correct: 1,
    conceptIds: ["js-object-array"],
    hint: "Was the array copied?",
    explanation:
      "Assigning an object or array copies the reference, not the contents. `a` and `b` are the same array, so the push shows through both; copy with `[...a]` to keep them apart.",
  }),
  question({
    id: "js-advanced-optional-type",
    title: "Optional properties",
    prompt:
      "In `type Note = { title: string; content?: string }`, which object fits?",
    choices: [
      '`{ title: "Milk" }`',
      '`{ content: "2 litres" }`',
      "`{ title: 3 }`",
    ],
    correct: 0,
    conceptIds: ["typescript-types"],
    hint: "Which property may be left out?",
    explanation:
      "`content?` is optional, so an object with only a string `title` fits. Leaving out `title` or giving it a number breaks the type, and TypeScript reports it before running.",
  }),

  // Git & GitHub: Basic
  question({
    id: "git-basic-staged",
    title: "Saved isn't committed",
    prompt:
      "You edit `app.js`, save it, and run `git commit`. What does the commit contain?",
    choices: [
      "Your edit to app.js",
      "Nothing new: the edit was never staged with git add",
      "Every file in the folder",
    ],
    correct: 1,
    conceptIds: ["git-repository"],
    hint: "Which command puts a change in the staging area?",
    explanation:
      "Saving only changes the working folder. `git commit` saves what's staged, so without `git add app.js` the edit isn't in the commit.",
  }),
  question({
    id: "git-basic-message",
    title: "A useful message",
    prompt:
      "Which commit message follows the conventional style and says what changed?",
    choices: [
      "`updated stuff`",
      "`fix: show an error when the note title is empty`",
      "`Fixed it!!`",
    ],
    correct: 1,
    conceptIds: ["conventional-commit", "git-commit"],
    hint: "type: what changed, in the imperative.",
    explanation:
      "`fix:` gives the kind of change and the rest says exactly what it does, so nobody needs to open the diff to know.",
  }),
  question({
    id: "git-basic-fast-forward",
    title: "A simple merge",
    prompt:
      "You branch from `main`, make 3 commits, and nobody changes `main`. What does `git merge` on main do?",
    choices: [
      "Creates a merge commit with two parents",
      "Fast-forwards: main's label moves to your last commit",
      "Reports a conflict",
    ],
    correct: 1,
    conceptIds: ["git-branch", "merge"],
    hint: "Has main moved since you branched?",
    explanation:
      "`main` hasn't moved, so there's nothing to combine: its label just slides forward to your newest commit.",
  }),
  question({
    id: "git-basic-rejected",
    title: "A rejected push",
    prompt: "`git push` is rejected with “fetch first”. What's the right fix?",
    choices: [
      "`git push --force`",
      "`git pull`, then `git push`",
      "Delete your branch",
    ],
    correct: 1,
    conceptIds: ["github-remote-push"],
    hint: "Someone pushed before you.",
    explanation:
      "GitHub has commits you don't. Pulling merges them with yours; then your push only adds to the history and is accepted. Forcing would delete their work.",
  }),
  question({
    id: "git-basic-pr-red",
    title: "A failing check",
    prompt: "Your pull request has a failing CI check. What should you do?",
    choices: [
      "Merge anyway; it's probably fine",
      "Fix it on the same branch and push; the checks run again",
      "Open a new pull request",
    ],
    correct: 1,
    conceptIds: ["pull-request"],
    hint: "What happens to a pull request when you push to its branch?",
    explanation:
      "Every push to the branch updates the pull request and re-runs the checks. Merge only when they're green.",
  }),

  // Git & GitHub: Intermediate
  question({
    id: "git-intermediate-conflict",
    title: "Finishing a conflicted merge",
    prompt:
      "You've edited every conflicted file and removed the markers. What finishes the merge?",
    choices: [
      "`git merge --abort`",
      "`git add` the files, then `git commit`",
      "`git push --force`",
    ],
    correct: 1,
    conceptIds: ["merge"],
    hint: "How does Git learn a file is resolved?",
    explanation:
      "`git add` marks each file resolved, and `git commit` creates the merge commit. `--abort` would throw the merge away.",
  }),
  question({
    id: "git-intermediate-revert",
    title: "Undoing on main",
    prompt: "A bad commit is already on `main` on GitHub. How do you undo it?",
    choices: [
      "`git reset --hard` and force-push main",
      "`git revert <hash>`: a new commit that undoes it",
      "Delete the repository",
    ],
    correct: 1,
    conceptIds: ["git-commit"],
    hint: "Others already have that commit.",
    explanation:
      "Rewriting shared history breaks everyone's copy. `git revert` adds a commit doing the opposite, which everyone just pulls.",
  }),
  question({
    id: "git-intermediate-rebase-rule",
    title: "The golden rule",
    prompt: "Which commits is it safe to rebase?",
    choices: [
      "Any, including main",
      "Only your own commits that nobody else has yet",
      "Only merge commits",
    ],
    correct: 1,
    conceptIds: ["git-branch"],
    hint: "Rebasing replaces commits with new ones.",
    explanation:
      "Rebased commits get new hashes. If others already have the old ones, your histories disagree. Rebase only unshared work.",
  }),
  question({
    id: "git-intermediate-gitignore",
    title: "Too late to ignore",
    prompt:
      "You add `.env` to `.gitignore`, but it was committed last week. What else do you need?",
    choices: [
      "Nothing: .gitignore removes it",
      "`git rm --cached .env`, a commit, and rotate the secret",
      "Rename the file",
    ],
    correct: 1,
    conceptIds: ["gitignore"],
    hint: "Does .gitignore affect files Git already tracks?",
    explanation:
      "Ignore rules only apply to untracked files. `git rm --cached` stops tracking it, and since the secret is in history, it must be changed.",
  }),
  question({
    id: "git-intermediate-review",
    title: "A blocking comment",
    prompt:
      "In a review, you notice a query returns every user's notes, not just the logged-in user's. How should you comment?",
    choices: [
      "`nit:` and approve",
      "`blocking:` explain the leak and how to fix it, and request changes",
      "Say nothing; tests will catch it",
    ],
    correct: 1,
    conceptIds: ["pull-request"],
    hint: "Can this be merged as it is?",
    explanation:
      "Leaking other users' data must be fixed before merging: a blocking comment that says why and how, with Request changes.",
  }),

  // Git & GitHub: Advanced
  question({
    id: "git-advanced-bisect",
    title: "Halving the search",
    prompt:
      "About how many tests does `git bisect` need to find a bad commit among 1,000?",
    choices: ["About 10", "About 100", "About 1,000"],
    correct: 0,
    conceptIds: ["git-commit"],
    hint: "Each test halves the range.",
    explanation:
      "Each answer halves the suspects: 1,000 → 500 → 250 → … → 1 takes about ten halvings, so about ten tests instead of a thousand.",
  }),
  question({
    id: "git-advanced-pickaxe",
    title: "Code that's gone",
    prompt:
      "A function was deleted months ago. Which command finds the commit that removed it?",
    choices: ["`git blame`", "`git log -S functionName`", "`git status`"],
    correct: 1,
    conceptIds: ["git-commit"],
    hint: "Blame only shows lines that still exist.",
    explanation:
      "`git log -S` searches the changes themselves, so it finds the commits that added and removed the text.",
  }),
  question({
    id: "git-advanced-ci",
    title: "Where the tests run",
    prompt: "Where should the full test suite run for every pull request?",
    choices: [
      "In a pre-commit hook",
      "In a GitHub Actions workflow",
      "Only on the reviewer's laptop",
    ],
    correct: 1,
    conceptIds: ["ci-cd", "pull-request"],
    hint: "Which one runs for everyone, on a clean machine?",
    explanation:
      "CI runs on a fresh runner for every pull request. Hooks are for quick local checks and can be skipped.",
  }),
  question({
    id: "git-advanced-secret",
    title: "A token in CI",
    prompt: "A deploy step needs a token. Where does it go?",
    choices: [
      "Written in the workflow YAML",
      "In the repository's Settings → Secrets, used as `${{ secrets.NAME }}`",
      "In a comment on the pull request",
    ],
    correct: 1,
    conceptIds: ["ci-cd", "secrets-env-vars"],
    hint: "The workflow file is committed.",
    explanation:
      "Anything in the YAML is in the repository forever. Secrets stored in settings are injected at run time and hidden in logs.",
  }),
  question({
    id: "git-advanced-verified",
    title: "What Verified proves",
    prompt: "What does GitHub's Verified badge on a commit prove?",
    choices: [
      "The code has no bugs",
      "It was signed with a key on the author's account and hasn't changed since",
      "A reviewer approved it",
    ],
    correct: 1,
    conceptIds: ["git-commit"],
    hint: "Identity, not quality.",
    explanation:
      "The author name is just a setting; a signature checked against the author's known key proves who made the commit.",
  }),
  // React: Basic
  question({
    id: "react-basic-render",
    title: "Who updates the page?",
    prompt:
      "A click handler in a React component calls `setCount(5)`. What makes the number on the page change?",
    choices: [
      "The handler must also set the element's `textContent`",
      "React re-renders the component and updates the elements that differ",
      "The page has to be reloaded",
    ],
    correct: 1,
    conceptIds: ["react-why", "react-state"],
    hint: "What does setting state ask React to do?",
    explanation:
      "Setting state asks React to call the component again. It compares the new JSX with the old and changes only the parts of the page that are different.",
  }),
  question({
    id: "react-basic-zero",
    title: "A stray zero",
    prompt:
      "`notes` is an empty array. What does `{notes.length && <NoteList notes={notes} />}` put on the page?",
    choices: ["Nothing", "The number 0", "An empty NoteList"],
    correct: 1,
    conceptIds: ["jsx"],
    hint: "What is `0 && anything`?",
    explanation:
      "`0 && …` evaluates to `0`, and React shows numbers as text. Use a real true-or-false test like `notes.length > 0 && …` instead.",
  }),
  question({
    id: "react-basic-default",
    title: "Defaults and props",
    prompt:
      'With `function Button({ variant = "primary" })`, what is `variant` for `<Button variant="danger" />` and for `<Button />`?',
    choices: [
      '"primary" both times',
      '"danger", then "primary"',
      '"danger", then undefined',
    ],
    correct: 1,
    conceptIds: ["react-props"],
    hint: "When does a default apply?",
    explanation:
      "A default is only used when the parent leaves the prop out. The first button passes danger; the second passes nothing, so it gets primary.",
  }),
  question({
    id: "react-basic-snapshot",
    title: "Twice in one click",
    prompt:
      "`count` is 0. A click runs `setCount(count + 1)` twice. What does the next render show?",
    choices: ["1", "2", "0"],
    correct: 0,
    conceptIds: ["react-usestate"],
    hint: "What is `count` inside this render?",
    explanation:
      "State is a snapshot: both calls read this render's `count`, 0, and ask for 1. To add twice, use the updater form `setCount((c) => c + 1)`.",
  }),
  question({
    id: "react-basic-handler",
    title: "When does it run?",
    prompt: "Which button deletes the note only when it is clicked?",
    choices: [
      "`<button onClick={onDelete(note.id)}>`",
      "`<button onClick={() => onDelete(note.id)}>`",
      '`<button onclick="onDelete(note.id)">`',
    ],
    correct: 1,
    conceptIds: ["react-event-handling"],
    hint: "Pass a function; don't call one.",
    explanation:
      "The arrow function is what React calls on the click. The first version calls `onDelete` during the render, and the third isn't how React attaches handlers.",
  }),
  question({
    id: "react-basic-key",
    title: "The wrong key",
    prompt:
      "A list uses `key={index}`. You add a note at the top, and text typed into the first note's input now appears next to the new note. Why?",
    choices: [
      "React lost the typed text",
      "Key 0 now means the new note, so React reused the first item's element for it",
      "Inputs can't be used in lists",
    ],
    correct: 1,
    conceptIds: ["react-lists-keys"],
    hint: "What does React match items by?",
    explanation:
      "React matches items by key. With positions as keys, the old first element (and its input) is given to whatever is first now. Stable ids keep each element with its note.",
  }),
  // React: Intermediate
  question({
    id: "react-intermediate-deps",
    title: "Stuck on the old note",
    prompt:
      "`useEffect(() => { getNote(id).then(setNote); }, []);` In the app, choosing another note leaves the first one on screen. Why?",
    choices: [
      "getNote is too slow",
      "The empty array means the effect never runs again when id changes",
      "setNote can't be passed to then",
    ],
    correct: 1,
    conceptIds: ["react-useeffect"],
    hint: "When does an effect with `[]` run?",
    explanation:
      "An effect re-runs only when a value in its dependency array changes. It reads `id`, so `id` must be listed: `[id]`. With `[]` it ran once, for the first note.",
  }),
  question({
    id: "react-intermediate-cleanup",
    title: "Two timers",
    prompt:
      "In development, a clock component's effect starts `setInterval` and the time now jumps two seconds per tick. What's missing?",
    choices: [
      "A cleanup that clears the interval",
      "A second dependency",
      "Strict Mode should be switched off",
    ],
    correct: 0,
    conceptIds: ["react-useeffect"],
    hint: "Strict Mode sets up, cleans up and sets up again.",
    explanation:
      "Strict Mode runs the effect twice to expose a missing cleanup. Without `return () => clearInterval(id)`, two intervals run at once, and the same leak would happen in production when the effect re-runs.",
  }),
  question({
    id: "react-intermediate-controlled",
    title: "Typing does nothing",
    prompt:
      "An input is written `<input value={title} />`. What happens when you type in it?",
    choices: [
      "The text appears and title updates",
      "Nothing: it always shows title, and nothing changes title",
      "The page reloads",
    ],
    correct: 1,
    conceptIds: ["react-controlled-form"],
    hint: "Who updates title?",
    explanation:
      "A controlled input shows its value prop. Without an onChange that sets the state, every key press is undone on the next render, so the input looks frozen.",
  }),
  question({
    id: "react-intermediate-refresh",
    title: "404 on refresh",
    prompt:
      "With React Router, clicking to /notes/7 works, but refreshing that page shows the host's 404 page. What fixes it?",
    choices: [
      "Using <a href> instead of <Link>",
      "Making the server send index.html for page URLs it doesn't have as files",
      "Adding a * route",
    ],
    correct: 1,
    conceptIds: ["react-why"],
    hint: "On a refresh, who answers first: React or the server?",
    explanation:
      "Refreshing asks the server for /notes/7. The routes only exist in the JavaScript, so the server needs a fallback that returns index.html; then React Router reads the URL.",
  }),
  question({
    id: "react-intermediate-context",
    title: "No provider",
    prompt:
      "`const AuthContext = createContext(null)`. A component outside every `<AuthContext>` calls `useContext(AuthContext)`. What does it get?",
    choices: ["null, the default", "The nearest user", "An error"],
    correct: 0,
    conceptIds: ["react-component-communication"],
    hint: "What's the argument to createContext for?",
    explanation:
      "With no provider above it, useContext returns the default given to createContext. Here that's null, so code that destructures the result will throw.",
  }),
  question({
    id: "react-intermediate-hook-state",
    title: "Shared or not?",
    prompt:
      "`Sidebar` and `Dashboard` both call `useNotes()`. Adding a note in `Dashboard` doesn't change `Sidebar`'s count. Why?",
    choices: [
      "useNotes has a bug",
      "Each call to a hook has its own state; hooks share logic, not data",
      "Sidebar needs a key",
    ],
    correct: 1,
    conceptIds: ["react-custom-hook"],
    hint: "Is a hook's useState shared between callers?",
    explanation:
      "Every component that calls a hook gets its own copy of that hook's state. To share the notes, call useNotes once in a common parent and pass them down, or provide them with context.",
  }),
  // React: Advanced
  question({
    id: "react-advanced-reducer-pure",
    title: "Inside the reducer",
    prompt:
      'A reducer handles `{ type: "added", note }` with `notes.push(action.note); return notes;`. What goes wrong?',
    choices: [
      "Nothing, push is fastest",
      "It changes the old state and returns the same array, so React may not re-render",
      "The reducer runs twice",
    ],
    correct: 1,
    conceptIds: ["react-state"],
    hint: "How does React know state changed?",
    explanation:
      "A reducer must return a new value and leave the old one alone. Returning the same, changed array means React sees no change: `return [action.note, ...notes]` instead.",
  }),
  question({
    id: "react-advanced-reducer-effect",
    title: "Where the request goes",
    prompt:
      "With useReducer, where does the request that deletes a note on the server belong?",
    choices: [
      "In the reducer's deleted case",
      "In the event handler, which then dispatches an action",
      "In the action object",
    ],
    correct: 1,
    conceptIds: ["react-state"],
    hint: "Reducers are pure.",
    explanation:
      "Reducers only calculate the next state and React may call them more than once. Side effects like requests go in the handler, which dispatches what happened.",
  }),
  question({
    id: "react-advanced-memo",
    title: "memo did nothing",
    prompt:
      "`NoteCard` is wrapped in memo, but every card still re-renders when the parent does. The parent passes `onDelete={(id) => remove(id)}`. Why?",
    choices: [
      "memo only works on class components",
      "The arrow function is new on every render, so the props never look the same",
      "Cards need keys for memo to work",
    ],
    correct: 1,
    conceptIds: ["react-props"],
    hint: "How does memo compare a function prop?",
    explanation:
      "memo compares props with Object.is. A function created during the render is a different object each time, so wrap it in useCallback (or let the React Compiler do it).",
  }),
  question({
    id: "react-advanced-measure",
    title: "It feels slow",
    prompt: "Typing in a search box lags. What should you do first?",
    choices: [
      "Wrap every component in memo",
      "Record the interaction with the React DevTools Profiler",
      "Rewrite the page with useReducer",
    ],
    correct: 1,
    conceptIds: ["react-state"],
    hint: "Before fixing, find out.",
    explanation:
      "The Profiler shows which components rendered and how long each took. The fix is often simple, like moving state down, and memo everywhere adds cost without finding the cause.",
  }),
  question({
    id: "react-advanced-lazy",
    title: "A failed chunk",
    prompt:
      "A lazy settings screen sits inside `<Suspense fallback={<Spinner />}>`. Its chunk fails to download. What does the user see?",
    choices: [
      "The spinner forever",
      "Whatever an error boundary above it shows; with none, the app crashes",
      "The settings screen from the cache",
    ],
    correct: 1,
    conceptIds: ["react-component"],
    hint: "Suspense covers waiting. What covers failing?",
    explanation:
      "Suspense only shows a fallback while loading. A failed import throws during rendering, which only an error boundary catches; without one React unmounts the app.",
  }),
  question({
    id: "react-advanced-findby",
    title: "An error that appears later",
    prompt:
      'A test clicks Save with a mocked API that rejects, then calls `screen.getByRole("alert")`, which fails. Why?',
    choices: [
      "Alerts can't be found by role",
      "The alert appears after the promise settles, and getBy only looks once",
      "The mock is wrong",
    ],
    correct: 1,
    conceptIds: ["react-component"],
    hint: "Which query waits?",
    explanation:
      'getBy checks immediately. The error renders after the rejected promise, so use `await screen.findByRole("alert")`, which keeps looking until it appears.',
  }),
  // HTTP & APIs: Basic
  question({
    id: "http-basic-contract",
    title: "A renamed field",
    prompt:
      "The API starts sending `name` instead of `title` in every note. Nobody changed the React app. What happens?",
    choices: [
      "Nothing: the browser maps the old name to the new one",
      "The app breaks where it reads `note.title`, because the contract changed",
      "fetch rejects with a 400",
    ],
    correct: 1,
    conceptIds: ["http-request-response", "rest-endpoint"],
    hint: "What does the client rely on?",
    explanation:
      "An API is a contract: the client relies on the shape of what the server sends. Renaming a field changes the contract, so `note.title` is now undefined. The response is still a 200, so nothing rejects.",
  }),
  question({
    id: "http-basic-put-patch",
    title: "Half a PUT",
    prompt:
      'Note 8 is `{ title: "Milk", content: "2 litres" }`. You send `PUT /api/notes/8` with only `{ "title": "Oat milk" }`. What should the note be now?',
    choices: [
      '`{ title: "Oat milk", content: "2 litres" }`',
      '`{ title: "Oat milk" }` with the content empty or gone',
      "Unchanged: PUT needs every field or it does nothing",
    ],
    correct: 1,
    conceptIds: ["http-put-delete", "http-methods"],
    hint: "PUT replaces; PATCH changes.",
    explanation:
      "PUT sends the whole new version, so anything left out is gone; the Notes App saves the missing content as empty. To change only the title and keep the rest, PATCH is the method that means that.",
  }),
  question({
    id: "http-basic-fetch-ok",
    title: "A 404 in try/catch",
    prompt:
      "`try { const res = await fetch(url); setNote(await res.json()); } catch { showError(); }`. The server answers 404. What happens?",
    choices: [
      "`showError()` runs",
      "The 404's error body is passed to `setNote`",
      "fetch retries until it gets a 200",
    ],
    correct: 1,
    conceptIds: ["http-status-codes", "http-request-response"],
    hint: "When does fetch reject?",
    explanation:
      "fetch only rejects when there's no response at all. A 404 is a response, so the code carries on and treats the error body as a note. Check `res.ok` (or `res.status`) before using the body.",
  }),
  question({
    id: "http-basic-content-type",
    title: "Labelling the body",
    prompt:
      "A POST sends `JSON.stringify(note)` as its body but sets no headers. The Notes App's server answers `400 Title is required`. Why?",
    choices: [
      "The JSON text is invalid",
      "Without `Content-Type: application/json`, express.json() doesn't read the body",
      "POST requests can't carry a body",
      "The `Accept` header is missing",
    ],
    correct: 1,
    conceptIds: ["http-headers", "http-post"],
    hint: "How does the server know what format the body is in?",
    explanation:
      "fetch labels a string body text/plain. express.json() only parses bodies labelled JSON, so the controller gets no body, finds no title and answers 400. Add the Content-Type header.",
  }),
  question({
    id: "http-basic-json-undefined",
    title: "What survives JSON",
    prompt:
      'What does `JSON.stringify({ title: "Milk", due: undefined })` give?',
    choices: [
      '{"title":"Milk","due":null}',
      '{"title":"Milk"}',
      '{"title":"Milk","due":"undefined"}',
    ],
    correct: 1,
    conceptIds: ["http-request-response"],
    hint: "Does JSON have an undefined value?",
    explanation:
      "JSON has no undefined, so stringify leaves that field out entirely; it doesn't become null or a string. Send null when the other side must see that a field is empty.",
  }),
  question({
    id: "http-basic-query-vs-path",
    title: "Path or query?",
    prompt:
      "You want the notes that mention milk, newest first. Which URL fits REST best?",
    choices: [
      "GET /api/notes/search/milk/newest",
      "GET /api/notes?search=milk&sort=newest",
      "POST /api/searchNotes",
    ],
    correct: 1,
    conceptIds: ["rest-endpoint", "http-get"],
    hint: "Is it a different resource, or the same collection narrowed?",
    explanation:
      "It's still the notes collection, just filtered and ordered, so the options go in query parameters after the ?. The path is for naming which resource you mean.",
  }),
  // HTTP & APIs: Intermediate
  question({
    id: "http-intermediate-page-cap",
    title: "A huge page",
    prompt:
      "Your API caps pages at 50 notes. A client sends `GET /api/notes?limit=100000`. What should it get back?",
    choices: [
      "Every note in the database",
      "At most 50 notes, and a `next` link (or cursor) for the rest",
      "500 Internal Server Error",
    ],
    correct: 1,
    conceptIds: ["http-get", "rest-endpoint"],
    hint: "Who decides the largest page?",
    explanation:
      "The server always caps the page size, whatever the client asks for. It sends a full page of 50 and says how to get the next one, so no single response can overwhelm it.",
  }),
  question({
    id: "http-intermediate-cursor",
    title: "A note seen twice",
    prompt:
      "With `?limit=20&offset=20`, people sometimes see the last note of page 1 again at the top of page 2. What's the usual fix?",
    choices: [
      "Ask for bigger pages",
      "Page with a cursor: “the 20 notes after this one”",
      "Retry the request",
    ],
    correct: 1,
    conceptIds: ["http-get"],
    hint: "What happens to positions when a new note is added?",
    explanation:
      "A new note shifts every position down one, so offset 20 now points at a note already shown. A cursor names where to continue, so additions don't move the next page.",
  }),
  question({
    id: "http-intermediate-field-errors",
    title: "Which field?",
    prompt:
      "A form sends a note with an empty title and content that is too long. Which response helps the person most?",
    choices: [
      '`500` with `{ "error": "Something went wrong" }`',
      '`400` with `{ "error": "Invalid input" }`',
      '`422` with `{ "errors": { "title": "Title is required", "content": "Too long" } }`',
    ],
    correct: 2,
    conceptIds: ["http-status-codes", "http-post"],
    hint: "The form wants to show each message next to its input.",
    explanation:
      "Bad input is a 4xx, not a 500. Listing every problem keyed by field lets the form show each message beside its input, so the person fixes everything in one go.",
  }),
  question({
    id: "http-intermediate-breaking",
    title: "Safe to ship?",
    prompt:
      "A phone app you can't update reads `GET /api/notes`. Which change is safe to make without a new version?",
    choices: [
      "Rename `content` to `body`",
      "Add a `pinned` field to every note",
      "Return `{ items: [...] }` instead of an array",
    ],
    correct: 1,
    conceptIds: ["rest-endpoint", "http-get"],
    hint: "Which one only adds?",
    explanation:
      "Adding a field breaks nobody, as long as clients ignore fields they don't know. Renaming a field or changing the array into an object breaks code that reads the old shape.",
  }),
  question({
    id: "http-intermediate-401-403",
    title: "Logged in, but not allowed",
    prompt:
      "Ben is logged in and tries to delete a note that was shared with him to read only. Which status fits?",
    choices: ["401 Unauthorized", "403 Forbidden", "400 Bad Request"],
    correct: 1,
    conceptIds: ["http-status-codes", "http-put-delete"],
    hint: "Does the server know who he is?",
    explanation:
      "401 means the server doesn't know who you are, so logging in could help. Here it knows it's Ben, and he still may not delete the note, so the answer is 403 Forbidden.",
  }),
  question({
    id: "http-intermediate-token-url",
    title: "Where the token goes",
    prompt:
      "A mobile app needs to send its access token with every request. Where should it go?",
    choices: [
      "In the URL: `/api/notes?token=abc`",
      "In the header `Authorization: Bearer abc`",
      "In the request body of every GET",
    ],
    correct: 1,
    conceptIds: ["http-headers"],
    hint: "Where do URLs end up?",
    explanation:
      "URLs are saved in history, server and proxy logs and analytics, so a token in one leaks. The Authorization header is the standard place, and it isn't stored alongside the URL.",
  }),
  // HTTP & APIs: Advanced
  question({
    id: "http-advanced-idempotency-key",
    title: "A retried save",
    prompt:
      "Saving a note with `POST /api/notes` times out, and the client retries. How does the server avoid creating the note twice?",
    choices: [
      "It can't: POST must never be retried",
      "The client sends the same Idempotency-Key on both attempts, and the server replays its stored answer",
      "The client switches to GET for the retry",
    ],
    correct: 1,
    conceptIds: ["http-post", "http-methods"],
    hint: "What could tell the server that two requests are one action?",
    explanation:
      "POST isn't idempotent, so a blind retry can create two notes. With one key per action, the server stores key → response and answers a repeat with the stored response instead of saving again.",
  }),
  question({
    id: "http-advanced-retry-which",
    title: "Worth retrying?",
    prompt: "Which failure should a client retry automatically, with backoff?",
    choices: ["400 Bad Request", "404 Not Found", "503 Service Unavailable"],
    correct: 2,
    conceptIds: ["http-status-codes"],
    hint: "Which one might pass on its own?",
    explanation:
      "A 503 means the server is struggling for now, so waiting and retrying can work. A 400 or 404 means the request itself is wrong or points at nothing, so sending it again gets the same answer.",
  }),
  question({
    id: "http-advanced-retry-after",
    title: "Too many requests",
    prompt:
      "A response is `429 Too Many Requests` with `Retry-After: 30`. What should the client do?",
    choices: [
      "Retry immediately",
      "Wait at least 30 seconds, then try again",
      "Log the user out",
    ],
    correct: 1,
    conceptIds: ["http-status-codes", "http-headers"],
    hint: "The header answers the question “when?”.",
    explanation:
      "429 means the client went over its rate limit, and Retry-After says how many seconds to wait. Retrying sooner just earns another 429 and keeps the server busy refusing requests.",
  }),
  question({
    id: "http-advanced-openapi-path",
    title: "Describing an endpoint",
    prompt:
      "In an OpenAPI document, how is the endpoint for updating one note written under `paths`?",
    choices: [
      '`"/api/notes/:id": { "put": … }`',
      '`"/api/notes/{id}": { "put": … }` with `id` listed in `parameters`',
      '`"PUT /api/notes": { "id": … }`',
    ],
    correct: 1,
    conceptIds: ["rest-endpoint", "http-put-delete"],
    hint: "OpenAPI doesn't use Express's style for parameters.",
    explanation:
      "Paths use curly braces for parameters, and each method is a key under its path. The `id` gets an entry in `parameters` with `in: path`, `required: true` and a schema.",
  }),
  question({
    id: "http-advanced-if-match",
    title: "Two tabs",
    prompt:
      'A note is open in two tabs. Tab A saves. Tab B then sends `PUT /api/notes/7` with `If-Match: "v3"`, but the note is now version 4. What should the server answer?',
    choices: [
      "200 OK, and save tab B's version",
      "304 Not Modified",
      "412 Precondition Failed, without saving",
    ],
    correct: 2,
    conceptIds: ["http-put-delete", "http-headers"],
    hint: "If-Match is a condition on the save.",
    explanation:
      "If-Match says “only save if it is still this version”. It isn't, so the server refuses with 412 and tab A's change survives; tab B reloads and applies its edit to the newer note.",
  }),
  question({
    id: "http-advanced-private-cache",
    title: "Caching notes",
    prompt:
      "`GET /api/notes` returns the logged-in user's notes. Which Cache-Control header is right?",
    choices: [
      "`public, max-age=3600`",
      "`private, no-cache`",
      "`public, no-cache`",
    ],
    correct: 1,
    conceptIds: ["http-headers", "http-get"],
    hint: "Who else could see a shared copy?",
    explanation:
      "`private` keeps the response out of shared caches like CDNs, so nobody else is served your notes, and `no-cache` makes the browser check with the server (using the ETag) before reusing its copy.",
  }),
  // Backend: Basic
  question({
    id: "backend-basic-trust",
    title: "Who owns the note?",
    prompt:
      'A request to create a note arrives with `{ "title": "Milk", "userId": 99 }` in its body, from a user logged in as 7. Whose note should it be?',
    choices: [
      "User 99: the body says so",
      "User 7: the checked login says so",
      "Reject it: bodies can't hold numbers",
    ],
    correct: 1,
    conceptIds: ["controller", "request-body"],
    hint: "Which of the two can the sender change freely?",
    explanation:
      "Anyone can put any id in a body, with curl or DevTools. Who is asking comes from the login the server checked itself (`req.user.id`), so the note belongs to user 7 and the body's `userId` is ignored.",
  }),
  question({
    id: "backend-basic-caret",
    title: "A version range",
    prompt:
      'package.json lists `"express": "^5.3.0"`. Which of these versions may `npm install` choose?',
    choices: ["5.2.9", "5.10.1", "6.0.0"],
    correct: 1,
    conceptIds: ["npm-packages"],
    hint: "^ keeps the first number the same.",
    explanation:
      "A caret range allows 5.3.0 and anything later while the major version stays 5. 5.10.1 is later than 5.3.0 because 10 is more than 3; 5.2.9 is older and 6.0.0 is a new major that may break things.",
  }),
  question({
    id: "backend-basic-env-string",
    title: "A setting from the environment",
    prompt: "The server runs with `PORT=8080`. What is `process.env.PORT + 1`?",
    choices: ["8081", '"80801"', "undefined"],
    correct: 1,
    conceptIds: ["nodejs", "environment-variables"],
    hint: "What type is every value in process.env?",
    explanation:
      'Environment variables are always strings, so `"8080" + 1` joins them into `"80801"`. Turn the value into a number first, as the Notes App does with `Number(process.env.PORT ?? 3000)`.',
  }),
  question({
    id: "backend-basic-create-app",
    title: "Building without listening",
    prompt:
      "Why does the Notes App build its Express app in `createApp()` and only call `listen` in `server.js`?",
    choices: [
      "Express needs two files to start",
      "So tests can use the app with no real port",
      "So the app answers requests faster",
    ],
    correct: 1,
    conceptIds: ["express"],
    hint: "Think about what the tests import.",
    explanation:
      "Tests import `createApp()` and send requests straight to the app it returns. If building the app also opened port 3000, every test file would try to take the same port, and they would clash or hang.",
  }),
  question({
    id: "backend-basic-route-order",
    title: "Which route answers?",
    prompt:
      'A router has `get("/:id", getNote)` and then `get("/latest", latest)`. What runs for `GET /latest`?',
    choices: [
      "latest, because it is an exact match",
      'getNote, with req.params.id = "latest"',
      "Both, one after the other",
    ],
    correct: 1,
    conceptIds: ["express-route"],
    hint: "Does Express look for the best match, or the first one?",
    explanation:
      "Express runs the first route that matches, in the order they were added. `:id` matches any one segment, including the word latest, so getNote answers and latest is never reached. Put fixed paths first.",
  }),
  question({
    id: "backend-basic-params-strings",
    title: "What type is the id?",
    prompt:
      "For `GET /api/notes/7` and the route `/api/notes/:id`, what is `req.params.id === 7`?",
    choices: ["true", "false", "It throws a TypeError"],
    correct: 1,
    conceptIds: ["express-route"],
    hint: "Where does req.params get its values from?",
    explanation:
      'Path parameters are cut out of the URL, so they are always strings: req.params.id is "7", and a string never strictly equals a number. Convert it with Number() first.',
  }),
  question({
    id: "backend-basic-forgot-next",
    title: "A middleware that only logs",
    prompt:
      "`app.use((req, res, next) => { console.log(req.path); })` is added before the routes. What does a browser get for `GET /api/notes`?",
    choices: [
      "The notes, as usual",
      "A 404 Not Found",
      "Nothing: the request hangs",
    ],
    correct: 2,
    conceptIds: ["express-middleware"],
    hint: "What must every middleware do before it finishes?",
    explanation:
      "Middleware must either send a response or call next(). This one does neither, so the request never reaches a route and no answer is ever sent; the browser waits until it times out.",
  }),
  question({
    id: "backend-basic-json-body",
    title: "Where did the body go?",
    prompt:
      "An app has no `app.use(express.json())`. A client POSTs a JSON note. What is `req.body` in the handler?",
    choices: ["The parsed object", "The JSON text", "undefined"],
    correct: 2,
    conceptIds: ["request-body", "express-middleware"],
    hint: "Which piece of code fills in req.body?",
    explanation:
      "Express does not read request bodies by itself. The express.json() middleware parses a JSON body into req.body; without it nothing sets req.body, so it stays undefined.",
  }),
  // Backend: Intermediate
  question({
    id: "backend-intermediate-early-return",
    title: "One answer per request",
    prompt:
      "A controller runs `if (error) res.status(400).json({ error });` and then `res.status(201).json(note);`. What happens for an invalid body?",
    choices: [
      "Only the 400 is sent",
      "The 400 is sent, then the 201 throws an error",
      "Only the 201 is sent",
    ],
    correct: 1,
    conceptIds: ["controller"],
    hint: "Does sending a response stop the function?",
    explanation:
      "res.json sends the answer but does not end the function, so the code carries on and tries to answer again: Cannot set headers after they are sent. Write return res.status(400)… so each path answers once.",
  }),
  question({
    id: "backend-intermediate-owner-id",
    title: "Whose note is it?",
    prompt:
      "In the Notes App, where should `createNote` get the id of the user who owns the new note?",
    choices: ["req.body.userId", "req.params.id", "req.user.id"],
    correct: 2,
    conceptIds: ["controller", "express-middleware"],
    hint: "Which of these can the client not simply make up?",
    explanation:
      "Anything in the body or the URL can be set by whoever sends the request. requireAuth sets req.user from the checked login cookie before the controller runs, so req.user.id is the only id to trust.",
  }),
  question({
    id: "backend-intermediate-server-check",
    title: "The form already checks",
    prompt:
      "The note form has `maxLength={100}`. Someone sends a 5,000-character title with curl. What stops it?",
    choices: [
      "The form's maxLength",
      "Nothing, unless the server checks too",
      "Express rejects long bodies",
    ],
    correct: 1,
    conceptIds: ["request-body", "controller"],
    hint: "Does a curl request ever see the form?",
    explanation:
      "Browser checks only run in the browser. A request sent with curl or a script skips them, so the controller must validate the body itself and answer 400 before anything is saved.",
  }),
  question({
    id: "backend-intermediate-mass-assignment",
    title: "An extra field",
    prompt:
      'A controller saves `{ ...req.body, userId: req.user.id }`. A client sends `{ "title": "Hi", "isAdmin": true }`. What goes wrong?',
    choices: [
      "Nothing: title is valid",
      "isAdmin is saved too",
      "Express removes unknown fields",
    ],
    correct: 1,
    conceptIds: ["request-body"],
    hint: "What does the spread copy?",
    explanation:
      "Spreading the body copies every field the client chose to send. Picking named fields, `const { title, content } = req.body`, is an allowlist: anything else is simply dropped.",
  }),
  question({
    id: "backend-intermediate-env-string",
    title: "Port 30001",
    prompt:
      "With `PORT=3000` set, `app.listen(process.env.PORT + 1)` listens on port 30001. Why?",
    choices: [
      "Environment values are strings",
      "PORT is read before it is set",
      "listen adds a 1 itself",
    ],
    correct: 0,
    conceptIds: ["environment-variables"],
    hint: "What type is everything in process.env?",
    explanation:
      'Every value in process.env is a string, so "3000" + 1 joins them into "30001". Convert when you read it: `Number(process.env.PORT ?? 3000)`.',
  }),
  question({
    id: "backend-intermediate-leaked-secret",
    title: "Pushed by mistake",
    prompt:
      "A commit with the real `JWT_SECRET` in `.env` was pushed to a public repo. What must you do?",
    choices: [
      "Delete .env in a new commit",
      "Rotate the secret on the server",
      "Rename the variable",
    ],
    correct: 1,
    conceptIds: ["environment-variables"],
    hint: "Is the old value still in the history?",
    explanation:
      "The old secret stays in the git history and may already be copied, so treat it as known. Set a new secret on the platform and restart; then add .env to .gitignore.",
  }),
  question({
    id: "backend-intermediate-error-handler",
    title: "The handler never runs",
    prompt:
      '`app.use((err, req, res) => res.status(500).json({ error: "Oops" }))` is the last middleware, but errors never reach it. Why?',
    choices: [
      "It needs four parameters",
      "It must come before the routes",
      "Express 5 has no error handlers",
    ],
    correct: 0,
    conceptIds: ["express-middleware"],
    hint: "How does Express tell error middleware apart?",
    explanation:
      "Express recognises error-handling middleware by its four parameters, (err, req, res, next). With three it is ordinary middleware, so errors skip it and Express's default handler answers.",
  }),
  question({
    id: "backend-intermediate-log-body",
    title: "What not to log",
    prompt:
      "A request logger writes `req.method`, `req.path` and `req.body` for every request. What is the problem?",
    choices: [
      "Logs get slightly longer",
      "Login bodies put passwords in the logs",
      "req.path is not allowed",
    ],
    correct: 1,
    conceptIds: ["express-middleware", "request-body"],
    hint: "What is in the body of POST /api/auth/login?",
    explanation:
      "Bodies can hold passwords, tokens and private note text, and logs are read by many people and tools. Log named, harmless fields such as method, path, status, duration and ids instead.",
  }),
  // Backend: Advanced
  question({
    id: "backend-advanced-service-layer",
    title: "Where the rule goes",
    prompt:
      "A route and a nightly job both create notes, and both must check that the title is at most 100 characters. Where should that check live?",
    choices: [
      "In each controller",
      "In a service both of them call",
      "In the repository, next to the SQL",
      "In the error-handling middleware",
    ],
    correct: 1,
    conceptIds: ["controller"],
    hint: "Which layer takes plain values, with no req or res?",
    explanation:
      "Rules belong in the service layer. It takes plain values (no req or res), so the route, the job and tests all call the same function and get the same check, while controllers and repositories stay simple.",
  }),
  question({
    id: "backend-advanced-fake-repo",
    title: "Testing without a database",
    prompt:
      "The notes service is built with `makeNotesService({ repo })`. How can a test check its rules without a running database?",
    choices: [
      "Mock the whole of Express",
      "Pass a fake repo that keeps notes in an array",
      "Set DATABASE_URL to an empty string",
    ],
    correct: 1,
    conceptIds: ["controller"],
    hint: "What does dependency injection let you swap?",
    explanation:
      "Because the repository is passed in rather than imported, a test can hand the service a fake object with the same functions that stores notes in an array. The rules run as usual and no database is needed.",
  }),
  question({
    id: "backend-advanced-job-queue",
    title: "A slow export",
    prompt:
      "`POST /api/notes/export` builds a PDF of every note, which takes about 20 seconds. What should the route do?",
    choices: [
      "Build it, then answer 201",
      "Add a job to a queue and answer 202",
      "Answer 200 and build it with no await",
      "Raise the request timeout",
    ],
    correct: 1,
    conceptIds: ["express-route"],
    hint: "The user shouldn't wait, and the work shouldn't be lost.",
    explanation:
      "Slow work goes to a job queue: the route stores a small job and answers 202 Accepted at once, and a worker builds the PDF. A promise without await is not retried and is lost if the server restarts.",
  }),
  question({
    id: "backend-advanced-cron-once",
    title: "Three emails each",
    prompt:
      "Every copy of the API starts a timer for `0 8 * * 1` to send weekly summaries. With three copies running, what happens on Monday at 08:00?",
    choices: [
      "One email per user",
      "Three emails per user",
      "No emails: the timers cancel out",
    ],
    correct: 1,
    conceptIds: ["nodejs"],
    hint: "How many processes run that timer?",
    explanation:
      "Each copy runs its own timer, so the job runs three times. A scheduled job must run once: store the schedule in the shared queue, take a lock, or use the platform's scheduler.",
  }),
  question({
    id: "backend-advanced-stateless",
    title: "Logged out at random",
    prompt:
      "An API keeps sessions in a `Map` in memory. After it is scaled to three copies behind a load balancer, users seem logged out at random. Why?",
    choices: [
      "The Map is too small",
      "Each copy has its own Map, so most copies never saw the login",
      "Load balancers delete cookies",
    ],
    correct: 1,
    conceptIds: ["nodejs"],
    hint: "Do separate processes share memory?",
    explanation:
      "Each copy is a separate process with its own memory. Copies that scale out must be stateless: keep logins in a signed token in a cookie, or sessions in Redis or the database.",
  }),
  question({
    id: "backend-advanced-graceful-shutdown",
    title: "On SIGTERM",
    prompt:
      "The platform sends SIGTERM to stop a server during a deploy. What is the graceful thing to do?",
    choices: [
      "Call process.exit(0) at once",
      "Ignore it and keep serving",
      "Stop taking requests, finish the rest, close the pool, exit",
    ],
    correct: 2,
    conceptIds: ["nodejs"],
    hint: "What about requests already in progress?",
    explanation:
      "Graceful shutdown calls server.close() so no new requests arrive but those in flight finish, then closes the database pool and exits. Exiting at once cuts off users mid-request.",
  }),
  // Databases: Basic
  question({
    id: "databases-basic-json-file",
    title: "Two saves at once",
    prompt:
      "A server keeps notes in `notes.json`: each request reads the file, adds a note and writes it back. Two requests add a note at the same moment. What can happen?",
    choices: [
      "Both notes are always saved",
      "One note is lost, with no error",
      "The second request waits its turn",
    ],
    correct: 1,
    conceptIds: ["database"],
    hint: "Both requests read the file before either writes.",
    explanation:
      "Both requests read the same old list, each adds its note to its own copy, and the second write replaces the first. One note silently disappears. A database handles many writes at once without losing any.",
  }),
  question({
    id: "databases-basic-foreign-key",
    title: "A note for nobody",
    prompt:
      "`notes.user_id` is `REFERENCES users (id)`. There is no user with id 9. What does `INSERT INTO notes (user_id, title) VALUES (9, 'Milk')` do?",
    choices: [
      "Saves the note with user_id 9",
      "Saves it with user_id NULL",
      "Fails with a foreign key error",
    ],
    correct: 2,
    conceptIds: ["foreign-key", "one-to-many-relationship"],
    hint: "What does REFERENCES promise about every note?",
    explanation:
      "A foreign key makes the database check that every user_id matches an existing users.id. There is no user 9, so the insert fails with an error and nothing is saved.",
  }),
  question({
    id: "databases-basic-newest-three",
    title: "The three newest",
    prompt: "Which query gives user 1's three newest note titles?",
    choices: [
      "… WHERE user_id = 1 LIMIT 3",
      "… WHERE user_id = 1 ORDER BY created_at DESC LIMIT 3",
      "… ORDER BY created_at DESC LIMIT 3",
    ],
    correct: 1,
    conceptIds: ["sql-select"],
    hint: "You need to filter, then sort, then keep a few.",
    explanation:
      "WHERE keeps only user 1's notes, ORDER BY created_at DESC puts the newest first, and LIMIT 3 keeps three. Without ORDER BY the rows come in no promised order; without WHERE you get everyone's notes.",
  }),
  question({
    id: "databases-basic-returning",
    title: "The new note's id",
    prompt:
      "`createNote` sends `INSERT INTO notes (user_id, title, content) VALUES ($1, $2, $3) RETURNING id, title`. What does RETURNING do?",
    choices: [
      "Sends back the saved row",
      "Saves the row a second time",
      "Undoes the insert on error",
    ],
    correct: 0,
    conceptIds: ["sql-insert"],
    hint: "The client needs the id the database chose.",
    explanation:
      "RETURNING makes the INSERT send back the row it stored, including the id and any defaults the database filled in, in the same round trip. createNote then answers 201 with that row.",
  }),
  question({
    id: "databases-basic-no-where",
    title: "A missing WHERE",
    prompt:
      "Someone runs `DELETE FROM notes;` in psql on the Notes App's database. What happens?",
    choices: [
      "psql refuses without a WHERE",
      "Only the newest note is deleted",
      "Every note of every user is deleted",
    ],
    correct: 2,
    conceptIds: ["sql-update-delete"],
    hint: "Which rows does a statement apply to when nothing picks them?",
    explanation:
      "Without WHERE, an UPDATE or DELETE applies to every row in the table, and SQL has no undo. Run a SELECT with the same WHERE first, or try it inside BEGIN … ROLLBACK.",
  }),
  question({
    id: "databases-basic-rowcount-404",
    title: "Someone else's note",
    prompt:
      "User 3 sends `PUT /api/notes/12`, but note 12 belongs to user 5. The query ends `WHERE id = $3 AND user_id = $4`. What does updateNote answer?",
    choices: [
      "200, and note 12 is changed",
      "404: rowCount is 0",
      "500: the query fails",
      "403 Forbidden",
    ],
    correct: 1,
    conceptIds: ["sql-update-delete", "crud"],
    hint: "Does any row have id 12 and user_id 3?",
    explanation:
      "No row matches both conditions, so nothing changes and rowCount is 0. updateNote answers 404 Note not found, the same as for a note that doesn't exist, so nobody learns which ids exist.",
  }),
  question({
    id: "databases-basic-parameters",
    title: "A strange title",
    prompt:
      'createNote runs `pool.query("INSERT INTO notes (user_id, title) VALUES ($1, $2)", [3, title])` with a title of `\'); DROP TABLE notes; --`. What happens?',
    choices: [
      "The notes table is dropped",
      "A note with that title is saved",
      "PostgreSQL rejects the query",
    ],
    correct: 1,
    conceptIds: ["parameterized-query"],
    hint: "Is the title ever part of the SQL text?",
    explanation:
      "The SQL text and the values are sent separately. PostgreSQL fixes the query's meaning before the values arrive, so the title is only ever data and is saved exactly as typed.",
  }),
  question({
    id: "databases-basic-one-pool",
    title: "A pool per request",
    prompt:
      "A controller creates `new pg.Pool(config)` at the start of every request and never closes it. What goes wrong as traffic grows?",
    choices: [
      "Nothing: pools are free",
      "Queries return stale rows",
      "New connections pile up until PostgreSQL refuses more",
    ],
    correct: 2,
    conceptIds: ["db-connection-pool"],
    hint: "What does a pool open when it is first used?",
    explanation:
      "Each new pool opens its own connections, which is slow, and these are never closed. PostgreSQL limits connections, so it soon refuses. Create one pool in db.js and import it everywhere.",
  }),
  // Databases: Intermediate
  question({
    id: "databases-intermediate-left-join",
    title: "Users with no notes",
    prompt:
      "Ann has 2 notes and Bo has none. Which query lists both, with Bo's count as 0?",
    choices: [
      "JOIN with COUNT(*)",
      "LEFT JOIN with COUNT(n.id)",
      "LEFT JOIN with COUNT(*)",
    ],
    correct: 1,
    conceptIds: ["foreign-key", "one-to-many-relationship", "sql-select"],
    hint: "Which join keeps unmatched users, and which COUNT skips NULL?",
    explanation:
      "An inner JOIN drops Bo. LEFT JOIN keeps him with NULL note columns; COUNT(n.id) skips that NULL and gives 0, while COUNT(*) counts his one row and gives 1.",
  }),
  question({
    id: "databases-intermediate-on-delete",
    title: "Deleting a user",
    prompt:
      "The Notes App's `notes.user_id` says `REFERENCES users (id) ON DELETE CASCADE`. What does `DELETE FROM users WHERE id = 3` do?",
    choices: [
      "Fails while user 3 has notes",
      "Deletes user 3 and all their notes",
      "Deletes user 3; notes keep user_id 3",
      "Sets their notes' user_id to NULL",
    ],
    correct: 1,
    conceptIds: ["foreign-key"],
    hint: "What does CASCADE do to the rows that point at the deleted one?",
    explanation:
      "CASCADE deletes the child rows too, so the user's notes go with them. RESTRICT (or the default) would refuse the delete, and SET NULL would empty user_id, which NOT NULL forbids.",
  }),
  question({
    id: "databases-intermediate-index-order",
    title: "The wrong first column",
    prompt:
      "A table has an index on `(user_id, created_at)`. Which query can't use it to jump to the rows?",
    choices: [
      "WHERE user_id = 3",
      "WHERE user_id = 3 ORDER BY created_at",
      "WHERE created_at > '2026-01-01'",
    ],
    correct: 2,
    conceptIds: ["sql-select"],
    hint: "A composite index is sorted by its first column first.",
    explanation:
      "The index is sorted by user_id, then by created_at within each user. Rows after a date are spread through every user's section, so a search on created_at alone can't start anywhere in it.",
  }),
  question({
    id: "databases-intermediate-index-fk",
    title: "Is the foreign key indexed?",
    prompt:
      "Why does the Notes App's schema.sql add `CREATE INDEX notes_user_id_idx ON notes (user_id)`?",
    choices: [
      "PostgreSQL doesn't index foreign keys by itself",
      "Without it, user_id could repeat",
      "It makes inserts faster",
    ],
    correct: 0,
    conceptIds: ["foreign-key", "sql-select"],
    hint: "Which columns get an index automatically?",
    explanation:
      "PRIMARY KEY and UNIQUE get an index automatically, but a foreign key doesn't. Every notes query filters by user_id, so without this index PostgreSQL would read everyone's notes to find one user's.",
  }),
  question({
    id: "databases-intermediate-migration-edit",
    title: "A migration that already ran",
    prompt:
      "Migration 003 ran in production last week, and its default value was wrong. What's the right fix?",
    choices: [
      "Edit 003 and deploy again",
      "Write a new migration, 005, that fixes it",
      "Run schema.sql again",
    ],
    correct: 1,
    conceptIds: ["sql-table", "database"],
    hint: "Will a database that already ran 003 ever run it again?",
    explanation:
      "The migration tool records 003 as done, so an edited 003 never runs where it already ran, and databases drift apart. A new migration reaches every database in the same order.",
  }),
  question({
    id: "databases-intermediate-n-plus-one",
    title: "Tags in a loop",
    prompt:
      "A page loads 50 notes with one query, then each note's tags with one query per note. How many queries is that, and what fixes it?",
    choices: [
      "50: nothing to fix",
      "51: load every note's tags in one query",
      "2: it's already batched",
    ],
    correct: 1,
    conceptIds: ["sql-select", "one-to-many-relationship"],
    hint: "One for the list, plus one per note.",
    explanation:
      "That's the N+1 problem: 1 query for the notes plus 50 for the tags. One query with WHERE note_id = ANY($1), or a JOIN, loads every note's tags at once, so the count stays at two whatever the number of notes.",
  }),
  // Databases: Advanced
  question({
    id: "databases-advanced-one-client",
    title: "BEGIN on the pool",
    prompt:
      'A controller runs `pool.query("BEGIN")`, two UPDATEs and `pool.query("COMMIT")`, all through `pool.query`. What\'s wrong?',
    choices: [
      "Nothing: the pool keeps it together",
      "Each call may use a different connection",
      "COMMIT must come before the UPDATEs",
    ],
    correct: 1,
    conceptIds: ["db-transaction", "db-connection-pool"],
    hint: "Which connection does each pool.query borrow?",
    explanation:
      "A transaction lives on one connection, but pool.query borrows any free one per call. Borrow one client with pool.connect(), run BEGIN, the changes and COMMIT on it, ROLLBACK on error and release() in finally.",
  }),
  question({
    id: "databases-advanced-lost-update",
    title: "Two withdrawals",
    prompt:
      "Two requests each read a balance of 100, subtract 30 in JavaScript and write the result back. What balance is left?",
    choices: ["40", "70", "100", "An error"],
    correct: 1,
    conceptIds: ["db-transaction", "sql-update-delete"],
    hint: "Both wrote a value worked out from the same old read.",
    explanation:
      "Both write 70, so one withdrawal is lost. Let the database do the maths in one statement (SET balance = balance - 30), or lock the row with SELECT … FOR UPDATE inside a transaction.",
  }),
  question({
    id: "databases-advanced-each-fact-once",
    title: "The email in every note",
    prompt:
      "A table stores the owner's email in every note row. Ana changes her email and one row is missed. What is this problem called?",
    choices: [
      "An update anomaly",
      "A lost update",
      "A deadlock",
      "A foreign key error",
    ],
    correct: 0,
    conceptIds: ["foreign-key", "one-to-many-relationship"],
    hint: "The same fact is stored in many places.",
    explanation:
      "Copies of one fact drift apart when a change misses one: an update anomaly. Normalising stores the email once in users and only user_id in notes, as the Notes App's schema does.",
  }),
  question({
    id: "databases-advanced-rows-removed",
    title: "Rows Removed by Filter",
    prompt:
      "EXPLAIN ANALYZE for listNotes shows `Seq Scan on notes` and `Rows Removed by Filter: 99960` to return 40 rows. What's the likely fix?",
    choices: [
      "Add LIMIT 40",
      "An index on notes (user_id)",
      "Run ANALYZE on users",
    ],
    correct: 1,
    conceptIds: ["sql-select"],
    hint: "How many rows did it read to keep 40?",
    explanation:
      "It read every note and threw almost all away: a sequential scan. An index on the filtered column lets PostgreSQL go straight to the user's rows, which is why the Notes App has notes_user_id_idx.",
  }),
  question({
    id: "databases-advanced-explain-analyze",
    title: "Measuring a DELETE",
    prompt:
      "You want the plan and real timings for a slow DELETE without losing data. What do you run?",
    choices: [
      "EXPLAIN ANALYZE DELETE …",
      "BEGIN; EXPLAIN ANALYZE DELETE …; ROLLBACK;",
      "ANALYZE notes;",
    ],
    correct: 1,
    conceptIds: ["sql-update-delete", "db-transaction"],
    hint: "EXPLAIN ANALYZE really runs the statement.",
    explanation:
      "EXPLAIN ANALYZE executes the query to measure it, so a bare DELETE really deletes. Inside a transaction you get the timings and then roll the change back. ANALYZE alone only refreshes statistics.",
  }),
  question({
    id: "databases-advanced-rpo",
    title: "Nightly backups",
    prompt:
      "Backups run nightly at 02:00. The disk dies at 17:00. How much data can be lost?",
    choices: ["None", "Up to 15 hours of changes", "Only the last minute"],
    correct: 1,
    conceptIds: ["database"],
    hint: "When was the last copy taken?",
    explanation:
      "Everything since the 02:00 backup is gone. How much you can afford to lose is the RPO; to shrink it, use point-in-time recovery, which replays the write-ahead log up to a chosen moment.",
  }),
  question({
    id: "databases-advanced-test-restore",
    title: "A backup that works",
    prompt: "How do you know your backups will actually work?",
    choices: [
      "The backup job reports success",
      "The files are big enough",
      "You restore one into a scratch database",
    ],
    correct: 2,
    conceptIds: ["database"],
    hint: "Only one of these proves the way back.",
    explanation:
      "A job can succeed while dumping the wrong database, or the steps may fail under pressure. Restoring regularly into a scratch database, checking row counts and timing it proves the backup and tells you your real recovery time.",
  }),
];
