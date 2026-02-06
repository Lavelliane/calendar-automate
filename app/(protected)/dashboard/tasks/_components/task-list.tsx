"use client";

import { Trash2, Clock, CheckCircle2, XCircle, Edit2, Check, X, CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useDeleteTask, useTasks, useUpdateTaskTitle } from "../_hooks";
import type { Task } from "../_types";
import { format } from "date-fns";
import { useState } from "react";

function getStatusBadge(status: Task["status"]) {
  switch (status) {
    case "pending":
      return (
        <Badge variant="outline" className="border-yellow-500 text-yellow-600">
          <Clock className="mr-1 h-3 w-3" />
          Pending
        </Badge>
      );
    case "scheduled":
      return (
        <Badge variant="outline" className="border-green-500 text-green-600">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Scheduled
        </Badge>
      );
    case "failed":
      return (
        <Badge variant="outline" className="border-red-500 text-red-600">
          <XCircle className="mr-1 h-3 w-3" />
          Failed
        </Badge>
      );
  }
}

function TaskItem({ task }: { task: Task }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const deleteTaskMutation = useDeleteTask();
  const updateTitleMutation = useUpdateTaskTitle();

  const handleSaveTitle = () => {
    if (editedTitle.trim() && editedTitle !== task.title) {
      updateTitleMutation.mutate(
        { taskId: task.id, title: editedTitle.trim() },
        {
          onSuccess: () => setIsEditing(false),
        },
      );
    } else {
      setIsEditing(false);
      setEditedTitle(task.title);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedTitle(task.title);
  };

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            {task.type === "meeting" ? (
              <Badge variant="secondary" className="border-purple-500 text-purple-600">
                <CalendarDays className="mr-1 h-3 w-3" />
                Meeting
              </Badge>
            ) : (
              <code className="text-sm font-semibold">{task.ticketNumber}</code>
            )}
            {getStatusBadge(task.status)}
          </div>

          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="h-8 text-sm"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveTitle();
                  if (e.key === "Escape") handleCancelEdit();
                }}
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={handleSaveTitle}
                disabled={updateTitleMutation.isPending}
              >
                <Check className="h-4 w-4 text-green-600" />
              </Button>
              <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                <X className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <p className="text-sm text-foreground">{task.title}</p>
              {task.status === "pending" && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditing(true)}
                  className="h-6 px-2"
                >
                  <Edit2 className="h-3 w-3 text-muted-foreground" />
                </Button>
              )}
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            <span>Duration: {task.durationMinutes} min</span>
            {task.scheduledStart && task.scheduledEnd && (
              <span className="ml-4">
                Scheduled: {format(new Date(task.scheduledStart), "MMM d, h:mm a")} -{" "}
                {format(new Date(task.scheduledEnd), "h:mm a")}
              </span>
            )}
          </div>
        </div>

        {task.status === "pending" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteTaskMutation.mutate(task.id)}
            disabled={deleteTaskMutation.isPending}
          >
            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
          </Button>
        )}
      </div>
    </Card>
  );
}

export function TaskList() {
  const { data, isLoading } = useTasks();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-sm text-muted-foreground">Loading tasks...</div>
      </div>
    );
  }

  const tasks = data?.tasks || [];

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
        <p className="text-sm text-muted-foreground">No tasks yet. Add some tasks to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  );
}
