import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { AuthType } from "@/lib/auth";
import { authMiddleware } from "@/server/middleware/auth.middleware";
import { taskService } from "@/server/services/task.service";
import { screenshotService } from "@/server/services/screenshot.service";
import {
  addTasksSchema,
  scheduleTasksSchema,
  getTasksSchema,
  addMeetingsSchema,
  updateTaskTitleSchema,
} from "@/server/validators/task.validators";
import { HTTPException } from "hono/http-exception";

const router = new Hono<{ Variables: AuthType }>();

// Apply auth middleware to all routes
router.use("/*", authMiddleware);

/**
 * GET /api/tasks
 * Get all tasks for the authenticated user
 */
router.get("/", zValidator("query", getTasksSchema), async (c) => {
  const user = c.get("user");
  if (!user) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  const { status } = c.req.valid("query");
  const tasks = await taskService.getTasks(user.id, status);

  return c.json({ tasks });
});

/**
 * POST /api/tasks
 * Add tasks manually
 */
router.post("/", zValidator("json", addTasksSchema), async (c) => {
  const user = c.get("user");
  if (!user) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  const { tickets } = c.req.valid("json");
  // Convert string array to object array format
  const tasksData = tickets.map((ticket) => ({ ticketNumber: ticket }));
  const tasks = await taskService.addTasks(user.id, tasksData);

  return c.json({ tasks, message: `${tasks.length} task(s) added successfully` });
});

/**
 * POST /api/tasks/meetings
 * Add generic meetings
 */
router.post("/meetings", zValidator("json", addMeetingsSchema), async (c) => {
  const user = c.get("user");
  if (!user) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  const { count } = c.req.valid("json");
  const meetings = await taskService.addMeetings(user.id, count);

  return c.json({ meetings, message: `${meetings.length} meeting(s) added successfully` });
});

/**
 * PATCH /api/tasks/:id/title
 * Update a task's title
 */
router.patch("/:id/title", zValidator("json", updateTaskTitleSchema), async (c) => {
  const user = c.get("user");
  if (!user) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  const taskId = c.req.param("id");
  const { title } = c.req.valid("json");
  const updatedTask = await taskService.updateTaskTitle(user.id, taskId, title);

  return c.json({ task: updatedTask, message: "Task title updated successfully" });
});

/**
 * POST /api/tasks/extract
 * Upload a screenshot and extract ticket numbers using AI
 */
router.post("/extract", async (c) => {
  const user = c.get("user");
  if (!user) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  try {
    // Parse multipart form data
    const body = await c.req.parseBody();
    const file = body.screenshot;

    if (!file || !(file instanceof File)) {
      throw new HTTPException(400, { message: "No screenshot file provided" });
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract tickets and titles using AI
    const extractedTasks = await screenshotService.extractTicketsFromImage(buffer);

    if (extractedTasks.length === 0) {
      return c.json({ tasks: [], tickets: [], message: "No tasks found in the screenshot" });
    }

    // Add extracted tasks
    const tasks = await taskService.addTasks(user.id, extractedTasks);
    const tickets = extractedTasks.map((t) => t.ticketNumber);

    return c.json({
      tasks,
      tickets,
      message: `${tasks.length} ticket(s) extracted and added successfully`,
    });
  } catch (error) {
    throw new HTTPException(500, {
      message: `Failed to process screenshot: ${error instanceof Error ? error.message : "Unknown error"}`,
    });
  }
});

/**
 * POST /api/tasks/schedule
 * Schedule all pending tasks for a specific date
 */
router.post("/schedule", zValidator("json", scheduleTasksSchema), async (c) => {
  const user = c.get("user");
  if (!user) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  const { date } = c.req.valid("json");

  // Pass date string directly – the service handles CST conversion
  const result = await taskService.scheduleTasks(user.id, date);

  return c.json({
    ...result,
    message: `Scheduled ${result.scheduled} task(s), ${result.failed} failed`,
  });
});

/**
 * DELETE /api/tasks/:id
 * Delete a pending task
 */
router.delete("/:id", async (c) => {
  const user = c.get("user");
  if (!user) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  const taskId = c.req.param("id");
  await taskService.deleteTask(user.id, taskId);

  return c.json({ message: "Task deleted successfully" });
});

export default router;
