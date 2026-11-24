import type { LevelPlan } from "@fsl/shared";
import {
  code,
  diagram,
  explain,
  inTheNotesApp,
  keyPoints,
  lesson,
  levelCheck,
  quickCheck,
} from "../blocks.js";

// Advanced: steps 29–38. The details professionals need: security, speed
// and scale, ending with the Notes App's real path in production.
export const advanced: LevelPlan = {
  outcome:
    "Reason about TLS, DNS records, CORS, CDNs, load balancers and where the time goes.",
  steps: [
    lesson(
      "tls-handshake",
      "The TLS handshake",
      4,
      explain(
        "Before HTTPS sends anything, the browser and server run a [[tls]] handshake. The server shows its [[certificate]]; the browser checks it, and they agree on keys for encryption.",
      ),
      diagram([
        ["Hello", "which versions?"],
        ["Certificate", "proves the domain"],
        ["Keys", "agreed in secret"],
        ["HTTP", "now encrypted"],
      ]),
      keyPoints(
        "The certificate is signed by an authority the browser trusts.",
        "An expired or wrong certificate shows a full-page warning.",
        "Let's Encrypt gives certificates for free.",
      ),
    ),
    lesson(
      "dns-records",
      "DNS records",
      4,
      explain(
        "A domain's DNS settings are a list of [[dns-record|records]]. Each has a type and a [[ttl]]: how long resolvers may keep it.",
      ),
      code(
        "bash",
        "dig notes.app",
        [
          "notes.app.      300  IN  A      76.76.21.21",
          "www.notes.app.  300  IN  CNAME  notes.app.",
          "notes.app.      3600 IN  MX     10 mail.notes.app.",
        ],
        {
          1: "A: name → IPv4 address",
          2: "CNAME: an alias",
          3: "MX: where email goes",
        },
      ),
      quickCheck(
        "You're moving to a new server tomorrow. What helps the change spread fast?",
        ["Lowering the TTL today", "Changing the port", "Turning off HTTPS"],
        0,
        "With a short [[ttl]], resolvers drop their cached copy quickly and pick up the new address.",
      ),
    ),
    lesson(
      "http2-and-http3",
      "HTTP/2 and HTTP/3",
      3,
      explain(
        "HTTP/1.1 sends one request at a time per connection. [[http2|HTTP/2]] sends many at once over one connection; HTTP/3 does the same over QUIC, so one lost packet doesn't hold up the rest.",
      ),
      keyPoints(
        "You don't change your code: browser and server agree on the version.",
        "Fewer connections means fewer handshakes.",
        "Many small files hurt less than they used to.",
      ),
      quickCheck(
        "What do you change in your app to use HTTP/2?",
        [
          "Every fetch call",
          "Nothing: the browser and server agree on it",
          "The HTML",
        ],
        1,
        "[[http2|HTTP/2]] is negotiated between browser and server; app code stays the same.",
      ),
    ),
    lesson(
      "origins-and-cors",
      "Origins and CORS",
      4,
      explain(
        "An [[origin]] is protocol + domain + port. Browsers keep origins apart, so a page on one can't read data from another, unless that server allows it with [[cors-basics|CORS]].",
      ),
      code(
        "http",
        "a CORS answer",
        [
          "OPTIONS /api/notes HTTP/1.1",
          "Origin: https://notes.app",
          "",
          "HTTP/1.1 204 No Content",
          "Access-Control-Allow-Origin: https://notes.app",
          "Access-Control-Allow-Methods: GET, POST",
        ],
        { 1: "the browser asks first", 5: "this origin may call me" },
      ),
      quickCheck(
        "Your API works in curl but the browser blocks it. Most likely?",
        [
          "The API is down",
          "CORS: the API didn't allow the page's origin",
          "DNS is wrong",
        ],
        1,
        "[[cors-basics|CORS]] is enforced by the browser only; curl ignores it.",
      ),
    ),
    lesson(
      "load-balancers",
      "Load balancers",
      3,
      explain(
        "One server can only do so much. A [[load-balancer]] spreads incoming requests across several copies of your app, and stops sending to any that fail.",
      ),
      diagram([
        ["Requests", "many visitors"],
        ["Load balancer", "picks a copy"],
        ["App × 3", "identical copies"],
      ]),
      keyPoints(
        "Copies must not keep logged-in users in memory.",
        "Keep shared data in the database or a session store.",
        "Adding copies is called scaling out.",
      ),
    ),
    lesson(
      "proxies",
      "Proxies",
      3,
      explain(
        "A [[proxy]] sits between client and server and passes messages on. A reverse proxy sits in front of your app and handles HTTPS, caching and compression for it.",
      ),
      diagram([
        ["Browser", "the client"],
        ["Reverse proxy", "TLS, cache, gzip"],
        ["Your app", "just the logic"],
      ]),
      quickCheck(
        "Why put a reverse proxy in front of an app?",
        [
          "To take shared jobs like HTTPS and caching off the app",
          "To make DNS lookups faster",
          "To store the database",
        ],
        0,
        "A reverse [[proxy]] handles the same jobs for every request, so the app only does its own logic.",
      ),
    ),
    lesson(
      "websockets",
      "WebSockets: live updates",
      3,
      explain(
        "Normal HTTP is ask-then-answer; the server can't speak first. A [[websocket]] starts as an HTTP request, then stays open so both sides can send at any time.",
      ),
      keyPoints(
        "Used for chat, live scores and collaborative editing.",
        "One connection stays open instead of asking again and again.",
        "The Notes App doesn't need one: it asks when you act.",
      ),
      quickCheck(
        "A chat app must show new messages instantly. What fits best?",
        ["A WebSocket", "A 301 redirect", "A longer cache time"],
        0,
        "A [[websocket]] lets the server push each message the moment it arrives.",
      ),
    ),
    lesson(
      "latency",
      "Where the time goes",
      3,
      explain(
        "[[latency]] is the waiting before data arrives. Each round trip adds some: the DNS lookup, the TCP connection, the TLS handshake, then the request itself.",
      ),
      keyPoints(
        "DNS lookup: about 20 ms (none if cached).",
        "TCP + TLS: one or two round trips.",
        "Request and response: one more, plus the server's work.",
        "CDNs, caching and HTTP/2 each remove some of these.",
      ),
      quickCheck(
        "Which change removes round trips for a visitor far away?",
        [
          "Serving files from a CDN near them",
          "Making the HTML longer",
          "Using a bigger font",
        ],
        0,
        "A CDN is close to the visitor, so each round trip is short: less [[latency]].",
      ),
    ),
    lesson(
      "notes-app-in-production",
      "The Notes App in production",
      4,
      explain(
        "Put it together: in production, a request to the Notes App passes through several pieces from this level before it reaches your code.",
      ),
      diagram([
        ["Browser", "HTTPS"],
        ["CDN / proxy", "TLS, static files"],
        ["Load balancer", "picks a copy"],
        ["Express API", "your code"],
        ["Database", "your notes"],
      ]),
      inTheNotesApp(
        "The backend ships as a Docker image built from this file; the Deployment topic builds the whole chain, one piece at a time.",
        { fileId: "backend/Dockerfile" },
      ),
    ),
    levelCheck("advanced-check", "Advanced check", [
      ["web-advanced-certificate", "tls-handshake"],
      ["web-advanced-cname", "dns-records"],
      ["web-advanced-cors", "origins-and-cors"],
      ["web-advanced-load-balancer", "load-balancers"],
    ]),
  ],
};
