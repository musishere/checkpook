import { Router } from "express";
import {
  createCourse,
  enrollStudent,
  getAllCourses,
  getCourseById,
  getInstructorCourses,
  submitCourseForReview,
  updateCourse,
} from "./courseController";
import { validateRequest } from "../../middleware/validateRequest";
import { createCourseSchema } from "./courseValidation";
import { requireAuth } from "../../middleware/auth";
import { UpdateCourseSchema } from "./courseSchemaValidate";

const router = Router();

// 🔒 Instructor creates a course
router.post(
  "/",
  requireAuth(["instructor"]),
  validateRequest(createCourseSchema),
  createCourse
);

// Instructor can view their own courses
router.get("/my", requireAuth(["instructor"]), getInstructorCourses);

// Get all published courses (public or for student browsing)
router.get("/", getAllCourses);

// Enroll student in a course
router.post("/:id/enroll", requireAuth(["student"]), enrollStudent);

// Get course by ID (public or protected)
router.get("/:id", getCourseById);

router.patch(
  "/:id",
  requireAuth(["instructor"]),
  validateRequest(UpdateCourseSchema),
  updateCourse
);
router.post(
  "/:id/submit-review",
  requireAuth(["instructor"]),
  submitCourseForReview
);

export default router;
