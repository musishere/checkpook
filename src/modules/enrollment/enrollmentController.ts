import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import AuthRequest from "../../types/express";
export const getEnrolledCourses = async (req: Request, res: Response) => {
  try {
    const studentId = req.user?.id;

    if (!studentId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Minimal test query first
    const test = await prisma.$queryRaw`
      SELECT id FROM "User" LIMIT 1
    `;
    console.log("Connection test:", test);

    // Main query with exact table names from your schema
    const enrolledCourses = await prisma.$queryRaw`
      SELECT
        c.id,
        c.title,
        c.description,
        u.email AS "instructorEmail"
      FROM "Enrollment" e
      JOIN "Course" c ON e."courseId" = c.id
      JOIN "User" u ON c."instructorId" = u.id
      WHERE e."studentId" = ${studentId}::uuid
    `;

    return res.json({ enrolledCourses });
  } catch (error) {
    console.error("Database Error:", error);

    // Get all table names for debugging
    const tables = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `.catch(() => null);

    return res.status(500).json({
      error: "Query failed",
      details: error instanceof Error ? error.message : "Unknown error",
      existing_tables: tables,
      next_steps: [
        "1. Verify these tables exist: Course, Enrollment, User",
        "2. Check table names are exact (including case)",
        "3. Try a simpler query first",
      ],
    });
  }
};
