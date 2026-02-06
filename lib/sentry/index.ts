import * as Sentry from "@sentry/nextjs";

/**
 * Initialize Sentry error tracking
 * This is called automatically in instrumentation.ts
 */
export function initSentry() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

  if (!dsn) {
    console.warn("[Sentry] No DSN provided, error tracking is disabled");
    return;
  }

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,

    // Performance monitoring
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

    // Session replay (client-side only)
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    // Debug mode for development
    debug: process.env.NODE_ENV === "development",

    // Ignore certain errors
    ignoreErrors: [
      // Network errors
      "NetworkError",
      "Network request failed",
      "Failed to fetch",
      "Load failed",
      // User aborted requests
      "AbortError",
      "The operation was aborted",
      // Browser extensions
      /^chrome-extension:\/\//,
      /^moz-extension:\/\//,
    ],

    // Before sending, sanitize sensitive data
    beforeSend(event) {
      // Remove sensitive headers
      if (event.request?.headers) {
        delete event.request.headers.authorization;
        delete event.request.headers.cookie;
      }
      return event;
    },
  });
}

/**
 * Capture an exception with Sentry
 * Use this for manual error capturing
 */
export function captureException(error: Error, context?: Record<string, unknown>) {
  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Capture a message with Sentry
 * Use for non-error events you want to track
 */
export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = "info",
  context?: Record<string, unknown>,
) {
  Sentry.captureMessage(message, {
    level,
    extra: context,
  });
}

/**
 * Set user context for Sentry
 * Call this after user authentication
 */
export function setUser(user: { id: string; email?: string; name?: string } | null) {
  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.name,
    });
  } else {
    Sentry.setUser(null);
  }
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(message: string, category: string, data?: Record<string, unknown>) {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: "info",
  });
}

// Re-export Sentry for advanced usage
export { Sentry };
