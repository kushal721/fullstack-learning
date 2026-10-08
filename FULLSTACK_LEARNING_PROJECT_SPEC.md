# Full-Stack Learning Platform --- Project Specification

## 1. Document Purpose

This document is the source of truth for building the project.

It is intended to be given to an AI coding agent such as Claude. Claude
should use this document to:

-   understand the product before changing code
-   initialize the project professionally
-   create the GitHub repository structure/workflow
-   create GitHub Issues and milestones
-   implement the application incrementally
-   use branches and pull requests
-   keep the architecture reusable
-   avoid unnecessary features
-   preserve the learning philosophy of the product

Do not treat this document as a request to implement everything in one
step.

The project must be built incrementally, issue by issue, with each
change reviewed and tested before moving to the next issue.

------------------------------------------------------------------------

# 2. Product Vision

## Working Description

This is an interactive platform that teaches beginners how full-stack
web development actually works.

The platform should not primarily teach users by giving them isolated
definitions or lists of technologies.

Instead, it should guide the learner through building a real application
from an empty project to a working deployed application.

The core philosophy is:

> **Don't just learn what to write. Understand what happens when you
> write it.**

A learner should be able to answer questions such as:

-   Where do I start?
-   Why do I need this file?
-   Why does this folder exist?
-   What does this HTML tag do?
-   What does this JavaScript function do?
-   Where is this function defined?
-   Who calls this function?
-   What does this function call?
-   How does one React component communicate with another?
-   How does the frontend communicate with the backend?
-   What is an HTTP request?
-   Where does the request go?
-   How does the backend process it?
-   How does the backend communicate with the database?
-   How does data travel from the UI to the database and back?
-   Where does authentication happen?
-   How is a password protected?
-   How does authorization work?
-   What happens when something fails?
-   How does the application eventually become a deployed website?

The product should make these relationships visible.

------------------------------------------------------------------------

# 3. Core Learning Experience

The learner should be able to follow this journey:

``` text
Start with an empty project
        ↓
Understand what we are building
        ↓
Create project structure
        ↓
Build frontend
        ↓
Build reusable components
        ↓
Build pages and UI
        ↓
Add frontend logic/state
        ↓
Connect frontend to backend
        ↓
Build backend
        ↓
Create API routes
        ↓
Process requests
        ↓
Connect database
        ↓
Store/retrieve data
        ↓
Authentication
        ↓
Authorization
        ↓
Security
        ↓
Validation/error handling
        ↓
Testing
        ↓
Deployment
        ↓
Live application
```

At every step the platform should explain:

1.  What are we doing?
2.  Why are we doing it?
3.  What problem does this solve?
4.  What are we creating?
5.  Where does it belong in the project?
6.  What does the code do?
7.  What does it connect to?
8.  What changed in the application?
9.  What did this step enable?
10. What comes next?

------------------------------------------------------------------------

# 4. The Main Product Systems

The platform consists of these major systems.

## 4.1 Learning Tree

The Learning Tree is the conceptual roadmap.

Initial structure:

``` text
Full-Stack Development
│
├── 1. How the Web Works
├── 2. HTML
├── 3. CSS
├── 4. JavaScript
├── 5. Git & GitHub
├── 6. React
├── 7. HTTP & APIs
├── 8. Backend
├── 9. Databases
├── 10. Authentication
├── 11. Security
├── 12. Testing
├── 13. Deployment
└── 14. How Everything Connects
```

The tree must support:

-   expandable/collapsible nodes
-   topic navigation
-   relationships between concepts
-   progression/status later
-   links to concepts
-   links to relevant build steps

The tree should be data-driven, not hard-coded into UI components.

------------------------------------------------------------------------

# 5. Concept Explorer

The Concept Explorer explains individual concepts.

Examples:

-   HTML `<button>`
-   HTML `<form>`
-   JavaScript function
-   JavaScript Promise
-   `async/await`
-   React component
-   React props
-   React state
-   `useState`
-   `useEffect`
-   HTTP GET
-   HTTP POST
-   JSON
-   Express route
-   middleware
-   controller
-   SQL query
-   database table
-   authentication
-   authorization

Every concept should follow a consistent structure.

## Concept Structure

``` text
Concept
│
├── What is it?
├── Why do we need it?
├── How does it work?
├── Basic example
├── What happens internally?
├── Where is it used?
├── What does it connect to?
├── Example project usage
└── Related concepts
```

Example:

``` text
useState
│
├── What is it?
├── Why do we need it?
├── Example
├── What happens when setState is called?
├── Where is it used?
├── Connected component
└── Related concepts
```

The Concept Explorer must connect back to the Example Project.

A learner should not only see a generic example. They should be able to
see where the concept is used in the real example application.

------------------------------------------------------------------------

# 6. Build Journey

The Build Journey is a primary product feature.

