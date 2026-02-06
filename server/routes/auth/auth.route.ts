import { Hono } from "hono";
import type { AuthType } from "@/lib/auth";
import { auth } from "@/lib/auth";

const router = new Hono<{ Bindings: AuthType }>({
  strict: false,
});

router.on(["POST", "GET"], "/*", (c) => {
  return auth.handler(c.req.raw);
});

export default router;
