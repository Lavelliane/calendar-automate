import type { Context } from "hono";
import { createMiddleware } from "hono/factory";
import { logger } from "@/server/services/logger.service";

/**
 * HTTP request logging middleware
 * Logs all incoming requests with method, path, status, and duration
 */
export const loggerMiddleware = createMiddleware(async (c: Context, next) => {
  const start = Date.now();
  const method = c.req.method;
  const path = c.req.path;

  await next();

  const duration = Date.now() - start;
  const status = c.res.status;

  logger.http(method, path, status, duration);
});