It guides the learner through building the example application.

Example:

``` text
BUILD NOTES APP

✓ 1. Understand the application
✓ 2. Create project
✓ 3. Create frontend structure
→ 4. Create first component
○ 5. Create page
○ 6. Add state
○ 7. Add API communication
○ 8. Create backend
○ 9. Create API routes
○ 10. Add database
○ 11. Add authentication
○ 12. Add security
○ 13. Test
○ 14. Deploy
```

The Build Journey is not simply a checklist.

Every step is an interactive lesson.

------------------------------------------------------------------------

# 7. Build Step Structure

Each build step should contain structured information.

Conceptually:

``` text
Build Step
│
├── title
├── order
├── goal
├── why
├── prerequisites
├── explanation
├── filesCreated
├── filesModified
├── conceptsIntroduced
├── codeExamples
├── relationshipsCreated
├── dataFlow
├── requestFlow
├── previousState
├── nextState
├── commonMistakes
└── nextStep
```

Example:

``` text
Step: Create Notes API

Goal:
Allow the frontend to create a note.

Why:
The frontend should not communicate directly with the database.

Files:
backend/routes/notes.js

Concepts:
- HTTP POST
- Express routes
- request body
- JSON
- API endpoint

Connection:
NoteForm
    ↓
createNote()
    ↓
POST /api/notes
    ↓
Express route
```

The platform should visibly show what changed before and after the step.

------------------------------------------------------------------------

# 8. Project Evolution

The learner should see the project grow over time.

The initial project might be:

``` text
notes-app/
```

Then:

``` text
notes-app/
├── frontend/
└── backend/
```

Then:

``` text
notes-app/
├── frontend/
│   └── src/
└── backend/
    └── src/
```

Then:

``` text
frontend/
└── src/
    ├── components/
    ├── pages/
    └── services/
```

Then actual files are introduced.

The learner should be able to move between project states and see:

-   files added
-   files removed
-   files modified
-   relationships added
-   new concepts introduced

The purpose is to teach architecture instead of asking learners to
memorize a finished folder structure.

------------------------------------------------------------------------

# 9. Example Application

The initial example application will be a Notes App.

It should be small enough to understand but rich enough to demonstrate
full-stack development.

## Functional scope

The application should eventually support:

-   registration
-   login
-   logout
-   viewing notes
-   creating notes
-   editing notes
-   deleting notes
-   user-specific notes
-   authentication
-   authorization
-   validation
-   error handling

The application exists primarily as a teaching artifact.

The learning platform should expose its architecture rather than hide
it.

------------------------------------------------------------------------

# 10. Example Application Architecture

The conceptual structure:

``` text
notes-app/
│
├── frontend/
│   ├── components/
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── NoteCard.jsx
│   │   ├── NoteForm.jsx
│   │   └── Navbar.jsx
│   │
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── Dashboard.jsx
│   │
│   ├── services/
│   │   └── notesApi.js
│   │
│   └── App.jsx
│
├── backend/
│   ├── routes/
│   │   ├── auth.js
│   │   └── notes.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   └── notesController.js
│   │
│   ├── middleware/
│   │   └── authMiddleware.js
│   │
│   └── server.js
│
└── database/
    └── schema.sql
```

This is a conceptual teaching structure. The exact implementation can be
adjusted when the example application is designed.

Do not introduce unnecessary architectural layers just because they are
common in large production applications.

The goal is clarity.

------------------------------------------------------------------------

# 11. Frontend Learning Flow

The frontend journey should teach how a UI becomes an application.

Example:

``` text
HTML structure
    ↓
CSS
    ↓
JavaScript
    ↓
React application
    ↓
Components
    ↓
Props
    ↓
Events
    ↓
State
    ↓
Forms
    ↓
API functions
    ↓
HTTP requests
```

The learner should be able to start at:

``` text
<button>
```

and eventually trace:

``` text
<button>
   ↓
onClick
   ↓
handleSave()
   ↓
createNote()
   ↓
fetch()
   ↓
HTTP request
```

------------------------------------------------------------------------

# 12. Reusable Components Are Part of the Curriculum

Component reuse is not merely an implementation technique.

It is something the learner should learn from.

For example:

``` text
Button.jsx
│
├── LoginForm.jsx
├── RegisterForm.jsx
├── NoteForm.jsx
└── DeleteNote.jsx
```

The platform should explain:

-   why a reusable component exists
-   why we don't duplicate the same code
-   how the component is imported
-   how it receives props
-   how it is reused
-   what changes when the shared component changes

This applies to:

-   UI components
-   utility functions
-   API functions
-   validation functions
-   middleware
-   shared types
-   shared data structures

The learner should see reuse as an architectural concept.

------------------------------------------------------------------------

# 13. Connection Tracer

The Connection Tracer is one of the most important features.

