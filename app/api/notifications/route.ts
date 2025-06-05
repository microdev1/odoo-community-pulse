import { NextRequest, NextResponse } from "next/server";
import { NotificationService } from "@/server/services/notification-service";

// Simple middleware to protect the notifications endpoint
const ADMIN_KEY = process.env.ADMIN_KEY || "secure-admin-key";

export async function POST(req: NextRequest) {
  // Check for admin key in headers
  const authorization = req.headers.get("authorization");
  if (!authorization || authorization !== `Bearer ${ADMIN_KEY}`) {
    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized: Invalid admin key",
      },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();

    if (body.type === "reminders") {
      // Send reminders for events happening tomorrow
      const result = await NotificationService.sendEventReminders();
      return NextResponse.json(result);
    } else if (body.type === "update" && body.eventId && body.message) {
      // Send update notifications for a specific event
      const result = await NotificationService.sendEventUpdateNotifications(
        body.eventId,
        body.message
      );
      return NextResponse.json(result);
    } else if (body.type === "cancellation" && body.eventId) {
      // Send cancellation notifications for a specific event
      const result =
        await NotificationService.sendEventCancellationNotifications(
          body.eventId
        );
      return NextResponse.json(result);
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid notification type or missing required parameters",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error sending notifications:", error);
    return NextResponse.json(
      {
        success: false,
        message: `Error sending notifications: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 }
    );
  }
}
