// src/modules/course/course.service.ts

import { prisma } from "../../lib/prisma";
import { CreateCourseSchema } from "./courseSchemaValidate";
import { z } from "zod";

const createCourse = async (
  data: z.infer<typeof CreateCourseSchema>,
  instructorId: string
) => {
  return await prisma.course.create({
    data: {
      ...data,
      instructorId,
    },
  });
};

const getCoursesByInstructor = async (instructorId: string) => {
  return await prisma.course.findMany({
    where: { instructorId },
  });
};

export const courseService = {
  createCourse,
  getCoursesByInstructor,
};
