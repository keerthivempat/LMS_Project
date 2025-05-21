import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import passport from "./config/passport.js";

const app = express();

// Middleware
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS','PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));


app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

app.use(cookieParser());
app.use(passport.initialize());

// routes imports
import authRoutes from "./routes/auth.route.js";
import orgRoutes from "./routes/org.route.js";
import courseRoutes from "./routes/course.route.js";
import sectionRoutes from "./routes/section.route.js";
import adminRouter from "./routes/admin.route.js";
import superAdminRouter from "./routes/superadmin.route.js";
import videoRouter from "./routes/video.route.js";
import assignmentRouter from "./routes/assignment.route.js";
import teacherRouter from "./routes/teacher.route.js";
import userRouter from "./routes/user.route.js";
import userRoutes from './routes/user.routes.js';
import certificateRouter from './routes/certificate.routes.js';
import progressRouter from './routes/progress.routes.js';

// routes declaration
app.use("/api/auth", authRoutes);
app.use("/api", orgRoutes);
app.use("/api", courseRoutes);
app.use("/api", sectionRoutes);
app.use("/api/video", videoRouter);
app.use("/api", assignmentRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/superadmin", superAdminRouter);
app.use("/api/teacher", teacherRouter);
app.use("/api/user", userRouter);
app.use('/api/users', userRoutes);
app.use('/api/certificates', certificateRouter);
app.use('/api/progress', progressRouter);

app.use((err, req, res, next) => {
  console.error(err); // Logs the error for debugging

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
      success: false,
      message: err.message || "Internal Server Error",
  });
});


export default app;
