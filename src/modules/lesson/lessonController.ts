import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { ZodError } from "zod";
import { createLessonSchema } from "./lessonValidator";

export const createLesson = async (req: Request, res: Response) => {
  const { id: courseId } = req.params;
  const instructorId = req.user!.id;

  try {
    const course = await prisma.course.findUnique({ where: { id: courseId } });

    if (!course || course.instructorId !== instructorId) {
      return res
        .status(403)
        .json({ error: "Not authorized to add lessons to this course" });
    }

    const parsed = createLessonSchema.parse(req.body);

    console.log("🧪 Parsed:", parsed);
    console.log("🧪 Course ID:", courseId);

    // ✅ Raw insert (ONLY ONCE)
    await prisma.$executeRawUnsafe(
      `
  INSERT INTO "Lesson"
    ("id", "title", "description", "videoUrl", "courseId")
  VALUES
    (gen_random_uuid(), $1, $2, $3, $4::uuid)
  `,
      parsed.title,
      parsed.description,
      parsed.videoUrl,
      courseId
    );

    // ✅ Then safely fetch the inserted lesson
    const [insertedLesson] = await prisma.$queryRawUnsafe<any[]>(
      `
  SELECT * FROM "Lesson"
  WHERE "courseId" = $1::uuid
  ORDER BY "createdAt" DESC
  LIMIT 1
  `,
      courseId
    );

    return res
      .status(201)
      .json({ message: "Lesson created", lesson: insertedLesson });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ error: error.issues[0].message });
    }

    console.error("❌ Lesson creation error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
