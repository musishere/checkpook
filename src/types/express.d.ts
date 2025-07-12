// src/types/express.d.ts
import { Request } from "express";
import { UserRole } from "./roles";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string; // not userId
        role: UserRole; // Optional: strict types
      };
    }
  }
}
