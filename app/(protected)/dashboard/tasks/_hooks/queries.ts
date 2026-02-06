import { useQuery } from "@tanstack/react-query";
import { fetchTasks } from "./api";
import type { TaskStatus } from "../_types";

export const taskKeys = {
  all: ["tasks"] as const,
  lists: () => [...taskKeys.all, "list"] as const,
  list: (status?: TaskStatus) => [...taskKeys.lists(), status] as const,
};

/**
 * Hook to fetch tasks
 */
export function useTasks(status?: TaskStatus) {
  return useQuery({
    queryKey: taskKeys.list(status),
    queryFn: () => fetchTasks(status),
  });
}
