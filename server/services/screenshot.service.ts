import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";
import { env } from "@/env/server";

export interface ExtractedTask {
  ticketNumber: string;
  title?: string;
}

/**
 * Extract ticket numbers and titles from an uploaded screenshot using OpenAI Vision
 */
export async function extractTicketsFromImage(
  imageBuffer: Buffer,
): Promise<ExtractedTask[]> {
  try {
    // Convert buffer to base64
    const base64Image = imageBuffer.toString("base64");

    // Determine image mime type from buffer
    let mimeType = "image/jpeg";
    if (imageBuffer[0] === 0x89 && imageBuffer[1] === 0x50) {
      mimeType = "image/png";
    } else if (imageBuffer[0] === 0x47 && imageBuffer[1] === 0x49) {
      mimeType = "image/gif";
    } else if (imageBuffer[0] === 0x52 && imageBuffer[1] === 0x49) {
      mimeType = "image/webp";
    }

    // Initialize OpenAI Vision model
    const model = new ChatOpenAI({
      modelName: "gpt-4o",
      apiKey: env.OPENAI_API_KEY,
      temperature: 0,
    });

    // Create message with image and prompt
    const message = new HumanMessage({
      content: [
        {
          type: "text",
          text: `This is a screenshot of a project management board (Jira, Linear, etc.) with tasks/tickets.

Extract ALL visible tasks. For each task, extract:
1. Ticket number/ID (e.g., TMI-1951, MKTG-1884, etc.)
2. The full task title/description shown next to the ticket number

Example from image:
- If you see "TMI-1951  Income Shifting: Savings calculated across all businesses..."
  Extract: { "ticketNumber": "TMI-1951", "title": "Income Shifting: Savings calculated across all businesses" }

- If you see "TMI-1323  Fix: Strategy Comparison Incorrect Savings for EQ Leasing..."
  Extract: { "ticketNumber": "TMI-1323", "title": "Fix: Strategy Comparison Incorrect Savings for EQ Leasing" }

Return a JSON array ONLY (no markdown, no code fences):
[
  { "ticketNumber": "TMI-1951", "title": "Income Shifting: Savings calculated across all businesses" },
  { "ticketNumber": "TMI-2015", "title": "Update Federal Savings Calculation and Display in Income Shifting" }
]

Rules:
- Extract the COMPLETE task title/description, not just the first few words
- Include all visible tickets, even if partially truncated
- If a ticket has no visible title, use the ticket number as the title
- Return [] if no tickets found
- CRITICAL: Return ONLY the JSON array, no other text`,
        },
        {
          type: "image_url",
          image_url: {
            url: `data:${mimeType};base64,${base64Image}`,
          },
        },
      ],
    });

    // Get response from OpenAI
    const response = await model.invoke([message]);
    const content = response.content.toString().trim();

    // Parse JSON response
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed
          .filter(
            (item) =>
              typeof item === "object" &&
              item !== null &&
              typeof item.ticketNumber === "string" &&
              item.ticketNumber.length > 0,
          )
          .map((item) => ({
            ticketNumber: item.ticketNumber.trim(),
            title: typeof item.title === "string" ? item.title.trim() : undefined,
          }));
      }
      return [];
    } catch (parseError) {
      // Fallback: try to extract ticket patterns manually (without titles)
      const ticketPattern = /\b[A-Z]{2,}-\d+\b/g;
      const matches = content.match(ticketPattern);
      return (matches || []).map((ticket) => ({ ticketNumber: ticket }));
    }
  } catch (error) {
    throw new Error(
      `Failed to extract tickets from image: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

export const screenshotService = {
  extractTicketsFromImage,
};
