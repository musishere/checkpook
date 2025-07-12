import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { courseService } from "./courseService";
import { ZodError } from "zod";
import { UpdateCourseSchema } from "./courseSchemaValidate";
import { Prisma } from "@prisma/client";

export const createCourse = async (req: Request, res: Response) => {
  try {
    const { title, description, price } = req.body;

    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const instructorId = req.user.id;

    const course = await prisma.course.create({
      data: {
        title,
        description,
        price,
        instructorId,
      },
    });

    res.status(201).json(course);
  } catch (err) {
    console.error("Create course error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getAllCourses = async (req: Request, res: Response) => {
  try {
    const courses = await prisma.course.findMany({
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    res.status(200).json(courses);
  } catch (err) {
    console.error("Error fetching courses:", err);
    res.status(500).json({ message: "Failed to fetch courses" });
  }
};

export const getCourseById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.status(200).json(course);
  } catch (err) {
    console.error("Error getting course:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const enrollStudent = async (req: Request, res: Response) => {
  const { id: courseId } = req.params;
  const studentId = req.user?.id;

  try {
    // Check if course exists
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if already enrolled
    const already = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: studentId!,
          courseId,
        },
      },
    });
    if (already) {
      return res.status(400).json({ message: "Already enrolled" });
    }

    // Enroll student
    const enrollment = await prisma.enrollment.create({
      data: {
        studentId: studentId!,
        courseId,
      },
    });

    res.status(201).json({ message: "Enrollment successful", enrollment });
  } catch (err) {
    console.error("Enrollment error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getInstructorCourses = async (req: Request, res: Response) => {
  try {
    const instructorId = req.user!.id;
    const courses = await courseService.getCoursesByInstructor(instructorId);
    return res.status(200).json(courses);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateCourse = async (req: Request, res: Response) => {
  console.log("🔥 Controller reached");

  const courseId = req.params.id;
  const instructorId = req.user!.id;

  try {
    console.log("🔎 Body:", req.body);

    const parsed = UpdateCourseSchema.parse(req.body);
    // const course = await prisma.course.findUnique({
    //   where: { id: courseId },
    // });
    const course = await prisma.course.findUnique({ where: { id: courseId } });

    if (!course || course.instructorId !== instructorId) {
      return res
        .status(403)
        .json({ error: "Not authorized to edit this course" });
    }

    await prisma.$executeRaw`
  UPDATE "Course"
  SET "title" = ${parsed.title}, "price" = ${parsed.price}, "isApproved" = false
  WHERE "id" = ${courseId}::uuid
`;

    // Then fetch the updated course manually

    return res.status(200).json({ message: "Course updated", course });
  } catch (error) {
    console.log("❌ Error:", error);

    if (error instanceof ZodError) {
      return res.status(400).json({ error: error.issues[0].message });
    }

    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const submitCourseForReview = async (req: Request, res: Response) => {
  const courseId = req.params.id;
  const instructorId = req.user!.id;

  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course || course.instructorId !== instructorId) {
      return res
        .status(403)
        .json({ error: "Not authorized to submit this course" });
    }

    await prisma.$executeRaw`
  UPDATE "Course"
  SET "isApproved" = false
  WHERE "id" = ${courseId}::uuid
`;

    return res.status(200).json({ message: "Course submitted for review" });
  } catch (error) {
    console.error("❌ Submit review error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
