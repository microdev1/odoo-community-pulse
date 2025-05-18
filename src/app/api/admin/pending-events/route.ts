import { supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendNotification } from '@/lib/notifications';

// GET pending events for approval
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const skip = (page - 1) * limit;

    // Get pending events count first
    const { count: total, error: countError } = await supabaseAdmin
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('isApproved', false);
      
    if (countError) {
      throw countError;
    }
    
    // Now get the pending events with pagination
    const { data: pendingEvents, error: eventsError } = await supabaseAdmin
      .from('events')
      .select(`
        *,
        user:users!createdBy (
          id,
          name,
          email,
          isVerifiedOrganizer
        )
      `)
      .eq('isApproved', false)
      .order('createdAt', { ascending: true })
      .range(skip, skip + limit - 1);
      
    if (eventsError) {
      throw eventsError;
    }

    return NextResponse.json({
      events: pendingEvents,
      pagination: {
        total: total || 0,
        page,
        limit,
        totalPages: Math.ceil((total || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching pending events:', error);
    return NextResponse.json({ error: 'Failed to fetch pending events' }, { status: 500 });
  }
}