The learner should be able to click a symbol/function/component and
understand:

``` text
WHERE IS IT DEFINED?
        ↓
WHO CALLS IT?
        ↓
WHAT DOES IT CALL?
        ↓
WHAT FILES DOES IT CONNECT TO?
        ↓
WHAT DATA DOES IT HANDLE?
        ↓
WHAT HAPPENS NEXT?
```

Example:

``` text
handleSave()
│
├── Defined in
│   NoteForm.jsx
│
├── Called by
│   form submit event
│
├── Calls
│   createNote()
│
└── Leads to
    POST /api/notes
```

Then:

``` text
createNote()
│
├── Defined in
│   notesApi.js
│
├── Calls
│   fetch()
│
└── Sends
    POST /api/notes
```

Then:

``` text
POST /api/notes
│
├── Express route
├── Controller
├── Validation
├── Database query
└── Response
```

------------------------------------------------------------------------

# 14. Data Flow

The platform must show how data travels.

Example:

``` text
USER INPUT
    ↓
React state
    ↓
Component
    ↓
API function
    ↓
JSON
    ↓
HTTP request
    ↓
Backend
    ↓
Validation
    ↓
Database
```

And the reverse:

``` text
Database
    ↓
Backend
    ↓
JSON response
    ↓
fetch()
    ↓
React
    ↓
State
    ↓
UI
```

Data flow must be visually traceable.

------------------------------------------------------------------------

# 15. Frontend → Backend → Database Flow

This is a central teaching path.

The learner should be able to see:

``` text
                    USER
                      │
                      ↓
                  REACT UI
                      │
                      ↓
                 EVENT HANDLER
                      │
                      ↓
                  API FUNCTION
                      │
                      ↓
                 HTTP REQUEST
                      │
                      ↓
                EXPRESS ROUTE
                      │
                      ↓
                  CONTROLLER
                      │
                      ↓
                  VALIDATION
                      │
                      ↓
                   DATABASE
                      │
                      ↓
                  DB RESPONSE
                      │
                      ↓
                  CONTROLLER
                      │
                      ↓
                JSON RESPONSE
                      │
                      ↓
                  REACT
                      │
                      ↓
                 UI UPDATE
```

Every node should eventually be clickable.

------------------------------------------------------------------------

# 16. Request Flow

The platform should explain HTTP through actual requests.

For example:

``` text
POST /api/notes
```

Display:

``` text
Method:
POST

Path:
/api/notes

Purpose:
Create a note

Request body:
{
  "title": "...",
  "content": "..."
}

Expected response:
{
  "id": "...",
  "title": "...",
  "content": "..."
}
```

Explain:

-   method
-   URL/path
-   headers
-   body
-   status code
-   response
-   JSON

------------------------------------------------------------------------

# 17. Database Learning Flow

The database journey should show why the database exists.

``` text
React
 ↓
HTTP
 ↓
Backend
 ↓
Database query
 ↓
PostgreSQL
```

The learner should understand:

-   database
-   table
-   row
-   column
-   primary key
-   foreign key
-   relationship
-   SQL
-   CRUD
-   query
-   transactions at an appropriate beginner level

The example should use actual application data.

Example:

``` text
users
────────────────────
id
email
password_hash
created_at

notes
────────────────────
id
user_id
title
content
created_at
```

The relationship:

``` text
User
  │
  └── has many
          ↓
        Notes
```

------------------------------------------------------------------------

# 18. Authentication and Security

Security should be integrated into the application journey.

Authentication flow:

``` text
User
 ↓
Login form
 ↓
HTTPS
 ↓
Backend
 ↓
Validate input
 ↓
Find user
 ↓
Verify password
 ↓
Create authentication state
 ↓
Return response
```

Authorization:

``` text
Request
 ↓
Authentication middleware
 ↓
Who is the user?
 ↓
Is the user authenticated?
 ↓
Is the user allowed to perform this action?
 ↓
Controller
 ↓
Database
```

Security concepts should eventually include:

-   HTTPS
-   password hashing
-   authentication
-   authorization
-   input validation
-   SQL injection
-   XSS
-   CSRF where applicable
-   environment variables/secrets
-   secure cookies/tokens depending on chosen implementation
-   least privilege
-   error handling without leaking sensitive information

Do not turn the product into a cybersecurity course. Teach security in
the context of the application.

------------------------------------------------------------------------

# 19. Practice System

Practice comes after the core learning experience works.

Possible modes:

## Predict

``` text
What happens when the user clicks Save?
```

## Trace

``` text
Follow the request from Button → Database.
```

## Find

``` text
Which file defines createNote()?
```

## Fix

``` text
The frontend is calling the wrong endpoint.
Find the problem.
```

## Build

``` text
Add a "favorite note" feature.
```

The practice system should reuse the same underlying
project/relationship data.

