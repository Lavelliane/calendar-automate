import { env } from "@/env/client";
import type {
  AddTasksResponse,
  AddMeetingsResponse,
  ExtractTasksResponse,
  GetTasksResponse,
  ScheduleTasksResponse,
  TaskStatus,
  UpdateTaskTitleResponse,
} from "../_types";

const API_URL = env.NEXT_PUBLIC_BASE_URL;

/**
 * Fetch tasks for the authenticated user
 */
export async function fetchTasks(status?: TaskStatus): Promise<GetTasksResponse> {
  const url = new URL(`${API_URL}/api/tasks`);
  if (status) {
    url.searchParams.set("status", status);
  }

  const response = await fetch(url.toString(), {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch tasks: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Add tasks manually
 */
export async function addTasks(tickets: string[]): Promise<AddTasksResponse> {
  const response = await fetch(`${API_URL}/api/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ tickets }),
  });

  if (!response.ok) {
    throw new Error(`Failed to add tasks: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Add generic meetings
 */
export async function addMeetings(count: number = 2): Promise<AddMeetingsResponse> {
  const response = await fetch(`${API_URL}/api/tasks/meetings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ count }),
  });

  if (!response.ok) {
    throw new Error(`Failed to add meetings: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Update a task's title
 */
export async function updateTaskTitle(
  taskId: string,
  title: string,
): Promise<UpdateTaskTitleResponse> {
  const response = await fetch(`${API_URL}/api/tasks/${taskId}/title`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ title }),
  });

  if (!response.ok) {
    throw new Error(`Failed to update task title: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Extract tasks from a screenshot
 */
export async function extractTasksFromScreenshot(
  file: File,
): Promise<ExtractTasksResponse> {
  const formData = new FormData();
  formData.append("screenshot", file);

  const response = await fetch(`${API_URL}/api/tasks/extract`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Failed to extract tasks: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Schedule all pending tasks
 */
export async function scheduleTasks(date: string): Promise<ScheduleTasksResponse> {
  const response = await fetch(`${API_URL}/api/tasks/schedule`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ date }),
  });

  if (!response.ok) {
    throw new Error(`Failed to schedule tasks: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Delete a task
 */
export async function deleteTask(taskId: string): Promise<{ message: string }> {
  const response = await fetch(`${API_URL}/api/tasks/${taskId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Failed to delete task: ${response.statusText}`);
  }

  return response.json();
}
