import { supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET a specific event by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: event, error } = await supabaseAdmin
      .from('events')
      .select(`
        *,
        user:users!createdBy (
          id,
          name,
          isVerifiedOrganizer
        ),
        attendances (
          id,
          name,
          email,
          peopleCount,
          createdAt
        )
      `)
      .eq('id', params.id)
      .single();
      
    if (error) {
      throw error;
    }

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 });
  }
}

// PUT (update) an event
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get full event details including attendances
    const { data: event, error } = await supabaseAdmin
      .from('events')
      .select(`
        *,
        attendances (
          name,
          email,
          phone
        )
      `)
      .eq('id', params.id)
      .single();
      
    if (error) {
      throw error;
    }

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Check if user is authorized to edit the event
    if (event.createdBy !== session.user.id && !session.user.isAdmin) {
      return NextResponse.json({ error: 'Not authorized to update this event' }, { status: 403 });
    }

    const data = await request.json();
    const { title, description, category, location, latitude, longitude, startDate, endDate, imageUrl } = data;

    // If non-admin user is updating an approved event, set it back to pending approval
    const isApproved = session.user.isAdmin
      ? (data.isApproved !== undefined ? data.isApproved : event.isApproved)
      : (session.user.isVerifiedOrganizer ? true : false);

    // Check if key details changed (location, date, or cancellation)
    const locationChanged = location !== event.location;
    const dateChanged = new Date(startDate).getTime() !== new Date(event.startDate).getTime();
    const cancelled = data.cancelled === true;

    const { data: updatedEvent, error: updateError } = await supabaseAdmin
      .from('events')
      .update({
        title,
        description,
        category,
        location,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        imageUrl,
        isApproved,
        updatedAt: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single();
      
    if (updateError) {
      throw updateError;
    }

    // If key details changed, create notifications for all attendees
    if (locationChanged || dateChanged || cancelled) {
      let updateMessage = '';
      if (cancelled) {
        updateMessage = `EVENT CANCELLED: "${title}" has been cancelled.`;
      } else {
        updateMessage = `EVENT UPDATE: "${title}" has been updated. `;
        if (locationChanged) {
          updateMessage += `New location: ${location}. `;
        }
        if (dateChanged) {
          updateMessage += `New date/time: ${new Date(startDate).toLocaleString()}.`;
        }
      }

      // Create notifications for all attendees
      const notifications = event.attendances.map((attendee: { email: string; phone?: string }) => ({
        email: attendee.email,
        phone: attendee.phone || null,
        message: updateMessage,
        type: 'EVENT_UPDATE',
        isSent: false,
        createdAt: new Date().toISOString()
      }));

      if (notifications.length > 0) {
        const { error: notifError } = await supabaseAdmin
          .from('notifications')
          .insert(notifications);
          
        if (notifError) {
          console.error('Error creating notifications:', notifError);
        }
      }
    }

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}

// DELETE an event
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: event, error: fetchError } = await supabaseAdmin
      .from('events')
      .select('createdBy')
      .eq('id', params.id)
      .single();

    if (fetchError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Check if user is authorized to delete the event
    if (event.createdBy !== session.user.id && !session.user.isAdmin) {
      return NextResponse.json({ error: 'Not authorized to delete this event' }, { status: 403 });
    }

    // Delete the event (cascades to attendances based on Supabase RLS policies)
    const { error: deleteError } = await supabaseAdmin
      .from('events')
      .delete()
      .eq('id', params.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}
