"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { CalendarDays } from "lucide-react";
import {
  ManualInput,
  ScreenshotUpload,
  TaskList,
  ScheduleControls,
} from "../_components";
import { useAddMeetings } from "../_hooks";

export function TasksContent() {
  const addMeetingsMutation = useAddMeetings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Auto Scheduler</h1>
        <p className="mt-2 text-muted-foreground">
          Add tasks and automatically schedule them to your Google Calendar
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Add Tasks</CardTitle>
              <CardDescription>
                Add tasks manually or upload a screenshot to extract ticket numbers
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={() => addMeetingsMutation.mutate(2)}
              disabled={addMeetingsMutation.isPending}
            >
              <CalendarDays className="mr-2 h-4 w-4" />
              Add Meetings (30min)
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="manual" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual">Manual Entry</TabsTrigger>
              <TabsTrigger value="screenshot">Screenshot Upload</TabsTrigger>
            </TabsList>
            <TabsContent value="manual" className="mt-4">
              <ManualInput />
            </TabsContent>
            <TabsContent value="screenshot" className="mt-4">
              <ScreenshotUpload />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Your Tasks</CardTitle>
          <CardDescription>
            View and manage your tasks before scheduling (meetings are prioritized)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TaskList />
        </CardContent>
      </Card>

      <ScheduleControls />
    </div>
  );
}
