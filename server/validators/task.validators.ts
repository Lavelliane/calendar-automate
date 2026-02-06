import { z } from "zod";

/**
 * Schema for adding tasks
 */
export const addTasksSchema = z.object({
  tickets: z
    .array(z.string().min(1, "Ticket number cannot be empty"))
    .min(1, "At least one ticket is required"),
});

export type AddTasksInput = z.infer<typeof addTasksSchema>;

/**
 * Schema for adding meetings
 */
export const addMeetingsSchema = z.object({
  count: z.number().min(1).max(10).default(2),
});

export type AddMeetingsInput = z.infer<typeof addMeetingsSchema>;

/**
 * Schema for updating task title
 */
export const updateTaskTitleSchema = z.object({
  title: z.string().min(1, "Title cannot be empty"),
});

export type UpdateTaskTitleInput = z.infer<typeof updateTaskTitleSchema>;

/**
 * Schema for scheduling tasks
 */
export const scheduleTasksSchema = z.object({
  date: z.string().refine((val) => !Number.isNaN(Date.parse(val)), {
    message: "Invalid date format. Use ISO date string (YYYY-MM-DD)",
  }),
});

export type ScheduleTasksInput = z.infer<typeof scheduleTasksSchema>;

/**
 * Schema for deleting a task
 */
export const deleteTaskSchema = z.object({
  id: z.string().min(1, "Task ID is required"),
});

export type DeleteTaskInput = z.infer<typeof deleteTaskSchema>;

/**
 * Schema for getting tasks with optional status filter
 */
export const getTasksSchema = z.object({
  status: z.enum(["pending", "scheduled", "failed"]).optional(),
});

export type GetTasksInput = z.infer<typeof getTasksSchema>;