------------------------------------------------------------------------

# 20. Search

The platform should eventually have global search.

Searching for a concept should return:

``` text
Concepts
Files
Functions
Components
Build Steps
Connections
Flows
```

Example:

``` text
Search: useState

Concept:
What is useState?

Used in:
NoteForm.jsx
Dashboard.jsx

Connections:
useState → handleSubmit
useState → UI update

Build steps:
Step 6 — Add frontend state
```

------------------------------------------------------------------------

# 21. Technical Stack

Use the following stack unless a strong technical reason appears to
change it.

## Learning Platform

-   Next.js
-   React
-   TypeScript
-   Tailwind CSS
-   React Flow
-   Monaco Editor or another suitable code viewer/editor
-   Framer Motion only where it improves comprehension
-   MDX/TypeScript/JSON for structured learning content
-   GitHub
-   Vercel for initial deployment

## Initial backend/database for the learning platform

None.

The learning content can initially be static/data-driven.

Later, if required:

``` text
Next.js
    ↓
API/backend
    ↓
PostgreSQL
```

This should only be introduced when user accounts/progress/etc. actually
require it.

------------------------------------------------------------------------

# 22. Important Architectural Principle: Data-Driven Content

Do not hard-code every lesson directly into React components.

The UI should consume structured data.

For example:

``` ts
type Concept = {
  id: string;
  title: string;
  category: string;
  explanation: string;
  why: string;
  examples: CodeExample[];
  relatedConcepts: string[];
  relatedFiles: string[];
  relatedBuildSteps: string[];
};
```

Similarly:

``` ts
type BuildStep = {
  id: string;
  order: number;
  title: string;
  goal: string;
  why: string;
  prerequisites: string[];
  concepts: string[];
  filesCreated: string[];
  filesModified: string[];
  relationships: string[];
  nextStep?: string;
};
```

And relationships:

``` ts
type Relationship = {
  id: string;
  source: string;
  target: string;
  type:
    | "calls"
    | "imports"
    | "renders"
    | "sends"
    | "receives"
    | "queries"
    | "returns"
    | "uses";
  explanation: string;
};
```

The exact TypeScript model can evolve, but the principle must remain.

------------------------------------------------------------------------

# 23. One Source of Truth

The same data should power multiple UI experiences.

For example, a function relationship should be usable by:

``` text
Concept Explorer
      ↓
File Explorer
      ↓
Connection Graph
      ↓
Build Journey
      ↓
Request Flow
```

Avoid maintaining five separate hard-coded descriptions of the same
relationship.

------------------------------------------------------------------------

# 24. Automatic Code Parsing

Do NOT build a sophisticated compiler/code parser in V1.

Initially, relationships can be manually defined in structured data.

Example:

``` ts
{
  id: "handleSave",
  type: "function",
  file: "NoteForm.jsx",
  definedAt: 12,
  calledBy: ["formSubmit"],
  calls: ["createNote"],
}
```

This is intentional.

The first goal is to prove the learning experience.

Automatic AST/code analysis can be added later.

------------------------------------------------------------------------

# 25. Platform Repository Structure

Initial platform repository:

``` text
fullstack-learning/
│
├── app/
│   ├── page.tsx
│   │
│   ├── learn/
│   │   ├── page.tsx
│   │   └── [topic]/
│   │       └── page.tsx
│   │
│   ├── concepts/
│   │   ├── page.tsx
│   │   └── [concept]/
│   │       └── page.tsx
│   │
│   ├── build/
│   │   ├── page.tsx
│   │   └── [step]/
│   │       └── page.tsx
│   │
│   ├── explorer/
│   │   └── page.tsx
│   │
│   ├── project/
│   │   └── page.tsx
│   │
│   └── flow/
│       └── page.tsx
│
├── components/
│   ├── learning-tree/
│   ├── concept-explorer/
│   ├── build-journey/
│   ├── project-evolution/
│   ├── file-explorer/
│   ├── code-viewer/
│   ├── connection-graph/
│   ├── flow-tracer/
│   ├── security-flow/
│   └── ui/
│
├── content/
│   ├── fundamentals/
│   ├── html/
│   ├── css/
│   ├── javascript/
│   ├── git/
│   ├── react/
│   ├── http/
│   ├── backend/
│   ├── database/
│   ├── authentication/
│   ├── security/
│   ├── testing/
│   └── deployment/
│
├── data/
│   ├── learning-tree.ts
│   ├── concepts.ts
│   ├── build-steps.ts
│   ├── example-project.ts
│   ├── files.ts
│   ├── relationships.ts
│   └── flows.ts
│
├── example-project/
│   ├── frontend/
│   ├── backend/
│   └── database/
│
├── lib/
│   ├── concepts.ts
│   ├── build-journey.ts
│   ├── project-graph.ts
│   ├── flow-tracer.ts
│   └── search.ts
│
├── public/
│
├── README.md
├── PROJECT.md
├── CONTRIBUTING.md
├── package.json
├── tsconfig.json
└── ...
```

