import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { addDays, startOfDay, endOfDay } from 'date-fns';

/**
 * API endpoint to create notification reminders for upcoming events
 * This should be called by a scheduled job (e.g., cron) once per day
 */
export async function POST(request: NextRequest) {
  try {
    // For security, check for a secret token
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    // Verify the token matches our secret
    if (token !== process.env.NOTIFICATION_SECRET_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current date
    const now = new Date();

    // Calculate tomorrow's date range (for event reminders)
    const tomorrowStart = startOfDay(addDays(now, 1));
    const tomorrowEnd = endOfDay(addDays(now, 1));

    // Find all approved events happening tomorrow
    const upcomingEvents = await prisma.event.findMany({
      where: {
        isApproved: true,
        startDate: {
          gte: tomorrowStart,
          lte: tomorrowEnd,
        },
      },
      include: {
        attendances: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    let reminderCount = 0;

    // Create reminders for each attendee of each event
    for (const event of upcomingEvents) {
      const eventDetails = `Event: ${event.title} at ${event.location} - ${new Date(event.startDate).toLocaleString()}`;

      // Process each attendee
      for (const attendee of event.attendances) {
        try {
          // Create a notification for this attendee
          await prisma.notification.create({
            data: {
              email: attendee.email,
              phone: attendee.phone || null,
              message: `Reminder: You're attending "${event.title}" tomorrow at ${event.location}. Event starts at ${new Date(event.startDate).toLocaleTimeString()}.`,
              type: 'EVENT_REMINDER',
              isSent: false,
            },
          });

          reminderCount++;
        } catch (error) {
          console.error(`Error creating reminder for ${attendee.email}:`, error);
        }
      }
    }

    return NextResponse.json({
      success: true,
      eventsProcessed: upcomingEvents.length,
      remindersCreated: reminderCount,
    });

  } catch (error) {
    console.error('Error scheduling event reminders:', error);
    return NextResponse.json({ error: 'Failed to schedule event reminders' }, { status: 500 });
  }
}
