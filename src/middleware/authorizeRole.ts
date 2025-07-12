// src/middleware/authorizeRole.ts
import { Request, Response, NextFunction } from "express";

export const authorizeRole = (role: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    if (req.user?.role !== role) {
      return res
        .status(403)
        .json({ error: "Access denied: insufficient permissions" });
    }
    next();
  };
};
