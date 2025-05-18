import { supabaseAdmin } from '@/lib/supabase';
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
    const { data: event, error: eventError } = await supabaseAdmin
      .from('events')
      .select(`
        *,
        user:users!createdBy (
          email,
          phone
        )
      `)
      .eq('id', params.id)
      .eq('isApproved', true)
      .single();
      
    if (eventError) {
      throw eventError;
    }

    if (!event) {
      return NextResponse.json({ error: 'Event not found or not approved' }, { status: 404 });
    }

    // Create the attendance record
    const { data: attendance, error: attendanceError } = await supabaseAdmin
      .from('attendances')
      .insert({
        name,
        email,
        phone,
        peopleCount,
        eventId: params.id,
        userId: session?.user?.id || null,
        createdAt: new Date().toISOString()
      })
      .select()
      .single();
      
    if (attendanceError) {
      throw attendanceError;
    }

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
    const eventStartTime = new Date(event.startDate).toLocaleTimeString();
    const { error: notificationError } = await supabaseAdmin
      .from('notifications')
      .insert({
        email,
        phone,
        message: `Reminder: You're attending "${event.title}" tomorrow at ${event.location}. Event starts at ${eventStartTime}.`,
        type: 'EVENT_REMINDER',
        isSent: false,
        createdAt: new Date().toISOString()
      });

    return NextResponse.json(attendance, { status: 201 });
  } catch (error) {
    console.error('Error registering attendance:', error);
    return NextResponse.json({ error: 'Failed to register attendance' }, { status: 500 });
  }
}
