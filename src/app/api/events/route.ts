import { prisma } from '@/lib/prisma';
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

    const skip = (page - 1) * limit;

    // Build filter object
    const where: any = { isApproved: true };

    // Add category filter if provided
    if (category) {
      where.category = category;
    }

    // Add search filter if provided
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Add date filter for upcoming events
    if (upcoming) {
      where.startDate = { gte: new Date() };
    }

    // Get total count for pagination
    const total = await prisma.event.count({ where });

    // Get events
    const events = await prisma.event.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        startDate: 'asc',
      },
      include: {
        user: {
          select: {
            name: true,
            isVerifiedOrganizer: true,
          },
        },
        _count: {
          select: {
            attendances: true,
          },
        },
      },
    });

    return NextResponse.json({
      events,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
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

    const newEvent = await prisma.event.create({
      data: {
        title,
        description,
        category,
        location,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        imageUrl,
        createdBy: session.user.id,
        // Auto-approve for verified organizers
        isApproved: session.user.isVerifiedOrganizer || session.user.isAdmin,
      },
    });

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
