import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserRole } from "../types/roles";

export const requireAuth = (roles: UserRole[] = []) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        userId: string;
        role: string;
      };

      // 🔒 Type guard to check if decoded.role is a valid UserRole
      if (
        !["admin", "instructor", "student", "support"].includes(decoded.role)
      ) {
        return res.status(403).json({ error: "Invalid role in token" });
      }

      req.user = {
        id: decoded.userId,
        role: decoded.role as UserRole,
      };

      if (roles.length && !roles.includes(req.user.role)) {
        return res.status(403).json({ error: "Access denied" });
      }

      next();
    } catch (err) {
      return res.status(401).json({ error: "Invalid token" });
    }
  };
};
