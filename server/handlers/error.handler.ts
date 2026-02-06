import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { ZodError } from "zod";
import { captureException } from "@/lib/sentry";
import { logger } from "@/server/services/logger.service";

/**
 * Global error handler for Hono app
 * Handles HTTPException, Zod validation errors, and generic errors
 * Integrates with Sentry for error tracking
 */
export function errorHandler(err: Error, c: Context) {
  const method = c.req.method;
  const path = c.req.path;

  // Handle HTTPException (our custom errors)
  if (err instanceof HTTPException) {
    logger.apiError(method, path, err.status, err.message);

    // Only capture 5xx errors to Sentry (not client errors)
    if (err.status >= 500) {
      captureException(err, {
        method,
        path,
        status: err.status,
      });
    }

    return c.json(
      {
        error: err.message,
        status: err.status,
      },
      err.status,
    );
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const messages = err.issues.map((issue) => {
      const issuePath = issue.path.length > 0 ? issue.path.join(".") : "root";
      return `${issuePath}: ${issue.message}`;
    });
    logger.apiError(method, path, 400, `Validation failed: ${messages.join(", ")}`);
    return c.json(
      {
        error: "Validation failed",
        details: messages,
        status: 400,
      },
      400,
    );
  }

  // Handle generic errors - always capture to Sentry
  logger.apiError(method, path, 500, err);
  captureException(err, {
    method,
    path,
    status: 500,
  });

  return c.json(
    {
      error: err.message || "Internal server error",
      status: 500,
    },
    500,
  );
}
