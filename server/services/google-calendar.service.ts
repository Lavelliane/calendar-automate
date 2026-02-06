import { google } from "googleapis";
import { db } from "@/db";
import { account } from "@/db/schema";
import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";

const TIMEZONE = "America/Chicago";

/**
 * Get the UTC offset (in hours) for America/Chicago on a given date.
 * Returns -6 for CST or -5 for CDT. Handles DST automatically.
 *
 * Works by checking what hour Chicago displays when it's noon UTC.
 * Uses only Intl.DateTimeFormat (no locale string parsing).
 */
function getChicagoOffsetHours(dateStr: string): number {
  const utcNoon = new Date(
    Date.UTC(
      parseInt(dateStr.slice(0, 4)),
      parseInt(dateStr.slice(5, 7)) - 1,
      parseInt(dateStr.slice(8, 10)),
      12, 0, 0,
    ),
  );

  // Extract the hour as Chicago sees it when it's 12:00 UTC
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    hour: "numeric",
    hour12: false,
  }).formatToParts(utcNoon);

  let chicagoHour = parseInt(parts.find((p) => p.type === "hour")?.value || "6");
  if (chicagoHour === 24) chicagoHour = 0;

  // 12 (UTC hour) + offset = chicagoHour  =>  offset = chicagoHour - 12
  return chicagoHour - 12;
}

/**
 * Build an ISO 8601 string for a Chicago local time with explicit UTC offset.
 *
 * Example: toChicagoISO("2026-02-09", 9, 0) => "2026-02-09T09:00:00-06:00"
 *
 * This string is unambiguous everywhere -- `new Date(...)` will parse it into
 * the correct UTC instant regardless of the server's local timezone.
 */
export function toChicagoISO(dateStr: string, hours: number, minutes = 0): string {
  const offset = getChicagoOffsetHours(dateStr);
  const sign = offset >= 0 ? "+" : "-";
  const absOffset = Math.abs(offset);
  return (
    `${dateStr}T` +
    `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00` +
    `${sign}${String(absOffset).padStart(2, "0")}:00`
  );
}

/**
 * Create a Date (correct UTC epoch) that represents a specific wall-clock
 * time in America/Chicago.
 *
 * Example: createChicagoDate("2026-02-09", 9, 0) → 2026-02-09T15:00:00Z (= 9 AM CST)
 */
export function createChicagoDate(dateStr: string, hours: number, minutes = 0): Date {
  return new Date(toChicagoISO(dateStr, hours, minutes));
}

/**
 * Get an authenticated Google Calendar client for a user
 */
export async function getCalendarClient(userId: string) {
  const userAccount = await db.query.account.findFirst({
    where: eq(account.userId, userId),
  });

  if (!userAccount) {
    throw new HTTPException(401, { message: "No account found for this user" });
  }

  if (userAccount.providerId !== "google") {
    throw new HTTPException(401, {
      message: `Google account not connected. Found provider: ${userAccount.providerId}. Please sign in with Google.`,
    });
  }

  if (!userAccount.accessToken) {
    throw new HTTPException(401, {
      message: "No access token found. Please re-authenticate with Google.",
    });
  }

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: userAccount.accessToken,
    refresh_token: userAccount.refreshToken,
  });

  return google.calendar({ version: "v3", auth: oauth2Client });
}

/**
 * Get existing calendar events for a specific date within 9 AM – 6 PM CST.
 * Excludes events created by this app (identified by their event IDs).
 *
 * @param dateStr "YYYY-MM-DD" – the date in Chicago local time
 * @param excludeEventIds Optional array of calendar event IDs to exclude (events created by this app)
 */
