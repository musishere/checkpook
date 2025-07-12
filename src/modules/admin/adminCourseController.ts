import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

export const getPendingCourses = async (_req: Request, res: Response) => {
  const courses = await prisma.$queryRawUnsafe(`
  SELECT
    c.*,
    u.id as "instructorId",
    u.name as "instructorName",
    u.email as "instructorEmail"
  FROM "Course" c
  JOIN "User" u ON u.id = c."instructorId"
  WHERE c."isApproved" = false
`);
  return res.status(200).json(courses);
};

export const approveCourse = async (req: Request, res: Response) => {
  const courseId = req.params.id;

  try {
    await prisma.$executeRaw`
      UPDATE "Course"
      SET "isApproved" = true
      WHERE "id" = ${courseId}::uuid
    `;

    return res.status(200).json({ message: "Course approved" });
  } catch (err) {
    console.error("Approve error:", err);
    return res.status(500).json({ error: "Failed to approve course" });
  }
};

export const rejectCourse = async (req: Request, res: Response) => {
  const courseId = req.params.id;

  try {
    await prisma.$executeRaw`
      DELETE FROM "Course"
      WHERE "id" = ${courseId}::uuid
    `;

    return res.status(200).json({ message: "Course rejected and removed" });
  } catch (err) {
    console.error("Reject error:", err);
    return res.status(500).json({ error: "Failed to reject course" });
  }
};
