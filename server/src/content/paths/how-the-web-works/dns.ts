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
  scene,
  trace,
} from "../blocks.js";

// DNS: from names to numbers. Why names and numbers, IP addresses, reading
// a domain, who knows the answer, the animated lookup, a lookup step by
// step, the answer (a record), caching and TTL, looking one up yourself,
// localhost, the Notes App, mistakes, practice and a recap.
export const dnsModule = moduleLesson(
  "dns",
  "DNS: from names to numbers",
  40,
  [
    "Explain why computers use IP addresses and people use domain names.",
    "Read a domain name from right to left: top-level domain, name, subdomain.",
    "Follow a lookup from the browser through the resolver to the name servers.",
    "Read a DNS answer, and say what its TTL means for caching.",
    "Look a name up yourself, and recognise common DNS mistakes.",
  ],

  part(
    "names-and-numbers",
    "Names for people, numbers for computers",
    explain(
      "People remember names like `notes.app`: a [[domain]]. Computers find each other by number: an [[ip-address]] like `76.76.21.21`. Your browser can only connect to a number, so before anything else it has to turn the name into one. That's the job of [[dns]], the Domain Name System.",
    ),
    analogy(
      "Your phone's contacts: you tap a name, and the phone dials the number stored with it. You never need to know the number.",
    ),
    diagram([
      ["notes.app", "the name you type"],
      ["DNS", "looks it up"],
      ["76.76.21.21", "the number"],
    ]),
    quickCheck(
      "What does DNS give the browser?",
      [
        "The page's HTML",
        "The server's IP address for a name",
        "A faster internet connection",
      ],
      1,
      "DNS answers one question: which [[ip-address]] belongs to this name. Getting the page itself comes after, over [[http]].",
    ),
  ),

  part(
    "ip-addresses",
    "IP addresses",
    explain(
      "Every device on the internet has an IP address. The common kind, **IPv4**, is four numbers from 0 to 255 separated by dots. There are only about 4 billion of those, so the newer **IPv6** uses eight groups of hexadecimal digits. Some addresses are special: `127.0.0.1` always means *this computer*.",
    ),
    reference("IP addresses you'll meet", [
      ["IPv4", "Four numbers, 0–255.", "76.76.21.21"],
      ["IPv6", "Eight hex groups; :: skips zeros.", "2606:4700::6810:84e5"],
      ["127.0.0.1", "This computer itself (IPv6: ::1).", "localhost"],
      [
        "192.168.x.x",
        "A private address inside a home network.",
        "192.168.1.20",
      ],
      [
        "1.1.1.1 / 8.8.8.8",
        "Public DNS resolvers you can use.",
        "Cloudflare / Google",
      ],
    ]),
    quickCheck(
      "Which is a valid IPv4 address?",
      ["`76.76.21.21`", "`76.300.21.21`", "`notes.app`"],
      0,
      "Each of the four numbers is 0–255, so 300 is too big. `notes.app` is a name, not an address.",
    ),
  ),

  part(
    "domains",
    "Reading a domain name",
    explain(
      "Domains are read from the **right**. The last label is the [[top-level-domain|top-level domain]] (TLD), like `.com` or `.app`. Before it is the name someone registered, like `notes`. Anything further left is a **subdomain** the owner made up, like `api` or `www`. Each level is managed by someone different, which is how DNS splits the work.",
    ),
    anatomy(
      "One domain, read right to left",
      ["api.notes.app"],
      [
        [
          "api",
          "subdomain",
          "Chosen by the owner of notes.app; could be www, mail, anything.",
        ],
        ["notes", "registered name", "Rented from a registrar, yearly."],
        [
          "app",
          "top-level domain",
          "Run by a registry; .com, .org, .uk are others.",
        ],
      ],
    ),
    quickCheck(
      "In `www.shop.example.co.uk`, which part did the owner make up themselves?",
      ["`co.uk`", "`example`", "`www.shop`"],
      2,
      "`co.uk` is the top-level part, `example` was registered, and everything to its left (`www.shop`) is the owner's own subdomains.",
    ),
  ),

  part(
    "who-knows",
    "Who knows the answer?",
    explain(
      "No single computer holds every address. Your browser asks a [[resolver]], usually run by your internet provider. If it doesn't already know, the resolver asks a **root** server which servers handle the TLD, asks the TLD servers which [[name-server|name server]] handles the domain, then asks that name server for the address.",
    ),
    diagram([
      ["Browser", "asks once"],
      ["Resolver", "does the asking"],
      ["Root", "→ .app servers"],
      [".app servers", "→ notes.app's"],
      ["Name server", "→ 76.76.21.21"],
    ]),
    keyPoints(
      "The browser asks one question and gets one answer.",
      "The resolver walks down: root, then TLD, then the domain's name server.",
      "Only the domain's own name server knows the real answer.",
    ),
  ),

  part(
    "watch-a-lookup",
    "Watch a lookup",
    explain(
      "Here's the same journey as an animation, from the browser's point of view. The resolver's trips to the root and TLD servers are folded into one step: most of the time it has already cached where `.app` lives, so it goes straight to the domain's name server.",
    ),
    scene("dns-lookup"),
    quickCheck(
      "DNS is down. What happens when you open `notes.app`?",
      [
        "The page loads slowly",
        "The browser can't find the server at all",
        "You see the page without colours",
      ],
      1,
      "The browser can only connect to an [[ip-address]]. Without DNS it never learns the number, so it can't reach the server at all.",
    ),
  ),

  part(
    "step-by-step",
    "A lookup, step by step",
    explain(
      "Every step of the way, something checks its own [[cache]] first, so most lookups stop early. Step through a first-ever lookup of `notes.app`, then see what happens a minute later:",
    ),
    trace(
      "Looking up notes.app",
      [
        "type notes.app, press Enter",
        "browser cache?   no",
        "computer (OS)?   no",
        "resolver cache?  no",
        "  root: .app?",
        "  .app: notes.app?",
        "  ns1: notes.app?",
        "resolver caches it: 300 s",
        "connect to 76.76.21.21",
        "a friend, a minute later",
      ],
      [
        {
          line: 2,
          note: "The browser checks its own short-term cache first. This is the first visit, so it's empty.",
          vars: [["browser cache", "empty"]],
        },
        {
          line: 4,
          note: "The operating system has nothing either, so it asks the configured [[resolver]], here `1.1.1.1`. It hasn't seen `notes.app` lately.",
          vars: [
            ["browser cache", "empty"],
            ["resolver cache", "empty"],
          ],
        },
        {
          line: 5,
          note: "The resolver asks a root server. The root doesn't know the address, but it knows who handles `.app`.",
          vars: [["resolver knows", ".app servers"]],
        },
        {
          line: 6,
          note: "The `.app` servers don't know it either, but they know which [[name-server]] the owner of `notes.app` chose.",
          vars: [["resolver knows", "ns1.dns.example"]],
        },
        {
          line: 7,
          note: "The domain's own name server has the record: `76.76.21.21`, with a [[ttl]] of 300 seconds.",
          vars: [["answer", "76.76.21.21"]],
        },
        {
          line: 8,
          note: "The resolver passes the answer back and caches it for 300 seconds. The browser and the OS keep a copy too.",
          vars: [
            ["answer", "76.76.21.21"],
            ["resolver cache", "notes.app, 300 s"],
          ],
        },
        {
          line: 10,
          note: "Your friend's lookup reaches the same resolver, which answers straight from its cache: no root, no TLD, no name server.",
          vars: [
            ["resolver cache", "notes.app, ~240 s left"],
            ["servers asked", "none"],
          ],
          output: "first lookup: 3 servers asked · a minute later: 0",
        },
      ],
      { language: "html" },
    ),
  ),

  part(
    "the-answer",
    "The answer: a DNS record",
    explain(
      "A domain's owner writes its addresses into [[dns-record|DNS records]] at their name server. The one a browser needs is an **A record**: a name, how long it may be cached, and an IPv4 address. Tools like `dig` print it on one line, exactly as the name server stores it (split in two here):",
    ),
    anatomy(
      "One A record",
      ["notes.app.  300  IN  A", "  76.76.21.21"],
      [
        [
          "notes.app.",
          "name",
          "The final dot is the root, which is always there but usually hidden.",
        ],
        [
          "300",
          "TTL",
          "Seconds a resolver may keep this answer before asking again.",
        ],
        ["IN", "class", "Internet. It's always IN today."],
        [
          "A",
          "type",
          "An IPv4 address. AAAA is IPv6; CNAME points to another name.",
        ],
        ["76.76.21.21", "value", "The answer: where notes.app's server is."],
      ],
    ),
    reference("Record types you'll meet", [
      ["A", "Name → IPv4 address.", "notes.app → 76.76.21.21"],
      ["AAAA", "Name → IPv6 address.", "notes.app → 2606:4700::1"],
      [
        "CNAME",
        "Name → another name, looked up in turn.",
        "www.notes.app → notes.app",
      ],
      ["MX", "Where the domain's email goes.", "notes.app → mail.example.com"],
      [
        "NS",
        "Which name servers handle the domain.",
        "notes.app → ns1.dns.example",
      ],
    ]),
  ),

  part(
    "caching-and-ttl",
    "Caching and TTL",
    explain(
      "Asking three servers for every page would be slow, so every answer is [[cache|cached]]: by the resolver, the operating system and the browser. The record's [[ttl]] says how many seconds a copy may be kept. A long TTL means fast lookups; a short one means a change of address reaches everyone sooner.",
    ),
    keyPoints(
      "Cached answers make most lookups take a millisecond or two.",
      "A change only reaches people once their cached copy expires.",
      "Lower the TTL a day before moving servers; raise it again after.",
    ),
    quickCheck(
      "A record has TTL `3600`. You change its address. How long might some people still be sent to the old one?",
      ["Not at all", "Up to an hour", "Up to a year"],
      1,
      "3600 seconds is an hour. A resolver that cached the old answer just before the change can keep using it for that long.",
    ),
  ),

  part(
    "look-it-up",
    "Look a name up yourself",
    explain(
      "You can ask DNS directly from a terminal. `dig` (macOS and Linux) shows the answer and its TTL; `nslookup` works on Windows too. Run the same command twice and the TTL is lower the second time: you got the resolver's cached copy, counting down.",
    ),
    code(
      "bash",
      "asking DNS from a terminal",
      [
        "$ dig +short notes.app",
        "76.76.21.21",
        "",
        "$ dig notes.app",
        ";; ANSWER SECTION:",
        "notes.app.   300   IN   A   76.76.21.21",
        ";; Query time: 21 msec",
        ";; SERVER: 1.1.1.1#53(1.1.1.1)",
        "",
        "$ nslookup notes.app",
      ],
      {
        1: "+short prints only the answer",
        6: "the record: name, TTL, class, type, address",
        7: "run it again and it's ~0 msec: cached",
        8: "which resolver answered (port 53 is DNS)",
        10: "the same question, on any system",
      },
    ),
  ),

  part(
    "localhost",
    "localhost: a name that stays home",
    explain(
      "[[localhost]] always means *this computer*: it's `127.0.0.1`, and the lookup never leaves your machine. Your operating system checks a small **hosts file** before asking DNS, and `localhost` is answered there or built in. That's why apps you run while developing are at addresses like `http://localhost:5173`.",
    ),
    code(
      "bash",
      "the hosts file, checked before DNS",
      ["$ cat /etc/hosts", "127.0.0.1   localhost", "::1         localhost"],
      {
        1: "on Windows: C:\\Windows\\System32\\drivers\\etc\\hosts",
        2: "localhost → this computer (IPv4)",
        3: "the same in IPv6",
      },
    ),
    quickCheck(
      "Your Wi-Fi is off. Can your browser still open `http://localhost:5173`?",
      [
        "Yes: localhost never needs the network or DNS",
        "No: every name needs a DNS server",
        "Only if the TTL hasn't run out",
      ],
      0,
      "`localhost` is answered on your own computer and points back to it, so nothing leaves your machine.",
    ),
  ),

  part(
    "notes-app",
    "DNS and the Notes App",
    explain(
      "While you build the Notes App, its two parts talk over `localhost`: the React app on port 5173 forwards `/api` to the API on port 3000, with no DNS involved. To put it online at a name, you'd add a record at your domain's name server pointing that name at the host that runs the app.",
    ),
    code(
      "bash",
      "records you might add to put the Notes App online",
      [
        "notes.example.com.   300   IN   A       203.0.113.10",
        "www.example.com.     300   IN   CNAME   notes.example.com.",
      ],
      {
        1: "your host gives you an address (this one is a documentation example)",
        2: "a second name that follows the first",
      },
    ),
    inTheNotesApp(
      "`vite.config.js` sends `/api` to `http://localhost:3000`: a name your computer answers itself, so the app works with no internet at all.",
      { fileId: "frontend/vite.config.js" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Moving servers with a long TTL",
      language: "bash",
      wrong: ["notes.app.   86400   IN   A   76.76.21.21"],
      problem:
        "86400 seconds is a day. Change the address now and some people keep reaching the old server for up to 24 hours.",
      right: ["notes.app.   300   IN   A   76.76.21.21"],
      why: "Lower the TTL a day before the move, so caches empty quickly when you change the address.",
    }),
    mistake({
      title: "A typo in the name",
      language: "bash",
      wrong: ["$ dig notes.ap", ";; status: NXDOMAIN"],
      problem:
        "NXDOMAIN means the name doesn't exist. The browser shows “This site can't be reached”, which looks like the server is down.",
      right: ["$ dig notes.app", ";; status: NOERROR"],
      why: "When a site won't load, check the name resolves at all before blaming the server.",
    }),
    mistake({
      title: "Thinking a DNS change is instant",
      language: "bash",
      wrong: [
        "# Changed the A record 2 minutes ago, still the old site? It's broken!",
      ],
      problem:
        "Your resolver, your computer and your browser may all still hold the old answer until their copies expire.",
      right: [
        "$ dig @ns1.dns.example notes.app",
        "# ask the name server itself",
      ],
      why: "Asking the domain's own name server skips the caches and shows whether the change was saved.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    pageYourTurn({
      title: "Put the lookup in order",
      task: "The five steps of a first-ever lookup are mixed up. Move whole lines so they run from first to last. Change only the order, not the words.",
      starter: [
        '<ol id="steps">',
        "  <li>The .app servers name notes.app's name server</li>",
        "  <li>The browser asks the resolver</li>",
        "  <li>The name server answers 76.76.21.21</li>",
        "  <li>The resolver asks a root server</li>",
        "  <li>The browser connects to 76.76.21.21</li>",
        "</ol>",
      ],
      checks: [
        {
          kind: "text",
          label: "First, the browser asks the resolver",
          selector: "#steps li:nth-child(1)",
          text: "The browser asks the resolver",
        },
        {
          kind: "text",
          label: "Then the root server",
          selector: "#steps li:nth-child(2)",
          text: "The resolver asks a root server",
        },
        {
          kind: "text",
          label: "Then the .app servers",
          selector: "#steps li:nth-child(3)",
          text: "The .app servers name notes.app's name server",
        },
        {
          kind: "text",
          label: "Then the name server's answer",
          selector: "#steps li:nth-child(4)",
          text: "The name server answers 76.76.21.21",
        },
        {
          kind: "text",
          label: "Last, the browser connects",
          selector: "#steps li:nth-child(5)",
          text: "The browser connects to 76.76.21.21",
        },
      ],
      hint: "The browser only ever talks to the resolver; the resolver walks down from the root.",
      solution: [
        '<ol id="steps">',
        "  <li>The browser asks the resolver</li>",
        "  <li>The resolver asks a root server</li>",
        "  <li>The .app servers name notes.app's name server</li>",
        "  <li>The name server answers 76.76.21.21</li>",
        "  <li>The browser connects to 76.76.21.21</li>",
        "</ol>",
      ],
    }),
    pageYourTurn({
      title: "Read the answer",
      task: "Read the record from `dig`, then replace each `?` with the right value: the address, how many seconds it may be cached, and the record type.",
      starter: [
        "<pre>shop.example.com.   1800   IN   A   93.184.215.14</pre>",
        '<p>Address: <span id="ip">?</span></p>',
        '<p>Cached for (seconds): <span id="ttl">?</span></p>',
        '<p>Record type: <span id="type">?</span></p>',
      ],
      checks: [
        {
          kind: "text",
          label: "The address",
          selector: "#ip",
          text: "93.184.215.14",
        },
        {
          kind: "text",
          label: "The TTL",
          selector: "#ttl",
          text: "1800",
        },
        {
          kind: "text",
          label: "The type",
          selector: "#type",
          text: "A",
        },
      ],
      hint: "The order is always name, TTL, class (IN), type, value.",
      solution: [
        "<pre>shop.example.com.   1800   IN   A   93.184.215.14</pre>",
        '<p>Address: <span id="ip">93.184.215.14</span></p>',
        '<p>Cached for (seconds): <span id="ttl">1800</span></p>',
        '<p>Record type: <span id="type">A</span></p>',
      ],
    }),
    pageYourTurn({
      title: "Take a domain apart",
      task: "For `api.notes.app`, replace each `?` with the top-level domain, the registered name with its TLD, and the subdomain.",
      starter: [
        "<p>Domain: api.notes.app</p>",
        '<p>Top-level domain: <span id="tld">?</span></p>',
        '<p>Registered domain: <span id="registered">?</span></p>',
        '<p>Subdomain: <span id="sub">?</span></p>',
      ],
      checks: [
        {
          kind: "text",
          label: "The top-level domain",
          selector: "#tld",
          text: "app",
        },
        {
          kind: "text",
          label: "The registered domain",
          selector: "#registered",
          text: "notes.app",
        },
        {
          kind: "text",
          label: "The subdomain",
          selector: "#sub",
          text: "api",
        },
      ],
      hint: "Read from the right: the last label is the TLD, then the registered name, then whatever is left.",
      solution: [
        "<p>Domain: api.notes.app</p>",
        '<p>Top-level domain: <span id="tld">app</span></p>',
        '<p>Registered domain: <span id="registered">notes.app</span></p>',
        '<p>Subdomain: <span id="sub">api</span></p>',
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("DNS cheat sheet", [
      ["IP address", "A computer's number.", "76.76.21.21"],
      ["domain", "A name for people; read right to left.", "api.notes.app"],
      ["resolver", "Looks names up for you, and caches.", "1.1.1.1"],
      [
        "root → TLD → name server",
        "Who the resolver asks, in order.",
        ". → .app → ns1.dns.example",
      ],
      [
        "A record",
        "Name, TTL, IN, A, address.",
        "notes.app. 300 IN A 76.76.21.21",
      ],
      ["TTL", "Seconds an answer may be cached.", "300 = five minutes"],
      ["dig / nslookup", "Ask DNS from a terminal.", "dig +short notes.app"],
      ["localhost", "This computer; no DNS needed.", "127.0.0.1"],
      ["NXDOMAIN", "The name doesn't exist.", "a typo, or an expired domain"],
    ]),
    quickCheck(
      "You open a site for the first time today. Who does your **browser** send its DNS question to?",
      [
        "The root server",
        "The site's own name server",
        "A resolver, which asks the others for it",
      ],
      2,
      "The browser asks one [[resolver]] and gets one answer. The resolver is the one that walks from the root to the TLD to the domain's name server.",
    ),
  ),
);