export async function getExistingEvents(
  calendarClient: ReturnType<typeof google.calendar>,
  dateStr: string,
  excludeEventIds: string[] = [],
) {
  // Build correct UTC timestamps for 9 AM and 6 PM CST
  const timeMin = createChicagoDate(dateStr, 9, 0);
  const timeMax = createChicagoDate(dateStr, 18, 0);

  try {
    const response = await calendarClient.events.list({
      calendarId: "primary",
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      timeZone: TIMEZONE,
      singleEvents: true,
      orderBy: "startTime",
    });

    const workdayStartMs = timeMin.getTime();
    const workdayEndMs = timeMax.getTime();

    const excludeSet = new Set(excludeEventIds);

    // Patterns to identify events created by this app
    const ticketPattern = /^[A-Z]+-\d+/; // Matches "TMI-1234" or "MKTG-1884"
    const meetingTypes = [
      "Daily Standup",
      "Sprint Planning",
      "Sprint Retrospective",
      "UI Review",
      "Code Review",
      "Team Sync",
    ];

    const filtered = response.data.items
      ?.filter((event) => {
        // Filter out all-day events
        if (!event.start?.dateTime || !event.end?.dateTime) return false;
        
        // Filter out events created by this app (by event ID)
        if (event.id && excludeSet.has(event.id)) return false;
        
        // Filter out events that match app patterns (ticket numbers or meeting types)
        const summary = event.summary || "";
        if (ticketPattern.test(summary)) return false;
        if (meetingTypes.some((type) => summary.includes(type))) return false;
        
        return true;
      }) || [];

    return filtered.map((event) => {
      const start = new Date(event.start!.dateTime!);
      const end = new Date(event.end!.dateTime!);

      // Clamp events to the workday window
      return {
        id: event.id || "",
        summary: event.summary || "",
        start: new Date(Math.max(start.getTime(), workdayStartMs)),
        end: new Date(Math.min(end.getTime(), workdayEndMs)),
      };
    });
  } catch (error) {
    throw new HTTPException(500, {
      message: `Failed to fetch calendar events: ${error instanceof Error ? error.message : "Unknown error"}`,
    });
  }
}

/**
 * Convert a UTC Date (representing a Chicago local time) to a Chicago ISO string.
 * This ensures Google Calendar interprets the date correctly.
 */
function toChicagoISOFromDate(date: Date): string {
  // Format the date in Chicago timezone
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const year = parts.find((p) => p.type === "year")?.value || "";
  const month = parts.find((p) => p.type === "month")?.value || "";
  const day = parts.find((p) => p.type === "day")?.value || "";
  const hour = parts.find((p) => p.type === "hour")?.value || "";
  const minute = parts.find((p) => p.type === "minute")?.value || "";
  const second = parts.find((p) => p.type === "second")?.value || "";

  // Get the offset for this date
  const dateStr = `${year}-${month}-${day}`;
  const offset = getChicagoOffsetHours(dateStr);
  const sign = offset >= 0 ? "+" : "-";
  const absOffset = Math.abs(offset);

  return `${dateStr}T${hour}:${minute}:${second}${sign}${String(absOffset).padStart(2, "0")}:00`;
}

/**
 * Create a calendar event.
 * Passes local Chicago time + timeZone to the API so Google handles
 * conversion correctly regardless of server timezone.
 */
export async function createEvent(
  calendarClient: ReturnType<typeof google.calendar>,
  title: string,
  start: Date,
  end: Date,
  description?: string | null,
) {
  try {
    const eventDescription = description || `Auto-scheduled: ${title}`;

    // Convert UTC Dates to Chicago local time strings
    const startChicagoISO = toChicagoISOFromDate(start);
    const endChicagoISO = toChicagoISOFromDate(end);

    console.log(`Creating event: ${title} from ${startChicagoISO} to ${endChicagoISO}`);

    const response = await calendarClient.events.insert({
      calendarId: "primary",
      requestBody: {
        summary: title,
        description: eventDescription,
        start: {
          dateTime: startChicagoISO,
          timeZone: TIMEZONE,
        },
        end: {
          dateTime: endChicagoISO,
          timeZone: TIMEZONE,
        },
        colorId: "9",
      },
    });

    console.log(`Event created successfully: ${response.data.id}`);
    return response.data.id || "";
  } catch (error: any) {
    console.error("Calendar API error:", {
      message: error.message,
      code: error.code,
      errors: error.errors,
      response: error.response?.data,
    });
    throw new HTTPException(500, {
      message: `Failed to create calendar event: ${error instanceof Error ? error.message : "Unknown error"}`,
    });
  }
}

export const googleCalendarService = {
  getCalendarClient,
  getExistingEvents,
  createEvent,
  createChicagoDate,
};