This structure can evolve. Do not create every directory on day one if
it has no purpose yet.

------------------------------------------------------------------------

# 26. Frontend Architecture

The learning platform should be componentized.

Example:

``` text
components/
├── learning-tree/
│   ├── LearningTree.tsx
│   ├── LearningNode.tsx
│   └── LearningProgress.tsx
│
├── concept-explorer/
│   ├── ConceptHeader.tsx
│   ├── ConceptExplanation.tsx
│   ├── CodeExample.tsx
│   ├── ConceptConnections.tsx
│   └── RelatedConcepts.tsx
│
├── build-journey/
│   ├── BuildTimeline.tsx
│   ├── BuildStep.tsx
│   ├── StepExplanation.tsx
│   ├── StepChanges.tsx
│   └── NextStep.tsx
│
├── project-evolution/
│   ├── ProjectTree.tsx
│   ├── ProjectSnapshot.tsx
│   └── ProjectDiff.tsx
│
├── connection-graph/
│   ├── ConnectionGraph.tsx
│   ├── ConnectionNode.tsx
│   └── ConnectionDetails.tsx
│
└── flow-tracer/
    ├── FlowCanvas.tsx
    ├── FlowNode.tsx
    ├── FlowEdge.tsx
    └── FlowDetails.tsx
```

Components should be reusable and focused.

Avoid giant components containing unrelated application logic.

------------------------------------------------------------------------

# 27. Reusability Rules

When building the platform:

1.  Prefer reusable components over duplicated UI.
2.  Prefer structured data over duplicated content.
3.  Separate content from presentation.
4.  Separate visualization logic from data.
5.  Do not duplicate relationship information.
6.  Avoid components that do many unrelated things.
7.  Keep components composable.
8.  Avoid premature abstractions when a pattern has not actually
    repeated.
9.  Do not create abstractions merely because they look "professional".
10. Favor understandable code over clever code.

The project itself is teaching software architecture, so its
architecture must be understandable.

------------------------------------------------------------------------

# 28. UX Principles

The platform should feel like an interactive technical learning
environment, not a generic blog.

Important principles:

-   clear visual hierarchy
-   minimal clutter
-   readable code
-   obvious current learning step
-   obvious next step
-   interactive diagrams
-   explain relationships visually
-   responsive layout
-   accessible controls
-   keyboard-friendly navigation
-   useful hover/focus states
-   animations should explain changes, not decorate unnecessarily

Do not over-gamify the experience.

------------------------------------------------------------------------

# 29. MVP Scope

The first meaningful MVP should include:

### Learning

-   Learning Tree
-   Concept Explorer
-   basic concept relationships

### Building

-   Build Journey
-   project structure
-   project evolution
-   step-by-step explanations

### Example Project

-   Notes App
-   frontend structure
-   backend structure
-   database structure
-   representative code

### Understanding Relationships

-   File Explorer
-   Code Viewer
-   Connection Tracer
-   basic data flow
-   frontend → backend → database flow

### Not required for first MVP

-   accounts
-   saved progress
-   AI tutor
-   advanced practice
-   automatic code parsing
-   multiple frameworks
-   collaboration
-   gamification

------------------------------------------------------------------------

# 30. Development Phases

## Phase 0 --- Professional Project Foundation

Goals:

-   create GitHub repository
-   initialize Next.js
-   configure TypeScript
-   configure linting/formatting as appropriate
-   create README
-   create PROJECT.md
-   create CONTRIBUTING.md
-   establish branch/PR workflow
-   establish GitHub Issues and milestones

------------------------------------------------------------------------

## Phase 1 --- Application Shell

Build:

-   global layout
-   navigation
-   basic page structure
-   responsive shell
-   reusable UI primitives

------------------------------------------------------------------------

## Phase 2 --- Learning Tree

Build:

-   tree data model
-   tree UI
-   expandable nodes
-   navigation
-   topic pages
-   relationship to concepts/build steps

------------------------------------------------------------------------

## Phase 3 --- Concept Explorer

Build:

-   concept data model
-   concept page
-   explanations
-   code examples
-   related concepts
-   related files
-   related build steps

------------------------------------------------------------------------

## Phase 4 --- Example Project

Build:

-   Notes App specification
-   project structure data
-   project file tree
-   code viewer
-   file metadata
-   project snapshots

------------------------------------------------------------------------

## Phase 5 --- Project Evolution

Build:

-   build step data model
-   project snapshots
-   file changes
-   before/after view
-   next-step navigation

------------------------------------------------------------------------

## Phase 6 --- Connection Tracer

Build:

