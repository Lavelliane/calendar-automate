import { Hono } from "hono";

const router = new Hono();

const startTime = Date.now();

/**
 * Health check endpoint
 * GET /api/health
 */
router.get("/", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - startTime) / 1000),
  });
});

export default router;
