export type TaskStatus = "pending" | "scheduled" | "failed";
export type TaskType = "ticket" | "meeting";

export interface Task {
  id: string;
  userId: string;
  ticketNumber: string | null;
  title: string;
  type: TaskType;
  status: TaskStatus;
  durationMinutes: number;
  scheduledStart: string | null;
  scheduledEnd: string | null;
  calendarEventId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AddTasksResponse {
  tasks: Task[];
  message: string;
}

export interface AddMeetingsResponse {
  meetings: Task[];
  message: string;
}

export interface ExtractTasksResponse {
  tasks: Task[];
  tickets: string[];
  message: string;
}

export interface ScheduleTasksResponse {
  scheduled: number;
  failed: number;
  message: string;
}

export interface GetTasksResponse {
  tasks: Task[];
}

export interface UpdateTaskTitleResponse {
  task: Task;
  message: string;
}
