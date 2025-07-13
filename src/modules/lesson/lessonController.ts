import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import z, { ZodError } from "zod";
import { createLessonSchema } from "./lessonValidator";
import { NextFunction } from "connect";

type LessonRow = {
  id: string;
  title: string;
  videoUrl: string;
  courseId: string;
  createdAt: string;
  updatedAt: string;
};

const getLessonsSchema = z.object({
  id: z.string().uuid({ message: "Invalid course ID format" }),
});

const completeLessonSchema = z.object({
  id: z.string().uuid({ message: "Invalid lesson ID" }),
});

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

export const getLessonsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1. Validate course ID from req.params
    const parseResult = getLessonsSchema.safeParse(req.params);
    if (!parseResult.success) {
      return res
        .status(400)
        .json({ error: parseResult.error.issues[0].message });
    }

    const courseId = parseResult.data.id;
    const user = req.user; // Added by JWT middleware

    // 2. ✅ Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { instructorId: true },
    });

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    const isInstructor =
      user?.role === "instructor" && user?.id === course.instructorId;
    let isEnrolled = false;

    // 3. ✅ Check enrollment if not instructor
    if (!isInstructor && user?.role === "student") {
      const enrollment = await prisma.enrollment.findFirst({
        where: {
          courseId,
          studentId: user.id,
        },
      });
      isEnrolled = !!enrollment;
    }

    // 4. If neither instructor nor enrolled student, deny access
    if (!isInstructor && !isEnrolled) {
      return res
        .status(403)
        .json({ error: "Access denied: unauthorized user" });
    }

    // 5.Fetch lessons using raw SQL (to avoid Prisma UUID issues with Supabase)
    const lessons = await prisma.$queryRawUnsafe<LessonRow[]>(`
  SELECT * FROM "Lesson"
  WHERE "courseId" = '${courseId}'
  ORDER BY "createdAt" ASC;
`);

    // 6.  Return response
    return res.status(200).json({
      courseId,
      totalLessons: lessons.length,
      lessons,
    });
  } catch (error) {
    next(error); // Pass to global error handler
  }
};

export const completeLessonController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parseResult = completeLessonSchema.safeParse(req.params);
    if (!parseResult.success) {
      return res
        .status(400)
        .json({ error: parseResult.error.issues[0].message });
    }

    const lessonId = parseResult.data.id;
    const user = req.user!;
    if (user.role !== "student") {
      return res
        .status(403)
        .json({ error: "Only students can complete lessons" });
    }

    // Check if lesson exists
    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) {
      return res.status(404).json({ error: "Lesson not found" });
    }

    // Check if student is enrolled in the course this lesson belongs to
    const isEnrolled = await prisma.enrollment.findFirst({
      where: {
        courseId: lesson.courseId,
        studentId: user.id,
      },
    });

    if (!isEnrolled) {
      return res
        .status(403)
        .json({ error: "You are not enrolled in this course" });
    }

    // Mark as complete (if not already marked)
    const alreadyDone = await prisma.lessonProgress.findFirst({
      where: {
        lessonId,
        studentId: user.id,
      },
    });

    if (alreadyDone) {
      return res.status(200).json({ message: "Already marked as completed" });
    }

    const result = await prisma.lessonProgress.create({
      data: {
        lessonId,
        studentId: user.id,
      },
    });

    return res.status(200).json({
      message: "Lesson marked as completed",
      progress: result,
    });
  } catch (err) {
    next(err);
  }
};
