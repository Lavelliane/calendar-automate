"use client";

import { useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useScheduleTasks } from "../_hooks";
import { format } from "date-fns";

export function ScheduleControls() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const scheduleTasksMutation = useScheduleTasks();

  const handleSchedule = () => {
    if (!date) return;

    // Convert the selected local date to its equivalent CST date
    // When it's Feb 7 in Korea (KST), it's Feb 6 in Chicago (CST)
    // We need to get "what day is it in Chicago right now" for the selected local date
    
    // Get the date as it appears in Chicago timezone
    const chicagoFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Chicago",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    
    const parts = chicagoFormatter.formatToParts(date);
    const year = parts.find((p) => p.type === "year")?.value;
    const month = parts.find((p) => p.type === "month")?.value;
    const day = parts.find((p) => p.type === "day")?.value;
    const dateString = `${year}-${month}-${day}`;
    
    scheduleTasksMutation.mutate(dateString);
  };

  return (
    <div className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:items-start sm:justify-between">
      <div className="space-y-1">
        <h3 className="text-sm font-medium">Schedule Tasks</h3>
        <p className="text-xs text-muted-foreground">
          Select a date to schedule all pending tasks (9AM-6PM CST)
        </p>
        {date && (
          <p className="text-xs font-medium text-primary">
            Will schedule for: {format(date, "MMM d, yyyy")} CST
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
          </PopoverContent>
        </Popover>

        <Button
          onClick={handleSchedule}
          disabled={!date || scheduleTasksMutation.isPending}
        >
          {scheduleTasksMutation.isPending ? "Scheduling..." : "Schedule All"}
        </Button>
      </div>
    </div>
  );
}
