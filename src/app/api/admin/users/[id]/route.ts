import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendNotification } from '@/lib/notifications';

// GET specific user details (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: params.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        location: true,
        isVerified: true,
        isAdmin: true,
        isVerifiedOrganizer: true,
        isBanned: true,
        createdAt: true,
        updatedAt: true,
        events: {
          select: {
            id: true,
            title: true,
            category: true,
            startDate: true,
            isApproved: true,
            isFlagged: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user details:', error);
    return NextResponse.json({ error: 'Failed to fetch user details' }, { status: 500 });
  }
}

// PATCH to update user status (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { action } = data;

    if (!['verify_organizer', 'unverify_organizer', 'ban', 'unban'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: params.id,
      },
      select: {
        email: true,
        phone: true,
        isVerifiedOrganizer: true,
        isBanned: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Process the action
    let updateData = {};
    let notificationMessage = '';
    let notificationSubject = '';

    switch (action) {
      case 'verify_organizer':
        updateData = { isVerifiedOrganizer: true };
        notificationMessage = 'Congratulations! You have been verified as an organizer. Your events will now be approved automatically.';
        notificationSubject = 'Organizer Status Verified';
        break;
      case 'unverify_organizer':
        updateData = { isVerifiedOrganizer: false };
        notificationMessage = 'Your verified organizer status has been removed. Your events will now require approval.';
        notificationSubject = 'Organizer Status Updated';
        break;
      case 'ban':
        updateData = { isBanned: true };
        notificationMessage = 'Your account has been banned due to violation of community guidelines.';
        notificationSubject = 'Account Banned';
        break;
      case 'unban':
        updateData = { isBanned: false };
        notificationMessage = 'Your account has been unbanned. You can now use Community Pulse again.';
        notificationSubject = 'Account Unbanned';
        break;
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: {
        id: params.id,
      },
      data: updateData,
    });

    // Send notification to user
    await sendNotification(
      user.email,
      user.phone || null,
      notificationMessage,
      notificationSubject,
      'EVENT_UPDATE'
    );

    return NextResponse.json({
      success: true,
      message: `User ${action.replace('_', ' ')} successful`,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
