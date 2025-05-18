import { prisma } from '@/lib/prisma';
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

    // Get pending events
    const pendingEvents = await prisma.event.findMany({
      where: {
        isApproved: false,
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'asc',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            isVerifiedOrganizer: true,
          },
        },
      },
    });

    const total = await prisma.event.count({
      where: {
        isApproved: false,
      },
    });

    return NextResponse.json({
      events: pendingEvents,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching pending events:', error);
    return NextResponse.json({ error: 'Failed to fetch pending events' }, { status: 500 });
  }
}
