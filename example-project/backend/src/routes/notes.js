import express from "express";
import * as notesController from "../controllers/notesController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

// Which URL runs which controller function. Every notes route needs a
// logged-in user, so requireAuth runs first for all of them.
export const notesRoutes = express.Router();

notesRoutes.use(requireAuth);
notesRoutes.get("/", notesController.listNotes);
notesRoutes.post("/", notesController.createNote);
notesRoutes.put("/:id", notesController.updateNote);
notesRoutes.delete("/:id", notesController.deleteNote);
