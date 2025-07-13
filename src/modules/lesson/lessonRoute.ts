import express from "express";
import {
  completeLessonController,
  createLesson,
  getLessonsController,
} from "./lessonController";
import { requireAuth } from "../../middleware/auth";
import { authorizeRole } from "../../middleware/authorizeRole";
import { createLessonSchema } from "./lessonValidator";
import { validateRequest } from "../../middleware/validateRequest";

const router = express.Router();

router.post(
  "/:id/lessons",
  requireAuth(["INSTRUCTOR"]),
  validateRequest(createLessonSchema),
  createLesson
);

router.get(
  "/courses/:id/lessons",
  requireAuth(["STUDENT", "INSTRUCTOR"]),
  getLessonsController
);

router.post(
  "/lessons/:id/complete",
  requireAuth(["STUDENT"]),
  completeLessonController
);

export default router;
