import cookieParser from "cookie-parser";
import express from "express";
import { authRoutes } from "./routes/auth.js";
import { notesRoutes } from "./routes/notes.js";

// Builds the Express app without starting it, so tests can send requests
// to it directly (server.js starts it).
export function createApp() {
  const app = express();

  // Middleware runs in this order for every request.
  app.use(express.json()); // JSON body → req.body
  app.use(cookieParser()); // Cookie header → req.cookies

  app.get("/api/health", (req, res) => res.json({ status: "ok" }));
  app.use("/api/auth", authRoutes);
  app.use("/api/notes", notesRoutes);

  // Last: any error thrown in a route ends up here (Express 5 also catches
  // errors from async functions). Log the details, tell the user less.
  app.use((err, req, res, next) => {
    console.error(err);
    if (res.headersSent) return next(err);
    // express.json() reports bad JSON as a 400 error.
    if (err.status === 400) {
      return res.status(400).json({ error: "Invalid JSON" });
    }
    res.status(500).json({ error: "Something went wrong" });
  });

  return app;
}
