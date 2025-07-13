import { Router } from "express";
import { getEnrolledCourses } from "./enrollmentController";
import { requireAuth } from "../../middleware/auth";

const router = Router();

router.get("/my-courses", requireAuth(["STUDENT"]), getEnrolledCourses);

export default router;