-   relationship model
-   function relationships
-   component relationships
-   imports
-   calls
-   file relationships
-   clickable graph
-   relationship details

------------------------------------------------------------------------

## Phase 7 --- Data and Request Flow

Build:

-   request flow model
-   frontend → backend visualization
-   backend → database visualization
-   response flow
-   HTTP details
-   JSON examples

------------------------------------------------------------------------

## Phase 8 --- Security

Build:

-   authentication flow
-   authorization flow
-   password security explanation
-   validation
-   HTTPS
-   common security problems

------------------------------------------------------------------------

## Phase 9 --- Practice

Build:

-   prediction
-   tracing
-   finding
-   fixing
-   small build tasks

------------------------------------------------------------------------

## Phase 10 --- Search and Polish

Build:

-   global search
-   responsive improvements
-   accessibility
-   performance
-   error states
-   loading states
-   animations
-   SEO

------------------------------------------------------------------------

## Phase 11 --- Optional Platform Backend

Only if product requirements justify it.

Potential features:

-   accounts
-   progress
-   bookmarks
-   completed lessons
-   practice history
-   personalized learning

------------------------------------------------------------------------

# 31. GitHub Development Workflow

This project must be developed professionally.

Do NOT develop directly on `main`.

Workflow:

``` text
GitHub Issue
     ↓
Create branch
     ↓
Implement
     ↓
Run checks
     ↓
Review diff
     ↓
Commit
     ↓
Push
     ↓
Pull Request
     ↓
Review
     ↓
Fix review feedback
     ↓
Merge
     ↓
Delete branch
     ↓
Next Issue
```

------------------------------------------------------------------------

# 32. Branch Naming

Use:

``` text
feature/<short-name>
fix/<short-name>
refactor/<short-name>
docs/<short-name>
chore/<short-name>
```

Examples:

``` text
feature/project-foundation
feature/learning-tree
feature/concept-explorer
feature/build-journey
fix/tree-navigation
docs/project-architecture
```

------------------------------------------------------------------------

# 33. Commit Convention

Prefer meaningful conventional commits.

Examples:

``` text
chore: initialize Next.js project
docs: add project specification
feat: add learning tree data model
feat: add interactive learning tree
feat: add concept explorer
fix: preserve selected learning node
refactor: extract reusable tree node
```

Do not create meaningless commits such as:

``` text
update
changes
fix stuff
final
final-final
```

------------------------------------------------------------------------

# 34. GitHub Project Board

Create a GitHub Project with:

``` text
BACKLOG
READY
IN PROGRESS
IN REVIEW
DONE
```

Issues should move through the board.

------------------------------------------------------------------------

# 35. Milestones

Create these milestones:

``` text
M1 — Foundation
M2 — Learning Tree
M3 — Concept Explorer
M4 — Example Project
M5 — Project Evolution
M6 — Connection Tracer
M7 — Data & Request Flow
M8 — Security
M9 — Practice
M10 — Polish
M11 — Optional Platform Backend
```

------------------------------------------------------------------------

# 36. Initial GitHub Issues

Create issues approximately in this order.

## M1 --- Foundation

### Issue 1 --- Initialize Next.js project

Goal:

Create the initial Next.js + TypeScript application.

Acceptance criteria:

-   application starts locally
-   TypeScript configured
-   linting works
-   production build succeeds
-   basic README exists

------------------------------------------------------------------------

### Issue 2 --- Add project documentation

Create:

-   README.md
-   PROJECT.md
-   CONTRIBUTING.md

Document:

-   purpose
-   architecture
-   development workflow
-   coding principles
-   project roadmap

------------------------------------------------------------------------

### Issue 3 --- Establish GitHub development workflow

Create:

-   branch conventions
-   PR template
-   issue template
-   project board
-   milestones

------------------------------------------------------------------------

### Issue 4 --- Create application shell

Build:

-   main layout
-   navigation
-   responsive shell
-   reusable base UI components

------------------------------------------------------------------------

# M2 --- Learning Tree

### Issue 5 --- Create learning tree data model

### Issue 6 --- Build learning tree UI

### Issue 7 --- Add expandable/collapsible nodes

### Issue 8 --- Add topic navigation

### Issue 9 --- Connect learning tree to concept/build data

------------------------------------------------------------------------

# M3 --- Concept Explorer

### Issue 10 --- Create concept data model

### Issue 11 --- Build concept page

### Issue 12 --- Add code examples

### Issue 13 --- Add related concepts

### Issue 14 --- Add related files/build steps

------------------------------------------------------------------------

# M4 --- Example Project

### Issue 15 --- Define Notes App learning project

### Issue 16 --- Create example project structure data

### Issue 17 --- Build project file explorer

### Issue 18 --- Add code viewer

### Issue 19 --- Add file metadata

------------------------------------------------------------------------

# M5 --- Project Evolution

### Issue 20 --- Create build-step data model

