import type { CourseMapResponse } from "@fsl/shared";
import { Router } from "express";
import { getCourseMap } from "../lib/paths.js";

export const courseMapRouter = Router();

// GET /api/course-map — every topic in reading order with its three levels
// (step ranges, counts, minutes, what each covers), or "planned".
courseMapRouter.get("/", (_req, res) => {
  const body: CourseMapResponse = getCourseMap();
  res.json(body);
});
