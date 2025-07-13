import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserRole } from "../types/roles"; // should be "ADMIN" | "INSTRUCTOR" | "STUDENT"

const VALID_ROLES: UserRole[] = ["ADMIN", "INSTRUCTOR", "STUDENT"];

export const requireAuth = (allowed: UserRole[] = []) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        userId: string;
        role: string;
      };

      const role = decoded.role.toUpperCase(); // <-- normalise

      if (!VALID_ROLES.includes(role as UserRole)) {
        return res.status(403).json({ error: "Invalid role in token" });
      }

      req.user = { id: decoded.userId, role: role as UserRole };

      // If route expects a subset of roles
      // console.log("Decoded JWT:", decoded);

      if (allowed.length && !allowed.includes(req.user.role)) {
        return res.status(403).json({ error: "Access denied" });
      }

      next();
    } catch {
      return res.status(401).json({ error: "Invalid token" });
    }
  };
};
