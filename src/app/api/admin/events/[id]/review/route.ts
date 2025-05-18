import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendNotification } from '@/lib/notifications';

// POST to approve or reject an event
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { action, reason } = data;

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const event = await prisma.event.findUnique({
      where: {
        id: params.id,
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
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (action === 'approve') {
      // Approve the event
      await prisma.event.update({
        where: {
          id: params.id,
        },
        data: {
          isApproved: true,
        },
      });

      // Notify the event creator
      if (event.user.email) {
        await sendNotification(
          event.user.email,
          event.user.phone || null,
          `Your event "${event.title}" has been approved and is now visible to the community.`,
          'Event Approved',
          'EVENT_UPDATE'
        );
      }

      return NextResponse.json({ success: true, message: 'Event approved' });
    } else {
      // Reject and delete the event
      await prisma.event.delete({
        where: {
          id: params.id,
        },
      });

      // Notify the event creator with the reason
      if (event.user.email) {
        const rejectionMessage = reason
          ? `Your event "${event.title}" has been rejected. Reason: ${reason}`
          : `Your event "${event.title}" has been rejected as it doesn't meet our community guidelines.`;

        await sendNotification(
          event.user.email,
          event.user.phone || null,
          rejectionMessage,
          'Event Rejected',
          'EVENT_UPDATE'
        );
      }

      return NextResponse.json({ success: true, message: 'Event rejected' });
    }
  } catch (error) {
    console.error('Error processing event approval/rejection:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
