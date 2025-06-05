import { NextRequest, NextResponse } from "next/server";
import { NotificationService } from "@/server/services/notification-service";

// This handler should be called by a scheduled task (e.g., cron job, Vercel Cron, etc.)
// to send reminders for events happening tomorrow
export async function GET(req: NextRequest) {
  // Check for cron secret to ensure only authorized requests can trigger this
  const { searchParams } = new URL(req.url);
  const cronSecret = searchParams.get("cronSecret");
  const configuredSecret = process.env.CRON_SECRET || "cron-secret-key";

  if (cronSecret !== configuredSecret) {
    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized: Invalid cron secret",
      },
      { status: 401 }
    );
  }

  try {
    const result = await NotificationService.sendEventReminders();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error sending event reminders:", error);
    return NextResponse.json(
      {
        success: false,
        message: `Error sending event reminders: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 }
    );
  }
}
