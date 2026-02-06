import { db } from "@/db";
import { task } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { nanoid } from "nanoid";
import {
  getCalendarClient,
  getExistingEvents,
  createEvent,
  createChicagoDate,
} from "./google-calendar.service";

type TimeSlot = {
  start: Date;
  end: Date;
};

const MEETING_TYPES = [
  "Daily Standup",
  "Sprint Planning",
  "Sprint Retrospective",
  "UI Review",
  "Code Review",
  "Team Sync",
];

/**
 * Add tickets for a user
 */
export async function addTasks(
  userId: string,
  tasksData: Array<{ ticketNumber: string; title?: string }>,
) {
  const tasks = tasksData.map(({ ticketNumber, title }) => ({
    id: nanoid(),
    userId,
    ticketNumber: ticketNumber,
    title: title || ticketNumber,
    type: "ticket",
    status: "pending",
    durationMinutes: Math.random() < 0.5 ? 60 : 120, // 1-2 hours for tickets
    scheduledStart: null,
    scheduledEnd: null,
    calendarEventId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  await db.insert(task).values(tasks);
  return tasks;
}

/**
 * Add generic meetings for a user
 */
export async function addMeetings(userId: string, count: number = 2) {
  const meetings = [];
  
  for (let i = 0; i < count; i++) {
    const meetingType = MEETING_TYPES[Math.floor(Math.random() * MEETING_TYPES.length)];
    meetings.push({
      id: nanoid(),
      userId,
      ticketNumber: null,
      title: meetingType,
      type: "meeting",
      status: "pending",
      durationMinutes: 30, // 30 minutes for meetings
      scheduledStart: null,
      scheduledEnd: null,
      calendarEventId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  await db.insert(task).values(meetings);
  return meetings;
}

/**
 * Update a task's title
 */
export async function updateTaskTitle(userId: string, taskId: string, newTitle: string) {
  const existingTask = await db.query.task.findFirst({
    where: and(eq(task.id, taskId), eq(task.userId, userId)),
  });

  if (!existingTask) {
    throw new HTTPException(404, { message: "Task not found" });
  }

  if (existingTask.status !== "pending") {
    throw new HTTPException(400, { message: "Can only edit pending tasks" });
  }

  await db
    .update(task)
    .set({ title: newTitle, updatedAt: new Date() })
    .where(eq(task.id, taskId));

  return db.query.task.findFirst({ where: eq(task.id, taskId) });
}

/**
 * Get tasks for a user
 */
export async function getTasks(userId: string, status?: string) {
  const whereClause = status
    ? and(eq(task.userId, userId), eq(task.status, status))
    : eq(task.userId, userId);

  return await db.query.task.findMany({
    where: whereClause,
    orderBy: (tasks, { desc }) => [desc(tasks.createdAt)],
  });
}

/**
 * Delete a pending task
 */
export async function deleteTask(userId: string, taskId: string) {
  const existingTask = await db.query.task.findFirst({
    where: and(eq(task.id, taskId), eq(task.userId, userId)),
  });

  if (!existingTask) {
    throw new HTTPException(404, { message: "Task not found" });
  }

  if (existingTask.status !== "pending") {
    throw new HTTPException(400, { message: "Can only delete pending tasks" });
  }

  await db.delete(task).where(and(eq(task.id, taskId), eq(task.userId, userId)));
}

/**
 * Build a sorted list of free time slots from occupied blocks.
 */
function calculateFreeSlots(
  occupiedBlocks: Array<{ start: Date; end: Date }>,
  workdayStart: Date,
  workdayEnd: Date,
): TimeSlot[] {
  const freeSlots: TimeSlot[] = [];
  const sorted = [...occupiedBlocks].sort((a, b) => a.start.getTime() - b.start.getTime());

  let cursor = workdayStart.getTime();

  for (const block of sorted) {
    const blockStart = Math.max(block.start.getTime(), workdayStart.getTime());
    const blockEnd = Math.min(block.end.getTime(), workdayEnd.getTime());

    if (blockStart <= cursor) {
      cursor = Math.max(cursor, blockEnd);
      continue;
    }

    freeSlots.push({
      start: new Date(cursor),
      end: new Date(blockStart),
    });
    cursor = Math.max(cursor, blockEnd);
  }

  if (cursor < workdayEnd.getTime()) {
    freeSlots.push({
      start: new Date(cursor),
      end: new Date(workdayEnd.getTime()),
    });
  }

  return freeSlots;
}

/**
 * Find the first free slot that fits the requested duration.
 */
function findFirstAvailableSlot(
  freeSlots: TimeSlot[],
  durationMinutes: number,
): { start: Date; end: Date } | null {
  for (const slot of freeSlots) {
    const slotMinutes = (slot.end.getTime() - slot.start.getTime()) / 60_000;

    if (slotMinutes >= durationMinutes) {
      return {
        start: new Date(slot.start),
        end: new Date(slot.start.getTime() + durationMinutes * 60_000),
      };
    }
  }

  return null;
}

/**
 * Schedule all pending tasks/meetings for a user on a specific date.
 * Meetings are prioritized and scheduled first, then tickets.
 * Failed tasks are removed from the database instead of being marked as failed.
 *
 * @param dateStr "YYYY-MM-DD" – the target date in CST
 */
export async function scheduleTasks(userId: string, dateStr: string) {
  // Fetch all pending items
  const pendingItems = await getTasks(userId, "pending");

  if (pendingItems.length === 0) {
    return { scheduled: 0, failed: 0 };
  }

  // Separate and prioritize: meetings first, then tickets
  const meetings = pendingItems.filter((item) => item.type === "meeting");
  const tickets = pendingItems.filter((item) => item.type === "ticket");
  const sortedItems = [...meetings, ...tickets];

  // Get Google Calendar client
  const calendarClient = await getCalendarClient(userId);

  // Get calendar event IDs for tasks already scheduled by this app (to exclude them)
  const scheduledTasks = await getTasks(userId, "scheduled");
  const appCreatedEventIds = scheduledTasks
    .map((t) => t.calendarEventId)
    .filter((id): id is string => id !== null);

  // Fetch existing events for the day (9 AM – 6 PM CST), excluding events created by this app
  const existingEvents = await getExistingEvents(calendarClient, dateStr, appCreatedEventIds);

  // Build workday boundaries in UTC (representing 9 AM and 6 PM CST)
  const workdayStart = createChicagoDate(dateStr, 9, 0);
  const workdayEnd = createChicagoDate(dateStr, 18, 0);

  // Keep track of all occupied blocks
  const occupiedBlocks: Array<{ start: Date; end: Date }> = existingEvents.map((e) => ({
    start: e.start,
    end: e.end,
  }));

  let scheduledCount = 0;
  let failedCount = 0;

  for (const item of sortedItems) {
    // Rebuild free slots after every placement
    const freeSlots = calculateFreeSlots(occupiedBlocks, workdayStart, workdayEnd);

    const slot = findFirstAvailableSlot(freeSlots, item.durationMinutes);

    if (!slot) {
      // Delete from DB instead of marking as failed
      await db.delete(task).where(eq(task.id, item.id));
      failedCount++;
      continue;
    }

    try {
      const eventTitle = item.ticketNumber ? `${item.ticketNumber}: ${item.title}` : item.title;

      const eventId = await createEvent(
        calendarClient,
        eventTitle,
        slot.start,
        slot.end,
        null,
      );

      await db
        .update(task)
        .set({
          status: "scheduled",
          scheduledStart: slot.start,
          scheduledEnd: slot.end,
          calendarEventId: eventId,
          updatedAt: new Date(),
        })
        .where(eq(task.id, item.id));

      // Mark this time block as occupied for the next iteration
      occupiedBlocks.push({ start: slot.start, end: slot.end });
      // Sort occupiedBlocks to maintain order for next iteration
      occupiedBlocks.sort((a, b) => a.start.getTime() - b.start.getTime());
      scheduledCount++;
    } catch (error) {
      // Delete from DB instead of marking as failed
      await db.delete(task).where(eq(task.id, item.id));
      failedCount++;
      
      // Log the error for debugging
      console.error(`Failed to schedule task ${item.id}:`, error);
    }
  }

  return { scheduled: scheduledCount, failed: failedCount };
}

export const taskService = {
  addTasks,
  addMeetings,
  updateTaskTitle,
  getTasks,
  deleteTask,
  scheduleTasks,
};