### Issue 21 --- Create project snapshots

### Issue 22 --- Show project evolution

### Issue 23 --- Build guided build-step UI

### Issue 24 --- Add next-step navigation

------------------------------------------------------------------------

# M6 --- Connection Tracer

### Issue 25 --- Create relationship data model

### Issue 26 --- Add function relationships

### Issue 27 --- Add component relationships

### Issue 28 --- Add import/file relationships

### Issue 29 --- Build connection graph

### Issue 30 --- Make graph nodes interactive

### Issue 31 --- Add relationship details

------------------------------------------------------------------------

# M7 --- Data & Request Flow

### Issue 32 --- Define request-flow data model

### Issue 33 --- Build flow visualization

### Issue 34 --- Add frontend request flow

### Issue 35 --- Add backend processing flow

### Issue 36 --- Add database flow

### Issue 37 --- Add response flow

### Issue 38 --- Add HTTP request details

------------------------------------------------------------------------

# M8 --- Security

### Issue 39 --- Define authentication flow

### Issue 40 --- Build authentication visualization

### Issue 41 --- Add authorization flow

### Issue 42 --- Add password security concepts

### Issue 43 --- Add input validation/security concepts

### Issue 44 --- Add common web security explanations

------------------------------------------------------------------------

# M9 --- Practice

### Issue 45 --- Create practice data model

### Issue 46 --- Add prediction exercises

### Issue 47 --- Add tracing exercises

### Issue 48 --- Add find-the-connection exercises

### Issue 49 --- Add break/fix exercises

### Issue 50 --- Add build exercises

------------------------------------------------------------------------

# M10 --- Polish

### Issue 51 --- Add global search

### Issue 52 --- Improve responsive design

### Issue 53 --- Accessibility review

### Issue 54 --- Performance review

### Issue 55 --- Add appropriate animations

### Issue 56 --- Improve error/loading states

### Issue 57 --- SEO and metadata

------------------------------------------------------------------------

# 37. Issue Quality Rules

Each GitHub issue should contain:

``` text
## Goal

## Why

## Requirements

## Acceptance Criteria

## Out of Scope

## Dependencies
```

Issues should be small enough to complete in one focused development
cycle.

Do not create one enormous issue such as:

> Build the entire connection tracer.

Instead split it into data model, UI, graph, interaction, etc.

------------------------------------------------------------------------

# 38. AI Coding Agent Rules

Claude or another AI coding agent must follow these rules.

Before implementing an issue:

1.  Inspect the repository.
2.  Inspect existing architecture.
3.  Inspect related components/data.
4.  Identify the smallest set of files that need modification.
5.  Do not modify unrelated files.
6.  Follow existing conventions.
7.  Reuse existing components/data structures.
8.  Do not introduce dependencies without justification.

After implementation:

1.  Run lint/checks.
2.  Run tests when available.
3.  Run production build.
4.  Inspect the final diff.
5.  Report what changed.
6.  Report any unresolved issues.
7.  Do not commit/push unless explicitly instructed by the workflow.

The agent should not silently redesign the architecture.

If a requirement appears ambiguous, choose the simplest implementation
consistent with this specification and document the assumption.

------------------------------------------------------------------------

# 39. Vibe Coding Rules

AI-assisted development is encouraged.

However, the goal is not:

> AI writes everything and the developer accepts it.

The goal is:

> AI accelerates implementation while the developer understands and
> reviews the implementation.

Before accepting an AI-generated change, inspect:

``` text
git status
git diff
```

Understand:

-   why files changed
-   why dependencies were added
-   what architecture changed
-   whether existing components could have been reused
-   whether the change is actually required

The project itself is intended to improve understanding of software
development.

------------------------------------------------------------------------

# 40. Testing Philosophy

Testing should be introduced progressively.

At minimum:

-   lint
-   TypeScript checks
-   production build

Later:

-   unit tests
-   component tests
-   integration tests
-   end-to-end tests

Do not build a huge testing framework before there is meaningful
application behavior to test.

------------------------------------------------------------------------

# 41. Content Quality Rules

Learning content must be:

-   beginner-friendly
-   technically accurate
-   concrete
-   connected to the example application
-   focused on cause and effect
-   free from unnecessary jargon
-   structured consistently

Avoid explanations like:

> React is a JavaScript library for building user interfaces.

That definition is useful but insufficient.

Prefer:

> We use React here because our interface changes when the user
> interacts with it. React gives us a way to represent the UI as
> components and update the interface when application state changes.

Then connect that explanation to actual project code.

------------------------------------------------------------------------

# 42. The Platform Should Always Answer "Why?"

Whenever a new technology/file/folder/function is introduced, explain
why it exists.

For example:

Bad:

``` text
Create services/notesApi.js
```

Better:

