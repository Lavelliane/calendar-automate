import { Hono } from "hono";
import { handle } from "hono/vercel";
import type { AuthType } from "@/lib/auth";
import { errorHandler } from "@/server/handlers/error.handler";
import { loggerMiddleware } from "@/server/middleware/logger.middleware";
import auth from "@/server/routes/auth/auth.route";
import docs from "@/server/routes/docs/docs.route";
import health from "@/server/routes/health/health.route";
import task from "@/server/routes/task/task.route";

const app = new Hono<{ Variables: AuthType }>({ strict: false }).basePath("/api");

// Request logging middleware
app.use("*", loggerMiddleware);

// Global error handler
app.onError(errorHandler);

// Route registration
app.route("/auth", auth);
app.route("/docs", docs);
app.route("/health", health);
app.route("/tasks", task);

// OpenAPI JSON endpoint (also available via /api/docs/openapi.json)
app.get("/openapi.json", (c) => {
  return c.redirect("/api/docs/openapi.json");
});

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
