// validators/lesson.validator.ts
import { z } from "zod";

export const createLessonSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  videoUrl: z.string().url("Video URL must be valid"),
});