``` text
We are creating services/notesApi.js because several UI components
may need to communicate with the notes API.

Instead of placing fetch() directly inside every component,
we keep API communication in one place.

Component
    ↓
notesApi.js
    ↓
HTTP API
```

This principle applies throughout the product.

------------------------------------------------------------------------

# 43. The Platform Should Always Show "What Changed?"

After each Build Step:

``` text
BEFORE

frontend/
└── src/
    └── App.jsx
```

Then:

``` text
AFTER

frontend/
└── src/
    ├── App.jsx
    └── components/
        └── NoteCard.jsx
```

Explain:

``` text
We added NoteCard because...
```

This makes architecture evolve naturally.

------------------------------------------------------------------------

# 44. The Platform Should Always Show "What Comes Next?"

Every build step ends with:

``` text
You just learned:
- Component
- Props
- Reuse

You just created:
- NoteCard.jsx

You are now able to:
- display a note

Next:
- Create NoteForm

Why:
- We need a way for users to create notes.
```

This prevents learners from getting lost.

------------------------------------------------------------------------

# 45. Long-Term Vision

Once the core platform is successful, it could eventually support:

-   multiple example applications
-   different stacks
-   automatic code relationship analysis
-   real code execution
-   user accounts
-   progress tracking
-   personalized learning paths
-   practice generation
-   project challenges
-   deployment simulations
-   additional languages/frameworks

Possible future examples:

``` text
Notes App
E-commerce App
Blog
Chat Application
Task Manager
```

But these are future possibilities, not MVP requirements.

------------------------------------------------------------------------

# 46. Definition of Done for the Core Product

The core product is successful when a beginner can:

1.  Open the Learning Tree.
2.  Understand where to start.
3.  Enter the Build Journey.
4.  Start with an empty application.
5.  See why each folder/file is created.
6.  Understand the code being introduced.
7.  Follow reusable components.
8.  Click a function and trace its relationships.
9.  Follow frontend → backend → database.
10. Follow data from user input to database and back.
11. Understand authentication/security flow.
12. Understand why each architectural layer exists.
13. Know what to build next.
14. Eventually understand how the application is deployed.

The product should leave the learner thinking:

> **"I understand how this application works."**

rather than:

> **"I memorized a bunch of React and Express syntax."**

------------------------------------------------------------------------

# 47. First Development Action

When starting this project, do NOT immediately implement the entire
application.

The first sequence should be:

``` text
1. Create GitHub repository
        ↓
2. Create initial project locally
        ↓
3. Initialize Next.js + TypeScript
        ↓
4. Create README.md
        ↓
5. Create PROJECT.md
        ↓
6. Create CONTRIBUTING.md
        ↓
7. Create GitHub Project
        ↓
8. Create milestones
        ↓
9. Create initial issues
        ↓
10. Create development branch
        ↓
11. Implement Issue #1
        ↓
12. Test
        ↓
13. Commit
        ↓
14. Push
        ↓
15. Open PR
        ↓
16. Review
        ↓
17. Merge
        ↓
18. Continue to Issue #2
```

Do not skip the GitHub workflow simply because the project is being
developed with AI.

The GitHub workflow is part of the learning objective.

------------------------------------------------------------------------

# 48. Final Product Principle

The entire platform should be built around five questions:

``` text
WHAT IS THIS?
        ↓
WHY DO WE NEED IT?
        ↓
HOW DO WE BUILD IT?
        ↓
HOW DOES IT CONNECT?
        ↓
WHAT HAPPENS NEXT?
```

If a feature does not help answer one of these questions, question
whether it belongs in the core product.

The platform should teach not only syntax, but the mental model of how
software systems are constructed.

------------------------------------------------------------------------

# 49. Instructions to the AI Coding Agent

You are the primary AI development agent for this project.

Use this document as the project specification.

Your responsibilities are:

1.  Initialize the project professionally.
2.  Create the repository structure.
3.  Create GitHub milestones and issues.
4.  Follow issue-driven development.
5.  Work on one focused issue at a time.
6.  Use branches and pull requests.
7.  Keep the architecture reusable.
8.  Keep learning content separate from UI.
9.  Avoid unnecessary dependencies.
10. Avoid premature backend/database work for the learning platform.
11. Build the example application as a teaching artifact.
12. Make frontend/backend/database relationships explicit.
13. Make project evolution visible.
14. Make reusable components understandable.
15. Test every meaningful change.
16. Review diffs before committing.
17. Keep commits meaningful.
18. Do not silently expand scope.
19. Update documentation when architecture changes.
20. Preserve the central philosophy:

> **Don't just learn what to write. Understand what happens when you
> write it.**

Start by inspecting the current environment and repository state.

If no project exists yet, initialize the project.

Do not implement the full application immediately.

First establish the professional GitHub/project foundation and create
the roadmap/issues required to build the project incrementally.
