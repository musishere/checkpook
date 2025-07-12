import { Router, Request, Response } from "express";
import { requireAuth } from "../../middleware/auth";
import {
  approveCourse,
  getPendingCourses,
  rejectCourse,
} from "./adminCourseController";

const router = Router();

router.get(
  "/dashboard",
  requireAuth(["admin"]),
  (req: Request, res: Response) => {
    // @ts-ignore
    res.json({ message: `Welcome, admin ${req.user.userId}` });
  }
);

router.get("/pending", requireAuth(["admin"]), getPendingCourses);
router.patch("/:id/approve", requireAuth(["admin"]), approveCourse);
router.patch("/:id/reject", requireAuth(["admin"]), rejectCourse);

export default router;
