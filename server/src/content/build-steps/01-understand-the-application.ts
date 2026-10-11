import type { BuildStep } from "@fsl/shared";

export const understandTheApplicationStep: BuildStep = {
  id: "understand-the-application",
  slug: "understand-the-application",
  order: 1,
  title: "Understand the application",
  goal: "Decide what the Notes App does and how its parts fit together before writing any code.",
  why: "Building without a plan leads to files and code that don't fit together. Knowing the goal first tells you which files you will need and why each one exists.",
  problemSolved:
    "Starting to code without knowing what the finished app should do, or how the frontend, backend and database relate to each other.",
  prerequisites: [],
  explanation: [
    "The Notes App lets a person keep private notes on a website. They can **register** with an email address and a password, **log in** and **log out**, see a **list** of their own notes (newest first), **create** a note with a title and some text, **edit** it and **delete** it. Nobody can ever see or change another person's notes.",
    "Every full-stack web application is made of three parts that run in different places. The **frontend** is the part you see: HTML, CSS and JavaScript running inside the browser. The **backend** is a program running on a server: it receives requests, checks them and decides what is allowed. The **database** stores the data permanently, so notes survive when the server restarts.",
    "The three parts talk in a fixed order. When you click *Save*, the frontend sends an HTTP request (for example `POST /api/notes`) to the backend. The backend checks who you are and whether the note is valid, then asks the database to store it with SQL. The answer travels back the same way: database → backend → frontend, which updates the screen.",
    'Why not put everything in the browser? Because anything in the browser can be read and changed by the person using it. The rules ("you may only see your own notes") and the data must live where users can\'t touch them: on the server and in the database.',
    "In this journey you build the parts in the order you would build a real app: first the frontend with fake data (steps 2–6), then the connection to an API (7), the backend (8–9), the database (10), accounts and security (11–12), tests (13) and finally putting it on the internet (14). Each step adds a few files; the Project page shows exactly which.",
    "The finished project has three folders, one per part: `frontend/` (React), `backend/` (Node.js + Express) and `database/` (SQL files for PostgreSQL). The frontend and backend each have their own `package.json`, because they are two separate programs.",
  ],
  howToCreate: [
    {
      text: "Open a terminal. Check that Node.js is installed and is version 22 or newer. Node.js runs JavaScript outside the browser; you need it for the tools in the next step and for the backend later. If the command is not found, install the LTS version from nodejs.org first.",
      code: {
        language: "bash",
        code: "node --version\nnpm --version",
        caption:
          "You should see something like `v22.12.0` and `10.9.0`. `npm` is installed together with Node.js.",
      },
    },
    {
      text: "Create one folder for the whole project and go into it. Every later step runs its commands inside this `notes-app` folder.",
      code: {
        language: "bash",
        code: "mkdir notes-app\ncd notes-app",
      },
    },
    {
      text: "Write the plan down before coding: a short list of the features (register, log in, log out, list, create, edit, delete notes) and the three parts (frontend, backend, database). Keep it next to you; every step ticks off a piece of it.",
    },
    {
      text: "Check it worked: `pwd` (macOS/Linux) or `cd` (Windows) prints a path ending in `notes-app`, and the folder is empty. That empty folder is step 0 on the Project page.",
    },
  ],
  fromScratch: [
    "List what users must be able to do, in plain sentences, before choosing any tools.",
    "For each feature, ask where it must run: on the screen (frontend), behind the scenes with rules (backend), or stored for later (database).",
    "Choose one folder per program (`frontend/`, `backend/`) plus one for database files, inside a single project folder.",
    "Plan to build from the screen inwards: a frontend with fake data first, then the API it needs, then the database behind the API.",
  ],
  filesCreated: [],
  filesModified: [],
  filesRemoved: [],
  conceptIds: ["how-the-web-works"],
  codeExamples: [
    {
      language: "http",
      code: 'POST /api/notes HTTP/1.1\nContent-Type: application/json\n\n{ "title": "Shopping", "content": "Milk, bread" }',
      caption:
        "The kind of message the frontend will send to the backend when you save a note. You will write the code that sends it in step 7 and the code that answers it in step 9.",
    },
  ],
  relationshipIds: [],
  enables:
    "Describe the Notes App's features and explain what its three parts — frontend, backend and database — each do.",
  commonMistakes: [
    "Starting to write code before deciding what the app should do. You end up with files that don't fit together and have to throw them away.",
    'Putting rules such as "only show my notes" in the frontend. Anyone can change code that runs in their own browser, so rules and data must live on the server.',
    "Using an old Node.js version. Modern tools such as Vite need Node.js 20.19 or 22.12 or newer and fail with confusing errors on older versions.",
  ],
  nextStepId: "create-project",
  nextWhy:
    "With a clear picture of the app, the next step creates the frontend project the user will see first.",
};
