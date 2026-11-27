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
  part,
  quickCheck,
  reference,
  trace,
  yourTurn,
} from "../blocks.js";

// Scaling: measure first, bigger or more servers, stateless servers, load
// balancers with round robin step by step, one process per core, caching,
// the database as the bottleneck, graceful shutdown, mistakes, practice and
// a recap.
export const scalingModule = moduleLesson(
  "scaling",
  "Scaling: more traffic, more servers",
  50,
  [
    "Measure latency and throughput, and find where the time goes, before changing anything.",
    "Compare a bigger server with more copies, and say why copies must be stateless.",
    "Explain how a load balancer spreads requests and how Node.js uses every core.",
    "Use caching and the connection pool wisely, as the database becomes the limit.",
    "Shut a server down gracefully on SIGTERM so requests in flight still finish.",
  ],

  part(
    "measure",
    "Measure first",
    explain(
      "Before scaling, find out what is slow. Two numbers matter: latency, how long one request takes (look at the slowest 1%, p99, not only the average), and throughput, how many requests per second the server handles. Then find where the time goes: your code, the database, another API. Often one slow query is the whole problem, and no extra server will fix it.",
    ),
    code(
      "js",
      "Timing every request",
      [
        "app.use((req, res, next) => {",
        "  const start = performance.now();",
        '  res.on("finish", () => {',
        "    const ms = performance.now() - start;",
        "    console.log(",
        "      req.method, req.path,",
        "      res.statusCode, ms.toFixed(1),",
        "    );",
        "  });",
        "  next();",
        "});",
      ],
      {
        3: "runs when the response has been sent",
        5: "a real app sends this to its logger or metrics",
      },
    ),
    keyPoints(
      "Latency: how long one request takes. Watch p99.",
      "Throughput: requests per second.",
      "Find the slow part first; it's often the database.",
      "Load-test (e.g. with autocannon or k6) before real users do.",
    ),
  ),

  part(
    "up-or-out",
    "Bigger, or more?",
    explain(
      "Scaling up (vertical) means a bigger machine: more CPU, more memory. It needs no code changes, but there's a largest machine, and one machine is one point of failure. [[horizontal-scaling|Scaling out]] (horizontal) means more copies of the same server, side by side. It has no real ceiling and one copy can fail while the others carry on, but the code must allow it.",
    ),
    reference("Up or out", [
      [
        "Up (vertical)",
        "Bigger machine. Simple, but has a ceiling.",
        "2 → 8 CPUs",
      ],
      [
        "Out (horizontal)",
        "More copies behind a load balancer.",
        "1 → 4 copies",
      ],
      ["Up: failure", "One machine down means the app is down.", "Restarts"],
      ["Out: failure", "One copy down; the others answer.", "3 of 4 still up"],
    ]),
  ),

  part(
    "stateless",
    "Stateless servers",
    explain(
      "Copies only work if any copy can answer any request. So a server must not keep anything about users in its own memory or on its own disk: no login sessions in a Map, no uploads in a local folder. Shared state goes somewhere every copy can reach: the database, Redis, object storage, or the request itself, like HTTP's [[stateless]] model.",
    ),
    inTheNotesApp(
      "The Notes App is stateless already: `requireAuth` reads the login from a signed token in a cookie, and every note lives in PostgreSQL. Any copy can answer any request.",
      { fileId: "backend/src/middleware/authMiddleware.js" },
    ),
    mistake({
      title: "Keeping users in the server's memory",
      wrong: ["const sessions = new Map();", "sessions.set(sessionId, user);"],
      problem:
        "The next request may reach another copy, which has never seen this session, so the user looks logged out. A restart forgets everyone.",
      right: [
        "// a signed token in a cookie, or",
        "// sessions stored in Redis or the database",
      ],
      why: "State that every copy needs must live outside every copy.",
    }),
  ),

  part(
    "load-balancer",
    "Load balancers",
    explain(
      "With several copies, something must decide which one gets each request. A [[load-balancer|load balancer]] sits in front, takes every request and passes it on, often in turn (round robin) or to the least busy copy. It checks each copy's health, such as the Notes App's `GET /api/health`, and stops sending to copies that fail.",
    ),
    analogy(
      "A bank with one queue and several open desks: whoever is at the front goes to the next free desk. A closed desk simply gets nobody.",
    ),
    diagram([
      ["Browsers", "many requests"],
      ["Load balancer", "picks a copy"],
      ["API ×3", "identical copies"],
      ["PostgreSQL", "shared"],
    ]),
    trace(
      "Round robin over three copies",
      [
        'const servers = ["a", "b", "c"];',
        "let next = 0;",
        "function pick() {",
        "  const s = servers[next];",
        "  next = (next + 1) % servers.length;",
        "  return s;",
        "}",
        "console.log(pick());",
        "console.log(pick());",
        "console.log(pick());",
        "console.log(pick());",
      ],
      [
        {
          line: 2,
          note: "Three copies, and the index of the next one to use.",
          vars: [
            ["servers", '["a", "b", "c"]'],
            ["next", "0"],
          ],
        },
        {
          line: 4,
          note: "The first request goes to a.",
          vars: [
            ["servers", '["a", "b", "c"]'],
            ["next", "0"],
            ["s", '"a"'],
          ],
          stack: ["pick"],
        },
        {
          line: 5,
          note: "Move on to the next copy.",
          vars: [
            ["servers", '["a", "b", "c"]'],
            ["next", "1"],
            ["s", '"a"'],
          ],
          stack: ["pick"],
        },
        {
          line: 9,
          note: "The second call printed b; next is now 2.",
          vars: [
            ["servers", '["a", "b", "c"]'],
            ["next", "2"],
          ],
          output: "a\nb",
        },
        {
          line: 5,
          note: "The third goes to c. `% servers.length` wraps 3 back to 0.",
          vars: [
            ["servers", '["a", "b", "c"]'],
            ["next", "0"],
            ["s", '"c"'],
          ],
          stack: ["pick"],
          output: "a\nb",
        },
        {
          line: 11,
          note: "The fourth call starts the circle again at a.",
          vars: [
            ["servers", '["a", "b", "c"]'],
            ["next", "1"],
          ],
          output: "a\nb\nc\na",
        },
      ],
    ),
  ),

  part(
    "cores",
    "One process, one core",
    explain(
      "Node.js runs your JavaScript on one thread, so one process keeps one CPU core busy, however many the machine has. To use them all, run one process per core: the built-in `node:cluster` module or a process manager like PM2 starts several copies that share one port. With containers, the usual way is simply to run more containers.",
    ),
    anatomy(
      "node:cluster in four lines",
      [
        "if (cluster.isPrimary) {",
        "  for (const _ of os.cpus()) cluster.fork();",
        "} else createApp().listen(3000);",
      ],
      [
        [
          "cluster.isPrimary",
          "the first process",
          "It doesn't serve requests; it starts and watches the others.",
        ],
        [
          "os.cpus()",
          "one per core",
          "A list of the machine's cores; os.availableParallelism() is newer.",
        ],
        [
          "cluster.fork()",
          "a copy",
          "Starts another process running this same file.",
        ],
        [
          "createApp().listen(3000)",
          "the workers",
          "Each copy listens on 3000; the primary shares the connections out.",
        ],
      ],
    ),
    keyPoints(
      "All [[node-cluster|cluster]] copies are separate processes: no shared memory.",
      "So they need to be stateless too, exactly like separate servers.",
      "PM2: `pm2 start src/server.js -i max` does the same.",
    ),
  ),

  part(
    "caching",
    "Caching: don't do the work twice",
    explain(
      "The cheapest request is one you don't have to work for. HTTP caching lets browsers and CDNs reuse answers. On the server, keep a result you compute often and that changes rarely, for a short time. A cache in one process's memory is per copy, so copies can disagree; a shared cache such as Redis is the same for all.",
    ),
    code(
      "js",
      "A tiny cache with a time limit",
      [
        "const cache = new Map();",
        "",
        "async function cached(key, ms, load) {",
        "  const hit = cache.get(key);",
        "  if (hit && hit.until > Date.now()) {",
        "    return hit.value;",
        "  }",
        "  const value = await load();",
        "  cache.set(key, {",
        "    value,",
        "    until: Date.now() + ms,",
        "  });",
        "  return value;",
        "}",
      ],
      {
        5: "fresh enough: no work at all",
        8: "missing or too old: do the work once",
        11: "keep it for `ms` milliseconds",
      },
    ),
    keyPoints(
      "Cache what is read often and changes rarely.",
      "Every cache can be stale: keep the time short.",
      "Never cache one user's data under a key another user can hit.",
    ),
  ),

  part(
    "database",
    "The database becomes the limit",
    explain(
      "Adding copies of the API is easy; the database is usually still one. Each copy has its own connection pool (pg keeps up to 10 connections by default), and PostgreSQL only accepts so many in total (100 by default). Ten copies with 10 each already reach that. So size pools for the total, fix slow queries and cache. The Databases topic goes deeper.",
    ),
    diagram([
      ["API ×10", "10 connections each"],
      ["100 connections", "all at once"],
      ["PostgreSQL", "limit: 100"],
    ]),
    quickCheck(
      "You run 6 copies of the API and each pool keeps up to 20 connections. The database allows 100. What happens at busy times?",
      [
        "Nothing: pools share connections between copies",
        "Up to 120 connections are wanted, so some copies can't connect",
        "The load balancer limits it to 100",
      ],
      1,
      "Every copy has its own pool: 6 × 20 = 120, above the database's 100. Lower the pool size or put a connection pooler in front of the database.",
    ),
  ),

  part(
    "shutdown",
    "Graceful shutdown",
    explain(
      "Platforms stop servers all the time: a new version is deployed, traffic drops, a machine is replaced. They send SIGTERM first. [[graceful-shutdown|Graceful shutdown]] means: stop taking new requests, let the ones in progress finish, close the database pool, then exit. The Notes App doesn't do this today; `server.js` only calls `listen`. Here is what it would add.",
    ),
    code(
      "js",
      "server.js with graceful shutdown",
      [
        "const server = createApp().listen(port);",
        "",
        'process.on("SIGTERM", () => {',
        "  server.close(async () => {",
        "    await pool.end();",
        "    process.exit(0);",
        "  });",
        "  setTimeout(() => process.exit(1), 10_000)",
        "    .unref();",
        "});",
      ],
      {
        1: "keep the server object listen() returns",
        4: "no new connections; the callback runs once in-flight requests finish",
        5: "close the database connections cleanly",
        8: "a deadline: don't wait forever for a stuck request",
      },
    ),
    inTheNotesApp(
      "`server.js` starts the app with `listen` and has no SIGTERM handler, so a stop cuts off requests in progress.",
      { fileId: "backend/src/server.js" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Adding servers before measuring",
      wrong: ["// slow? run 4 copies instead of 1"],
      problem:
        "If one query takes 2 seconds, four copies run that 2-second query four times as often and the database gets slower still.",
      right: ["// time each request, find the slow part,", "// fix it first"],
      why: "Scaling multiplies what you have; fix the slow part before you copy it.",
    }),
    mistake({
      title: "Saving uploads to the local disk",
      wrong: ["fs.writeFileSync(`uploads/${name}`, file);"],
      problem:
        "The file is on one copy only. The next request goes to another copy, which doesn't have it, and a redeploy deletes it.",
      right: ["await storage.put(name, file);", "// object storage such as S3"],
      why: "Files every copy must see go to shared storage, not one server's disk.",
    }),
    mistake({
      title: "Exiting at once on SIGTERM",
      wrong: ['process.on("SIGTERM", () => process.exit(0));'],
      problem:
        "Requests still in progress are cut off and their users see errors.",
      right: [
        'process.on("SIGTERM", () => {',
        "  server.close(() => process.exit(0));",
        "});",
      ],
      why: "server.close() lets in-flight requests finish before the process exits.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "A round-robin balancer",
      task: "Write `makeBalancer(servers)`. It returns `{ pick }`. `servers` is a list of `{ name, healthy }`. Each call to `pick()` returns the name of the next healthy server in turn, skipping unhealthy ones, and wrapping round at the end. If none is healthy, return `null`.",
      starter: [
        "function makeBalancer(servers) {",
        "  return {",
        "    pick() { return servers[0].name; },",
        "  };",
        "}",
      ],
      tests: [
        [
          '(() => { const b = makeBalancer([{ name: "a", healthy: true }, { name: "b", healthy: true }]); return [b.pick(), b.pick(), b.pick()]; })()',
          '["a", "b", "a"]',
        ],
        [
          '(() => { const b = makeBalancer([{ name: "a", healthy: true }, { name: "b", healthy: false }, { name: "c", healthy: true }]); return [b.pick(), b.pick(), b.pick()]; })()',
          '["a", "c", "a"]',
        ],
        ['makeBalancer([{ name: "a", healthy: false }]).pick()', "null"],
      ],
      hint: "Keep an index. In `pick`, try at most `servers.length` times: take `servers[i]`, move `i` on with `% servers.length`, and return its name if it's healthy.",
      solution: [
        "function makeBalancer(servers) {",
        "  let i = 0;",
        "  return {",
        "    pick() {",
        "      for (let n = 0; n < servers.length; n++) {",
        "        const s = servers[i];",
        "        i = (i + 1) % servers.length;",
        "        if (s.healthy) return s.name;",
        "      }",
        "      return null;",
        "    },",
        "  };",
        "}",
      ],
    }),
    yourTurn({
      title: "How many servers?",
      task: "Write `serversNeeded(peakRps, rpsPerServer)`: the copies needed to handle `peakRps` requests per second when each handles `rpsPerServer`, plus one spare so a copy can fail or restart without trouble.",
      starter: [
        "function serversNeeded(peakRps, rpsPerServer) {",
        "  return peakRps / rpsPerServer;",
        "}",
      ],
      tests: [
        ["serversNeeded(900, 200)", "6"],
        ["serversNeeded(400, 200)", "3"],
        ["serversNeeded(50, 200)", "2"],
        ["serversNeeded(0, 200)", "1"],
      ],
      hint: "Round up with `Math.ceil`: 4.5 servers means 5. Then add 1.",
      solution: [
        "function serversNeeded(peakRps, rpsPerServer) {",
        "  return Math.ceil(peakRps / rpsPerServer) + 1;",
        "}",
      ],
    }),
    yourTurn({
      title: "Shut down in order",
      task: 'Write `async shutdown(deps)`. Call `deps.stopAccepting()`. Then, while `deps.inFlight()` is above 0, `await deps.wait()`. Then `await deps.closePool()` and return `"closed"`.',
      starter: [
        "async function shutdown(deps) {",
        "  await deps.closePool();",
        '  return "closed";',
        "}",
      ],
      tests: [
        [
          '(async () => { const log = []; let n = 2; await shutdown({ stopAccepting: () => log.push("stop"), inFlight: () => n, wait: async () => { n--; log.push("wait"); }, closePool: async () => { log.push("pool"); } }); return log; })()',
          '["stop", "wait", "wait", "pool"]',
        ],
        [
          '(async () => { const log = []; await shutdown({ stopAccepting: () => log.push("stop"), inFlight: () => 0, wait: async () => log.push("wait"), closePool: async () => { log.push("pool"); } }); return log; })()',
          '["stop", "pool"]',
        ],
        [
          "shutdown({ stopAccepting() {}, inFlight: () => 0, wait: async () => {}, closePool: async () => {} })",
          '"closed"',
        ],
      ],
      hint: "`stopAccepting()` first, then `while (deps.inFlight() > 0) await deps.wait();`, then the pool.",
      solution: [
        "async function shutdown(deps) {",
        "  deps.stopAccepting();",
        "  while (deps.inFlight() > 0) {",
        "    await deps.wait();",
        "  }",
        "  await deps.closePool();",
        '  return "closed";',
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Scaling cheat sheet", [
      ["Latency", "Time for one request. Watch p99.", "p99 = 180 ms"],
      ["Throughput", "Requests per second.", "1,200 req/s"],
      ["Scale up", "A bigger machine; has a ceiling.", "8 CPUs, 32 GB"],
      [
        "Scale out",
        "More copies behind a load balancer.",
        "4 copies of the API",
      ],
      [
        "Stateless",
        "Nothing about users in one copy's memory or disk.",
        "Token in a cookie, notes in PostgreSQL",
      ],
      ["Round robin", "Each copy in turn.", "a, b, c, a, …"],
      [
        "One process per core",
        "node:cluster, PM2, or more containers.",
        "pm2 start src/server.js -i max",
      ],
      [
        "Cache",
        "Keep a result for a short time.",
        "Map or Redis, with a time limit",
      ],
      [
        "Pool size",
        "Copies × pool size ≤ the database's limit.",
        "6 × 15 = 90 ≤ 100",
      ],
      [
        "Graceful shutdown",
        "SIGTERM → server.close → pool.end → exit.",
        'process.on("SIGTERM", …)',
      ],
    ]),
    quickCheck(
      "The Notes App kept logged-in users in a `Map` in memory instead of a signed cookie. What would break when you run three copies?",
      [
        "Nothing: each copy has its own Map",
        "A user logged in on one copy looks logged out when a request reaches another",
        "The database would reject the connections",
      ],
      1,
      "Each copy has its own memory, so only one copy knows about the login. That's why servers that scale out must be stateless; the Notes App's cookie travels with every request.",
    ),
  ),
);
