import {
  analogy,
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
} from "../blocks.js";

// Clients, servers and the internet. Two computers talking, what a client
// is, what a server is, one server for many clients, the internet as a
// network of networks, packets, the internet and the web, a trip step by
// step, roles not machines (the Notes App), seeing the route yourself,
// mistakes, practice and a recap.
export const clientsAndServersModule = moduleLesson(
  "clients-and-servers",
  "Clients, servers and the internet",
  40,
  [
    "Explain the client–server model: who asks, who answers, and why.",
    "Recognise clients and servers, and see that they're roles, not kinds of machine.",
    "Describe the internet as a network of networks that carries packets.",
    "Tell the internet and the web apart.",
    "Follow a request from your device to a server and back.",
  ],

  part(
    "two-computers",
    "Two computers talking",
    explain(
      "Every time you use a website, two computers are talking. Your device **asks** for something; another computer, often far away, **answers**. The one that asks is the [[client]]. The one that answers is the [[server]]. Everything else in this topic is detail about that conversation.",
    ),
    analogy(
      "Like a restaurant: you (the client) order from the menu, the kitchen (the server) cooks and sends the food out. You never go into the kitchen.",
    ),
    diagram(
      [
        ["Client", "your browser"],
        ["Server", "a computer far away"],
      ],
      true,
    ),
    quickCheck(
      "You open your notes on your phone. Which computer is the client?",
      ["Your phone", "The computer that stores the notes", "Both, equally"],
      0,
      "Your phone asks for the notes, so it's the [[client]]. The computer that has them and answers is the [[server]].",
    ),
  ),

  part(
    "clients",
    "Clients: the ones that ask",
    explain(
      "A client is any program that sends a request and waits for an answer. The one you use most is your [[browser]], but phone apps, smart TVs, game consoles and command-line tools like `curl` are clients too. A client usually starts and stops when you do: close the tab and that client is gone.",
    ),
    keyPoints(
      "A client starts the conversation; it asks first.",
      "Browsers, phone apps and `curl` are all clients.",
      "A client runs on your device, close to you.",
      "It shows you the answer: a page, a list, a video.",
    ),
  ),

  part(
    "servers",
    "Servers: the ones that answer",
    explain(
      "A server is a program that waits for requests and answers them, and by extension the computer it runs on. It's an ordinary computer, usually without a screen, kept always on in a [[data-centre]]. It holds what clients need: pages, files, everyone's data. Servers are named by what they serve:",
    ),
    reference("Kinds of server you'll meet", [
      ["Web server", "Sends pages, styles and scripts.", "index.html"],
      ["API server", "Sends data, often as JSON.", "GET /api/notes"],
      ["Database server", "Stores and finds data.", "PostgreSQL"],
      ["File / CDN server", "Sends images and downloads.", "logo.png"],
      ["Mail server", "Sends and receives email.", "you@notes.app"],
    ]),
    quickCheck(
      "What makes a computer a server?",
      [
        "Special hardware only data centres can buy",
        "It runs a program that waits for requests and answers them",
        "It has no screen",
      ],
      1,
      "Any computer becomes a [[server]] by running a program that listens and answers. Data-centre machines are just ones built to do that all day.",
    ),
  ),

  part(
    "many-clients",
    "One server, many clients",
    explain(
      "One server answers many clients at the same time: thousands of phones and laptops can ask the Notes App's server for notes at once. Each conversation is separate, so the server answers each client with its own data. This split, many clients asking a few always-on servers, is the [[client-server|client–server model]].",
    ),
    diagram([
      ["Phone", "client"],
      ["Laptop", "client"],
      ["Tablet", "client"],
      ["Server", "answers each"],
    ]),
    keyPoints(
      "Clients come and go; the server stays on.",
      "The data lives in one place, so every client sees the same notes.",
      "A busy site runs many copies of its server to share the work.",
    ),
  ),

  part(
    "the-internet",
    "The internet: a network of networks",
    explain(
      "Your home Wi-Fi is a small [[network]]. Your [[isp|internet provider]] has a bigger one, and so does every data centre. The [[internet]] is all of these joined together: a network of networks. A [[router]] at each join passes messages one step closer to where they're going.",
    ),
    diagram([
      ["Your device", "phone, laptop"],
      ["Wi-Fi router", "your home network"],
      ["Your provider", "ISP"],
      ["The backbone", "long-distance cables"],
      ["Data centre", "the server"],
    ]),
    analogy(
      "Like the road system: your street joins a local road, then a motorway, then another city's roads. No one road goes everywhere, but together they reach every door.",
    ),
  ),

  part(
    "packets",
    "Messages travel as packets",
    explain(
      "Big messages don't travel in one piece. They're cut into small [[packet|packets]], each labelled with where it's from and where it's going. Every router reads the label and sends the packet on, one hop at a time. Packets can take different routes and arrive out of order; the receiving computer puts them back together.",
    ),
    keyPoints(
      "A page is cut into many small packets.",
      "Each packet carries the address it's going to.",
      "Routers pass each one a hop closer.",
      "The receiver puts them back in order.",
    ),
    quickCheck(
      "A cable breaks between two routers while a page is loading. What happens?",
      [
        "The whole internet stops",
        "Routers send the remaining packets another way",
        "The page loads without its pictures",
      ],
      1,
      "The internet has many routes between any two places, so routers send packets around the break.",
    ),
  ),

  part(
    "internet-and-web",
    "The internet and the web",
    explain(
      "The [[internet]] is the roads: the networks that carry packets. The [[web]] is one thing that travels on those roads: pages and apps you open in a [[browser]], linked by URLs. Email, video calls, online games and DNS also use the internet without being the web.",
    ),
    reference("Things that use the internet", [
      ["The web", "Pages and apps in a browser.", "notes.app"],
      ["Email", "Messages between mail servers.", "your mail app"],
      ["Video calls", "Live sound and pictures.", "a call app"],
      ["Online games", "Moves sent between players.", "a game"],
      ["DNS", "Turns names into addresses.", "notes.app → 76.76…"],
    ]),
    quickCheck(
      "Are the internet and the web the same thing?",
      [
        "Yes, two names for one thing",
        "No: the web is one service that runs on the internet",
        "No: the internet runs on the web",
      ],
      1,
      "The internet is the network. The web (pages, links, browsers) is one of the things that use it.",
    ),
  ),

  part(
    "a-trip",
    "A request's trip, step by step",
    explain(
      "You're in a café and open your notes. Step through the trip your request takes, and the answer's trip back:",
    ),
    trace(
      "From a café to the server",
      [
        "phone joins café Wi-Fi",
        "browser: get my notes",
        "→ café Wi-Fi router",
        "→ café's provider (ISP)",
        "→ backbone, many hops",
        "→ data centre",
        "server: request arrives",
        "server finds your notes",
        "← the same kind of trip",
        "browser shows the notes",
      ],
      [
        {
          line: 1,
          note: "Joining the Wi-Fi puts your phone on the café's small [[network]], with a way out to the internet through its [[router]].",
          vars: [["network", "café Wi-Fi"]],
        },
        {
          line: 2,
          note: "The browser is the [[client]]. It builds a request and cuts it into [[packet|packets]] addressed to the server.",
          vars: [
            ["client", "your phone's browser"],
            ["packets", "addressed to the server"],
          ],
        },
        {
          line: 3,
          note: "The café's router doesn't know the server, only the way out: it passes the packets to the café's internet provider.",
          vars: [["hops so far", "1"]],
        },
        {
          line: 5,
          note: "Routers on long-distance cables pass the packets on, a hop at a time. Each only knows the next step, not the whole route.",
          vars: [["hops so far", "~12"]],
        },
        {
          line: 7,
          note: "The packets reach the data centre and the [[server]] program puts them back together into one request.",
          vars: [["server", "has the request"]],
        },
        {
          line: 8,
          note: "The server does the work only it can do: it finds *your* notes in its data.",
          vars: [["answer", "your 3 notes"]],
        },
        {
          line: 10,
          note: "The answer travels back in packets, through routers again, and your browser shows it.",
          vars: [
            ["answer", "your 3 notes"],
            ["round trip", "~80 ms"],
          ],
          output: "one request out, one answer back, ~12 hops each way",
        },
      ],
      { language: "html" },
    ),
  ),

  part(
    "roles-not-machines",
    "Roles, not machines",
    explain(
      "“Client” and “server” describe what a program is doing, not what a computer is. The same computer can be both: while you build the Notes App, your laptop runs the browser (a client) *and* the API (a server). And a server can be a client too: the Notes App's API asks the database for notes.",
    ),
    diagram([
      ["Browser", "client"],
      ["Notes API", "server, then client"],
      ["PostgreSQL", "server"],
    ]),
    inTheNotesApp(
      "`request.js` is the client side: every request the React app sends to the API goes through it.",
      { fileId: "frontend/src/services/request.js" },
    ),
    inTheNotesApp(
      "`db.js` is where the API turns client: it connects to PostgreSQL and sends it queries.",
      { fileId: "backend/src/db.js" },
    ),
  ),

  part(
    "see-the-route",
    "See the route yourself",
    explain(
      "`traceroute` (`tracert` on Windows) shows each router your packets pass through on the way to a server. Each line is one hop, and each hop adds a little time. `ping` sends a tiny message and times the round trip. Here's one hop's line taken apart:",
    ),
    anatomy(
      "One hop",
      [" 3  isp-core.example  12.4 ms"],
      [
        ["3", "hop number", "The third router on the way."],
        ["isp-core.example", "router", "Its name, or its IP address."],
        ["12.4 ms", "time", "How long there and back took."],
      ],
    ),
    code(
      "bash",
      "a route from home to a server",
      [
        "$ traceroute notes.app",
        " 1  192.168.1.1        2.1 ms",
        " 2  10.20.0.1          9.8 ms",
        " 3  isp-core.example  12.4 ms",
        " …",
        "12  76.76.21.21       28.0 ms",
        "",
        "$ ping -c 1 notes.app",
        "time=27.9 ms",
      ],
      {
        2: "hop 1: your own Wi-Fi router",
        3: "hop 2: into your provider's network",
        6: "the last hop is the server itself",
        9: "ping: one round trip, about the same as the last hop",
      },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "“The internet is down”",
      language: "bash",
      wrong: ["# notes.app won't load, so the internet is down"],
      problem:
        "One site failing usually means that one server (or your way to it) has a problem. The internet as a whole almost never goes down.",
      right: [
        "$ ping example.com   # do other sites answer?",
        "$ ping notes.app     # does this one?",
      ],
      why: "Check another site first. If others work, the problem is with that one server, not your connection.",
    }),
    mistake({
      title: "Thinking a server is special hardware",
      language: "bash",
      wrong: ["# I need to buy a server before I can build an API"],
      problem:
        "A server is a program that answers requests. Any computer that runs one is a server, including your laptop.",
      right: ["$ npm run dev", "# your laptop is now a server on localhost"],
      why: "You build and test servers on your own computer, then run the same program on one in a data centre.",
    }),
    mistake({
      title: "Thinking the client has the data",
      language: "bash",
      wrong: ["# my notes are saved in my browser"],
      problem:
        "The Notes App's browser side only shows the notes. They live in the server's database, which is why they appear on every device you log in from.",
      right: ["# the browser asks; the server's database keeps the notes"],
      why: "Clients show and send; servers store. Clear your browser and your notes are still on the server.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    pageYourTurn({
      title: "Client or server?",
      task: "Replace each `?` with `client` or `server`, depending on whether that program asks or answers in the Notes App.",
      starter: [
        '<p>Your phone\'s browser: <span id="browser">?</span></p>',
        '<p>The Express API answering /api/notes: <span id="api">?</span></p>',
        '<p>PostgreSQL, storing everyone\'s notes: <span id="db">?</span></p>',
        '<p>A curl command in your terminal: <span id="curl">?</span></p>',
      ],
      checks: [
        {
          kind: "text",
          label: "The browser asks",
          selector: "#browser",
          text: "client",
        },
        {
          kind: "text",
          label: "The API answers",
          selector: "#api",
          text: "server",
        },
        {
          kind: "text",
          label: "The database answers",
          selector: "#db",
          text: "server",
        },
        {
          kind: "text",
          label: "curl asks",
          selector: "#curl",
          text: "client",
        },
      ],
      hint: "Ask of each: does it start the conversation (client), or wait for requests and answer them (server)?",
      solution: [
        '<p>Your phone\'s browser: <span id="browser">client</span></p>',
        '<p>The Express API answering /api/notes: <span id="api">server</span></p>',
        '<p>PostgreSQL, storing everyone\'s notes: <span id="db">server</span></p>',
        '<p>A curl command in your terminal: <span id="curl">client</span></p>',
      ],
    }),
    pageYourTurn({
      title: "Put the trip in order",
      task: "Your request's trip from a laptop at home is mixed up. Move whole lines so it runs from first to last. Change only the order, not the words.",
      starter: [
        '<ol id="trip">',
        "  <li>Your internet provider</li>",
        "  <li>Your laptop's browser</li>",
        "  <li>The server in a data centre</li>",
        "  <li>Your home Wi-Fi router</li>",
        "  <li>The backbone's long-distance routers</li>",
        "</ol>",
      ],
      checks: [
        {
          kind: "text",
          label: "It starts in the browser",
          selector: "#trip li:nth-child(1)",
          text: "Your laptop's browser",
        },
        {
          kind: "text",
          label: "Then your own router",
          selector: "#trip li:nth-child(2)",
          text: "Your home Wi-Fi router",
        },
        {
          kind: "text",
          label: "Then your provider",
          selector: "#trip li:nth-child(3)",
          text: "Your internet provider",
        },
        {
          kind: "text",
          label: "Then the backbone",
          selector: "#trip li:nth-child(4)",
          text: "The backbone's long-distance routers",
        },
        {
          kind: "text",
          label: "And finally the server",
          selector: "#trip li:nth-child(5)",
          text: "The server in a data centre",
        },
      ],
      hint: "Start nearest to you and move outward: your device, your network, your provider's, the long way, their network.",
      solution: [
        '<ol id="trip">',
        "  <li>Your laptop's browser</li>",
        "  <li>Your home Wi-Fi router</li>",
        "  <li>Your internet provider</li>",
        "  <li>The backbone's long-distance routers</li>",
        "  <li>The server in a data centre</li>",
        "</ol>",
      ],
    }),
    pageYourTurn({
      title: "Internet or web?",
      task: "Everything here uses the internet. Replace each `?` with `web` if it's the web (pages and links in a browser), or `internet` if it uses the internet but isn't the web.",
      starter: [
        '<p>Clicking a link on a page: <span id="link">?</span></p>',
        '<p>An email arriving in your mail app: <span id="email">?</span></p>',
        '<p>Opening notes.app in a browser: <span id="page">?</span></p>',
        '<p>A video call in a call app: <span id="call">?</span></p>',
      ],
      checks: [
        {
          kind: "text",
          label: "A link is the web",
          selector: "#link",
          text: "web",
        },
        {
          kind: "text",
          label: "Email isn't the web",
          selector: "#email",
          text: "internet",
        },
        {
          kind: "text",
          label: "A page is the web",
          selector: "#page",
          text: "web",
        },
        {
          kind: "text",
          label: "A video call isn't the web",
          selector: "#call",
          text: "internet",
        },
      ],
      hint: "The web is pages and links in a browser. Other apps that talk over the network use the internet without being the web.",
      solution: [
        '<p>Clicking a link on a page: <span id="link">web</span></p>',
        '<p>An email arriving in your mail app: <span id="email">internet</span></p>',
        '<p>Opening notes.app in a browser: <span id="page">web</span></p>',
        '<p>A video call in a call app: <span id="call">internet</span></p>',
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Clients, servers and the internet", [
      ["client", "Asks first; shows you the answer.", "your browser"],
      ["server", "Waits, answers, keeps the data.", "the Notes API"],
      ["client–server", "Many clients, few always-on servers.", "every site"],
      ["roles", "One program can be both.", "API → database"],
      ["network", "Computers joined together.", "your Wi-Fi"],
      ["internet", "A network of networks.", "Wi-Fi → ISP → …"],
      ["router", "Passes packets one hop on.", "your Wi-Fi box"],
      ["packet", "A small labelled piece of a message.", "part of a page"],
      ["web", "Pages and apps in a browser.", "notes.app"],
      ["traceroute / ping", "See the hops / time a trip.", "ping notes.app"],
    ]),
    quickCheck(
      "Your notes show up on your phone and your laptop. Why?",
      [
        "Each device keeps its own copy and they never differ",
        "Both are clients asking the same server, which keeps the notes",
        "The phone sends them to the laptop directly",
      ],
      1,
      "The [[server]] stores the notes in one place. Every [[client]] you log in from asks it, so they all see the same notes.",
    ),
  ),
);
