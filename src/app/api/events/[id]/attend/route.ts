import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendNotification } from '@/lib/notifications';

// POST new attendance for an event
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const data = await request.json();
    const { name, email, phone, peopleCount } = data;

    // Validate the event exists and is approved
    const event = await prisma.event.findUnique({
      where: {
        id: params.id,
        isApproved: true,
      },
      include: {
        user: {
          select: {
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found or not approved' }, { status: 404 });
    }

    // Create the attendance record
    const attendance = await prisma.attendance.create({
      data: {
        name,
        email,
        phone,
        peopleCount,
        eventId: params.id,
        userId: session?.user?.id,
      },
    });

    // Notify the event creator
    if (event.user.email) {
      await sendNotification(
        event.user.email,
        event.user.phone || null,
        `New attendance for your event "${event.title}": ${name} (${email}) has registered with ${peopleCount} people.`,
        `New Attendance: ${event.title}`,
        'EVENT_UPDATE'
      );
    }

    // Schedule a reminder for the attendee (1 day before the event)
    const reminderDate = new Date(event.startDate);
    reminderDate.setDate(reminderDate.getDate() - 1);

    // Store the notification in the database to be sent later
    await prisma.notification.create({
      data: {
        email,
        phone,
        message: `Reminder: You're attending "${event.title}" tomorrow at ${event.location}. Event starts at ${event.startDate.toLocaleTimeString()}.`,
        type: 'EVENT_REMINDER',
        isSent: false,
      },
    });

    return NextResponse.json(attendance, { status: 201 });
  } catch (error) {
    console.error('Error registering attendance:', error);
    return NextResponse.json({ error: 'Failed to register attendance' }, { status: 500 });
  }
}
