"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAddTasks } from "../_hooks";

export function ManualInput() {
  const [input, setInput] = useState("");
  const addTasksMutation = useAddTasks();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    // Split by commas or newlines and filter empty strings
    const tickets = input
      .split(/[,\n]/)
      .map((ticket) => ticket.trim())
      .filter((ticket) => ticket.length > 0);

    if (tickets.length === 0) return;

    addTasksMutation.mutate(tickets, {
      onSuccess: () => {
        setInput("");
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="tickets">Enter Ticket Numbers</Label>
        <Textarea
          id="tickets"
          placeholder="TMI-1234, TMI-5678&#10;or one per line"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={4}
          className="font-mono"
        />
        <p className="text-sm text-muted-foreground">
          Separate tickets with commas or newlines
        </p>
      </div>

      <Button type="submit" disabled={addTasksMutation.isPending || !input.trim()}>
        {addTasksMutation.isPending ? "Adding..." : "Add Tasks"}
      </Button>
    </form>
  );
}
