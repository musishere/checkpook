import express from "express";
import { createLesson } from "./lessonController";
import { requireAuth } from "../../middleware/auth";
import { authorizeRole } from "../../middleware/authorizeRole";
import { createLessonSchema } from "./lessonValidator";
import { validateRequest } from "../../middleware/validateRequest";

const router = express.Router();

router.post(
  "/:id/lessons",
  requireAuth(["instructor"]),
  validateRequest(createLessonSchema),
  createLesson
);

export default router;
