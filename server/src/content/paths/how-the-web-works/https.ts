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

// HTTPS and security basics. Why plain HTTP is a postcard, what others can
// still see, the three promises, keys, certificates, a secure connection
// step by step, what the padlock means, certificate warnings, getting
// everything onto HTTPS, the Notes App, mistakes, practice and a recap.
export const httpsModule = moduleLesson(
  "https",
  "HTTPS and security basics",
  40,
  [
    "Explain why plain HTTP isn't private, and what HTTPS adds.",
    "Name HTTPS's three promises: private, unchanged, and really that site.",
    "Read a certificate: who it's for, who vouches for it, and until when.",
    "Say what the padlock does and doesn't tell you, and what a warning means.",
    "Keep a whole site on HTTPS: redirects, HSTS and no mixed content.",
  ],

  part(
    "postcards",
    "Plain HTTP is a postcard",
    explain(
      "An [[http]] request crosses many networks: the café's Wi-Fi, its provider, routers along the way. With plain HTTP the message is readable text, so anyone on that path can read it, and even change it. [[https-basics|HTTPS]] is HTTP sent through [[tls]]: every message is [[encryption|encrypted]] first.",
    ),
    analogy(
      "Plain HTTP is a postcard: every sorting office can read it, or write on it. HTTPS is a sealed envelope that only the person it's addressed to can open, with a seal that shows if anyone tried.",
    ),
    quickCheck(
      "You log in over plain `http://` on café Wi-Fi. Who could read your password?",
      [
        "Nobody: passwords are always hidden",
        "Anyone who can see the traffic on the way, like others on the Wi-Fi",
        "Only the server",
      ],
      1,
      "Plain [[http]] is readable text on the way. That's exactly what HTTPS fixes.",
    ),
  ),

  part(
    "what-they-see",
    "What others can still see",
    explain(
      "HTTPS hides *what* you say, not *that* you're talking. Someone watching the network still sees which computers are connected, roughly which site (the [[domain]] is usually visible), and how much data moves when. Everything inside the request is sealed: the path, the query, the headers, the cookies and the body.",
    ),
    reference("Visible to someone on the Wi-Fi", [
      ["Your and the server's IP", "Yes, with HTTP or HTTPS.", "76.76.21.21"],
      ["The domain", "Usually, even with HTTPS.", "notes.app"],
      ["Path and query", "HTTP: yes. HTTPS: no.", "/search?q=…"],
      ["Headers and cookies", "HTTP: yes. HTTPS: no.", "Cookie: token=…"],
      ["The body", "HTTP: yes. HTTPS: no.", '{"password":"…"}'],
      ["Sizes and timing", "Yes, with HTTP or HTTPS.", "about 40 KB, at 9:02"],
    ]),
  ),

  part(
    "three-promises",
    "Three promises",
    explain(
      "HTTPS makes three promises at once. Your messages are **private**: only the real server can read them. They arrive **unchanged**: any tampering is detected and the connection fails. And you're talking to the **real site**: the server has to prove it owns `notes.app` before anything is sent.",
    ),
    keyPoints(
      "Private: others see noise, not your data.",
      "Unchanged: tampering breaks the connection.",
      "Authentic: the server proves who it is with a certificate.",
    ),
    quickCheck(
      "Someone on the Wi-Fi tries to slip an advert into a page sent over HTTPS. What happens?",
      [
        "The advert appears in the page",
        "The change is detected and the browser rejects it",
        "The page loads twice",
      ],
      1,
      "HTTPS checks every message arrived exactly as sent. A changed message doesn't pass the check.",
    ),
  ),

  part(
    "keys",
    "Scrambling with keys",
    explain(
      "[[encryption|Encryption]] scrambles a message using a **key**, a long secret number; only someone with the right key can unscramble it. The clever part: the browser and server agree on a fresh secret key at the start of each connection *without ever sending it*, so someone watching the whole conversation still can't work it out.",
    ),
    diagram([
      ["Message", "GET /notes"],
      ["Encrypt", "with the secret key"],
      ["On the wire", "x8#Lq…"],
      ["Decrypt", "same key, at the server"],
    ]),
    analogy(
      "Like two people mixing paint: each adds a secret colour to a shared one and swaps the mix. Each can make the same final colour, but someone who only saw the mixes can't unmix them.",
    ),
  ),

  part(
    "certificates",
    "Certificates: proving who you are",
    explain(
      "Anyone can claim to be `notes.app`. To prove it, the server shows a [[certificate]]: a small file that names the domain and is signed by a [[certificate-authority|certificate authority]] (CA), a company your browser already trusts. Click the padlock and open the certificate to see its main parts:",
    ),
    anatomy(
      "One certificate, summarised",
      [
        "Issued to:  notes.app",
        "Issued by:  Let's Encrypt",
        "Valid until: 31 Mar 2027",
        "Public key: 04:a3:5e:…",
      ],
      [
        ["notes.app", "subject", "The domain it's for; must match the URL."],
        ["Let's Encrypt", "issuer", "The CA that checked and signed it."],
        ["31 Mar 2027", "expiry", "After this it's no longer accepted."],
        [
          "04:a3:5e:…",
          "public key",
          "Used in the handshake to prove it's real.",
        ],
      ],
    ),
    keyPoints(
      "The CA checks you control the domain before signing.",
      "Browsers trust a short built-in list of CAs.",
      "Certificates expire after months, so they're renewed automatically.",
    ),
  ),

  part(
    "step-by-step",
    "A secure connection, step by step",
    explain(
      "Step through what happens before your first HTTPS request is sent, and what happens when someone on the Wi-Fi pretends to be the server:",
    ),
    trace(
      "Connecting to https://notes.app",
      [
        "open https://notes.app",
        "connect to port 443",
        "browser: hello, TLS 1.3",
        "server: certificate",
        "name is notes.app?   yes",
        "signed by a known CA? yes",
        "still in date?       yes",
        "agree a secret key",
        "GET / (encrypted)",
        "padlock shown",
        "a fake server on the Wi-Fi",
        "warning: not private",
      ],
      [
        {
          line: 2,
          note: "`https` means port 443. The browser opens a connection to the server's address, which [[dns]] found.",
          vars: [["port", "443"]],
        },
        {
          line: 4,
          note: "The [[tls]] handshake starts. The server answers with its [[certificate]].",
          vars: [["certificate", "notes.app, by Let's Encrypt"]],
        },
        {
          line: 5,
          note: "Check one: is it for the name in the address bar? A certificate for any other domain fails here.",
          vars: [["name matches", "yes"]],
        },
        {
          line: 6,
          note: "Check two: is it signed by a [[certificate-authority]] the browser trusts? Anyone can make a certificate; only a CA's signature counts.",
          vars: [
            ["name matches", "yes"],
            ["trusted CA", "yes"],
          ],
        },
        {
          line: 7,
          note: "Check three: is today between its start and expiry dates?",
          vars: [
            ["name matches", "yes"],
            ["trusted CA", "yes"],
            ["in date", "yes"],
          ],
        },
        {
          line: 8,
          note: "Both sides agree a fresh secret key for this connection. The key itself is never sent over the network.",
          vars: [["key", "agreed, never sent"]],
        },
        {
          line: 9,
          note: "Only now does the first HTTP request go, encrypted with that key. Someone on the Wi-Fi sees noise.",
          vars: [
            ["key", "agreed, never sent"],
            ["on the wire", "x8#Lq…"],
          ],
        },
        {
          line: 10,
          note: "Every check passed, so the browser shows the padlock.",
          output: "secure connection: padlock",
        },
        {
          line: 12,
          note: "A fake server can't get a CA to sign a certificate for `notes.app`, so check two fails. The browser stops and shows a full-page warning instead of sending anything.",
          vars: [["trusted CA", "no"]],
          output: "Your connection is not private",
        },
      ],
      { language: "html" },
    ),
  ),

  part(
    "the-padlock",
    "What the padlock means",
    explain(
      "The padlock means the connection is private and you're really talking to the domain in the address bar. It doesn't mean the site is honest. A scam site at `notes-app-login.example` can get a certificate for *its own* name for free, padlock and all. Always read the domain itself.",
    ),
    keyPoints(
      "Padlock: private, unchanged, really this domain.",
      "It says nothing about whether the site is trustworthy.",
      "Scam sites have padlocks too; read the domain.",
    ),
    quickCheck(
      "An email links to `https://notes-app-login.example`, which shows a padlock. Is it safe to log in?",
      [
        "Yes: the padlock proves it's the Notes App",
        "Not necessarily: the padlock only proves it's really notes-app-login.example",
        "Yes, as long as the page looks right",
      ],
      1,
      "The [[certificate]] proves who owns *that* name. Anyone can register a look-alike domain and get a certificate for it.",
    ),
  ),

  part(
    "warnings",
    "When the browser warns you",
    explain(
      "If any check fails, the browser shows a full-page warning instead of the site. On a site you don't control, that's the browser doing its job: go back. On your own site, the error code tells you what to fix:",
    ),
    reference("Certificate warnings (Chrome's codes)", [
      [
        "ERR_CERT_DATE_INVALID",
        "Expired, or the computer's clock is wrong.",
        "renew it",
      ],
      [
        "ERR_CERT_COMMON_NAME_INVALID",
        "It's for a different name.",
        "www.notes.app vs notes.app",
      ],
      [
        "ERR_CERT_AUTHORITY_INVALID",
        "Not signed by a trusted CA.",
        "self-signed, or a fake",
      ],
    ]),
    quickCheck(
      "Your own site suddenly shows `ERR_CERT_DATE_INVALID` for everyone. What's the likely fix?",
      ["Renew the certificate", "Change the domain", "Turn HTTPS off"],
      0,
      "Certificates expire. Most hosts renew them automatically; when that fails, the site breaks for everyone on the same day.",
    ),
  ),

  part(
    "all-https",
    "Everything on HTTPS",
    explain(
      "A site should never answer over plain HTTP. It redirects `http://` to `https://`, then sends a [[hsts|Strict-Transport-Security]] header so the browser uses HTTPS on its own from then on. Every file the page loads must be HTTPS too: an `http://` script on an HTTPS page is [[mixed-content|mixed content]], and browsers block it.",
    ),
    code(
      "http",
      "moving a visitor to HTTPS, and keeping them there",
      [
        "GET / HTTP/1.1",
        "Host: notes.app",
        "",
        "HTTP/1.1 301 Moved Permanently",
        "Location: https://notes.app/",
        "",
        "HTTP/1.1 200 OK",
        "Strict-Transport-Security: max-age=31536000",
      ],
      {
        1: "a request over plain http://",
        4: "the server won't answer it here…",
        5: "…it points to the https:// address",
        8: "HSTS: use https for this site for a year",
      },
    ),
  ),

  part(
    "notes-app",
    "HTTPS and the Notes App",
    explain(
      "While you build the Notes App it runs on `http://localhost`. That's fine: the traffic never leaves your computer, and browsers treat `localhost` as secure. Online it's served over HTTPS by its host, which gets and renews the certificate for you. The login cookie is marked `secure` in production, so the browser only ever sends it over HTTPS.",
    ),
    inTheNotesApp(
      "`authController.js` sets the login cookie with `secure: true` in production, so it never travels over plain HTTP.",
      { fileId: "backend/src/controllers/authController.js" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "A form that posts to http://",
      language: "html",
      wrong: ['<form action="http://notes.app/login" method="post">'],
      problem:
        "Even on an HTTPS page, this sends the password over plain HTTP, readable by anyone on the way. Browsers warn before submitting it.",
      right: ['<form action="https://notes.app/login" method="post">'],
      why: "Every URL a page uses, for forms, scripts and images, should be `https://`, or a relative URL so it follows the page.",
    }),
    mistake({
      title: "An http:// script on an HTTPS page",
      language: "html",
      wrong: ['<script src="http://cdn.example/chart.js"></script>'],
      problem:
        "That's mixed content. The browser blocks it, because a script changed on the way could take over the whole page. The chart silently never loads.",
      right: ['<script src="https://cdn.example/chart.js"></script>'],
      why: "Load every file over HTTPS. Check the Console for “Mixed Content” errors.",
    }),
    mistake({
      title: "Clicking through a certificate warning",
      language: "bash",
      wrong: ["# “Your connection is not private” → Advanced → Proceed"],
      problem:
        "The warning means the browser can't confirm who's on the other end. Proceeding on public Wi-Fi may send your login to whoever is pretending to be the site.",
      right: ["# go back, then try again on a network you trust"],
      why: "Never click through on someone else's site. On your own, read the error code and fix the certificate.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    pageYourTurn({
      title: "Fix the mixed content",
      task: "This page is served over HTTPS, but its logo and its login form still use `http://`. Change both URLs to `https://`.",
      starter: [
        '<img id="logo" src="http://notes.app/logo.png" alt="Notes">',
        '<form id="login" action="http://notes.app/login" method="post">',
        "  <button>Log in</button>",
        "</form>",
      ],
      checks: [
        {
          kind: "attr",
          label: "The logo loads over HTTPS",
          selector: "#logo",
          name: "src",
          value: "https://notes.app/logo.png",
        },
        {
          kind: "attr",
          label: "The form sends over HTTPS",
          selector: "#login",
          name: "action",
          value: "https://notes.app/login",
        },
      ],
      hint: "Only the scheme changes: `http` becomes `https`. The rest of each URL stays the same.",
      solution: [
        '<img id="logo" src="https://notes.app/logo.png" alt="Notes">',
        '<form id="login" action="https://notes.app/login" method="post">',
        "  <button>Log in</button>",
        "</form>",
      ],
    }),
    pageYourTurn({
      title: "What can they see?",
      task: "You open `https://notes.app/search?q=birthday` on café Wi-Fi. Replace each `?` with `yes` or `no`: can someone else on the Wi-Fi see it?",
      starter: [
        '<p>The domain notes.app: <span id="domain">?</span></p>',
        '<p>The search, q=birthday: <span id="query">?</span></p>',
        '<p>Your login cookie: <span id="cookie">?</span></p>',
        '<p>That you sent some data: <span id="traffic">?</span></p>',
      ],
      checks: [
        {
          kind: "text",
          label: "The domain usually shows",
          selector: "#domain",
          text: "yes",
        },
        {
          kind: "text",
          label: "The query is encrypted",
          selector: "#query",
          text: "no",
        },
        {
          kind: "text",
          label: "Cookies are encrypted",
          selector: "#cookie",
          text: "no",
        },
        {
          kind: "text",
          label: "Traffic itself is visible",
          selector: "#traffic",
          text: "yes",
        },
      ],
      hint: "HTTPS hides what's inside the request (path, query, headers, body), not who's talking or how much.",
      solution: [
        '<p>The domain notes.app: <span id="domain">yes</span></p>',
        '<p>The search, q=birthday: <span id="query">no</span></p>',
        '<p>Your login cookie: <span id="cookie">no</span></p>',
        '<p>That you sent some data: <span id="traffic">yes</span></p>',
      ],
    }),
    pageYourTurn({
      title: "Read the certificate",
      task: "Read the certificate, then replace each `?`: the domain it's for, who signed it, and which check fails if you visit `https://shop.example` with it: `name`, `issuer` or `date`.",
      starter: [
        "<pre>Issued to:   notes.app",
        "Issued by:   Let's Encrypt",
        "Valid until: 31 Mar 2027</pre>",
        '<p>For: <span id="for">?</span></p>',
        '<p>Signed by: <span id="by">?</span></p>',
        '<p>On shop.example, this fails: <span id="fails">?</span></p>',
      ],
      checks: [
        {
          kind: "text",
          label: "The domain it's for",
          selector: "#for",
          text: "notes.app",
        },
        {
          kind: "text",
          label: "The certificate authority",
          selector: "#by",
          text: "Let's Encrypt",
        },
        {
          kind: "text",
          label: "The failing check",
          selector: "#fails",
          text: "name",
        },
      ],
      hint: "“Issued to” is the domain; “Issued by” is the CA. A certificate only works for the name it was issued to.",
      solution: [
        "<pre>Issued to:   notes.app",
        "Issued by:   Let's Encrypt",
        "Valid until: 31 Mar 2027</pre>",
        '<p>For: <span id="for">notes.app</span></p>',
        '<p>Signed by: <span id="by">Let\'s Encrypt</span></p>',
        '<p>On shop.example, this fails: <span id="fails">name</span></p>',
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("HTTPS cheat sheet", [
      ["HTTP", "Readable on the way, like a postcard.", "http://"],
      ["HTTPS", "HTTP inside TLS: private, unchanged, authentic.", "https://"],
      ["still visible", "IPs, usually the domain, sizes, timing.", "notes.app"],
      ["hidden", "Path, query, headers, cookies, body.", "/search?q=…"],
      ["certificate", "Domain + CA signature + expiry.", "Let's Encrypt"],
      ["padlock", "Secure connection, not an honest site.", "read the domain"],
      ["warning", "A check failed: go back.", "ERR_CERT_…"],
      ["301 + HSTS", "Move to HTTPS and stay there.", "max-age=31536000"],
      ["mixed content", "http:// files on an https page.", "blocked"],
    ]),
    quickCheck(
      "Which part of `https://notes.app/notes/7` can someone on the same Wi-Fi usually see?",
      ["`/notes/7`", "`notes.app`", "Both"],
      1,
      "The domain usually shows; the [[path]] travels inside the encrypted request.",
    ),
  ),
);
