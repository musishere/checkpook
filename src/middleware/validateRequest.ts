import { ZodSchema, ZodError } from "zod";
import { Request, Response, NextFunction } from "express";

export const validateRequest = (schema: ZodSchema<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // console.log("[validateRequest] Validating body:", req.body);

      // req.body = schema.parse(req.body); // replaces req.body with parsed version
      next();
    } catch (err: unknown) {
      // console.error("[validateRequest] Validation error:", err);

      if (err instanceof ZodError && Array.isArray(err.issues)) {
        return res.status(400).json({
          errors: err.issues.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        });
      }

      return res
        .status(500)
        .json({ error: "Something went wrong during validation" });
    }
  };
};
