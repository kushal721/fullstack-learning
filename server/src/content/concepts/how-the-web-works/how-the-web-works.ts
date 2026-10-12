import type { Concept } from "@fsl/shared";

export const howTheWebWorks: Concept = {
  id: "how-the-web-works",
  slug: "how-the-web-works",
  title: "How the web works",
  topicId: "how-the-web-works",
  summary:
    "The journey a web page takes from a server somewhere on the internet to the browser on your screen, one request and one response at a time.",
  basics: [
    "The internet is a huge network of computers connected to each other. The web is one way of using that network: some computers store pages and data, and other computers ask for them and show them to people.",
    "A program that asks for something is called a client. Your web browser (Chrome, Firefox, Safari, Edge) is a client. A program that waits for questions and answers them is called a server. A server is just a program running on a computer that is always switched on and connected to the internet.",
    "Every page has an address called a URL (Uniform Resource Locator), like `https://example.com/notes`. Typing a URL or clicking a link tells the browser which server to ask and what to ask it for.",
    "Computers on the internet find each other with numbers called IP addresses, like `93.184.215.14`. People are bad at remembering numbers, so we use names like `example.com` instead, and a system called DNS translates the name into the number.",
  ],
  what: [
    'The web is a conversation between clients and servers. The client sends a request ("please give me the page at `/notes`") and the server sends back a response ("here it is", or "not found"). The rules for these messages are called HTTP, and HTTPS is the same thing with encryption so nobody in between can read it.',
    "A URL has parts, and each part has a job. In `https://example.com/notes`, `https` is the protocol (the rules to use for talking), `example.com` is the domain (which server to talk to), and `/notes` is the path (which thing on that server you want).",
  ],
  why: [
    'Knowing this journey explains almost every problem you will meet as a web developer. A blank page, a "site can\'t be reached" error, a `404 Not Found` or a request that never reaches your API each fail at a different step, and once you know the steps you know where to look.',
    "It also explains why a full-stack app is split in two. The browser shows the page and handles clicks, while the server keeps the data safe in a database. They can only work together by sending requests and responses, so everything you build later (forms, `fetch()`, an Express API) is built on this conversation.",
  ],
  howItWorks: [
    'You type `https://example.com` and press Enter. The browser first needs the server\'s IP address, so it asks a DNS server: "what is the address of `example.com`?" The DNS server answers with a number, and the browser remembers it for a while so it does not have to ask again.',
    'The browser opens a connection to that IP address and, because the protocol is `https`, sets up encryption. Then it sends an HTTP request such as `GET / HTTP/1.1`, which means "please give me the main page".',
    "The server receives the request, works out what was asked for and sends back a response: a status code (`200 OK` means success, `404` means not found), some headers (extra information such as `Content-Type: text/html`) and a body, which for a page is the HTML text.",
    "The browser reads the HTML from top to bottom. Every time it finds a link to another file, such as a CSS stylesheet, an image or a JavaScript file, it sends another request for it. HTML gives the page its structure, CSS gives it its look, and JavaScript makes it react to the user. When everything has arrived, the browser draws the page.",
  ],
  basicExample: {
    language: "http",
    code: `GET /notes HTTP/1.1
Host: example.com
Accept: text/html

HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8

<!doctype html>
<html lang="en">
  <head><title>My notes</title></head>
  <body><h1>My notes</h1></body>
</html>`,
    caption:
      "The browser's request (top) asks for the path /notes on example.com; the server's response (bottom) says 200 OK and sends the HTML of the page.",
  },
  internals: [
    "DNS works like a chain of phone books. Your computer first checks its own memory (its cache), then asks a DNS resolver, usually run by your internet provider. If the resolver doesn't know, it asks other DNS servers, from the ones that know about `.com` down to the one responsible for `example.com`, and remembers the answer for next time.",
    "Underneath HTTP, the data travels in small pieces called packets, sent with protocols named TCP and IP. TCP makes sure all the pieces arrive and are put back in the right order, so HTTP can treat the request and response as complete messages.",
    'The port is a number that says which program on the server should get the message, like a flat number in a building. HTTPS uses port 443 and HTTP uses port 80 by default, so you never see them in normal URLs. On your own computer you will see them: `http://localhost:5173` means "this computer, port 5173".',
    "While turning the HTML into a page, the browser builds a tree of objects called the DOM (Document Object Model), applies the CSS rules to it, works out where every box goes (layout) and finally paints the pixels. JavaScript can change the DOM later, and the browser redraws the parts that changed.",
  ],
  howToCreate: [
    {
      text: "Watch a real page load. Open any website in Chrome or Firefox, open the developer tools (F12, or Cmd+Option+I on a Mac), click the Network tab and reload the page. Every row is one request. Click the first row and look at its Headers: you should see the request URL, the method `GET` and the status code `200`.",
    },
    {
      text: "Send a request yourself from a terminal (Terminal on a Mac, PowerShell on Windows) with `curl`, a small program that speaks HTTP. The `-i` flag also prints the response headers.",
      code: {
        language: "bash",
        code: `curl -i https://example.com`,
        caption:
          "It worked if the first line says HTTP/2 200 (or HTTP/1.1 200 OK), followed by headers and then the page's HTML.",
      },
    },
    {
      text: "Ask DNS for a domain's IP address with `nslookup`. This is the same question your browser asks before every new site.",
      code: {
        language: "bash",
        code: `nslookup example.com`,
        caption:
          "It worked if the output ends with one or more Address lines, each holding an IP address. The exact numbers can change over time.",
      },
    },
    {
      text: "Become the server. Make a folder, create a file in it called `index.html`, and start a tiny local web server in that folder with Python (already installed on most Macs) or with Node.js.",
      code: {
        language: "bash",
        code: `mkdir my-site
cd my-site
echo "<h1>Hello from my own server</h1>" > index.html

python3 -m http.server 8000
# or, if you have Node.js: npx serve -l 8000`,
      },
    },
    {
      text: 'Open `http://localhost:8000` in your browser. You should see your heading. Look at the terminal too: the server prints a line such as `"GET / HTTP/1.1" 200` for every request it answers. Your browser was the client and your own computer was the server. Press Ctrl+C in the terminal to stop it.',
    },
  ],
  whereUsed: [
    "Every web page you visit, from a news site to the Notes App, is delivered with this same request and response cycle.",
    "Every time JavaScript calls `fetch()` to load or save data, it sends an HTTP request and waits for a response, just like the browser does for a page.",
    "When something goes wrong, the Network tab in the developer tools shows each request, its status code and the response, which is the first place to look when debugging.",
  ],
  connectsTo: [
    "HTML documents, which are what a server sends back when the browser asks for a page.",
    "CSS and JavaScript files, which the browser requests separately after it reads the HTML.",
    "HTTP methods such as GET and POST, which tell the server what the request wants to do.",
    "Backend servers such as Express, which receive requests, talk to a database and send responses.",
  ],
  projectUsage: [
    {
      explanation:
        "In development the Notes App runs two servers on your computer: the Vite server at `http://localhost:5173` sends the React app (`frontend/index.html` plus the JavaScript and CSS), and the Express API at `http://localhost:3000` answers requests for data.",
      fileId: "frontend/vite.config.js",
      match: '"/api": "http://localhost:3000",',
    },
    {
      explanation:
        "When you save a note, the browser is the client and the Express backend is the server: `createNote()` in `frontend/src/services/notesApi.js` sends `POST /api/notes`, and the backend stores the note in PostgreSQL and sends a response back.",
      fileId: "frontend/src/services/notesApi.js",
      match: "export function createNote({ title, content }) {",
    },
    {
      explanation:
        "Logging in follows the same pattern: the Login page sends `POST /api/auth/login` and waits for the server's response before showing the Dashboard.",
      fileId: "frontend/src/pages/Login.jsx",
      match: "const user = await login({ email, password });",
    },
  ],
  commonMistakes: [
    "Opening an HTML file by double-clicking it (a `file://` URL) and expecting it to behave like a real website. Some features, such as loading JavaScript modules or calling an API, need the page to come from a server. Run a local server and open `http://localhost:...` instead.",
    "Thinking the browser and the server share variables or memory. They are separate programs, often on separate computers, and the only way to pass data between them is to send it in a request or a response.",
    "Mixing up the parts of a URL, for example forgetting the protocol (`localhost:3000/api/notes` instead of `http://localhost:3000/api/notes`) or the port. Read the URL part by part: protocol, domain, port, path.",
    "Assuming a page that shows nothing has a broken server. Open the Network tab first: a red row with `404` means the path is wrong, a failed row with no status means the server is not running or the address is wrong, and a `200` means the problem is in your HTML, CSS or JavaScript.",
  ],
  relatedConcepts: ["html-document", "http-post", "html-form"],
  relatedFiles: [],
  relatedBuildSteps: [],
};
