import {
  anatomy,
  analogy,
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

// Background jobs: work that shouldn't happen during a request, queues and
// workers, enqueueing and answering 202, a worker, retries with backoff and
// jobs that are safe to run twice, a retried job step by step, dead-letter
// queues, cron schedules, one server per scheduled job, the Notes App,
// mistakes, practice and a recap.
export const backgroundJobsModule = moduleLesson(
  "background-jobs",
  "Background jobs",
  50,
  [
    "Spot work that shouldn't run while a request waits, such as email or reports.",
    "Add a job to a queue, answer 202 Accepted and let a worker do the work.",
    "Retry failed jobs with backoff, and make jobs safe to run twice.",
    "Move jobs that keep failing to a dead-letter queue instead of losing them.",
    "Read cron syntax and make sure only one server runs each scheduled job.",
  ],

  part(
    "not-now",
    "Work that shouldn't happen during a request",
    explain(
      "Some work is slow or unreliable: sending an email, resizing an uploaded image, building a report, calling another company's API. If a route does it before answering, the user waits, and if that API is down the request fails, even though the main thing (saving the note) worked. That work can happen a moment later instead.",
    ),
    diagram([
      ["POST /api/notes", "save: 15 ms"],
      ["send email", "+ 2,000 ms"],
      ["201", "after 2 s"],
    ]),
    keyPoints(
      "Do in the request only what the answer needs.",
      "Email, images, reports and other APIs can wait a moment.",
      "A slow or failing extra must not break the main action.",
    ),
  ),

  part(
    "queue",
    "Queues and workers",
    explain(
      'A [[job-queue|job queue]] is a list of work to do later. The route adds a job, a small object like `{ type: "welcome-email", userId: 7 }`, and answers at once. A [[worker-process|worker]], a separate process, takes jobs off the queue one by one and does them. The queue is stored outside both processes, so no job is lost when one restarts.',
    ),
    analogy(
      "A café till takes your order, gives you a ticket and serves the next person. The barista works through the tickets behind.",
    ),
    diagram([
      ["Web server", "adds a job"],
      ["Queue", "Redis or a table"],
      ["Worker", "does the job"],
    ]),
    quickCheck(
      "Why does the worker run as a separate process from the web server?",
      [
        "Express can't send email",
        "So a slow job never slows down requests, and workers can be added as the queue grows",
        "So the job runs before the response is sent",
      ],
      1,
      "Separate processes share nothing but the queue. Heavy jobs use the worker's time, not the server's, and you can run as many workers as the queue needs.",
    ),
  ),

  part(
    "enqueue",
    "Add a job, answer 202",
    explain(
      "When the client asked for the slow work itself, such as “export my notes as a PDF”, the route adds a job and answers `202 Accepted`: “I've got it, it isn't done yet.” The body can include a job id the client can ask about later. When the slow work is a side effect (a welcome email after signing up), the route answers as usual and the job runs on its own.",
    ),
    code(
      "js",
      "A route that queues an export",
      [
        "export async function exportNotes(req, res) {",
        "  const job = await queue.add(",
        '    "export-pdf",',
        "    { userId: req.user.id },",
        "  );",
        "  res.status(202).json({",
        "    jobId: job.id,",
        "    status: `/api/jobs/${job.id}`,",
        "  });",
        "}",
      ],
      {
        2: "only the job is stored: fast",
        4: "ids, not whole objects: the worker reads fresh data",
        6: "202 Accepted: taken, not finished",
        8: "where the client can check on it",
      },
    ),
    code(
      "http",
      "What the client sees",
      [
        "POST /api/notes/export HTTP/1.1",
        "",
        "HTTP/1.1 202 Accepted",
        '{ "jobId": "41",',
        '  "status": "/api/jobs/41" }',
      ],
      { 3: "answered in milliseconds" },
    ),
  ),

  part(
    "worker",
    "A worker",
    explain(
      "Two common tools: BullMQ keeps the queue in Redis, a fast in-memory data store; or a jobs table in the database you already have, which the worker checks every few seconds. Here is the worker side with BullMQ. It runs as its own process, often from the same code base: `node src/worker.js`.",
    ),
    anatomy(
      "worker.js with BullMQ",
      [
        'new Worker("emails", async (job) => {',
        "  await sendWeeklySummary(job.data.userId);",
        "}, { connection, concurrency: 5 });",
      ],
      [
        [
          '"emails"',
          "queue name",
          "The same name the web server used in queue.add.",
        ],
        [
          "async (job)",
          "the handler",
          "Called once per job. Resolving means done; throwing means failed.",
        ],
        [
          "job.data.userId",
          "the job's data",
          "What the route put in. Keep it small: ids, not whole notes.",
        ],
        [
          "connection",
          "Redis",
          "Where the queue lives, shared by servers and workers.",
        ],
        [
          "concurrency: 5",
          "in parallel",
          "Up to five jobs at once in this worker.",
        ],
      ],
    ),
  ),

  part(
    "retries",
    "Retries and jobs that run twice",
    explain(
      "Jobs fail: the email service times out, the API returns 503. So queues retry, with [[retry-backoff|backoff]]: wait longer before each attempt. And because a worker can crash after sending the email but before marking the job done, a job may run twice. Write jobs so a second run does no harm, the same idea as an [[idempotency-key]] in HTTP.",
    ),
    code(
      "js",
      "Retries with backoff, and a safe job",
      [
        'await queue.add("welcome", { userId }, {',
        "  attempts: 5,",
        "  backoff: {",
        '    type: "exponential",',
        "    delay: 1000,",
        "  },",
        "});",
        "",
        "async function welcome({ userId }) {",
        "  const user = await users.find(userId);",
        "  if (user.welcomeSentAt) return;",
        "  await mailer.send(user.email, /* … */);",
        "  await users.markWelcomeSent(userId);",
        "}",
      ],
      {
        2: "up to 5 tries in all",
        4: "wait 1 s, 2 s, 4 s, 8 s between them",
        11: "already done? then a second run does nothing",
        13: "remember that it's done",
      },
    ),
    keyPoints(
      "Assume every job can run more than once.",
      "Check “already done?” first, or use the job id as a key.",
      "A small gap remains (crash between send and mark); keep it tiny.",
    ),
  ),

  part(
    "step-by-step",
    "A retried job, step by step",
    explain(
      "Follow a tiny queue runner. The first attempt fails, the second works. With `maxTries` reached instead, the job would go to the dead letters.",
    ),
    trace(
      "Two attempts at one job",
      [
        "function run(job, work, maxTries) {",
        "  for (let i = 1; i <= maxTries; i++) {",
        "    try {",
        "      work(job);",
        '      return "done";',
        "    } catch {",
        "      // wait, then try again",
        "    }",
        "  }",
        "  dead.push(job);",
        '  return "dead";',
        "}",
        "const dead = [];",
        "run({ id: 41 }, flaky, 3);",
      ],
      [
        {
          line: 14,
          note: "Job 41 runs with up to 3 tries. `flaky` fails the first time only.",
          vars: [["dead", "[]"]],
        },
        {
          line: 4,
          note: "Attempt 1. The email service times out, so `work` throws.",
          vars: [
            ["dead", "[]"],
            ["job", "{ id: 41 }"],
            ["work", "flaky"],
            ["maxTries", "3"],
            ["i", "1"],
          ],
          stack: ["run"],
        },
        {
          line: 6,
          note: "Caught. A real queue would wait (backoff) before the next try.",
          vars: [
            ["dead", "[]"],
            ["job", "{ id: 41 }"],
            ["work", "flaky"],
            ["maxTries", "3"],
            ["i", "1"],
          ],
          stack: ["run"],
        },
        {
          line: 4,
          note: "Attempt 2. This time it works.",
          vars: [
            ["dead", "[]"],
            ["job", "{ id: 41 }"],
            ["work", "flaky"],
            ["maxTries", "3"],
            ["i", "2"],
          ],
          stack: ["run"],
        },
        {
          line: 5,
          note: "Done after two tries; the dead letters stay empty.",
          vars: [
            ["dead", "[]"],
            ["job", "{ id: 41 }"],
            ["work", "flaky"],
            ["maxTries", "3"],
            ["i", "2"],
          ],
          stack: ["run"],
        },
        {
          line: 14,
          note: "Back at the top level. Had all 3 tries failed, line 10 would have moved the job to `dead`.",
          vars: [["dead", "[]"]],
        },
      ],
    ),
  ),

  part(
    "dead-letters",
    "Dead-letter queues",
    explain(
      "Some jobs never succeed: the user was deleted, the data is broken, the code has a bug. Retrying forever wastes work and hides the problem; dropping the job loses it silently. A [[dead-letter-queue|dead-letter queue]] is where a job goes after its last attempt fails. Someone looks at it, fixes the cause and runs it again.",
    ),
    keyPoints(
      "Keep the error and the job's data with each dead letter.",
      "Alert when dead letters appear, so someone notices.",
      "BullMQ keeps failed jobs; a jobs table can use status = 'failed'.",
    ),
    quickCheck(
      "A job fails because the user it refers to no longer exists. What should happen after the retries run out?",
      [
        "Retry it forever: it might work one day",
        "Delete it silently",
        "Move it to the dead-letter queue, with its error, for someone to look at",
      ],
      2,
      "Retrying can't fix missing data, and deleting hides the problem. A dead letter stops the retries but keeps the job and its error.",
    ),
  ),

  part(
    "cron",
    "Scheduled jobs",
    explain(
      "Some work runs on a timetable, not because of a request: delete old drafts every night, send a weekly summary every Monday. That's a [[cron-job|scheduled job]], written in cron syntax: five fields for minute, hour, day of month, month and day of week. `*` means “every”.",
    ),
    anatomy(
      "Every Monday at 08:00",
      ["0 8 * * 1"],
      [
        ["0", "minute", "At minute 0."],
        ["8", "hour", "At 08:00, in the server's time zone (often UTC)."],
        ["*", "day of month", "Any day of the month."],
        ["*", "month", "Any month."],
        ["1", "day of week", "Monday. 0 (or 7) is Sunday."],
      ],
    ),
    reference("Cron examples", [
      ["*/15 * * * *", "Every 15 minutes.", "00, 15, 30, 45"],
      ["0 3 * * *", "Every day at 03:00.", "Clean up old data"],
      ["0 8 * * 1", "Mondays at 08:00.", "Weekly summary"],
      ["0 0 1 * *", "Midnight on the 1st of each month.", "Monthly report"],
    ]),
  ),

  part(
    "only-one",
    "Only one server runs it",
    explain(
      "If three copies of your server each start a timer for `0 8 * * 1`, every user gets three summary emails. A scheduled job must run once, not once per copy. Common fixes: let the queue schedule it (BullMQ's repeatable jobs are stored once in Redis), take a lock in the database before running, or use the platform's scheduler to start a one-off command.",
    ),
    mistake({
      title: "A timer in every copy of the server",
      wrong: [
        "// server.js, running on 3 machines",
        'cron.schedule("0 8 * * 1", sendSummaries);',
      ],
      problem:
        "Each copy runs the job at 08:00, so the work happens three times.",
      right: [
        "// once, e.g. from a deploy script",
        "await queue.upsertJobScheduler(",
        '  "weekly-summary",',
        '  { pattern: "0 8 * * 1" },',
        ");",
      ],
      why: "The schedule lives once in the shared queue, and whichever worker picks the job up runs it.",
    }),
  ),

  part(
    "notes-app",
    "The Notes App",
    explain(
      "The Notes App has no background jobs, no queue and no worker. Every route does its work and answers. That's right for it: saving a note is quick and there's nothing slow to hand off. A first job would be something like “send each user a weekly summary email”, which needs a scheduler, a queue and a worker.",
    ),
    inTheNotesApp(
      "Every route finishes its work before answering; nothing is queued for later.",
      { fileId: "backend/src/controllers/notesController.js" },
    ),
    code(
      "js",
      "A weekly summary (not in the Notes App)",
      [
        "// runs at 0 8 * * 1: one job per user",
        "async function queueSummaries() {",
        "  for (const id of await users.allIds()) {",
        "    await queue.add(",
        '      "summary",',
        "      { userId: id },",
        "    );",
        "  }",
        "}",
        "",
        "// the worker, one user at a time",
        "async function summary({ userId }) {",
        "  const notes = await repo.thisWeek(userId);",
        "  await mailer.send(userId, render(notes));",
        "}",
      ],
      {
        4: "one small job each: one failure doesn't stop the rest",
        13: "a repository, as in the layers module",
      },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Firing and forgetting inside the request",
      wrong: [
        "sendWelcomeEmail(user); // no await",
        "res.status(201).json(user);",
      ],
      problem:
        "If it fails, nobody retries and the error may crash the process as an unhandled rejection. If the server restarts, the email is lost.",
      right: [
        'await queue.add("welcome-email",',
        "  { userId: user.id });",
        "res.status(201).json(user);",
      ],
      why: "A queued job is stored, retried and visible; a stray promise is none of those.",
    }),
    mistake({
      title: "Putting whole objects in the job",
      wrong: ['queue.add("summary", { user, notes });'],
      problem:
        "The job is large, and by the time it runs the notes may have changed or been deleted.",
      right: ['queue.add("summary", { userId: user.id });'],
      why: "Pass ids; the worker reads fresh data when it runs.",
    }),
    mistake({
      title: "A job that isn't safe to repeat",
      wrong: [
        "async function charge({ orderId }) {",
        "  await payments.charge(orderId);",
        "}",
      ],
      problem: "A retry after a crash charges the customer twice.",
      right: [
        "async function charge({ orderId }) {",
        "  await payments.charge(orderId, {",
        "    idempotencyKey: `order-${orderId}`,",
        "  });",
        "}",
      ],
      why: "A key per job lets the payment service ignore the repeat.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "Queue the export",
      task: 'Write the controller `exportNotes(req, res, queue)`. Call `queue.add("export-pdf", { userId: req.user.id })`, which returns `{ id }`, then answer `202` with `{ jobId: id }`.',
      starter: [
        "function exportNotes(req, res, queue) {",
        "  res.status(200).json({ done: true });",
        "}",
      ],
      tests: [
        [
          '(() => { const added = []; const queue = { add: (name, data) => { added.push([name, data]); return { id: "41" }; } }; const res = { status(c) { this.statusCode = c; return this; }, json(b) { this.body = b; } }; exportNotes({ user: { id: 7 } }, res, queue); return [res.statusCode, res.body, added]; })()',
          '[202, { jobId: "41" }, [["export-pdf", { userId: 7 }]]]',
        ],
        [
          '(() => { const queue = { add: () => ({ id: "9" }) }; const res = { status(c) { this.statusCode = c; return this; }, json(b) { this.body = b; } }; exportNotes({ user: { id: 3 } }, res, queue); return res.body.jobId; })()',
          '"9"',
        ],
      ],
      hint: "Keep what `queue.add` returns, then `res.status(202).json({ jobId: job.id })`.",
      solution: [
        "function exportNotes(req, res, queue) {",
        "  const job = queue.add(",
        '    "export-pdf",',
        "    { userId: req.user.id },",
        "  );",
        "  res.status(202).json({ jobId: job.id });",
        "}",
      ],
    }),
    yourTurn({
      title: "Retries and dead letters",
      task: "Write `processQueue(jobs, worker, maxTries)`. For each job, call `worker(job)`; if it throws, try again, up to `maxTries` attempts in all. Return `{ done, dead }`: the ids of jobs that succeeded and of jobs that failed every attempt.",
      starter: [
        "function processQueue(jobs, worker, maxTries) {",
        "  const done = [];",
        "  const dead = [];",
        "  for (const job of jobs) {",
        "    worker(job);",
        "    done.push(job.id);",
        "  }",
        "  return { done, dead };",
        "}",
      ],
      tests: [
        [
          "processQueue([{ id: 1 }, { id: 2 }], () => {}, 3)",
          "{ done: [1, 2], dead: [] }",
        ],
        [
          'processQueue([{ id: 1 }, { id: 2 }], (job) => { if (job.id === 2) throw new Error("bad"); }, 3)',
          "{ done: [1], dead: [2] }",
        ],
        [
          '(() => { let calls = 0; const r = processQueue([{ id: 5 }], () => { calls++; if (calls < 3) throw new Error("timeout"); }, 3); return [r, calls]; })()',
          "[{ done: [5], dead: [] }, 3]",
        ],
        [
          '(() => { let calls = 0; processQueue([{ id: 5 }], () => { calls++; throw new Error("x"); }, 4); return calls; })()',
          "4",
        ],
      ],
      hint: "Inside the job loop, loop up to `maxTries` times with try/catch, and stop as soon as `worker(job)` doesn't throw.",
      solution: [
        "function processQueue(jobs, worker, maxTries) {",
        "  const done = [];",
        "  const dead = [];",
        "  for (const job of jobs) {",
        "    let ok = false;",
        "    for (let i = 0; i < maxTries && !ok; i++) {",
        "      try { worker(job); ok = true; } catch {}",
        "    }",
        "    (ok ? done : dead).push(job.id);",
        "  }",
        "  return { done, dead };",
        "}",
      ],
    }),
    yourTurn({
      title: "Does the schedule match?",
      task: 'Write `matches(expr, time)`. `expr` is a cron expression like `"0 8 * * *"`; check only its first two fields, minute and hour, against `time.minute` and `time.hour`. A field is `*` (any), a number, or `*/n` (when the value divides evenly by n).',
      starter: [
        "function matches(expr, time) {",
        '  return expr === "* * * * *";',
        "}",
      ],
      tests: [
        ['matches("0 8 * * *", { minute: 0, hour: 8 })', "true"],
        ['matches("0 8 * * *", { minute: 0, hour: 9 })', "false"],
        ['matches("*/15 * * * *", { minute: 30, hour: 14 })', "true"],
        ['matches("*/15 * * * *", { minute: 20, hour: 14 })', "false"],
        ['matches("* * * * *", { minute: 59, hour: 23 })', "true"],
      ],
      hint: 'Split on spaces. Write `fieldOk(field, value)`: `*` is true; a field starting with `"*/"` checks `value % n === 0`; otherwise compare `Number(field)`.',
      solution: [
        "function fieldOk(field, value) {",
        '  if (field === "*") return true;',
        '  if (field.startsWith("*/")) {',
        "    return value % Number(field.slice(2)) === 0;",
        "  }",
        "  return Number(field) === value;",
        "}",
        "function matches(expr, time) {",
        '  const [minute, hour] = expr.split(" ");',
        "  return fieldOk(minute, time.minute) &&",
        "    fieldOk(hour, time.hour);",
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Background jobs cheat sheet", [
      [
        "Job queue",
        "Work to do later, stored outside the server.",
        'queue.add("email", { userId })',
      ],
      ["Worker", "A separate process that runs jobs.", "node src/worker.js"],
      [
        "202 Accepted",
        "Taken, not done yet; give a job id.",
        '{ "jobId": "41" }',
      ],
      [
        "Retries",
        "Several attempts, waiting longer each time.",
        "attempts: 5, exponential",
      ],
      [
        "Safe to repeat",
        "Check “already done?” or use a key.",
        "if (user.welcomeSentAt) return;",
      ],
      [
        "Dead-letter queue",
        "Jobs that failed every attempt, kept with the error.",
        "status = 'failed'",
      ],
      ["Cron", "minute hour day month weekday.", "0 8 * * 1"],
      [
        "One runner",
        "A schedule must run once, not once per server.",
        "Repeatable job, or a lock",
      ],
      ["Tools", "BullMQ with Redis, or a jobs table.", "new Worker(...)"],
    ]),
    quickCheck(
      "A welcome-email job crashed after sending but before it was marked done. The queue runs it again. What keeps the user from getting two emails?",
      [
        "Nothing: queues never run a job twice",
        "The job checks whether the email was already sent before sending",
        "Answering 202 instead of 201",
      ],
      1,
      "Queues can run a job more than once, so each job should check whether its work is already done (or use a key) and skip it.",
    ),
  ),
);
