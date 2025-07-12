import { z } from "zod";

export const CreateCourseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description too short"),
  price: z.number().positive("Price must be positive"),
  thumbnailUrl: z.string().url().optional(),
  category: z.string().min(1, "Category is required"),
});

export const UpdateCourseSchema = z
  .object({
    title: z.string().min(1).optional(),
    description: z.string().min(10).optional(),
    price: z.number().positive().optional(),
    thumbnailUrl: z.string().url().optional(),
    category: z.string().min(1).optional(),
    // Let Prisma handle this, don't expose in API:
    isApproved: z.boolean().optional(),
  })
  .strict(); // Ensures no unexpected fields
