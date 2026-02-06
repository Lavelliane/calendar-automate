"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Upload, Sparkles, Clock } from "lucide-react";
import Link from "next/link";

export function DashboardContent() {
  return (
    <section className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          Welcome to Calendar Automate
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Automatically schedule your tasks to Google Calendar with AI-powered smart placement
        </p>
      </div>

      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            How It Works
          </CardTitle>
          <CardDescription>Three simple steps to automated scheduling</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Upload className="h-6 w-6" />
              </div>
              <h3 className="font-semibold">1. Add Your Tasks</h3>
              <p className="text-sm text-muted-foreground">
                Type ticket numbers manually (e.g., TMI-1234) or upload a screenshot and let AI
                extract them for you
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="font-semibold">2. Pick a Date</h3>
              <p className="text-sm text-muted-foreground">
                Choose when to schedule your tasks. Each task gets a random 2-3 hour block between
                9AM-6PM CST
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="font-semibold">3. Auto-Schedule</h3>
              <p className="text-sm text-muted-foreground">
                Our AI finds free slots in your Google Calendar and schedules tasks without
                conflicts
              </p>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <Button size="lg" asChild>
              <Link href="/dashboard/tasks">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
            <CardDescription>What makes Calendar Automate powerful</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                  <span className="h-2 w-2 rounded-full bg-green-600 dark:bg-green-400" />
                </span>
                <div>
                  <p className="font-medium">Smart Conflict Detection</p>
                  <p className="text-sm text-muted-foreground">
                    Automatically avoids overlapping with existing calendar events
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <span className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                </span>
                <div>
                  <p className="font-medium">AI Screenshot Reading</p>
                  <p className="text-sm text-muted-foreground">
                    Upload Jira boards or task lists - AI extracts ticket numbers instantly
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                  <span className="h-2 w-2 rounded-full bg-purple-600 dark:bg-purple-400" />
                </span>
                <div>
                  <p className="font-medium">Random Duration Assignment</p>
                  <p className="text-sm text-muted-foreground">
                    Each task gets 2-3 hours randomly for realistic scheduling
                  </p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tips for Best Results</CardTitle>
            <CardDescription>Make the most of Calendar Automate</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-2">
                <span className="text-primary">→</span>
                <span>
                  Connect with Google OAuth to ensure full calendar access and token refresh
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">→</span>
                <span>
                  Schedule tasks at least a day in advance for better slot availability
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">→</span>
                <span>
                  For screenshots, ensure ticket numbers are clearly visible and follow the
                  XXX-#### format
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">→</span>
                <span>
                  All times are in CST (America/Chicago) - your calendar will adjust to your
                  timezone
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
