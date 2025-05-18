import { supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET all events with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const upcoming = searchParams.get('upcoming') === 'true';

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Start building query
    let query = supabaseAdmin
      .from('events')
      .select(`
        *,
        user:users!createdBy (
          name,
          isVerifiedOrganizer
        ),
        attendances_count:attendances (count)
      `, { count: 'exact' })
      .eq('isApproved', true);

    // Add category filter if provided
    if (category) {
      query = query.eq('category', category);
    }

    // Add search filter if provided
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,location.ilike.%${search}%`);
    }

    // Add date filter for upcoming events
    if (upcoming) {
      const now = new Date().toISOString();
      query = query.gte('startDate', now);
    }

    // Add ordering
    query = query.order('startDate', { ascending: true });

    // Add pagination
    query = query.range(from, to);

    // Execute the query
    const { data: events, count: total, error } = await query;
    
    if (error) {
      throw error;
    }

    return NextResponse.json({
      events,
      pagination: {
        total: total || 0,
        page,
        limit,
        totalPages: Math.ceil((total || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

// POST a new event
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { title, description, category, location, latitude, longitude, startDate, endDate, imageUrl } = data;

    const { data: newEvent, error } = await supabaseAdmin
      .from('events')
      .insert({
        title,
        description,
        category,
        location,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        imageUrl,
        createdBy: session.user.id,
        // Auto-approve for verified organizers
        isApproved: session.user.isVerifiedOrganizer || session.user.isAdmin,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
