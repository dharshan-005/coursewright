import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

import courseRoutes from "./routes/courseRoutes.js";
import lessonRoutes from "./routes/lessonRoutes.js";
import enrollmentRoutes from "./routes/enrollmentRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";
import submissionRoutes from "./routes/submissionRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";

import { notFound, errorHandler } from "./middleware/errorHandler.js";

export function createApp() {
  const app = express();

  const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.use(helmet());

  app.use(
    cors({
      origin(origin, callback) {
        // Allow Postman, curl, and same-origin requests without an Origin header.
        if (!origin || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        return callback(new Error(`Origin ${origin} not allowed by CORS`));
      },
    }),
  );

  app.use(express.json({ limit: "100kb" }));

  if (process.env.NODE_ENV !== "test") {
    app.use(morgan("dev"));
  }

  app.get("/api/health", (_req, res) => {
    res.json({ success: true, status: "ok" });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/dashboard", dashboardRoutes);

  app.use("/api/courses", courseRoutes);
  app.use("/api/lessons", lessonRoutes);
  app.use("/api/enrollments", enrollmentRoutes);
  app.use("/api/assignments", assignmentRoutes);
  app.use("/api/submissions", submissionRoutes);
  app.use("/api/progress", progressRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
