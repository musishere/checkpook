// src/index.ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./modules/auth/authRoute";
import cookieParser from "cookie-parser";
import adminRoutes from "./modules/admin/adminRoute";
import { authenticate } from "./middleware/autheticate";
import { authorizeRole } from "./middleware/authorizeRole";
import enrollmentRoutes from "./modules/enrollment/enrollmentRoute";
import lessonRoutes from "./modules/lesson/lessonRoute";
import courseRoutes from "./modules/courses/courseRoute";
import adminCourseRoutes from "./modules/admin/adminRoute";

// ...

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use("/admin", adminRoutes); // <-- Mounts /admin/dashboard route here
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api", lessonRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/admin/courses", adminCourseRoutes);
// app.use("/api/courses", lessonRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
