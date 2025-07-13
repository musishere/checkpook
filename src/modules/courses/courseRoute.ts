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
  requireAuth(["INSTRUCTOR"]),
  validateRequest(createCourseSchema),
  createCourse
);

// Instructor can view their own courses
router.get("/my", requireAuth(["INSTRUCTOR"]), getInstructorCourses);

// Get all published courses (public or for student browsing)
router.get("/", getAllCourses);

// Enroll student in a course
router.post("/:id/enroll", requireAuth(["STUDENT"]), enrollStudent);

// Get course by ID (public or protected)
router.get("/:id", getCourseById);

router.patch(
  "/:id",
  requireAuth(["INSTRUCTOR"]),
  validateRequest(UpdateCourseSchema),
  updateCourse
);
router.post(
  "/:id/submit-review",
  requireAuth(["INSTRUCTOR"]),
  submitCourseForReview
);

export default router;
