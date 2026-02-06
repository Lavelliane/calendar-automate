import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addTasks,
  addMeetings,
  updateTaskTitle,
  extractTasksFromScreenshot,
  scheduleTasks,
  deleteTask,
} from "./api";
import { taskKeys } from "./queries";
import { toast } from "sonner";

/**
 * Hook to add tasks manually
 */
export function useAddTasks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addTasks,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      toast.success(data.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

/**
 * Hook to add meetings
 */
export function useAddMeetings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addMeetings,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      toast.success(data.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

/**
 * Hook to update a task's title
 */
export function useUpdateTaskTitle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, title }: { taskId: string; title: string }) =>
      updateTaskTitle(taskId, title),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      toast.success(data.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

/**
 * Hook to extract tasks from a screenshot
 */
export function useExtractFromScreenshot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: extractTasksFromScreenshot,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      toast.success(data.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

/**
 * Hook to schedule all pending tasks
 */
export function useScheduleTasks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: scheduleTasks,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      toast.success(data.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

/**
 * Hook to delete a task
 */
export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTask,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      toast.success(data.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
