import express from "express";
import cors from "cors";
import morgan from "morgan";
import { env } from "./config/env.js";
import { healthRouter } from "./routes/health.js";
import { authRouter } from "./routes/auth.js";
import { meRouter } from "./routes/me.js";
import { adminUsersRouter } from "./routes/adminUsers.js";
import { doctorsRouter } from "./routes/doctors.js";
import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { testrouter } from "./routes/tests.js";
import { appointmentsRouter } from "./routes/appointments.js";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use(morgan("dev"));
  app.use(express.json({ limit: "1mb" }));
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    }),
  );

  app.get("/", (_req, res) => {
    res.json({ name: "eyecare-bd-backend", status: "ok" });
  });

  app.use("/api/health", healthRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/me", meRouter);
  app.use("/api/admin/users", adminUsersRouter);
  app.use("/api/doctors", doctorsRouter);
  app.use("/api/tests", testrouter);
  app.use("/api/appointments", appointmentsRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

