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

// Ports and TCP: the connection. Why ports, port numbers, both ends of a
// connection, listening, why TCP, the handshake, a connection step by step,
// reusing connections, TCP and UDP, the Notes App's ports, mistakes,
// practice and a recap.
export const portsAndTcpModule = moduleLesson(
  "ports-and-tcp",
  "Ports and TCP: the connection",
  40,
  [
    "Explain what a port is, and name the ports you'll meet most.",
    "Read a connection as two ends, each an IP address and a port.",
    "Say what TCP adds: complete, in-order delivery, with lost packets resent.",
    "Follow a TCP connection from handshake to close, and why reuse matters.",
    "Tell TCP and UDP apart, and fix common port mistakes.",
  ],

  part(
    "many-programs",
    "One computer, many programs",
    explain(
      "An [[ip-address]] gets a message to the right computer. But one computer runs many programs at once: a web server, a database, an email server. A [[port]] is a number from 0 to 65535 that says which program should get the message. A program that wants messages **listens** on a port; every message arrives addressed to an IP *and* a port.",
    ),
    analogy(
      "The IP address is a block of flats; the port is the flat number. The post reaches the building by its street address, and the right door by its number.",
    ),
    quickCheck(
      "Why can one computer run a website and a database at the same time?",
      [
        "They listen on different ports",
        "They take turns every second",
        "They need two IP addresses",
      ],
      0,
      "Each program listens on its own [[port]], so each message reaches the right one.",
    ),
  ),

  part(
    "port-numbers",
    "Port numbers you'll meet",
    explain(
      "Common services have standard ports, so clients know where to knock without being told. Browsers add 443 for `https://` and 80 for `http://`, which is why you almost never type them. Ports below 1024 are reserved for well-known services; development tools pick higher ones like 3000 or 5173.",
    ),
    reference("Ports you'll meet", [
      ["443", "HTTPS: almost every website.", "https://notes.app"],
      ["80", "Plain HTTP; usually redirects to 443.", "http://notes.app"],
      ["53", "DNS lookups.", "1.1.1.1:53"],
      ["22", "SSH: logging in to a server.", "ssh you@server"],
      ["5432", "PostgreSQL databases.", "localhost:5432"],
      ["3000", "A common dev server port.", "the Notes API"],
      ["5173", "Vite's dev server.", "the React app"],
    ]),
  ),

  part(
    "both-ends",
    "Both ends of a connection",
    explain(
      "A connection has two ends, and each is an IP address plus a port. The server's port is fixed and well known, like 443. Your end gets a temporary port picked by your operating system for this one connection, so ten open tabs are ten different connections to the same server:",
    ),
    anatomy(
      "One connection, two ends",
      ["from 192.168.1.20:52144", "  to 76.76.21.21:443"],
      [
        ["192.168.1.20", "your IP", "Your device, on your home network."],
        ["52144", "your port", "Temporary: picked just for this connection."],
        ["76.76.21.21", "server IP", "Where notes.app lives; DNS found it."],
        ["443", "server port", "Fixed: the HTTPS program listens here."],
      ],
    ),
  ),

  part(
    "listening",
    "Listening on a port",
    explain(
      "A server program starts by asking the operating system for a port: it **listens** there, and connections to that port are handed to it. Only one program can listen on a port at a time, so starting a second copy fails. If nothing is listening, a connection is refused straight away.",
    ),
    code(
      "bash",
      "starting, clashing and finding a server",
      [
        "$ node src/server.js",
        "Notes API listening on",
        "  http://localhost:3000",
        "",
        "$ node src/server.js  # again",
        "Error: listen EADDRINUSE:",
        "  address already in use :::3000",
        "",
        "$ lsof -i :3000",
        "COMMAND  PID  …  NAME",
        "node    4182  …  *:3000 (LISTEN)",
      ],
      {
        3: "the API now owns port 3000",
        6: "address in use: port 3000 is taken",
        9: "which program is on port 3000?",
        11: "process 4182: stop it, or use another port",
      },
    ),
  ),

  part(
    "why-tcp",
    "Why TCP?",
    explain(
      "The internet only promises to *try* to deliver each [[packet]]. Packets get lost, arrive twice or arrive out of order. [[tcp]], the Transmission Control Protocol, builds a reliable connection on top: it numbers every packet, the receiver confirms what arrived, and anything missing is sent again. HTTP (until HTTP/3) runs on TCP.",
    ),
    analogy(
      "Like posting a book one numbered page at a time, with the reader texting back “got up to page 40”. If page 12 goes missing, you post page 12 again.",
    ),
    keyPoints(
      "TCP numbers every packet it sends.",
      "The receiver acknowledges what arrived.",
      "Missing packets are sent again.",
      "The app gets every byte, in order, or an error.",
    ),
  ),

  part(
    "handshake",
    "The handshake",
    explain(
      "Before any data, the two ends open the connection with a **three-way handshake**: the client says SYN (“let's talk”), the server answers SYN-ACK (“OK, let's”), and the client says ACK (“great”). That costs one round trip before the first byte of HTTP. For HTTPS, the [[tls]] handshake comes next, on the same connection.",
    ),
    diagram([
      ["SYN", "client: let's talk"],
      ["SYN-ACK", "server: OK"],
      ["ACK", "client: connected"],
      ["Data", "HTTP can start"],
    ]),
    quickCheck(
      "The server is 50 ms away (100 ms there and back). How long before the browser can even send `GET /`?",
      [
        "No time at all",
        "At least one round trip, about 100 ms",
        "Ten round trips",
      ],
      1,
      "The handshake needs a reply from the server before data can flow: one round trip of [[latency]].",
    ),
  ),

  part(
    "step-by-step",
    "A connection, step by step",
    explain(
      "Step through one connection: the handshake, a request whose answer loses a packet on the way, and the close:",
    ),
    trace(
      "One TCP connection to notes.app:443",
      [
        "connect 76.76.21.21:443",
        "→ SYN",
        "← SYN-ACK",
        "→ ACK: connected",
        "(TLS handshake for https)",
        "→ GET /api/notes",
        "← packets 1, 2, 3",
        "  packet 2 is lost",
        "→ ACK: have 1, need 2",
        "← packet 2, sent again",
        "app reads the response",
        "→ FIN: close",
      ],
      [
        {
          line: 1,
          note: "Your OS picks a temporary port, say 52144, for your end. The server's end is port 443.",
          vars: [["connection", "…:52144 → 76.76.21.21:443"]],
        },
        {
          line: 4,
          note: "Three messages, one round trip: both ends now agree the connection is open, and on where their packet numbering starts.",
          vars: [
            ["state", "connected"],
            ["round trips", "1"],
          ],
        },
        {
          line: 6,
          note: "The request goes out. For https, the [[tls]] handshake ran first, and everything from here is encrypted.",
          vars: [["state", "connected"]],
        },
        {
          line: 8,
          note: "The response is too big for one [[packet]], so it's sent as three. Packet 2 is lost somewhere on the way.",
          vars: [
            ["received", "1, 3"],
            ["missing", "2"],
          ],
        },
        {
          line: 10,
          note: "The client acknowledges what it has; the server notices packet 2 never got through and sends it again.",
          vars: [
            ["received", "1, 2, 3"],
            ["missing", "none"],
          ],
        },
        {
          line: 11,
          note: "Only now does the browser get the response: complete and in order. It never saw the loss, only a little delay.",
          vars: [["received", "1, 2, 3"]],
          output: "200 OK · the whole response, in order",
        },
        {
          line: 12,
          note: "When neither side needs it any more, FIN closes the connection. Until then it can carry more requests.",
          vars: [["state", "closed"]],
        },
      ],
      { language: "html" },
    ),
  ),

  part(
    "reuse",
    "Reusing connections",
    explain(
      "Every new connection costs a handshake, plus a TLS handshake for HTTPS: two or three round trips before any data. So clients keep connections open and reuse them. Browsers send many requests down one connection ([[http]] keep-alive), and HTTP/2 runs them all at once over a single connection.",
    ),
    keyPoints(
      "A new connection costs one round trip; HTTPS adds more.",
      "Browsers keep connections open and reuse them.",
      "HTTP/2 sends many requests at once on one connection.",
      "Servers do the same with their databases: a connection pool.",
    ),
  ),

  part(
    "tcp-and-udp",
    "TCP and UDP",
    explain(
      "TCP's reliability costs time: waiting for a resent packet holds up everything behind it. [[udp]] skips all that: no handshake, no numbering, no resending. Packets that are lost stay lost. That suits things where *late* is as bad as *lost*: live calls, games and quick DNS lookups. HTTP/3 runs on QUIC, which builds its own reliability on UDP.",
    ),
    reference("TCP or UDP?", [
      ["TCP", "Reliable, in order; a handshake first.", "web pages, APIs"],
      ["UDP", "Fast; lost packets stay lost.", "calls, games"],
      ["DNS", "Usually UDP: one small question.", "port 53"],
      ["HTTP/1.1, HTTP/2", "Run on TCP.", "most of the web"],
      ["HTTP/3", "Runs on QUIC, on UDP.", "Google, Cloudflare"],
    ]),
    quickCheck(
      "In a video call, one packet of sound is lost. Why is UDP better here than TCP?",
      [
        "UDP resends it faster",
        "Waiting for a resend would freeze the call; skipping a moment is better",
        "UDP never loses packets",
      ],
      1,
      "By the time a resent packet arrived, the moment has passed. A tiny glitch beats a frozen call.",
    ),
  ),

  part(
    "notes-app",
    "Ports in the Notes App",
    explain(
      "In development the Notes App is three programs, each listening on its own port: the React app on 5173, the API on 3000 and PostgreSQL on 5432. The browser only ever talks to 5173; Vite forwards `/api` to 3000, and the API talks to 5432. The API reads its port from `PORT`, so a host can choose a different one.",
    ),
    diagram([
      ["Browser", "→ localhost:5173"],
      ["Vite", "React app · forwards /api"],
      ["API", "localhost:3000"],
      ["PostgreSQL", "localhost:5432"],
    ]),
    inTheNotesApp("`server.js` listens on `PORT`, or 3000 if it isn't set.", {
      fileId: "backend/src/server.js",
    }),
    inTheNotesApp(
      "`db.js` keeps a pool of open database connections, because opening a new one costs a handshake every time.",
      { fileId: "backend/src/db.js" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Starting a server twice",
      language: "bash",
      wrong: [
        "$ npm run dev",
        "Error: listen EADDRINUSE: address already in use :::3000",
      ],
      problem:
        "Another program, often an old copy of the same server in a forgotten terminal, is already listening on port 3000.",
      right: ["$ lsof -i :3000   # find it, then stop it", "$ npm run dev"],
      why: "Only one program can listen on a port. Stop the old one, or start the new one with another `PORT`.",
    }),
    mistake({
      title: "Leaving the port out of a dev URL",
      language: "bash",
      wrong: ["$ curl http://localhost/api/notes", "Connection refused"],
      problem:
        "With no port, `http://` means port 80, where nothing is listening. The API is on 3000.",
      right: ["$ curl http://localhost:3000/api/notes"],
      why: "Only 80 and 443 are filled in for you. Every other port has to be in the URL.",
    }),
    mistake({
      title: "Hard-coding the port",
      wrong: ["app.listen(3000);"],
      problem:
        "Many hosts tell your app which port to use through the `PORT` environment variable. Ignore it and the host can't reach your app.",
      right: [
        "const port = Number(process.env.PORT ?? 3000);",
        "app.listen(port);",
      ],
      why: "Read the port from the environment, with a sensible default for development.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    pageYourTurn({
      title: "Which port?",
      task: "Replace each `?` with the port number that program or URL uses.",
      starter: [
        '<p>https://notes.app: <span id="https">?</span></p>',
        '<p>http://notes.app: <span id="http">?</span></p>',
        '<p>The Notes API in development: <span id="api">?</span></p>',
        '<p>PostgreSQL: <span id="db">?</span></p>',
      ],
      checks: [
        {
          kind: "text",
          label: "HTTPS",
          selector: "#https",
          text: "443",
        },
        {
          kind: "text",
          label: "Plain HTTP",
          selector: "#http",
          text: "80",
        },
        {
          kind: "text",
          label: "The Notes API",
          selector: "#api",
          text: "3000",
        },
        {
          kind: "text",
          label: "PostgreSQL",
          selector: "#db",
          text: "5432",
        },
      ],
      hint: "The table of ports you'll meet has all four. The browser fills in two of them for you.",
      solution: [
        '<p>https://notes.app: <span id="https">443</span></p>',
        '<p>http://notes.app: <span id="http">80</span></p>',
        '<p>The Notes API in development: <span id="api">3000</span></p>',
        '<p>PostgreSQL: <span id="db">5432</span></p>',
      ],
    }),
    pageYourTurn({
      title: "Order the handshake",
      task: "The start of a connection is mixed up. Move whole lines so it runs from first to last. Change only the order, not the words.",
      starter: [
        '<ol id="steps">',
        "  <li>Server: SYN-ACK</li>",
        "  <li>Client: GET /api/notes</li>",
        "  <li>Client: SYN</li>",
        "  <li>Client: ACK</li>",
        "</ol>",
      ],
      checks: [
        {
          kind: "text",
          label: "The client opens with SYN",
          selector: "#steps li:nth-child(1)",
          text: "Client: SYN",
        },
        {
          kind: "text",
          label: "The server answers SYN-ACK",
          selector: "#steps li:nth-child(2)",
          text: "Server: SYN-ACK",
        },
        {
          kind: "text",
          label: "The client confirms with ACK",
          selector: "#steps li:nth-child(3)",
          text: "Client: ACK",
        },
        {
          kind: "text",
          label: "Only then the request",
          selector: "#steps li:nth-child(4)",
          text: "Client: GET /api/notes",
        },
      ],
      hint: "“Let's talk”, “OK, let's”, “great”, and only then the data.",
      solution: [
        '<ol id="steps">',
        "  <li>Client: SYN</li>",
        "  <li>Server: SYN-ACK</li>",
        "  <li>Client: ACK</li>",
        "  <li>Client: GET /api/notes</li>",
        "</ol>",
      ],
    }),
    pageYourTurn({
      title: "Read the connection",
      task: "Read the connection, then replace each `?`: the server's IP address, the server's port, and your end's temporary port.",
      starter: [
        "<pre>192.168.1.20:61002 → 104.18.6.7:443</pre>",
        '<p>Server IP: <span id="server-ip">?</span></p>',
        '<p>Server port: <span id="server-port">?</span></p>',
        '<p>Your temporary port: <span id="client-port">?</span></p>',
      ],
      checks: [
        {
          kind: "text",
          label: "The server's IP",
          selector: "#server-ip",
          text: "104.18.6.7",
        },
        {
          kind: "text",
          label: "The server's port",
          selector: "#server-port",
          text: "443",
        },
        {
          kind: "text",
          label: "Your temporary port",
          selector: "#client-port",
          text: "61002",
        },
      ],
      hint: "Each end is IP:port. The arrow points from you to the server; the server's port is the well-known one.",
      solution: [
        "<pre>192.168.1.20:61002 → 104.18.6.7:443</pre>",
        '<p>Server IP: <span id="server-ip">104.18.6.7</span></p>',
        '<p>Server port: <span id="server-port">443</span></p>',
        '<p>Your temporary port: <span id="client-port">61002</span></p>',
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Ports and TCP cheat sheet", [
      ["port", "Which program on a computer: 0–65535.", "443"],
      ["listen", "A server claims a port; one at a time.", "app.listen(3000)"],
      ["connection", "Two ends, each IP:port.", "…:52144 → …:443"],
      ["TCP", "Reliable: numbered, acknowledged, resent.", "HTTP/1.1, /2"],
      ["handshake", "SYN, SYN-ACK, ACK: one round trip.", "before any data"],
      [
        "reuse",
        "Keep connections open: no new handshake.",
        "keep-alive, pools",
      ],
      ["UDP", "No handshake, no resends: fast.", "calls, games, DNS"],
      ["EADDRINUSE", "That port is taken.", "lsof -i :3000"],
      ["refused", "Nothing listening on that port.", "wrong port?"],
    ]),
    quickCheck(
      "Your browser shows “connection refused” for `http://localhost:3000`. What's the likeliest cause?",
      [
        "The internet is down",
        "Nothing is listening on port 3000: the API isn't running",
        "The page has a CSS error",
      ],
      1,
      "A refused connection means no program is listening on that [[port]]. Start the server, or check the port number.",
    ),
  ),
);
