import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import AuthRequest from "../../types/express";

export const getEnrolledCourses = async (req: Request, res: Response) => {
  try {
    const studentId = req.user?.userId;

    const enrollments = await prisma.enrollment.findMany({
      where: { studentId },
      include: {
        course: {
          include: {
            instructor: {
              select: { name: true, email: true },
            },
          },
        },
      },
    });

    const courses = enrollments.map((e) => e.course);

    res.json({ enrolledCourses: courses });
  } catch (error) {
    console.error("Error fetching enrolled courses:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
